const Joi = require('joi');

// Incubation application validation schema
const incubationApplicationSchema = Joi.object({
    // Applicant Details
    applicantName: Joi.string().required().trim().max(100),
    applicantEmail: Joi.string().email().required().trim(),
    dateOfBirth: Joi.string().required().trim(),
    qualification: Joi.string().required().trim().max(200),
    contactDetails: Joi.string().required().trim().min(50).max(1000),
    entityType: Joi.string().valid('startup', 'individual').required(),
    companyRegistrationDetails: Joi.string().allow('').trim(),

    // Innovation Details
    innovationTitle: Joi.string().required().trim().max(200),
    prototypeTime: Joi.string().required().trim().max(100),
    category: Joi.string().valid('Process', 'Product', 'New Application', 'Other').required(),
    innovationDescription: Joi.string().required().trim().min(100).max(2000),
    applications: Joi.string().required().trim().min(50).max(1000),
    novelty: Joi.string().required().trim().min(50).max(1000),
    businessModel: Joi.string().required().trim().min(50).max(1000),
    rndStatus: Joi.string().required().trim().min(50).max(1000),
    trlStatus: Joi.string().required().trim().min(50).max(1000),

    // Team & IP
    teamMembers: Joi.string().required().trim().min(50).max(1000),
    patents: Joi.string().allow('').trim(),
    awards: Joi.string().allow('').trim(),

    // Incubation Requirements
    requestedPeriod: Joi.string().required().trim().max(100),
    spaceRequested: Joi.string().required().trim().max(200),
    equipmentRequired: Joi.string().required().trim().min(50).max(1000),
    otherIncubator: Joi.string().allow('').trim(),

    // Compliance & Ethics
    clinicalSamples: Joi.string().allow('').trim(),
    biosafetyClearance: Joi.string().allow('').trim(),
    employeesOnsite: Joi.number().integer().min(0).default(0),

    // Financials & Support
    fundRaised: Joi.string().required().trim().min(20).max(500),
    annualTurnover: Joi.string().required().trim().min(20).max(500),
    incubationHelp: Joi.string().required().trim().min(50).max(1000),
    documents: Joi.string().required().trim().min(20).max(1000),

    // Pre-incubation specific
    isStudent: Joi.boolean().default(false),
    ideationMentorship: Joi.boolean().default(false),
    labAccess: Joi.boolean().default(false),
    prototypeSupport: Joi.boolean().default(false),
    businessPlanning: Joi.boolean().default(false),
    ecosystemExposure: Joi.boolean().default(false),

    // Additional Information
    priorFunding: Joi.boolean().default(false),
    fundingDetails: Joi.string().allow('').trim(),
    collaborationRequired: Joi.boolean().default(false),
    collaborationDept: Joi.string().allow('').trim(),
    futureVision: Joi.string().required().trim().min(50).max(1000),

    // Application Status
    applicationStatus: Joi.string().valid('submitted', 'under-review', 'approved', 'rejected', 'incubated', 'graduated', 'exited').default('submitted'),
    currentStage: Joi.string().valid('pre-incubation', 'incubation', 'graduated', 'exited').default('incubation'),
    status: Joi.string().valid('active', 'inactive', 'graduated', 'exited').default('active'),

    // Progress Tracking
    fundingReceived: Joi.number().min(0).default(0),
    employees: Joi.number().integer().min(0).default(0),
    achievements: Joi.array().items(Joi.string().trim()),
    milestones: Joi.array().items(Joi.string().trim())
});

// Update validation schema (allows partial updates)
const updateIncubationApplicationSchema = Joi.object({
    applicantName: Joi.string().trim().max(100),
    applicantEmail: Joi.string().email().trim(),
    dateOfBirth: Joi.string().trim(),
    qualification: Joi.string().trim().max(200),
    contactDetails: Joi.string().trim().min(50).max(1000),
    entityType: Joi.string().valid('startup', 'individual'),
    companyRegistrationDetails: Joi.string().allow('').trim(),
    innovationTitle: Joi.string().trim().max(200),
    prototypeTime: Joi.string().trim().max(100),
    category: Joi.string().valid('Process', 'Product', 'New Application', 'Other'),
    innovationDescription: Joi.string().trim().min(100).max(2000),
    applications: Joi.string().trim().min(50).max(1000),
    novelty: Joi.string().trim().min(50).max(1000),
    businessModel: Joi.string().trim().min(50).max(1000),
    rndStatus: Joi.string().trim().min(50).max(1000),
    trlStatus: Joi.string().trim().min(50).max(1000),
    teamMembers: Joi.string().trim().min(50).max(1000),
    patents: Joi.string().allow('').trim(),
    awards: Joi.string().allow('').trim(),
    requestedPeriod: Joi.string().trim().max(100),
    spaceRequested: Joi.string().trim().max(200),
    equipmentRequired: Joi.string().trim().min(50).max(1000),
    otherIncubator: Joi.string().allow('').trim(),
    clinicalSamples: Joi.string().allow('').trim(),
    biosafetyClearance: Joi.string().allow('').trim(),
    employeesOnsite: Joi.number().integer().min(0),
    fundRaised: Joi.string().trim().min(20).max(500),
    annualTurnover: Joi.string().trim().min(20).max(500),
    incubationHelp: Joi.string().trim().min(50).max(1000),
    documents: Joi.string().trim().min(20).max(1000),
    isStudent: Joi.boolean(),
    ideationMentorship: Joi.boolean(),
    labAccess: Joi.boolean(),
    prototypeSupport: Joi.boolean(),
    businessPlanning: Joi.boolean(),
    ecosystemExposure: Joi.boolean(),
    priorFunding: Joi.boolean(),
    fundingDetails: Joi.string().allow('').trim(),
    collaborationRequired: Joi.boolean(),
    collaborationDept: Joi.string().allow('').trim(),
    futureVision: Joi.string().trim().min(50).max(1000),
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
    sortBy: Joi.string().valid('submittedAt', 'applicantName', 'innovationTitle', 'applicationStatus').default('submittedAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
    incubationApplicationSchema,
    updateIncubationApplicationSchema,
    queryParamsSchema
};
