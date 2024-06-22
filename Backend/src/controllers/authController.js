const bcrypt = require('bcrypt');
const db = require('../config/database');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/emailUtils');
const { body, validationResult } = require('express-validator');
const Usuario = require('../models/usuario');

const login = async (req, res) => {
  console.log(req.body)
  await body('cpf').notEmpty().withMessage('O CPF é obrigatório.').run(req);
  await body('contrasena')
    .isLength({ min: 3 })
    .withMessage('A senha deve ter pelo menos 3 caracteres.')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const cpfTratado = req.body.cpf.replace(/[^\d]+/g, '');
    const usuario = await Usuario.findOne({ where: { cpf: cpfTratado } });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(
      req.body.contrasena.trim(),
      usuario.contrasena
    );

    if (!isMatch) {
      return res.status(401).json({ message: 'Senha incorreta.' });
    }

    const token = jwt.sign({ userId: usuario.id, userRol: usuario.rol, userName: usuario.nombre }, process.env.JWT_SECRET, { expiresIn: '2h' });
    // Gere o refresh token
    const refreshToken = jwt.sign({ userId: usuario.id, userRol: usuario.rol, userName: usuario.nombre }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '12h' });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // True em produção
      maxAge: 10800000, // 3 horas em milissegundos
      sameSite: 'Strict',
      path: '/',
    });

    res.cookie('token', token, {
      httpOnly: true,
      // secure: false, // process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'strict',
      path: '/',
    });

    res.setHeader('x-access-token', token);

    console.log("Login: ",token)
    
    return res.status(200).json({
      code: 200,
      message: 'Login realizado com sucesso!',
      data: {
        id: usuario.id,
        usuario: usuario.usuario,
        rol: usuario.rol,
        name: usuario.nombre,
        fechaNacimiento: usuario.fechaNacimiento,
        genero: usuario.genero,
        correo: usuario.correo,
        telefono: usuario.telefono,
        cpf: usuario.cpf,
        cidade: usuario.cidade,
        estado: usuario.estado
      }
    });
  } catch (error) {
    console.error('Erro ao realizar login:', error);
    return res.status(500).json({ message: 'Erro ao realizar login.' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token');
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout realizado com sucesso!' });
};

const forgotPassword = async (req, res) => {
  await body('email')
    .isEmail()
    .withMessage('Digite um email válido.')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email } = req.body;

    const user = await Usuario.findOne({ where: { usuario: email } });
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    const resetUrl = `${process.env.FRONTEND_URL}/redefinir-senha/${resetToken}`;
    await sendPasswordResetEmail(email, resetUrl);

    res
      .status(200)
      .json({ message: 'Email de redefinição de senha enviado com sucesso!' });
  } catch (error) {
    console.error(
      'Erro ao processar a solicitação de redefinição de senha:',
      error
    );
    res.status(500).json({ message: 'Erro ao processar a solicitação.' });
  }
};

const resetPassword = async (req, res) => {
  await body('token').notEmpty().withMessage('token não fornecido.').run(req);
  await body('newPassword')
    .isLength({ min: 6 })
    .withMessage('A nova senha deve ter pelo menos 6 caracteres.')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Usuario.update(
      { contrasena: hashedPassword },
      { where: { id: userId } }
    );

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ message: 'Erro ao redefinir a senha.' });
  }
};

const changePassword = async (req, res) => {
  await body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual não fornecida.')
    .run(req);
  await body('newPassword')
    .isLength({ min: 6 })
    .withMessage('A nova senha deve ter pelo menos 6 caracteres.')
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await Usuario.findByPk(userId); 
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: 'Senha atual incorreta.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Usuario.update(
      { contrasena: hashedPassword },
      { where: { id: userId } }
    );

    res.status(200).json({ message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    res.status(500).json({ message: 'Erro ao alterar a senha.' });
  }
};

const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token não encontrado.' });
    }

    // Valide o refresh token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => { // Use uma chave secreta diferente para refresh tokens
      if (err) {
        return res.status(403).json({ message: 'Refresh token inválido ou expirado.' });
      }

      // Gere um novo token de acesso
      const accessToken = jwt.sign({ userId: decoded.userId, userRol: decoded.rol, userName: decoded.nombre }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Envie o novo token de acesso em um cookie
      res.cookie('token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 10800000, 
        sameSite: 'strict',
        path: '/',
      });

      res.status(200).json({ 
        message: 'token atualizado com sucesso.',
        accessToken: accessToken
      });
    });
  } catch (error) {
    console.error('Erro ao atualizar token:', error);
    res.status(401).json({ message: 'Erro ao atualizar token.' });
  }
};

module.exports = {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
};