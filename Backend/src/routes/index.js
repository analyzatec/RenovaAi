const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const pacienteRoutes = require('./pacienteRoutes');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/usuario', verifyToken, usuarioRoutes);
router.use('/paciente', verifyToken, pacienteRoutes);

module.exports = router;