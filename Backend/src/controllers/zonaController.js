// src/controllers/zonaController.js
const Zona = require('../models/zona');

const getZonas = async (req, res) => {
  try {
    const zonas = await Zona.findAll();
    res.status(200).json(zonas);
  } catch (error) {
    console.error('Erro ao buscar zonas:', error);
    res.status(500).json({ message: 'Erro ao buscar zonas.' });
  }
};

module.exports = {
  getZonas,
};