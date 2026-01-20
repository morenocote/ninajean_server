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

        const [tables] = await connection.query('SHOW TABLES');
        console.log('\nTables in database:');
        if (tables.length === 0) {
            console.log('(No tables found)');
        } else {
            tables.forEach(row => {
                console.log(`- ${Object.values(row)[0]}`);
            });
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Connection failed:');
        console.error(error.message);
    }
}

testConnection();
