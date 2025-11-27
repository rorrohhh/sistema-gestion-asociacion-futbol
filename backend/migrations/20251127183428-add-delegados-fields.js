'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Agregar campo a Jugadores
    await queryInterface.addColumn('jugadores', 'delegadoInscripcion', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // 2. Agregar campo a Pases
    await queryInterface.addColumn('pases', 'delegado', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jugadores', 'delegadoInscripcion');
    await queryInterface.removeColumn('pases', 'delegado');
  }
};