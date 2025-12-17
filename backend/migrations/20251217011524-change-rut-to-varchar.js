'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('Jugadores', 'rut', {
      type: Sequelize.STRING(20),
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Jugadores', 'rut', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};