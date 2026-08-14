const express = require('express');
const router = express.Router();
const contactController = require('./controller');
const validate = require('../../middleware/validation.middleware');
const { contactInquirySchema } = require('./validation');
const { publicContactLimiter } = require('../../middleware/rate-limit.middleware');

router.post('/contact', publicContactLimiter, validate({ body: contactInquirySchema }), contactController.handleContactInquiry);

module.exports = router;
