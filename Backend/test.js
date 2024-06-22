const { validarCPF } = require('./src/validators/cpfValidator');

const cpfValido = '01841447366'; // Substitua por um CPF válido
const cpfInvalido = '12345678900'; // Substitua por um CPF inválido

console.log(`CPF válido: ${validarCPF(cpfValido)}`);
console.log(`CPF inválido: ${validarCPF(cpfInvalido)}`);