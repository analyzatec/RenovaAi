const bcrypt = require('bcrypt');
const Paciente = require('../models/paciente');
const Usuario = require('../models/usuario');
const { body, validationResult } = require('express-validator');
const { validarCPF } = require('../validators/cpfValidator');

const createPaciente = async (req, res) => {
  try {
    console.log("teste_create_Paciente: ", req.body)
    // Validação de entradas com express-validator
    await body('tipoSangre').notEmpty().withMessage('O tipo sanguíneo é obrigatório.').run(req);
    await body('idZona').notEmpty().withMessage('A zona é obrigatória.').run(req);
    await body('cpf')
      .custom((value) => {
        if (value && !validarCPF(value)) {
          throw new Error('CPF inválido.');
        }
        return true;
      })
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Criar o Paciente associado ao Usuário
    const pacienteData = {
      tipoSangre: req.body.tipoSangre,
      idZona: req.body.idZona,
      cpf: req.body.cpf,
    };

    const novoPaciente = await Paciente.create(pacienteData);

    res.status(201).json({
      message: 'Paciente criado com sucesso!',
      paciente: novoPaciente,
    });
  } catch (error) {
    console.error('Erro ao criar paciente:', error);
    res.status(500).json({ message: 'Erro ao criar paciente.' });
  }
};

const getPacientes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 10;
    const status = req.query.status === 'true';
    const pacientes = await Paciente.findAll({
      where: { status }, // Filtra por status
      include: [{ model: Usuario, as: 'usuario' }],
      limit: size,
      offset: page * size
    });
    const totalPacientes = await Paciente.count({ where: { status } }); // Conta pacientes com o status especificado
    const totalPages = Math.ceil(totalPacientes / size);

    res.status(200).json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro ao buscar pacientes.' });
  }
};

module.exports = {
  createPaciente,
  getPacientes,
};