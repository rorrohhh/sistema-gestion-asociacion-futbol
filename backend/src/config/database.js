require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        dialectOptions: {
            charset: 'utf8mb4',
        },
        define: {
            charset: 'utf8mb4',
            collate: 'utf8mb4_unicode_ci'
        },
        logging: false,
    }
);

module.exports = sequelize;