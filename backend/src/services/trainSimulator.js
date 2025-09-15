const { query } = require('./db');

// In-memory state to manage train positions.
const trainStates = {};

// Function to fetch initial train data and start the simulation.
async function initializeSimulation() {
  const trains = await query('SELECT id, train_no, name FROM trains');
  for (const train of trains.rows) {
    trainStates[train.train_no] = {
      ...train,
      position: 0, 
      speed: 0,
      status: 'stopped',
      nextStation: null,
      eta: null,
    };
  }
}

// Function to simulate train movement.
async function simulateMovement(io) {
  // Fetch trains currently enroute from the database
  const q = `
    SELECT tm.*, t.train_no, t.name,
           s1.code AS current_station_code,
           s2.code AS next_station_code,
           tk.length_m AS track_length
    FROM train_movements tm
    JOIN trains t ON tm.train_id = t.id
    JOIN stations s1 ON tm.current_station = s1.id
    JOIN stations s2 ON tm.next_station = s2.id
    JOIN tracks tk ON (tk.from_station = s1.id AND tk.to_station = s2.id)
                  OR (tk.from_station = s2.id AND tk.to_station = s1.id)
    WHERE tm.status = 'enroute'
  `;
  try {
    const res = await query(q);

    // Use a for-of loop for sequential asynchronous operations
    for (const train of res.rows) {
      // Simple simulation: move the train forward by a fixed amount.
      const movement_step = train.speed_kmph / 3.6; // Speed in m/s
      const new_position = (parseFloat(train.position_m) || 0) + movement_step;

      // Check if train has reached the destination
      if (new_position >= train.track_length) {
        train.status = 'arrived';
        train.position_m = train.track_length;
      } else {
        train.position_m = new_position;
      }
      
      // Update state in database
      await query('UPDATE train_movements SET position_m = $1, status = $2 WHERE id = $3', [new_position, train.status, train.id]);
      
      // Broadcast the update to all connected clients.
      io.emit('trainUpdate', {
        train_no: train.train_no,
        name: train.name,
        current_status: {
          status: train.status,
          current_station: train.current_station_code,
          next_station: train.next_station_code,
          position_m: new_position,
          eta: train.eta,
        },
        timestamp: new Date(),
      });
    }
  } catch (err) {
    console.error('Simulation error:', err);
  }
}

module.exports = {
  initializeSimulation,
  simulateMovement,
};