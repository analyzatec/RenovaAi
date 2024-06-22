const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { // Substitua pelos seus dados
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false // Desative o log para produção
});

module.exports = sequelize;