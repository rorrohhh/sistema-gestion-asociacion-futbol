'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('partidos', 'campeonato', {
      type: Sequelize.ENUM('A', 'B'),
      allowNull: false,
      defaultValue: 'A'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('partidos', 'campeonato');
  }
};