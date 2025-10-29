const mongoose = require('mongoose');

const incubationApplicationSchema = new mongoose.Schema({
    // Applicant Details
    applicantName: {
        type: String,
        required: [true, 'Applicant name is required'],
        trim: true
    },
    applicantEmail: {
        type: String,
        required: [true, 'Applicant email is required'],
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    dateOfBirth: {
        type: String,
        required: [true, 'Date of birth is required']
    },
    qualification: {
        type: String,
        required: [true, 'Professional qualification is required'],
        trim: true
    },
    contactDetails: {
        type: String,
        required: [true, 'Contact details are required'],
        trim: true
    },
    entityType: {
        type: String,
        enum: ['startup', 'individual'],
        required: [true, 'Entity type is required']
    },
    companyRegistrationDetails: {
        type: String,
        trim: true
    },

    // Innovation Details
    innovationTitle: {
        type: String,
        required: [true, 'Innovation title is required'],
        trim: true
    },
    prototypeTime: {
        type: String,
        required: [true, 'Prototype time is required'],
        trim: true
    },
    category: {
        type: String,
        enum: ['Process', 'Product', 'New Application', 'Other'],
        required: [true, 'Category is required']
    },
    innovationDescription: {
        type: String,
        required: [true, 'Innovation description is required'],
        trim: true
    },
    applications: {
        type: String,
        required: [true, 'Applications are required'],
        trim: true
    },
    novelty: {
        type: String,
        required: [true, 'Novelty information is required'],
        trim: true
    },
    businessModel: {
        type: String,
        required: [true, 'Business model is required'],
        trim: true
    },
    rndStatus: {
        type: String,
        required: [true, 'R&D status is required'],
        trim: true
    },
    trlStatus: {
        type: String,
        required: [true, 'TRL status is required'],
        trim: true
    },

    // Team & IP
    teamMembers: {
        type: String,
        required: [true, 'Team members information is required'],
        trim: true
    },
    patents: {
        type: String,
        trim: true
    },
    awards: {
        type: String,
        trim: true
    },

    // Incubation Requirements
    requestedPeriod: {
        type: String,
        required: [true, 'Requested incubation period is required'],
        trim: true
    },
    spaceRequested: {
        type: String,
        required: [true, 'Space requested is required'],
        trim: true
    },
    equipmentRequired: {
        type: String,
        required: [true, 'Equipment required is needed'],
        trim: true
    },
    otherIncubator: {
        type: String,
        trim: true
    },

    // Compliance & Ethics
    clinicalSamples: {
        type: String,
        trim: true
    },
    biosafetyClearance: {
        type: String,
        trim: true
    },
    employeesOnsite: {
        type: Number,
        default: 0
    },

    // Financials & Support
    fundRaised: {
        type: String,
        required: [true, 'Fund raised information is required'],
        trim: true
    },
    annualTurnover: {
        type: String,
        required: [true, 'Annual turnover is required'],
        trim: true
    },
    incubationHelp: {
        type: String,
        required: [true, 'Incubation help expected is required'],
        trim: true
    },
    documents: {
        type: String,
        required: [true, 'Documents list is required'],
        trim: true
    },

    // Pre-incubation specific
    isStudent: {
        type: Boolean,
        default: false
    },
    ideationMentorship: {
        type: Boolean,
        default: false
    },
    labAccess: {
        type: Boolean,
        default: false
    },
    prototypeSupport: {
        type: Boolean,
        default: false
    },
    businessPlanning: {
        type: Boolean,
        default: false
    },
    ecosystemExposure: {
        type: Boolean,
        default: false
    },

    // Additional Information
    priorFunding: {
        type: Boolean,
        default: false
    },
    fundingDetails: {
        type: String,
        trim: true
    },
    collaborationRequired: {
        type: Boolean,
        default: false
    },
    collaborationDept: {
        type: String,
        trim: true
    },
    futureVision: {
        type: String,
        required: [true, 'Future vision is required'],
        trim: true
    },

    // Application Status
    applicationType: {
        type: String,
        default: 'incubation'
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
        default: 'incubation'
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
incubationApplicationSchema.index({ applicationStatus: 1 });
incubationApplicationSchema.index({ currentStage: 1 });
incubationApplicationSchema.index({ innovationTitle: 'text', applicantName: 'text' });

module.exports = mongoose.model('IncubationApplication', incubationApplicationSchema);
