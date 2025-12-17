'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Jugadores', 'nacimiento', {
      type: Sequelize.DATE,
      allowNull: true,
    });


    await queryInterface.changeColumn('Jugadores', 'inscripcion', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.changeColumn('Jugadores', 'nacimiento', {
      type: Sequelize.DATE,
      allowNull: false,
    });

    await queryInterface.changeColumn('Jugadores', 'inscripcion', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};