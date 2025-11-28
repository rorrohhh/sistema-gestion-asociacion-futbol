const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Partido = sequelize.define('Partido', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha_numero: { 
    type: DataTypes.INTEGER, // Número de fecha (Jornada 1, 2, 3...)
    allowNull: false
  },
  dia_hora: { 
    type: DataTypes.DATE, // Fecha calendario real
    allowNull: true
  },
  serie: {
    type: DataTypes.ENUM('1era', '2da', '3era'),
    allowNull: false
  },
  recinto: {
    type: DataTypes.STRING,
    allowNull: true
  },
  goles_local: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  goles_visita: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.ENUM('programado', 'finalizado', 'suspendido'),
    defaultValue: 'programado'
  },
  // Las FK (clubLocalId, clubVisitaId) se inyectan en associations
}, {
  tableName: 'partidos',
  timestamps: true
});

module.exports = Partido;