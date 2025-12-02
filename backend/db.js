require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    // Use this for running server.js locally
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,

    // This line is for the docker container to use enviornment variables defined in a compose file.
    //connectionString: process.env.DATABASE_URL || `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`,

});

module.exports = pool;