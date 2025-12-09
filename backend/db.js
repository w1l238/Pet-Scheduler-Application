const { Pool } = require('pg');
require('dotenv').config();

let poolConfig;

if (process.env.DATABASE_URL) {
    // Use connection string for Docker environment
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
    };
} else {
    // Use individual parameters for local environment (from .env file)
    poolConfig = {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    };
}

const pool = new Pool(poolConfig);

module.exports = pool;