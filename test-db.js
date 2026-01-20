const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    console.log('Testing connection with:');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            connectTimeout: 5000 // 5 seconds timeout
        });

        console.log('✅ Connection successful!');
        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error.message);
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.error('\nPOSSIBLE CAUSES:');
            console.error('1. The DB_HOST is incorrect.');
            console.error('2. Your local IP address is not whitelisted in Hostinger Remote MySQL.');
            console.error('3. Hostinger is blocking the connection.');
        }
    }
}

testConnection();
