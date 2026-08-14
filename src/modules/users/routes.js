const express = require('express');
const router = express.Router();
const userController = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { updateProfileSchema } = require('./validation');

router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validate({ body: updateProfileSchema }), userController.updateProfile);

module.exports = router;
