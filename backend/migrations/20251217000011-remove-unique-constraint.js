'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.removeColumn('jugadores', 'folio');


    await queryInterface.addColumn('jugadores', 'folio', {
      type: Sequelize.STRING,
      allowNull: true,  
      unique: false     
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn('jugadores', 'folio');


    await queryInterface.addColumn('jugadores', 'folio', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true      
    });
  }
};