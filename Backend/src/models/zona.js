const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Zona = sequelize.define('Zona', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Zona;