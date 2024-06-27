const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const usuarioRoutes = require('./usuarioRoutes');
const citaRoutes = require('./citaRoutes');
const zonaRoutes = require('./zonaRoutes');
const { verifyToken } = require('../middlewares/authMiddleware');

router.use('/auth', authRoutes);
router.use('/zona', zonaRoutes);
router.use('/usuario', verifyToken, usuarioRoutes);
router.use('/cita', verifyToken, citaRoutes);

module.exports = router;