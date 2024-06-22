// routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/pacienteController');
const { verifyToken, authorizeDoctor } = require('../middlewares/authMiddleware');

router.post('/pacientes', verifyToken, pacienteController.createPaciente);
router.get('/pacientes', verifyToken, authorizeDoctor, pacienteController.getPacientes);
// ... (outras rotas para Paciente, se necessário)

module.exports = router;