const express = require('express');
const router = express.Router();
const zonaController = require('../controllers/zonaController'); // Crie o controller zonaController.js
const { verifyToken } = require('../middlewares/authMiddleware');

// Rota para buscar todas as zonas
router.get('/zonas', verifyToken, zonaController.getZonas);

module.exports = router;