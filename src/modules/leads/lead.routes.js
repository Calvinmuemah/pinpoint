const express = require('express');
const router = express.Router();
const leadController = require('./lead.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validation.middleware');
const { createLeadSchema, updateStatusSchema, getLeadsQuerySchema } = require('./validation');

router.use(authMiddleware);

router.get('/export', validate({ query: getLeadsQuerySchema }), leadController.exportLeads);
router.get('/', validate({ query: getLeadsQuerySchema }), leadController.getLeads);
router.post('/', validate({ body: createLeadSchema }), leadController.createLead);
router.get('/:id', leadController.getLeadById);
router.patch('/:id/status', validate({ body: updateStatusSchema }), leadController.updateStatus);
router.post('/:id/star', leadController.toggleStar);
router.delete('/:id', leadController.deleteLead);

module.exports = router;
