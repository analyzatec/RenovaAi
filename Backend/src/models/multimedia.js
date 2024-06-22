const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Historial = require('./historial'); // Importe o modelo Historial

const Multimedia = sequelize.define('Multimedia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false
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

Multimedia.belongsTo(Historial, { foreignKey: 'historialClinicoId' });

module.exports = Multimedia;