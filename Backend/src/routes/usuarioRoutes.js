// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, authorizeAdmin, authorizeDoctor } = require('../middlewares/authMiddleware');

// ... (outras rotas)
router.post('/usuarios', verifyToken, authorizeAdmin, usuarioController.createUsuario); // Protegendo a rota
router.post('/usuarios/doctor', verifyToken, authorizeDoctor, usuarioController.createUsuario);
router.post('/pacientes', verifyToken, authorizeDoctor, usuarioController.registrarPaciente);
router.get('/usuarios/cpf/:cpf', verifyToken, usuarioController.getUsuarioByCPF);
router.get('/usuarios', verifyToken, authorizeAdmin, usuarioController.getUsuarios);
router.get('/usuarios/:id', verifyToken, authorizeAdmin, usuarioController.getUsuarioById);
router.get('/usuariosPaciente/:id', verifyToken, authorizeDoctor, usuarioController.getUsuarioById);
router.get('/todos-pacientes', verifyToken, authorizeDoctor, usuarioController.getTodosPacientes);
router.put('/usuarios/:id', verifyToken, authorizeAdmin, usuarioController.updateUsuario); // Rota para atualizar um usuário
router.put('/pacientes/:id', verifyToken, authorizeDoctor, usuarioController.updateUsuario);
router.put('/usuarios/desativar/:id', verifyToken, authorizeAdmin, usuarioController.desativarUsuario);
router.put('/usuarios/desativarPaciente/:id', verifyToken, authorizeDoctor, usuarioController.desativarUsuario);

module.exports = router;