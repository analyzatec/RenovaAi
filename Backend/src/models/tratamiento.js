const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Historial = require('./historial'); // Importe o modelo Historial

const Tratamiento = sequelize.define('Tratamiento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  medicamento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  frecuencia: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duracion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  viaAdministracion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  indicaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  historialClinicoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Historials', // Nome do modelo Historial (plural)
      key: 'id'
    },
    onDelete: 'CASCADE', // Opção para deletar em cascata
    onUpdate: 'CASCADE'  // Opção para atualizar em cascata
  }
});

Tratamiento.belongsTo(Historial, { foreignKey: 'historialClinicoId' });

module.exports = Tratamiento;