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
        port: process.env.DB_PORT,
    };
    // Only add password if it's not an empty string
    if (process.env.DB_PASSWORD && process.env.DB_PASSWORD !== '') {
        poolConfig.password = process.env.DB_PASSWORD;
    }
}

const pool = new Pool(poolConfig);

module.exports = pool;