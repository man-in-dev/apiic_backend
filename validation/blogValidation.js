const Joi = require('joi');

const base = {
    title: Joi.string().trim().min(1).max(200).required(),
    content: Joi.string().trim().min(1).required(),
    coverImage: Joi.string().uri().allow('').optional(),
    tags: Joi.array().items(Joi.string().trim()).default([]),
    status: Joi.string().valid('draft', 'published').optional(),
    isActive: Joi.boolean().optional(),
};

const createBlogValidation = Joi.object(base);

const updateBlogValidation = Joi.object(
    Object.keys(base).reduce((acc, k) => ({ ...acc, [k]: base[k].optional() }), {})
);

const blogQueryValidation = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(200).allow('').optional(),
    status: Joi.string().valid('draft', 'published').optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('publishedAt', 'createdAt', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createBlogValidation, updateBlogValidation, blogQueryValidation };


