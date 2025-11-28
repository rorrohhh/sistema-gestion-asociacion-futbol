const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Club = sequelize.define('Club', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    logo: { 
        type: DataTypes.STRING,
        allowNull: true
    },

    division: { 
        type: DataTypes.ENUM('A', 'B'),
        allowNull: false,
        defaultValue: 'A'
    },

    tiene_super_senior: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    tiene_2da: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    tiene_1era: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'clubes',
    timestamps: false
});

module.exports = Club;