const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const refreshTokenMiddleware = require('../middlewares/refreshTokenMiddleware');

router.post('/login', authController.login);
router.post('/refresh-token', refreshTokenMiddleware, authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/change-password', verifyToken, authController.changePassword);  // Rota protegida
router.post('/logout', authController.logout);

router.get('/verify-token', verifyToken, (req, res) => {
    console.log(req.headers)
    res.status(200).json({
      id: req.user.userId,
      rol: req.user.userRol,
      token: req.headers.authorization.split(' ')[1],
      name: req.user.userName
      // ... (outras informações do usuário)
    });
});

  
module.exports = router;