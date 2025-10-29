const Joi = require('joi');

// Contact form validation schema
const contactValidation = Joi.object({
    firstName: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(50)
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 1 character long',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required'
        }),

    lastName: Joi.string()
        .required()
        .trim()
        .min(1)
        .max(50)
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 1 character long',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required'
        }),

    email: Joi.string()
        .required()
        .email()
        .trim()
        .lowercase()
        .max(100)
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please enter a valid email address',
            'string.max': 'Email cannot exceed 100 characters',
            'any.required': 'Email is required'
        }),

    phone: Joi.string()
        .optional()
        .trim()
        .pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
        .max(20)
        .messages({
            'string.pattern.base': 'Please enter a valid phone number',
            'string.max': 'Phone number cannot exceed 20 characters'
        }),

    organization: Joi.string()
        .optional()
        .trim()
        .max(100)
        .messages({
            'string.max': 'Organization name cannot exceed 100 characters'
        }),

    subject: Joi.string()
        .required()
        .trim()
        .min(5)
        .max(200)
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 5 characters long',
            'string.max': 'Subject cannot exceed 200 characters',
            'any.required': 'Subject is required'
        }),

    message: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(2000)
        .messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 10 characters long',
            'string.max': 'Message cannot exceed 2000 characters',
            'any.required': 'Message is required'
        }),

    subscribeNewsletter: Joi.boolean()
        .optional()
        .default(false),

    source: Joi.string()
        .optional()
        .valid('website', 'email', 'phone', 'referral', 'other')
        .default('website'),

    referrer: Joi.string()
        .optional()
        .trim()
        .max(200)
        .messages({
            'string.max': 'Referrer information cannot exceed 200 characters'
        })
});

// Contact update validation schema (for admin updates)
const contactUpdateValidation = Joi.object({
    status: Joi.string()
        .optional()
        .valid('new', 'in-progress', 'responded', 'closed')
        .messages({
            'any.only': 'Status must be one of: new, in-progress, responded, closed'
        }),

    priority: Joi.string()
        .optional()
        .valid('low', 'medium', 'high', 'urgent')
        .messages({
            'any.only': 'Priority must be one of: low, medium, high, urgent'
        }),

    response: Joi.string()
        .optional()
        .trim()
        .max(2000)
        .messages({
            'string.max': 'Response cannot exceed 2000 characters'
        }),

    respondedBy: Joi.string()
        .optional()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .messages({
            'string.pattern.base': 'Invalid user ID format'
        })
});

// Contact query validation schema
const contactQueryValidation = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1),

    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10),

    search: Joi.string()
        .optional()
        .trim()
        .max(100)
        .messages({
            'string.max': 'Search term cannot exceed 100 characters'
        }),

    status: Joi.string()
        .optional()
        .valid('new', 'in-progress', 'responded', 'closed')
        .messages({
            'any.only': 'Status must be one of: new, in-progress, responded, closed'
        }),

    priority: Joi.string()
        .optional()
        .valid('low', 'medium', 'high', 'urgent')
        .messages({
            'any.only': 'Priority must be one of: low, medium, high, urgent'
        }),

    source: Joi.string()
        .optional()
        .valid('website', 'email', 'phone', 'referral', 'other')
        .messages({
            'any.only': 'Source must be one of: website, email, phone, referral, other'
        }),

    dateFrom: Joi.date()
        .optional()
        .iso()
        .messages({
            'date.format': 'Date from must be in ISO format (YYYY-MM-DD)'
        }),

    dateTo: Joi.date()
        .optional()
        .iso()
        .min(Joi.ref('dateFrom'))
        .messages({
            'date.format': 'Date to must be in ISO format (YYYY-MM-DD)',
            'date.min': 'Date to must be after date from'
        }),

    sortBy: Joi.string()
        .optional()
        .valid('submittedAt', 'firstName', 'lastName', 'email', 'status', 'priority')
        .default('submittedAt'),

    sortOrder: Joi.string()
        .optional()
        .valid('asc', 'desc')
        .default('desc')
});

module.exports = {
    contactValidation,
    contactUpdateValidation,
    contactQueryValidation
};
