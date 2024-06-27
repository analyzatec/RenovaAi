// backend/src/controllers/citaController.js
const Cita = require('../models/cita');
const Zona = require('../models/zona')
const Medicamento = require('../models/medicamento');
const Usuario = require('../models/usuario');
const { Op } = require('sequelize');

// Função para obter a lista de pacientes que possuem receitas
const getPacientesComReceitas = async (req, res) => {
  try {
    // 1. Busca todas as receitas, ordenadas pela data de registro em ordem decrescente
    const receitas = await Cita.findAll({
      attributes: ['idPaciente', 'dataUltimaConsulta', 'dataRegistro', 'idZona'],
      order: [['dataRegistro', 'DESC']],
      include: [
        {
          model: Zona,
          attributes: ['nombre'],
          as: 'Zona'
        }
      ]
    });
    // 2. Cria um conjunto (Set) para armazenar os IDs dos pacientes com receitas
    const pacientesIds = new Set(receitas.map(receita => receita.idPaciente));

    // 3. Busca os pacientes com base nos IDs do conjunto
    const pacientes = await Usuario.findAll({
      where: {
        id: { [Op.in]: Array.from(pacientesIds) }, // Filtra por pacientes com IDs no conjunto
        rol: 'asistente'
      },
      attributes: ['id', 'nombre', 'cpf', 'fechaNacimiento']
    });

    // 4. Associa as receitas aos pacientes
    const pacientesComReceitas = pacientes.map(paciente => {
      // Encontra a receita mais recente para o paciente
      const receita = receitas.find(r => r.idPaciente === paciente.id);
      return {
        ...paciente.toJSON(), // Converte o paciente para um objeto JSON
        Receitas: [receita] // Adiciona a receita ao paciente
      };
    });

    res.status(200).json(pacientesComReceitas);
  } catch (error) {
    console.error('Erro ao buscar pacientes com receitas:', error);
    res.status(500).json({ message: 'Erro ao buscar pacientes com receitas.' });
  }
};

// Função para cadastrar uma nova receita
const cadastrarReceita = async (req, res) => {
  const { dataUltimaConsulta, idPaciente, idUsuarioCadastro, idZona } = req.body;

  try {
    const novaReceita = await Cita.create({
      dataUltimaConsulta,
      idPaciente,
      idUsuarioCadastro,
      idZona,
    });

    res.status(201).json(novaReceita); // Retorna a receita criada
  } catch (error) {
    console.error('Erro ao cadastrar receita:', error);
    res.status(500).json({ message: 'Erro ao cadastrar receita.' });
  }
};

// Função para cadastrar medicamentos de uma receita
const cadastrarMedicamentos = async (req, res) => {
  const { nome, dosagem, instrucoes, idCita } = req.body;

  try {
    const novoMedicamento = await Medicamento.create({
      nome,
      dosagem,
      instrucoes,
      idCita,
    });

    res.status(201).json(novoMedicamento); // Retorna o medicamento criado
  } catch (error) {
    console.error('Erro ao cadastrar medicamento:', error);
    res.status(500).json({ message: 'Erro ao cadastrar medicamento.' });
  }
};

// ... (outras funções do controller - criar, editar, visualizar receita e medicamentos)

module.exports = {
  getPacientesComReceitas,
  cadastrarReceita,
  cadastrarMedicamentos
  // ... (outras funções do controller)
};