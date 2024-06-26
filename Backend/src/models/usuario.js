// models/usuario.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  contrasena: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rol: {
    type: DataTypes.ENUM('admin', 'doctor', 'asistente', 'analista'),
    allowNull: false,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaNacimiento: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  genero: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sexualidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  raca: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cpf: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true,
  },
  cidade: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  estado: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  byId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  // Campos específicos de pacientes
  tipoSangre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idZona: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Zonas',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

// Hook beforeCreate para criptografar a senha antes de criar o usuário
Usuario.beforeCreate(async (usuario) => {
  if (usuario.contrasena) {
    const saltRounds = 10;
    usuario.contrasena = await bcrypt.hash(usuario.contrasena, saltRounds);
  }
});

module.exports = Usuario;