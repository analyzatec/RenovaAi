// validators/cpfValidator.js
const validateCpf = require('validar-cpf');

const validarCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]+/g, '');
    return validateCpf(cpf);
  };
  
  module.exports = { validarCPF };