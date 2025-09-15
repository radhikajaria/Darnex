-- Initial Schema for Railway Simulation System

-- Table: stations
CREATE TABLE IF NOT EXISTS stations (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    lat NUMERIC(10, 8),
    lon NUMERIC(11, 8),
    attributes JSONB
);

-- Table: platforms
CREATE TABLE IF NOT EXISTS platforms (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    platform_no VARCHAR(10) NOT NULL,
    length_m INTEGER,
    UNIQUE (station_id, platform_no)
);

-- Table: tracks
CREATE TABLE IF NOT EXISTS tracks (
    id SERIAL PRIMARY KEY,
    from_station INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    to_station INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    length_m INTEGER NOT NULL,
    type VARCHAR(50),
    allowed_speed INTEGER
);

-- Table: crossings
CREATE TABLE IF NOT EXISTS crossings (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    name VARCHAR(255),
    type VARCHAR(50),
    controlled BOOLEAN DEFAULT TRUE
);

-- Table: trains
CREATE TABLE IF NOT EXISTS trains (
    id SERIAL PRIMARY KEY,
    train_no VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50),
    priority INTEGER,
    length_m INTEGER
);

-- Table: timetable_events
CREATE TABLE IF NOT EXISTS timetable_events (
    id SERIAL PRIMARY KEY,
    train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    station_id INTEGER NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
    scheduled_arrival TIMESTAMP WITH TIME ZONE,
    scheduled_departure TIMESTAMP WITH TIME ZONE,
    platform_no VARCHAR(10),
    order_no INTEGER NOT NULL
);

-- Table: train_movements
CREATE TABLE IF NOT EXISTS train_movements (
    id SERIAL PRIMARY KEY,
    train_id INTEGER NOT NULL REFERENCES trains(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    current_station INTEGER REFERENCES stations(id),
    next_station INTEGER REFERENCES stations(id),
    status VARCHAR(50),
    speed_kmph NUMERIC(5, 2),
    position_m NUMERIC(10, 2),
    eta TIMESTAMP WITH TIME ZONE,
    etd TIMESTAMP WITH TIME ZONE
);