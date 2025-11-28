'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('clubes', 'tiene_1era', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
    await queryInterface.addColumn('clubes', 'tiene_2da', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
    await queryInterface.addColumn('clubes', 'tiene_3era', {
      type: Sequelize.BOOLEAN,
      defaultValue: true, 
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('clubes', 'tiene_1era');
    await queryInterface.removeColumn('clubes', 'tiene_2da');
    await queryInterface.removeColumn('clubes', 'tiene_3era');
  }
};