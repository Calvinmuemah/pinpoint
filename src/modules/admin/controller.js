const adminService = require('./service');
const { successResponse } = require('../../utils/api-response');

const createClient = async (req, res, next) => {
  try {
    const result = await adminService.onboardClient(req.body);
    return successResponse(res, 201, {
      message: 'Client onboarded successfully and credentials sent to email',
      client: result.client,
      temporaryPassword: result.generatedPassword,
    });
  } catch (error) {
    next(error);
  }
};

const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await adminService.getInquiries();
    return successResponse(res, 200, inquiries);
  } catch (error) {
    next(error);
  }
};

const getClients = async (req, res, next) => {
  try {
    const clients = await adminService.getClients();
    return successResponse(res, 200, clients);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClient,
  getInquiries,
  getClients,
};
