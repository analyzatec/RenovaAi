const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Cita = require('./cita');
const Historial = require('./historial');
const Alergia = require('./alergia');
const Usuario = require('./usuario');

const Paciente = sequelize.define('Paciente', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tipoSangre: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  idZona: {
    type: DataTypes.INTEGER,
    allowNull: false,
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
  cpf: { // CPF como chave estrangeira para Usuario
    type: DataTypes.STRING(14), 
    allowNull: false,
    unique: true, 
    references: {
      model: 'Usuarios',
      key: 'cpf', 
    },
  },
});

Paciente.hasMany(Cita, { foreignKey: 'idPaciente' });
Paciente.hasMany(Historial, { foreignKey: 'idPaciente' });
Paciente.hasMany(Alergia, { foreignKey: 'idPaciente' });
// Relação 1:1 com Usuario (usando CPF como chave estrangeira)
Paciente.belongsTo(Usuario, { foreignKey: 'cpf', targetKey: 'cpf', as: 'usuario' });

module.exports = Paciente;