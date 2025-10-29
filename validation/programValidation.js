const Joi = require('joi');

const base = {
    title: Joi.string().trim().min(1).max(200).required(),
    duration: Joi.string().trim().max(100).allow('').optional(),
    bullets: Joi.array().items(Joi.string().trim().min(1)).min(1).required(),
    isActive: Joi.boolean().optional(),
};

const createProgramValidation = Joi.object(base);

const updateProgramValidation = Joi.object(
    Object.keys(base).reduce((acc, k) => ({ ...acc, [k]: base[k].optional() }), {})
);

const programQueryValidation = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    search: Joi.string().trim().max(200).allow('').optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('createdAt', 'title').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = { createProgramValidation, updateProgramValidation, programQueryValidation };


