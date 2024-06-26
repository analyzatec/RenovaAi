const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
// const pacienteRoutes = require('./pacienteRoutes');
const zonaRoutes = require('./zonaRoutes');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/zona', zonaRoutes);
router.use('/usuario', verifyToken, usuarioRoutes);
// router.use('/paciente', verifyToken, pacienteRoutes);

module.exports = router;