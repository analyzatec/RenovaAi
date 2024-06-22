// src/middlewares/refreshTokenMiddleware.js
const jwt = require('jsonwebtoken');

const refreshTokenMiddleware = (req, res, next) => {
  const refreshToken = req.cookies.refreshToken; // Obtenha o refresh token do cookie

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token não encontrado.' });
  }

  // Valide o refresh token
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => { // Use uma chave secreta diferente para refresh tokens
    if (err) {
      return res.status(403).json({ message: 'Refresh token inválido ou expirado.' });
    }

    // Gere um novo token de acesso
    const accessToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Envie o novo token de acesso em um cookie
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, 
      sameSite: 'strict',
      path: '/',
    });

    next(); // Continue com a próxima rota
  });
};

module.exports = refreshTokenMiddleware;