const nodemailer = require('nodemailer');
require('dotenv').config();

// Configurar o nodemailer com suas credenciais de email
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_HOST, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  secure: true,
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    await transporter.sendMail({
      from: 'seu_email@example.com', 
      to: email,
      subject: 'Redefinição de Senha',
      html: `
        <p>Você solicitou a redefinição de senha para sua conta.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
      `,
    });
    console.log('Email de redefinição de senha enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar email de redefinição de senha:', error);
    throw error; 
  }
};

module.exports = {
  sendPasswordResetEmail,
};