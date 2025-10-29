const Joi = require('joi');

// User registration validation schema
const registerSchema = Joi.object({
    name: Joi.string().required().trim().min(2).max(50),
    email: Joi.string().email().required().trim(),
    password: Joi.string().required().min(6).max(128),
    role: Joi.string().valid('admin', 'reviewer', 'applicant').default('applicant')
});

// User login validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required().trim(),
    password: Joi.string().required()
});

// Password update validation schema
const updatePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required().min(6).max(128)
});

// User profile update validation schema
const updateProfileSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50),
    email: Joi.string().email().trim(),
    role: Joi.string().valid('admin', 'reviewer', 'applicant'),
    isActive: Joi.boolean()
});

module.exports = {
    registerSchema,
    loginSchema,
    updatePasswordSchema,
    updateProfileSchema
};
