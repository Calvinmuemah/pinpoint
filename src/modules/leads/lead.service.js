const leadRepository = require('./lead.repository');
const leadScoringService = require('../../ai/scoring/lead-scoring.service');
const { NotFoundError } = require('../../utils/errors');
const { getPagination } = require('../../utils/pagination');

const getLeads = async (userId, queryParams) => {
  const { page, limit, offset } = getPagination(queryParams.page, queryParams.limit);
  const { leads, total } = await leadRepository.findLeads({
    userId,
    search: queryParams.search,
    scoreFilter: queryParams.scoreFilter,
    status: queryParams.status,
    limit,
    offset,
  });

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getLeadById = async (id, userId) => {
  const lead = await leadRepository.findLeadById(id, userId);
  if (!lead) {
    throw new NotFoundError(`Lead with ID ${id} not found`);
  }
  return lead;
};

const createLead = async (userId, data) => {
  // Execute AI intelligence scoring on the lead details
  const aiIntelligence = await leadScoringService.processContent(data.details);

  const destination = data.destination || aiIntelligence.destination || null;
  const travelType = data.travelType || aiIntelligence.travelType || 'Leisure';
  const budget = data.budget || aiIntelligence.budget || 0;
  const intentScore = aiIntelligence.intentScore || 60;
  const scoreCategory = aiIntelligence.scoreCategory || leadScoringService.getCategoryFromScore(intentScore);

  const newLead = await leadRepository.createLeadRecord({
    userId,
    details: data.details,
    destination,
    travelType,
    budget,
    source: data.source || 'Manual',
    intentScore,
    scoreCategory,
    intelligence: {
      intent: `${scoreCategory} Travel Intent`,
      reasoning: aiIntelligence.reasoning,
      confidence: aiIntelligence.confidence,
      extractedEntities: aiIntelligence.extractedEntities,
      model: 'gemini-2.5-flash',
    },
  });

  return newLead;
};

const createLeadFromAI = async ({ userId, source, details, destination, travelType, budget, intelligence }) => {
  const intentScore = intelligence.intentScore || 70;
  const scoreCategory = intelligence.scoreCategory || leadScoringService.getCategoryFromScore(intentScore);

  return await leadRepository.createLeadRecord({
    userId,
    details,
    destination: destination || intelligence.destination,
    travelType: travelType || intelligence.travelType || 'Leisure',
    budget: budget || intelligence.budget || 0,
    source: source || 'AI Social Listener',
    intentScore,
    scoreCategory,
    intelligence,
  });
};

const updateStatus = async (id, status) => {
  const lead = await leadRepository.updateLeadStatus(id, status);
  if (!lead) {
    throw new NotFoundError(`Lead with ID ${id} not found`);
  }
  return lead;
};

const toggleStar = async (id) => {
  const lead = await leadRepository.toggleStarStatus(id);
  if (!lead) {
    throw new NotFoundError(`Lead with ID ${id} not found`);
  }
  return lead;
};

const archiveLead = async (id) => {
  const lead = await leadRepository.archiveLead(id);
  if (!lead) {
    throw new NotFoundError(`Lead with ID ${id} not found`);
  }
  return lead;
};

const generateCSV = async (userId, queryParams) => {
  // Fetch up to 5000 matching leads for CSV export
  const { leads } = await leadRepository.findLeads({
    userId,
    search: queryParams.search,
    scoreFilter: queryParams.scoreFilter,
    status: queryParams.status,
    limit: 5000,
    offset: 0,
  });

  const headers = [
    'ID',
    'Details',
    'Destination',
    'Travel Type',
    'Budget',
    'Source',
    'Intent Score',
    'Score Category',
    'Status',
    'Starred',
    'Created At',
  ];

  const escapeCSV = (field) => {
    if (field === null || field === undefined) return '""';
    const str = String(field).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = leads.map((l) => [
    escapeCSV(l.id),
    escapeCSV(l.details),
    escapeCSV(l.destination),
    escapeCSV(l.travel_type),
    escapeCSV(l.budget),
    escapeCSV(l.source),
    escapeCSV(l.intent_score),
    escapeCSV(l.score_category),
    escapeCSV(l.status),
    escapeCSV(l.is_starred ? 'Yes' : 'No'),
    escapeCSV(l.created_at),
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
};

module.exports = {
  getLeads,
  getLeadById,
  createLead,
  createLeadFromAI,
  updateStatus,
  toggleStar,
  archiveLead,
  generateCSV,
};
