'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    // Permitir NULL en la columna 'rut'
    await queryInterface.changeColumn('jugadores', 'rut', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    // Permitir NULL en la columna 'dv'
    await queryInterface.changeColumn('jugadores', 'dv', {
      type: Sequelize.STRING(1),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir cambios (volver a NO permitir NULL)
    // NOTA: Esto fallará si ya existen registros con RUT nulo en la BD
    await queryInterface.changeColumn('jugadores', 'rut', {
      type: Sequelize.INTEGER,
      allowNull: false
    });

    await queryInterface.changeColumn('jugadores', 'dv', {
      type: Sequelize.STRING(1),
      allowNull: false
    });
  }
};