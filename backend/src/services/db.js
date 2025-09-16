const { Pool } = require('pg');

// Database connection configuration.
// Remember to replace 'your_username', 'your_password', 'your_dbname'
// with your actual PostgreSQL credentials.
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'railway_sim_db',
    password: 'Themedaksh990',
    port: 5432,
  });

// A simple function to query the database.
const query = (text, params) => pool.query(text, params);

module.exports = {
  query,
};