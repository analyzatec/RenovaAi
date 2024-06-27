// backend/src/models/cita.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dataRegistro: { // Data de registro da receita
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Define a data atual como padrão
  },
  dataUltimaConsulta: { // Data da última consulta médica
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  idPaciente: { // ID do paciente (usuário com rol 'paciente')
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  },
  idUsuarioCadastro: { // ID do usuário que cadastrou a receita
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  },
  idZona: { // ID da zona (UBS)
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Zonas',
      key: 'id',
    },
  },
});

module.exports = Cita;