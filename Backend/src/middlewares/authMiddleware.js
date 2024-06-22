// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { validarCPF } = require('../validators/cpfValidator'); // Importe o validador

const authorizeAdmin = (req, res, next) => {
  if (req.user.userRol !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Você não tem permissão para realizar esta ação.' });
  }
  next();
};

const authorizeDoctor = (req, res, next) => {
  if (req.user.userRol === 'doctor') {
    next();
  } else {
    return res.status(403).json({ message: 'Acesso negado. Apenas médicos podem realizar esta ação.' });
  }
};

// Middleware para verificar autenticação JWT
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Autenticação necessária.' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
    req.user = user;
    next();
  });
};

module.exports = { authorizeAdmin, verifyToken, authorizeDoctor };