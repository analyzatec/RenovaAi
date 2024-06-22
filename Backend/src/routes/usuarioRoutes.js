// routes/usuarioRoutes.js
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, authorizeAdmin, authorizeDoctor } = require('../middlewares/authMiddleware');

// ... (outras rotas)
router.post('/usuarios', verifyToken, authorizeAdmin, usuarioController.createUsuario); // Protegendo a rota
router.post('/usuarios/doctor', verifyToken, authorizeDoctor, usuarioController.createUsuario);
router.get('/usuarios/cpf/:cpf', verifyToken, usuarioController.getUsuarioByCPF);
router.get('/usuarios', verifyToken, authorizeAdmin, usuarioController.getUsuarios);
router.put('/usuarios/:id', verifyToken, authorizeAdmin, usuarioController.updateUsuario); // Rota para atualizar um usuário
router.get('/usuarios/:id', verifyToken, authorizeAdmin, usuarioController.getUsuarioById);
router.delete('/usuarios/:id', verifyToken, authorizeAdmin, usuarioController.deleteUsuario); 

module.exports = router;