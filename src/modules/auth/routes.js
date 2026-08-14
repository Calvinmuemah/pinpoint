const express = require('express');
const router = express.Router();
const authController = require('./controller');
const validate = require('../../middleware/validation.middleware');
const { loginSchema, registerSchema } = require('./validation');

router.post('/login', validate({ body: loginSchema }), authController.login);
router.post('/register', validate({ body: registerSchema }), authController.register);

module.exports = router;
