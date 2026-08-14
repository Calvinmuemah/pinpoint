const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const adminRepository = require('./repository');
const authRepository = require('../auth/repository');
const emailService = require('../../services/email.service');
const { ConflictError } = require('../../utils/errors');

/**
 * Onboards a client agency, initializes their account, and dispatches credentials via email.
 */
const onboardClient = async (data) => {
  // Check if user already exists
  const existing = await authRepository.findByEmail(data.email);
  if (existing) {
    throw new ConflictError(`User account with email ${data.email} already exists`);
  }

  // Generate a random temporary password if not provided
  const rawPassword = data.password || `PinPoint!${crypto.randomBytes(3).toString('hex')}#`;
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  // Create client in database with default subscription, keywords, sources, and rules
  const createdClient = await adminRepository.createClientAccount({
    name: data.name,
    email: data.email,
    passwordHash,
    subscriptionPlan: data.subscriptionPlan,
    price: data.price,
    contactInquiryId: data.contactInquiryId,
    keywords: data.keywords,
  });

  // Dispatch welcome email with credentials
  await emailService.sendClientWelcomeEmail({
    to: data.email,
    name: data.name,
    password: rawPassword,
  });

  return {
    client: createdClient,
    generatedPassword: rawPassword,
    emailSent: true,
  };
};

const getInquiries = async () => {
  return await adminRepository.getInquiriesList();
};

const getClients = async () => {
  return await adminRepository.getClientsList();
};

module.exports = {
  onboardClient,
  getInquiries,
  getClients,
};
