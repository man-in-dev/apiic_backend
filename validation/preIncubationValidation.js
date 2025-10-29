const Joi = require('joi');

// Team member validation schema
const teamMemberSchema = Joi.object({
    name: Joi.string().required().trim().max(100),
    address: Joi.string().required().trim().max(500),
    contact: Joi.string().required().trim().max(200)
});

// Shareholder validation schema
const shareholderSchema = Joi.object({
    name: Joi.string().required().trim().max(100),
    shares: Joi.number().integer().min(0).required(),
    percentage: Joi.number().min(0).max(100).required(),
    designation: Joi.string().required().trim().max(100)
});

// Pre-incubation application validation schema
const preIncubationApplicationSchema = Joi.object({
    // A. Applicant Details
    applicantName: Joi.string().required().trim().max(100),
    applicantBackground: Joi.string().allow('').trim(),
    companyName: Joi.string().required().trim().max(200),
    foundingTeam: Joi.array().items(teamMemberSchema).min(1),
    shareholdingStructure: Joi.array().items(shareholderSchema).min(1),
    partnershipDetails: Joi.string().allow('').trim(),
    hasFiledITReturn: Joi.boolean().default(false),
    registrationNo: Joi.string().allow('').trim(),
    registrationDate: Joi.string().allow('').trim(),
    registeringAuthority: Joi.string().allow('').trim(),
    pan: Joi.string().allow('').trim(),
    tan: Joi.string().allow('').trim(),

    // B. Background
    problemAddressed: Joi.string().required().trim().min(50).max(1000),
    proposedSolution: Joi.string().required().trim().min(50).max(1000),

    // C. Business Details
    productServiceDetails: Joi.string().required().trim().min(100).max(2000),
    targetCustomer: Joi.string().required().trim().min(100).max(2000),
    businessPlan: Joi.string().required().trim().min(100).max(2000),
    marketSize: Joi.string().required().trim().min(100).max(2000),
    goToMarketStrategy: Joi.string().required().trim().min(100).max(2000),
    revenueModel: Joi.string().required().trim().min(100).max(2000),
    competitors: Joi.string().required().trim().min(100).max(2000),
    fundingInvestment: Joi.string().required().trim().min(100).max(2000),
    swotAnalysis: Joi.string().required().trim().min(100).max(2000),
    otherDetails: Joi.string().allow('').trim(),

    // D. Scientific/Technological Details
    technologyCategory: Joi.string().valid('to-be-developed', 'self-developed', 'acquired', 'licensed', 'off-the-shelf').required(),
    technologyDetails: Joi.string().required().trim().min(50).max(1000),
    canBePatented: Joi.boolean().default(false),
    conductedPatentSearch: Joi.boolean().default(false),
    appliedForPatent: Joi.boolean().default(false),
    patentDetails: Joi.string().allow('').trim(),
    otherIPRProtection: Joi.string().allow('').trim(),

    // E. Incubation Requirement
    infrastructureFacilities: Joi.string().required().trim().min(50).max(1000),
    mentors: Joi.string().required().trim().min(20).max(500),
    manpower: Joi.string().required().trim().min(20).max(500),

    // Application Status
    applicationStatus: Joi.string().valid('submitted', 'under-review', 'approved', 'rejected', 'incubated', 'graduated', 'exited').default('submitted'),
    currentStage: Joi.string().valid('pre-incubation', 'incubation', 'graduated', 'exited').default('pre-incubation'),
    status: Joi.string().valid('active', 'inactive', 'graduated', 'exited').default('active'),

    // Progress Tracking
    fundingReceived: Joi.number().min(0).default(0),
    employees: Joi.number().integer().min(0).default(0),
    achievements: Joi.array().items(Joi.string().trim()),
    milestones: Joi.array().items(Joi.string().trim())
});

// Update validation schema (allows partial updates)
const updatePreIncubationApplicationSchema = Joi.object({
    applicantName: Joi.string().trim().max(100),
    applicantBackground: Joi.string().allow('').trim(),
    companyName: Joi.string().trim().max(200),
    foundingTeam: Joi.array().items(teamMemberSchema),
    shareholdingStructure: Joi.array().items(shareholderSchema),
    partnershipDetails: Joi.string().allow('').trim(),
    hasFiledITReturn: Joi.boolean(),
    registrationNo: Joi.string().allow('').trim(),
    registrationDate: Joi.string().allow('').trim(),
    registeringAuthority: Joi.string().allow('').trim(),
    pan: Joi.string().allow('').trim(),
    tan: Joi.string().allow('').trim(),
    problemAddressed: Joi.string().trim().min(50).max(1000),
    proposedSolution: Joi.string().trim().min(50).max(1000),
    productServiceDetails: Joi.string().trim().min(100).max(2000),
    targetCustomer: Joi.string().trim().min(100).max(2000),
    businessPlan: Joi.string().trim().min(100).max(2000),
    marketSize: Joi.string().trim().min(100).max(2000),
    goToMarketStrategy: Joi.string().trim().min(100).max(2000),
    revenueModel: Joi.string().trim().min(100).max(2000),
    competitors: Joi.string().trim().min(100).max(2000),
    fundingInvestment: Joi.string().trim().min(100).max(2000),
    swotAnalysis: Joi.string().trim().min(100).max(2000),
    otherDetails: Joi.string().allow('').trim(),
    technologyCategory: Joi.string().valid('to-be-developed', 'self-developed', 'acquired', 'licensed', 'off-the-shelf'),
    technologyDetails: Joi.string().trim().min(50).max(1000),
    canBePatented: Joi.boolean(),
    conductedPatentSearch: Joi.boolean(),
    appliedForPatent: Joi.boolean(),
    patentDetails: Joi.string().allow('').trim(),
    otherIPRProtection: Joi.string().allow('').trim(),
    infrastructureFacilities: Joi.string().trim().min(50).max(1000),
    mentors: Joi.string().trim().min(20).max(500),
    manpower: Joi.string().trim().min(20).max(500),
    applicationStatus: Joi.string().valid('submitted', 'under-review', 'approved', 'rejected', 'incubated', 'graduated', 'exited'),
    currentStage: Joi.string().valid('pre-incubation', 'incubation', 'graduated', 'exited'),
    status: Joi.string().valid('active', 'inactive', 'graduated', 'exited'),
    fundingReceived: Joi.number().min(0),
    employees: Joi.number().integer().min(0),
    achievements: Joi.array().items(Joi.string().trim()),
    milestones: Joi.array().items(Joi.string().trim())
});

// Query parameters validation
const queryParamsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().allow('').trim(),
    applicationStatus: Joi.string().valid('submitted', 'under-review', 'approved', 'rejected', 'incubated', 'graduated', 'exited'),
    currentStage: Joi.string().valid('pre-incubation', 'incubation', 'graduated', 'exited'),
    status: Joi.string().valid('active', 'inactive', 'graduated', 'exited'),
    sortBy: Joi.string().valid('submittedAt', 'applicantName', 'companyName', 'applicationStatus').default('submittedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
    preIncubationApplicationSchema,
    updatePreIncubationApplicationSchema,
    queryParamsSchema
};
