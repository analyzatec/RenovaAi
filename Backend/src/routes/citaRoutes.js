// backend/src/routes/citaRoutes.js
const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { verifyToken, authorizeDoctor } = require('../middlewares/authMiddleware');

// Rota para listar pacientes que possuem receitas
router.get('/pacientes-com-receitas', verifyToken, authorizeDoctor, citaController.getPacientesComReceitas);
router.get('/receitas/:id', verifyToken, authorizeDoctor, citaController.getReceitaById);
router.post('/receitas', verifyToken, authorizeDoctor, citaController.cadastrarReceita);
router.post('/medicamentos', verifyToken, authorizeDoctor, citaController.cadastrarMedicamentos);
router.put('/receitas/:id', verifyToken, authorizeDoctor, citaController.atualizarReceita);
router.put('/medicamentos/:id', verifyToken, authorizeDoctor, citaController.atualizarMedicamento);

// ... (outras rotas)

module.exports = router;