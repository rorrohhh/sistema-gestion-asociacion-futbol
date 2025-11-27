'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('jugadores', 'foto', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('jugadores', 'activo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('jugadores', 'foto');
    await queryInterface.removeColumn('jugadores', 'activo');
  }
};