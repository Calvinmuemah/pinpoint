const leadService = require('./lead.service');
const { successResponse, paginatedResponse } = require('../../utils/api-response');

const getLeads = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const result = await leadService.getLeads(userId, req.query);
    return paginatedResponse(res, result.leads, result.pagination);
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const lead = await leadService.getLeadById(req.params.id, userId);
    return successResponse(res, 200, lead);
  } catch (error) {
    next(error);
  }
};

const createLead = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const newLead = await leadService.createLead(userId, req.body);
    return successResponse(res, 201, newLead);
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const updatedLead = await leadService.updateStatus(req.params.id, req.body.status);
    return successResponse(res, 200, updatedLead);
  } catch (error) {
    next(error);
  }
};

const toggleStar = async (req, res, next) => {
  try {
    const result = await leadService.toggleStar(req.params.id);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const result = await leadService.archiveLead(req.params.id);
    return successResponse(res, 200, {
      message: 'Lead archived successfully',
      id: result.id,
      archivedAt: result.archived_at,
    });
  } catch (error) {
    next(error);
  }
};

const exportLeads = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const csvData = await leadService.generateCSV(userId, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    return res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  updateStatus,
  toggleStar,
  deleteLead,
  exportLeads,
};
