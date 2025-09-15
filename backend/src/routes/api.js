const express = require('express');
const router = express.Router();
const { query } = require('../services/db');

// GET /api/v1/sections/:station_code/snapshot
// Returns a snapshot of a station and its active trains.
router.get('/v1/sections/:station_code/snapshot', async (req, res) => {
  const { station_code } = req.params;
  try {
    const stationRes = await query('SELECT * FROM stations WHERE code = $1', [station_code]);
    if (stationRes.rows.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }
    const station = stationRes.rows[0];

    const platformsRes = await query('SELECT platform_no, length_m FROM platforms WHERE station_id = $1', [station.id]);
    const tracksRes = await query(`
      SELECT t.id AS track_id, s1.code AS from_station_code, s2.code AS to_station_code, t.length_m
      FROM tracks t
      JOIN stations s1 ON t.from_station = s1.id
      JOIN stations s2 ON t.to_station = s2.id
      WHERE s1.id = $1 OR s2.id = $1
    `, [station.id]);

    const trainsRes = await query(`
      SELECT t.train_no, t.name, t.type, tm.status, tm.eta, tm.etd,
             s.code AS current_station_code, s2.code AS next_station_code
      FROM train_movements tm
      JOIN trains t ON tm.train_id = t.id
      JOIN stations s ON tm.current_station = s.id
      LEFT JOIN stations s2 ON tm.next_station = s2.id
      WHERE tm.current_station = $1 OR tm.next_station = $1
    `, [station.id]);

    const trains = trainsRes.rows.map(t => ({
      train_no: t.train_no,
      name: t.name,
      type: t.type,
      current_status: {
        status: t.status,
        current_station: t.current_station_code,
        next_station: t.next_station_code,
        eta: t.eta,
        etd: t.etd,
      }
    }));

    res.json({
      station: { code: station.code, name: station.name },
      platforms: platformsRes.rows,
      tracks: tracksRes.rows.map(t => ({ track_id: t.track_id, from: t.from_station_code, to: t.to_station_code, length_m: t.length_m })),
      trains,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/v1/trains/:train_no
// Returns details for a specific train.
router.get('/v1/trains/:train_no', async (req, res) => {
  const { train_no } = req.params;
  try {
    const trainRes = await query('SELECT * FROM trains WHERE train_no = $1', [train_no]);
    if (trainRes.rows.length === 0) {
      return res.status(404).json({ error: 'Train not found' });
    }
    const train = trainRes.rows[0];

    const timetableRes = await query(`
      SELECT te.scheduled_arrival, te.scheduled_departure, te.platform_no,
             s.code AS station_code, s.name AS station_name
      FROM timetable_events te
      JOIN stations s ON te.station_id = s.id
      WHERE te.train_id = $1
      ORDER BY te.order_no
    `, [train.id]);

    const movementsRes = await query(`
      SELECT tm.timestamp, tm.status, tm.speed_kmph, tm.position_m,
             s1.code AS current_station_code, s2.code AS next_station_code
      FROM train_movements tm
      JOIN stations s1 ON tm.current_station = s1.id
      LEFT JOIN stations s2 ON tm.next_station = s2.id
      WHERE tm.train_id = $1
      ORDER BY tm.timestamp DESC
    `, [train.id]);

    res.json({
      train: { train_no: train.train_no, name: train.name, type: train.type },
      timetable: timetableRes.rows,
      movements: movementsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/v1/sim/command
// Simulates a command to a train (e.g., hold, release).
// This is a placeholder for your optimization algorithms.
router.post('/v1/sim/command', (req, res) => {
  const { train_no, command } = req.body;
  
  // Here, Kaushal's algorithm would receive this command and update a train's state.
  // We'll just log it for now.
  console.log(`Received command: '${command}' for train: ${train_no}`);
  
  // Example: If a "hold" command is received, update the train's speed.
  if (command === 'hold') {
    // Logic to update train speed in db to 0
  }

  res.status(200).json({ status: 'success', message: `Command '${command}' received for train ${train_no}` });
});

module.exports = router;