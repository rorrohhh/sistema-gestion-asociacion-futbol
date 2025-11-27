const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pase = sequelize.define('Pase', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    // Ahora se llama 'comentario' en lugar de 'motivo'
    comentario: {
        type: DataTypes.STRING,
        allowNull: true
    },
    delegado: {
        type: DataTypes.STRING,
        allowNull: true 
    },
    // Claves foráneas explícitas para referencia
    jugadorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    clubOrigenId: {
        type: DataTypes.INTEGER,
        allowNull: true // Puede ser null si viene libre
    },
    clubDestinoId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'pases',
    timestamps: true
});

module.exports = Pase;