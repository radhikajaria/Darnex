# Railway Traffic Management & Simulation Backend

Welcome to the backend for our Smart India Hackathon project! This repository contains the core logic for the railway simulation, including the database, APIs, and real-time updates.

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: Make sure you have Node.js installed.
- **PostgreSQL**: Install PostgreSQL and create a database for the project. Note down your username and database name.
- **Redis**: Install and run a Redis server.

### 2. Setup

1.  Clone this repository:
    `git clone https://github.com/your-username/railway-sim-backend.git`
    `cd railway-sim-backend`

2.  Install dependencies:
    `npm install`

### 3. Database Setup

1.  **Create Schema**: Run the SQL script to create your database tables.
    ```bash
    psql -U your_username -d your_dbname -a -f src/db/migrations/20250915_initial_schema.sql
    ```
    Replace `your_username` and `your_dbname` with your actual PostgreSQL credentials.

2.  **Seed Data**: Populate the tables with initial data.
    ```bash
    psql -U your_username -d your_dbname -a -f src/db/seed/seed_data.sql
    ```

### 4. Running the Backend

1.  Start the server:
    `npm start`

2.  The server will be running at `http://localhost:3000`.

### 5. API Endpoints

The following APIs are available for the frontend team:

-   **GET `/api/v1/sections/:station_code/snapshot`**: Get a snapshot of a station, including platforms, tracks, and trains.
    -   Example: `http://localhost:3000/api/v1/sections/JP/snapshot`

-   **GET `/api/v1/trains/:train_no`**: Get details about a specific train, its timetable, and its movements.
    -   Example: `http://localhost:3000/api/v1/trains/12986`

-   **POST `/api/v1/sim/command`**: Simulated control action. Send JSON data with a command.
    -   Example Body: `{ "train_no": "12986", "command": "hold" }`

### 6. Real-Time Updates (WebSockets)

-   The server uses WebSockets to broadcast real-time train position updates.
-   The frontend can connect to `ws://localhost:3000` to receive messages.
-   Listen for the `trainUpdate` event.

**Example Frontend Code:**
```javascript
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('trainUpdate', (data) => {
  console.log('Real-time train update:', data);
  // Update your frontend dashboard with this data
});