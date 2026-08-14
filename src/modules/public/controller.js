const contactService = require('./service');
const { successResponse } = require('../../utils/api-response');

const handleContactInquiry = async (req, res, next) => {
  try {
    const inquiry = await contactService.submitContactInquiry(req.body);
    return successResponse(res, 201, {
      message: 'Contact inquiry submitted successfully',
      inquiryId: inquiry.id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleContactInquiry,
};
