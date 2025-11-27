'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      comentario: {
        type: Sequelize.STRING,
        allowNull: true
      },
      jugadorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'jugadores',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      clubOrigenId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'clubes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      clubDestinoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clubes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pases');
  }
};