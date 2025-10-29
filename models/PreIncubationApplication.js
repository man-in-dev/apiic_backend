const mongoose = require('mongoose');

const teamMemberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    contact: {
        type: String,
        required: true,
        trim: true
    }
});

const shareholderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    shares: {
        type: Number,
        required: true,
        min: 0
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    designation: {
        type: String,
        required: true,
        trim: true
    }
});

const preIncubationApplicationSchema = new mongoose.Schema({
    // A. Applicant Details
    applicantName: {
        type: String,
        required: [true, 'Applicant name is required'],
        trim: true
    },
    applicantBackground: {
        type: String,
        trim: true
    },
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    foundingTeam: [teamMemberSchema],
    shareholdingStructure: [shareholderSchema],
    partnershipDetails: {
        type: String,
        trim: true
    },
    hasFiledITReturn: {
        type: Boolean,
        default: false
    },
    registrationNo: {
        type: String,
        trim: true
    },
    registrationDate: {
        type: String,
        trim: true
    },
    registeringAuthority: {
        type: String,
        trim: true
    },
    pan: {
        type: String,
        trim: true
    },
    tan: {
        type: String,
        trim: true
    },

    // B. Background
    problemAddressed: {
        type: String,
        required: [true, 'Problem addressed is required'],
        trim: true
    },
    proposedSolution: {
        type: String,
        required: [true, 'Proposed solution is required'],
        trim: true
    },

    // C. Business Details
    productServiceDetails: {
        type: String,
        required: [true, 'Product/Service details are required'],
        trim: true
    },
    targetCustomer: {
        type: String,
        required: [true, 'Target customer is required'],
        trim: true
    },
    businessPlan: {
        type: String,
        required: [true, 'Business plan is required'],
        trim: true
    },
    marketSize: {
        type: String,
        required: [true, 'Market size is required'],
        trim: true
    },
    goToMarketStrategy: {
        type: String,
        required: [true, 'Go to market strategy is required'],
        trim: true
    },
    revenueModel: {
        type: String,
        required: [true, 'Revenue model is required'],
        trim: true
    },
    competitors: {
        type: String,
        required: [true, 'Competitors information is required'],
        trim: true
    },
    fundingInvestment: {
        type: String,
        required: [true, 'Funding and investment information is required'],
        trim: true
    },
    swotAnalysis: {
        type: String,
        required: [true, 'SWOT analysis is required'],
        trim: true
    },
    otherDetails: {
        type: String,
        trim: true
    },

    // D. Scientific/Technological Details
    technologyCategory: {
        type: String,
        enum: ['to-be-developed', 'self-developed', 'acquired', 'licensed', 'off-the-shelf'],
        required: [true, 'Technology category is required']
    },
    technologyDetails: {
        type: String,
        required: [true, 'Technology details are required'],
        trim: true
    },
    canBePatented: {
        type: Boolean,
        default: false
    },
    conductedPatentSearch: {
        type: Boolean,
        default: false
    },
    appliedForPatent: {
        type: Boolean,
        default: false
    },
    patentDetails: {
        type: String,
        trim: true
    },
    otherIPRProtection: {
        type: String,
        trim: true
    },

    // E. Incubation Requirement
    infrastructureFacilities: {
        type: String,
        required: [true, 'Infrastructure facilities requirement is needed'],
        trim: true
    },
    mentors: {
        type: String,
        required: [true, 'Mentor requirements are needed'],
        trim: true
    },
    manpower: {
        type: String,
        required: [true, 'Manpower requirements are needed'],
        trim: true
    },

    // Application Status
    applicationType: {
        type: String,
        default: 'pre-incubation'
    },
    applicationStatus: {
        type: String,
        enum: ['submitted', 'under-review', 'approved', 'rejected', 'incubated', 'graduated', 'exited'],
        default: 'submitted'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    approvedAt: {
        type: Date
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },

    // Current Status
    currentStage: {
        type: String,
        enum: ['pre-incubation', 'incubation', 'graduated', 'exited'],
        default: 'pre-incubation'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'graduated', 'exited'],
        default: 'active'
    },

    // Progress Tracking
    fundingReceived: {
        type: Number,
        default: 0
    },
    employees: {
        type: Number,
        default: 0
    },
    achievements: [String],
    milestones: [String],
}, {
    timestamps: true
});

// Index for better query performance
preIncubationApplicationSchema.index({ applicationStatus: 1 });
preIncubationApplicationSchema.index({ currentStage: 1 });
preIncubationApplicationSchema.index({ companyName: 'text', applicantName: 'text' });

module.exports = mongoose.model('PreIncubationApplication', preIncubationApplicationSchema);
