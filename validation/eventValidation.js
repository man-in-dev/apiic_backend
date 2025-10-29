const Joi = require('joi');

// Event type enum
const eventTypes = [
    'workshop',
    'seminar',
    'webinar',
    'outreach',
    'collaboration',
    'hackathon',
    'capacity-building',
    'calendar-event',
    'past-event'
];

const eventStatuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
const eventModes = ['In-person', 'Online', 'Hybrid'];

// Base event validation schema
const baseEventSchema = {
    title: Joi.string()
        .trim()
        .min(1)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 1 character long',
            'string.max': 'Title cannot exceed 200 characters',
            'any.required': 'Title is required'
        }),

    description: Joi.string()
        .trim()
        .min(1)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 1 character long',
            'string.max': 'Description cannot exceed 2000 characters',
            'any.required': 'Description is required'
        }),

    date: Joi.date()
        .iso()
        .required()
        .messages({
            'date.base': 'Date must be a valid date',
            'date.format': 'Date must be in ISO format',
            'any.required': 'Event date is required'
        }),

    type: Joi.string()
        .valid(...eventTypes)
        .required()
        .messages({
            'any.only': `Type must be one of: ${eventTypes.join(', ')}`,
            'any.required': 'Event type is required'
        }),

    venue: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Venue cannot exceed 200 characters'
        }),

    speaker: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Speaker name cannot exceed 200 characters'
        }),

    mode: Joi.string()
        .valid(...eventModes)
        .optional()
        .messages({
            'any.only': `Mode must be one of: ${eventModes.join(', ')}`
        }),

    audience: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Audience cannot exceed 200 characters'
        }),

    participants: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Participants cannot exceed 100 characters'
        }),

    focus: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Focus cannot exceed 500 characters'
        }),

    partners: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Partners cannot exceed 500 characters'
        }),

    objective: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Objective cannot exceed 1000 characters'
        }),

    theme: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Theme cannot exceed 200 characters'
        }),

    prizes: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Prizes cannot exceed 200 characters'
        }),

    teams: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Teams cannot exceed 100 characters'
        }),

    duration: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Duration cannot exceed 100 characters'
        }),

    sessions: Joi.string()
        .trim()
        .max(100)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Sessions cannot exceed 100 characters'
        }),

    certification: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Certification cannot exceed 200 characters'
        }),

    eligibility: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Eligibility cannot exceed 500 characters'
        }),

    modules: Joi.string()
        .trim()
        .max(1000)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Modules cannot exceed 1000 characters'
        }),

    highlight: Joi.string()
        .trim()
        .max(500)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Highlight cannot exceed 500 characters'
        }),

    status: Joi.string()
        .valid(...eventStatuses)
        .optional()
        .messages({
            'any.only': `Status must be one of: ${eventStatuses.join(', ')}`
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'isActive must be a boolean value'
        })
};

// Create event validation
const createEventValidation = Joi.object(baseEventSchema);

// Update event validation (all fields optional except validation rules)
const updateEventValidation = Joi.object(
    Object.keys(baseEventSchema).reduce((acc, key) => {
        acc[key] = baseEventSchema[key].optional();
        return acc;
    }, {})
);

// Query parameters validation
const eventQueryValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),

    search: Joi.string()
        .trim()
        .max(200)
        .allow('')
        .optional()
        .messages({
            'string.max': 'Search term cannot exceed 200 characters'
        }),

    type: Joi.string()
        .valid(...eventTypes)
        .optional()
        .messages({
            'any.only': `Type must be one of: ${eventTypes.join(', ')}`
        }),

    status: Joi.string()
        .valid(...eventStatuses)
        .optional()
        .messages({
            'any.only': `Status must be one of: ${eventStatuses.join(', ')}`
        }),

    isActive: Joi.boolean()
        .optional()
        .messages({
            'boolean.base': 'isActive must be a boolean value'
        }),

    sortBy: Joi.string()
        .valid('title', 'date', 'type', 'status', 'createdAt', 'updatedAt')
        .default('createdAt')
        .messages({
            'any.only': 'sortBy must be one of: title, date, type, status, createdAt, updatedAt'
        }),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
        .messages({
            'any.only': 'sortOrder must be either "asc" or "desc"'
        }),

    startDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'startDate must be a valid date',
            'date.format': 'startDate must be in ISO format'
        }),

    endDate: Joi.date()
        .iso()
        .min(Joi.ref('startDate'))
        .optional()
        .messages({
            'date.base': 'endDate must be a valid date',
            'date.format': 'endDate must be in ISO format',
            'date.min': 'endDate must be after startDate'
        })
});

module.exports = {
    createEventValidation,
    updateEventValidation,
    eventQueryValidation
};
