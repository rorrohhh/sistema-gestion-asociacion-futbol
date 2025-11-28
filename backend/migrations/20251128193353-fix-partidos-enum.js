'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    return queryInterface.sequelize.query(
      "ALTER TABLE partidos MODIFY COLUMN serie ENUM('1era', '2da', '3era', 'super_senior') NOT NULL;"
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.sequelize.query(
      "ALTER TABLE partidos MODIFY COLUMN serie ENUM('1era', '2da', '3era') NOT NULL;"
    );
  }
};