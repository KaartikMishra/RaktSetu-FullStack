import { validationResult, body } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules for registration
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required'),
    body('role')
        .optional()
        .isIn(['donor', 'seeker', 'hospital']).withMessage('Invalid role')
];

// Validation rules for login
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

// Validation rules for blood request
export const bloodRequestValidation = [
    body('bloodGroup')
        .notEmpty().withMessage('Blood group is required')
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
    body('unitsRequested')
        .notEmpty().withMessage('Number of units is required')
        .isInt({ min: 1 }).withMessage('At least 1 unit must be requested'),
    body('urgency')
        .optional()
        .isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid urgency level'),
    body('reason')
        .trim()
        .notEmpty().withMessage('Reason for request is required')
        .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
];
