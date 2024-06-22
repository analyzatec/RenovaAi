const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Alergia = sequelize.define('Alergia', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  reaccion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tratamiento: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  idPaciente: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Pacientes', 
      key: 'id'
    }
  }
});

module.exports = Alergia;