'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clubes', 'logo', {
      type: Sequelize.STRING,
      allowNull: true // Puede ser nulo si el club no tiene escudo aún
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('clubes', 'logo');
  }
};