const Joi = require('joi');

const createMentorSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 100 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Please provide a valid email address'
        }),
    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .required()
        .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    designation: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Designation is required',
            'string.min': 'Designation must be at least 2 characters long',
            'string.max': 'Designation cannot exceed 100 characters'
        }),
    company: Joi.string()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Company is required',
            'string.min': 'Company name must be at least 2 characters long',
            'string.max': 'Company name cannot exceed 100 characters'
        }),
    expertise: Joi.array()
        .items(Joi.string().min(2).max(50))
        .min(1)
        .required()
        .messages({
            'array.min': 'At least one expertise area is required',
            'any.required': 'Expertise areas are required'
        }),
    bio: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Bio is required',
            'string.min': 'Bio must be at least 10 characters long',
            'string.max': 'Bio cannot exceed 1000 characters'
        }),
    profileImage: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Please provide a valid image URL'
        }),
    linkedinProfile: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Please provide a valid LinkedIn profile URL'
        }),
    isActive: Joi.boolean()
        .optional()
        .default(true)
});

const updateMentorSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Name must be at least 2 characters long',
            'string.max': 'Name cannot exceed 100 characters'
        }),
    email: Joi.string()
        .email()
        .optional()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),
    phone: Joi.string()
        .pattern(/^[\+]?[1-9][\d]{0,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    designation: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Designation must be at least 2 characters long',
            'string.max': 'Designation cannot exceed 100 characters'
        }),
    company: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Company name must be at least 2 characters long',
            'string.max': 'Company name cannot exceed 100 characters'
        }),
    expertise: Joi.array()
        .items(Joi.string().min(2).max(50))
        .min(1)
        .optional()
        .messages({
            'array.min': 'At least one expertise area is required'
        }),
    bio: Joi.string()
        .min(10)
        .max(1000)
        .optional()
        .messages({
            'string.min': 'Bio must be at least 10 characters long',
            'string.max': 'Bio cannot exceed 1000 characters'
        }),
    profileImage: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Please provide a valid image URL'
        }),
    linkedinProfile: Joi.string()
        .uri()
        .optional()
        .allow('')
        .messages({
            'string.uri': 'Please provide a valid LinkedIn profile URL'
        }),
    isActive: Joi.boolean()
        .optional()
});

const validateCreateMentor = (req, res, next) => {
    const { error } = createMentorSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateUpdateMentor = (req, res, next) => {
    const { error } = updateMentorSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: error.details.map(detail => detail.message)
        });
    }
    next();
};

module.exports = {
    validateCreateMentor,
    validateUpdateMentor
};
