// src/controllers/usuarioController.js
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario');
const createDOMPurify = require('dompurify');
const { body, validationResult } = require('express-validator');
const { JSDOM } = require('jsdom');
const { validarCPF } = require('../validators/cpfValidator');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const createUsuario = async (req, res) => {
  console.log("teste_Create: ",req.body)
  // Regras de validação
  await body('contrasena')
    .isLength({ min: 8 })
    .matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]+$/)
    .not().isIn(['password', '123456', 'qwerty', '12345678', 'admin', 'user', 'senha'])
    .withMessage('A senha deve ter pelo menos 8 caracteres, incluindo letras, números e caracteres especiais.')
    .run(req);
  await body('rol')
    .isIn(['doctor', 'asistente', 'analista'])
    .withMessage('Papel de usuário inválido.')
    .run(req);
  await body('nombre').notEmpty().withMessage('O nome é obrigatório.').run(req);
  await body('fechaNacimiento').isDate().withMessage('A data de nascimento deve ser uma data válida.').run(req);
  await body('genero').notEmpty().withMessage('O gênero é obrigatório.').run(req);
  await body('sexualidade').notEmpty().withMessage('A sexualidade é obrigatória.').run(req);
  await body('raca').notEmpty().withMessage('A raça é obrigatória.').run(req);
  await body('correo').isEmail().withMessage('O email é inválido.').run(req);
  await body('telefono').isMobilePhone('pt-BR').withMessage('O telefone é inválido.').run(req);
  await body('cpf')
    .custom((value) => {
      if (!validarCPF(value)) {
        throw new Error('CPF inválido.');
      }
      return true;
    })
    .run(req);
  await body('cidade').notEmpty().withMessage('A cidade é obrigatória').run(req);
  await body('estado').notEmpty().withMessage('O estado é obrigatório').run(req);

  // Validações para campos de paciente (se aplicável)
  if (req.body.rol === 'asistente') {
    await body('tipoSangre').notEmpty().withMessage('O tipo sanguíneo é obrigatório.').run(req);
    await body('idZona').notEmpty().withMessage('A zona é obrigatória.').run(req);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validação do role (apenas 'asistente' é permitido para 'doctor')
  if (req.user.userRol === 'doctor' && req.body.rol !== 'asistente') {
    return res.status(403).json({ message: 'Médicos só podem registrar usuários com o role "asistente".' });
  }

  try {
    const usuario = await Usuario.create({
      contrasena: req.body.contrasena.trim(),
      rol: req.body.rol,
      nombre: req.body.nombre.trim(),
      fechaNacimiento: req.body.fechaNacimiento,
      genero: req.body.genero,
      sexualidade: req.body.sexualidade,
      raca: req.body.raca,
      correo: req.body.correo.trim(),
      telefono: req.body.telefono.trim(),
      cpf: req.body.cpf ? req.body.cpf.replace(/[^\d]+/g, '') : null,
      cidade: req.body.cidade.trim(),
      estado: req.body.estado,
      byId: req.body.byId,
      // Campos de paciente (se aplicável)
      tipoSangre: req.body.tipoSangre,
      idZona: req.body.idZona,
      status: req.body.status
    });

    return res.status(201).json({
      code: 201,
      message: 'Usuário registrado com sucesso!',
      data: {
        id: usuario.id,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.log(error)
    console.error('Erro ao registrar usuário:', error);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'CPF já cadastrado.' });
    }

    return res.status(500).json({ message: 'Erro ao registrar usuário.' });
  }
};

// Função para obter a lista de usuários
const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll(); // Busca todos os usuários do banco de dados
    res.status(200).json(usuarios); // Retorna a lista de usuários em formato JSON
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ message: 'Erro ao buscar usuários.' });
  }
};

const getTodosPacientes = async (req, res) => {
  const { status } = req.query; // Parâmetro de filtro de status

  try {
    const options = {
      where: { rol: 'asistente' }, // Filtra por usuários com rol 'paciente'
    };

    // Adiciona filtro de status, se fornecido
    if (status !== undefined) {
      options.where.status = status === 'true';
    }

    const pacientes = await Usuario.findAll(options);

    res.status(200).json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ message: 'Erro ao buscar pacientes.' });
  }
};

const getUsuarioByCPF = async (req, res) => {
  try {
    const cpf = req.params.cpf;

    // 2. Buscar o usuário pelo CPF
    const usuario = await Usuario.findOne({ where: { cpf: cpf } });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // 3. Retornar os dados do usuário
    res.status(200).json({
      usuario: {
        id: usuario.id,
        usuario: usuario.usuario,
        rol: usuario.rol,
        name: usuario.nombre,
        fechaNacimiento: usuario.fechaNacimiento,
        genero: usuario.genero,
        sexualidade: usuario.sexualidade,
        raca: usuario.raca,
        correo: usuario.correo,
        telefono: usuario.telefono,
        cpf: usuario.cpf,
        cidade: usuario.cidade,
        estado: usuario.estado
      }
     });
  } catch (error) {
    console.error('Erro ao buscar usuário por CPF:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};

const updateUsuario = async (req, res) => {
  const usuarioId = req.params.id;
  console.log("updateUsuario: ", req.body)

  if (req.user.userRol === 'admin') {
    await body('rol')
      .isIn([ 'doctor', 'asistente', 'analista'])
      .withMessage('Papel de usuário inválido.')
      .run(req);
  }
  await body('nombre').notEmpty().withMessage('O nome é obrigatório.').run(req);
  await body('fechaNacimiento').isDate().withMessage('A data de nascimento deve ser uma data válida.').run(req);
  await body('genero').notEmpty().withMessage('O gênero é obrigatório.').run(req);
  await body('correo').isEmail().withMessage('O email é inválido.').run(req);
  await body('telefono').isMobilePhone('pt-BR').withMessage('O telefone é inválido.').run(req);
  await body('cpf')
    .custom((value) => {
      if (!validarCPF(value)) {
        throw new Error('CPF inválido.');
      }
      return true;
    })
    .run(req);
  await body('cidade').notEmpty().withMessage('A cidade é obrigatória').run(req);
  await body('estado').notEmpty().withMessage('O estado é obrigatório').run(req);

  if (req.body.rol === 'asistente' && req.user.userRol === 'doctor') {
    await body('tipoSangre').notEmpty().withMessage('O tipo sanguíneo é obrigatório.').run(req);
    await body('idZona').notEmpty().withMessage('A zona é obrigatória.').run(req);
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Busca o usuário pelo ID
    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza os campos do usuário, exceto a senha
    await usuario.update({
      rol: req.body.rol,
      nombre: req.body.nombre.trim(),
      fechaNacimiento: req.body.fechaNacimiento,
      genero: req.body.genero,
      sexualidade: req.body.sexualidade,
      raca: req.body.raca,
      correo: req.body.correo.trim(),
      telefono: req.body.telefono.trim(),
      cpf: req.body.cpf ? req.body.cpf.replace(/[^\d]+/g, '') : null,
      cidade: req.body.cidade.trim(),
      estado: req.body.estado,
      byId: req.body.byId,
      // Campos de paciente
      tipoSangre: req.body.tipoSangre,
      idZona: req.body.idZona,
      status: req.body.status
    });

      return res.status(200).json({ // Use 200 OK para sucesso na atualização
        code: 200,
        message: 'Usuário atualizado com sucesso!',
        data: {
          id: usuario.id,
          rol: usuario.rol,
        },
      });
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar usuário.' });
    }
  };

const getUsuarioById = async (req, res) => {
  const usuarioId = req.params.id;

  try {
    const usuario = await Usuario.findByPk(usuarioId); // Busca o usuário pelo ID

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.status(200).json(usuario); // Retorna o usuário em formato JSON
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    res.status(500).json({ message: 'Erro ao buscar usuário.' });
  }
};

// Função para desativar um usuário
const desativarUsuario = async (req, res) => {
  const usuarioId = req.params.id;
  const { status } = req.body; // Recebe o status do corpo da requisição

  try {
    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    // Atualiza o status com o valor recebido
    await usuario.update({ status });

    // Define a mensagem de sucesso de acordo com o status
    const mensagem = status ? 'Usuário ativado com sucesso!' : 'Usuário desativado com sucesso!';

    res.status(200).json({ message: mensagem });
  } catch (error) {
    console.error('Erro ao atualizar status do usuário:', error);
    res.status(500).json({ message: 'Erro ao atualizar status do usuário.' });
  }
};

const registrarPaciente = async (req, res) => {
  const cpf = req.body.cpf ? req.body.cpf.replace(/[^\d]+/g, '') : null;

  try {
    // Busca um usuário existente com o CPF fornecido
    let usuario = await Usuario.findOne({ where: { cpf } });

    if (usuario) {
      // Se o usuário já existe, atualiza os campos de paciente
      await usuario.update({
        tipoSangre: req.body.tipoSangre,
        idZona: req.body.idZona,
        status: req.body.status || usuario.status // Mantém o status atual se não for fornecido
      });
    } else {
      // Se o usuário não existe, cria um novo usuário com rol 'paciente'
      usuario = await Usuario.create({
        // ... (campos de usuário: nome, data de nascimento, etc.)
        rol: 'paciente',
        tipoSangre: req.body.tipoSangre,
        idZona: req.body.idZona,
        status: req.body.status || true // Define o status como true (ativo) por padrão
      });
    }

    res.status(201).json({
      message: 'Paciente registrado com sucesso!',
      usuario: usuario
    });
  } catch (error) {
    console.error('Erro ao registrar paciente:', error);
    res.status(500).json({ message: 'Erro ao registrar paciente.' });
  }
};

// Adicionar outras funções relacionadas a usuários aqui, se necessário

module.exports = {
  createUsuario,
  getUsuarioByCPF,
  getUsuarios,
  getTodosPacientes,
  updateUsuario,
  getUsuarioById,
  desativarUsuario,
  registrarPaciente,
  // ... outras funções
};