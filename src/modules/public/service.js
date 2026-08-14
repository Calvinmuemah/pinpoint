const contactRepository = require('./repository');

const submitContactInquiry = async (inquiryData) => {
  return await contactRepository.createInquiry(inquiryData);
};

module.exports = {
  submitContactInquiry,
};
