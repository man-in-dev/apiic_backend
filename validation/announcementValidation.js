const Joi = require('joi');

// Validation for creating announcement
const announcementValidation = Joi.object({
    title: Joi.string()
        .required()
        .trim()
        .min(5)
        .max(200)
        .messages({
            'string.empty': 'Title is required',
            'string.min': 'Title must be at least 5 characters long',
            'string.max': 'Title cannot exceed 200 characters'
        }),

    description: Joi.string()
        .required()
        .trim()
        .min(10)
        .max(1000)
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 10 characters long',
            'string.max': 'Description cannot exceed 1000 characters'
        }),

    link: Joi.string()
        .required()
        .uri()
        .messages({
            'string.empty': 'Link is required',
            'string.uri': 'Please provide a valid URL'
        }),

    status: Joi.string()
        .valid('draft', 'published', 'archived')
        .default('draft'),

    priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .default('medium'),

    isActive: Joi.boolean()
        .default(true),

    publishedAt: Joi.date()
        .allow(null)
        .optional(),

    expiresAt: Joi.date()
        .allow(null)
        .optional()
});

// Validation for updating announcement
const announcementUpdateValidation = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(200)
        .optional(),

    description: Joi.string()
        .trim()
        .min(10)
        .max(1000)
        .optional(),

    link: Joi.string()
        .uri()
        .optional(),

    status: Joi.string()
        .valid('draft', 'published', 'archived')
        .optional(),

    priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .optional(),

    isActive: Joi.boolean()
        .optional(),

    publishedAt: Joi.date()
        .allow(null)
        .optional(),

    expiresAt: Joi.date()
        .allow(null)
        .optional()
});

// Validation for query parameters
const announcementQueryValidation = Joi.object({
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
        .trim()
        .max(100)
        .optional(),

    status: Joi.string()
        .valid('draft', 'published', 'archived')
        .optional(),

    priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .optional(),

    isActive: Joi.boolean()
        .optional(),

    sortBy: Joi.string()
        .valid('title', 'createdAt', 'publishedAt', 'priority', 'status')
        .default('createdAt'),

    sortOrder: Joi.string()
        .valid('asc', 'desc')
        .default('desc')
});

module.exports = {
    announcementValidation,
    announcementUpdateValidation,
    announcementQueryValidation
};
