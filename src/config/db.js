// // db.js
// import dotenv from 'dotenv';
// import mysql from 'mysql2';

// dotenv.config();

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// db.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database:', err);
//     process.exit(1); // Exit the app if database connection fails
//   }
//   console.log('Connected to MySQL database');
// });

// export default db;
