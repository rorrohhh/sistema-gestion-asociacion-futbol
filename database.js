const mysql = require("mysql2");

const pool = mysql.createPool({
    host: "localhost",
    user: "rorro",
    password: "0P*iHiCgRePG6Buo",
    database: "futbol",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
