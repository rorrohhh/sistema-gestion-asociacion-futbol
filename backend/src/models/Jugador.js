const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Jugador = sequelize.define('Jugador', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    numero: DataTypes.INTEGER,
    paterno: DataTypes.STRING,
    materno: DataTypes.STRING,
    nombres: DataTypes.STRING,
    rut: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    dv: {
        type: DataTypes.STRING(1),
        allowNull: true
    },
    pasaporte: {
        type: DataTypes.STRING,
        allowNull: true
    },
    
    tipoIdentificacion: {
        type: DataTypes.STRING(10), // 'RUT' o 'PASSPORT'
        allowNull: false, // Debe existir en ambos casos
        defaultValue: 'RUT' // Valor por defecto
    },
    nacionalidad: {
        type: DataTypes.STRING,
        allowNull: true // Puede ser opcional al principio
    },
    rol: DataTypes.STRING,
    nacimiento: DataTypes.DATEONLY,
    inscripcion: DataTypes.DATEONLY,
    // La llave foránea clubId se crea automática al hacer la relación,
    // pero es buena práctica declararla explícitamente para validaciones.
    clubId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'jugadores',
    timestamps: false
});

module.exports = Jugador;