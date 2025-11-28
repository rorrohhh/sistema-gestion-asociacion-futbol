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
    logo: { // Agregamos campo para el escudo/logo
        type: DataTypes.STRING,
        allowNull: true
    },
    // --- CAMPOS DE SERIES ---
    tiene_1era: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    tiene_2da: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    tiene_3era: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    }
}, {
    tableName: 'clubes',
    timestamps: false
});

module.exports = Club;