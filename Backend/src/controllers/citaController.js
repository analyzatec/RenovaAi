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
      attributes: ['id', 'idPaciente', 'dataUltimaConsulta', 'dataRegistro', 'idZona'],
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

// Função para buscar uma receita por ID
const getReceitaById = async (req, res) => {
  const { id } = req.params;

  try {
    // 1. Busca a receita pelo ID
    const receita = await Cita.findByPk(id);

    if (!receita) {
      return res.status(404).json({ message: 'Receita não encontrada.' });
    }

    // 2. Busca os dados do paciente (usuário)
    const paciente = await Usuario.findByPk(receita.idPaciente, {
      attributes: ['cpf', 'idZona', 'nombre']
    });

    // 3. Busca os medicamentos associados à receita
    const medicamentos = await Medicamento.findAll({
      where: { idCita: receita.id }
    });

    // 4. Combina os dados em um único objeto
    const receitaCompleta = {
      ...receita.toJSON(), // Converte a receita para um objeto JSON
      Paciente: paciente ? paciente.toJSON() : null, // Adiciona os dados do paciente
      Medicamentos: medicamentos // Adiciona os medicamentos
    };

    res.status(200).json(receitaCompleta);
  } catch (error) {
    console.error('Erro ao buscar receita:', error);
    res.status(500).json({ message: 'Erro ao buscar receita.' });
  }
};

// Função para atualizar uma receita
const atualizarReceita = async (req, res) => {
  const { id } = req.params;
  const { dataUltimaConsulta, idZona } = req.body; // Inclua idZona

  try {
    const receita = await Cita.findByPk(id);
    console.log(receita)

    if (!receita) {
      return res.status(404).json({ message: 'Receita não encontrada.' });
    }

    await receita.update({ dataUltimaConsulta, idZona }); // Atualize idZona

    res.status(200).json({ message: 'Receita atualizada com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar receita:', error);
    res.status(500).json({ message: 'Erro ao atualizar receita.' });
  }
};

const atualizarMedicamento = async (req, res) => {
  const { id } = req.params;
  const { nome, dosagem, instrucoes } = req.body;

  try {
    const medicamento = await Medicamento.findByPk(id);

    if (!medicamento) {
      return res.status(404).json({ message: 'Medicamento não encontrado.' });
    }

    await medicamento.update({ nome, dosagem, instrucoes });

    res.status(200).json({ message: 'Medicamento atualizado com sucesso!' });
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar medicamento.' });
  }
};

// ... (outras funções do controller - criar, editar, visualizar receita e medicamentos)

module.exports = {
  getPacientesComReceitas,
  cadastrarReceita,
  cadastrarMedicamentos,
  getReceitaById,
  atualizarReceita,
  atualizarMedicamento,
  // ... (outras funções do controller)
};