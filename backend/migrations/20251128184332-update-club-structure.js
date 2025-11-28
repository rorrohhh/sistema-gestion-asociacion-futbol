'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.addColumn('clubes', 'division', {
      type: Sequelize.ENUM('A', 'B'),
      allowNull: false,
      defaultValue: 'A' 
    });

    await queryInterface.renameColumn('clubes', 'tiene_3era', 'tiene_super_senior');


    await queryInterface.addColumn('partidos', 'equipo_culpable_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'clubes', key: 'id' } 
    });

    await queryInterface.addColumn('partidos', 'motivo_suspension', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.removeColumn('partidos', 'motivo_suspension');
    await queryInterface.removeColumn('partidos', 'equipo_culpable_id');
    await queryInterface.renameColumn('clubes', 'tiene_super_senior', 'tiene_3era');
    await queryInterface.removeColumn('clubes', 'division');
  }
};