const express = require('express');
const router = express.Router();
const authController = require('./controller');
const validate = require('../../middleware/validation.middleware');
const {
  loginSchema,
  registerSchema,
  refreshTokenSchema,
  logoutSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} = require('./validation');

router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/register', validate({ body: registerSchema }), authController.register);
router.post('/refresh', validate({ body: refreshTokenSchema }), authController.refreshToken);
router.post('/logout', validate({ body: logoutSchema }), authController.logout);
router.post('/forgot-password', validate({ body: forgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), authController.resetPassword);

module.exports = router;

