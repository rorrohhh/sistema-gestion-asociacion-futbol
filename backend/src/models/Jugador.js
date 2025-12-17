const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jugador = sequelize.define('Jugador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paterno: {
        type: DataTypes.STRING,
        collate: 'utf8mb4_unicode_ci' // <--- Agregamos esto
    },
    materno: {
        type: DataTypes.STRING,
        collate: 'utf8mb4_unicode_ci'
    },
    nombres: {
        type: DataTypes.STRING,
        collate: 'utf8mb4_unicode_ci'
    },
    // CORRECCIÓN PRINCIPAL: Cambiamos INTEGER a STRING
    rut: {
        type: DataTypes.STRING(20), 
        allowNull: true,
        collate: 'utf8mb4_unicode_ci' // Para evitar el error de collation
    },
    dv: {
        type: DataTypes.STRING(1),
        allowNull: true,
        collate: 'utf8mb4_unicode_ci' // Importante para búsquedas de 'K'
    },
    pasaporte: {
        type: DataTypes.STRING,
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
    },
    tipoIdentificacion: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'RUT',
        collate: 'utf8mb4_unicode_ci'
    },
    nacionalidad: {
        type: DataTypes.STRING,
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
    },
    delegadoInscripcion: {
        type: DataTypes.STRING,
        allowNull: true,
        collate: 'utf8mb4_unicode_ci'
    },
    foto: DataTypes.STRING,
    activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    folio: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        collate: 'utf8mb4_unicode_ci'
    },
    nacimiento: DataTypes.DATEONLY,
    inscripcion: DataTypes.DATEONLY,
    clubId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'jugadores',
    timestamps: false,
    // Aseguramos que la tabla completa use este collation por defecto
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci' 
});

module.exports = Jugador;