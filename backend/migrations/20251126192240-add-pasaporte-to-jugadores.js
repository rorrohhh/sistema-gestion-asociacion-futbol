'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Añadir las nuevas columnas
    await queryInterface.addColumn('jugadores', 'pasaporte', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('jugadores', 'tipoIdentificacion', {
      type: Sequelize.STRING(10),
      allowNull: false,
      defaultValue: 'RUT',
    });

    // Cambiar las restricciones de rut y dv para permitir nulos
    await queryInterface.changeColumn('jugadores', 'rut', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('jugadores', 'dv', {
      type: Sequelize.STRING(1),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir: Eliminar las nuevas columnas y restaurar allowNull=false para rut/dv
    await queryInterface.removeColumn('jugadores', 'pasaporte');
    await queryInterface.removeColumn('jugadores', 'tipoIdentificacion');

    // Si tenías datos, restaurar la restricción NOT NULL puede fallar.
    // Esto es solo para revertir la migración:
    await queryInterface.changeColumn('jugadores', 'rut', {
      type: Sequelize.INTEGER,
      allowNull: false, 
    });
    await queryInterface.changeColumn('jugadores', 'dv', {
      type: Sequelize.STRING(1),
      allowNull: false,
    });
  }
};