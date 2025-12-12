// /backend/debug-env.js
// This script helps debug environment variable loading.

// Load environment variables from .env file
require('dotenv').config();

console.log('--- Checking Environment Variables ---');

// Log the values of the variables that should be in your .env file
console.log(`DB_USER:`, process.env.DB_USER);
console.log(`DB_HOST:`, process.env.DB_HOST);
console.log(`DB_DATABASE:`, process.env.DB_DATABASE);
console.log(`DB_PASSWORD:`, process.env.DB_PASSWORD);
console.log(`DB_PORT:`, process.env.DB_PORT);
console.log('------------------------------------');

// Mimic the logic from the updated db.js to see what config is being created
let poolConfig;

if (process.env.DATABASE_URL) {
    console.log('DATABASE_URL is set. Using it for connection.');
    poolConfig = {
        connectionString: process.env.DATABASE_URL,
    };
} else {
    console.log('DATABASE_URL is not set. Using individual .env variables.');
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

console.log('\n--- Resulting Pool Configuration ---');
// We will print the password differently to avoid logging it directly if it's a real password.
const displayConfig = { ...poolConfig };
if (poolConfig.password) {
    displayConfig.password = `(string with length ${poolConfig.password.length})`;
} else if (poolConfig.hasOwnProperty('password')) {
    displayConfig.password = poolConfig.password;
} else {
    displayConfig.password = '(property is omitted)';
}

console.log(displayConfig);
console.log('------------------------------------');

console.log('\n[ACTION] Please run this script and show me the output.');
console.log('From your backend directory, execute: node debug-env.js');
