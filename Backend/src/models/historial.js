const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Historial = sequelize.define('Historial', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  motivoConsulta: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  enfermedadActual: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  antecedentesPersonales: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  antecedentesFamiliares: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  examenFisico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  diagnostico: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  observaciones: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  idPaciente: { // ID do paciente (usuário com rol 'paciente')
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id',
    },
  }
});

module.exports = Historial;