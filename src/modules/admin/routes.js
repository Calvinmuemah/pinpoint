const express = require('express');
const router = express.Router();
const adminController = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const adminMiddleware = require('../../middleware/admin.middleware');
const validate = require('../../middleware/validation.middleware');
const { onboardClientSchema } = require('./validation');

// Require authentication & admin role
router.use(authMiddleware);
router.use(adminMiddleware);

router.post('/clients', validate({ body: onboardClientSchema }), adminController.createClient);
router.get('/clients', adminController.getClients);
router.get('/inquiries', adminController.getInquiries);

module.exports = router;
