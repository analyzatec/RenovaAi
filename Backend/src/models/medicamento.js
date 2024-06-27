// backend/src/models/medicamento.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medicamento = sequelize.define('Medicamento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: { // Nome do medicamento
    type: DataTypes.STRING,
    allowNull: false,
  },
  dosagem: { // Dosagem do medicamento
    type: DataTypes.STRING,
    allowNull: true,
  },
  instrucoes: { // Instruções de uso
    type: DataTypes.STRING,
    allowNull: true,
  },
  idCita: { // ID da receita (cita) à qual o medicamento pertence
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Cita',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
});

module.exports = Medicamento;