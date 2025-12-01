// src/validators/crimePin.validator.js
import { body, param, query } from 'express-validator';
import { CRIME_TYPES } from '../constants/crimeTypes.js';

export const createCrimePinValidator = [
    body('location.lat')
        .exists().withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),

    body('location.lng')
        .exists().withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),

    body('location.address')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Address cannot exceed 500 characters'),

    body('crimeType')
        .exists().withMessage('Crime type is required')
        .isIn(Object.values(CRIME_TYPES)).withMessage('Invalid crime type'),

    body('rating')
        .exists().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

    body('description')
        .exists().withMessage('Description is required')
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
        .custom((tags) => {
            if (tags && tags.length > 10) {
                throw new Error('Cannot have more than 10 tags');
            }
            return true;
        }),

    body('tags.*')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('Each tag cannot exceed 50 characters')
];

export const updateCrimePinValidator = [
    param('id')
        .isMongoId().withMessage('Invalid crime pin ID'),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

    body('status')
        .optional()
        .isIn(['active', 'resolved', 'spam']).withMessage('Invalid status'),

    body('tags')
        .optional()
        .isArray().withMessage('Tags must be an array')
];

export const voteValidator = [
    param('id')
        .isMongoId().withMessage('Invalid crime pin ID'),

    body('voteType')
        .exists().withMessage('Vote type is required')
        .isIn(['upvote', 'downvote']).withMessage('Vote type must be either "upvote" or "downvote"')
];

export const commentValidator = [
    param('id')
        .isMongoId().withMessage('Invalid crime pin ID'),

    body('text')
        .exists().withMessage('Comment text is required')
        .trim()
        .isLength({ min: 1, max: 500 }).withMessage('Comment must be between 1 and 500 characters')
];

export const getCrimePinsValidator = [
    query('lat')
        .optional()
        .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),

    query('lng')
        .optional()
        .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),

    query('radius')
        .optional()
        .isFloat({ min: 0.1, max: 100 }).withMessage('Radius must be between 0.1 and 100 km'),

    query('crimeType')
        .optional()
        .isIn([...Object.values(CRIME_TYPES), 'all']).withMessage('Invalid crime type'),

    query('minRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Minimum rating must be between 1 and 5'),

    query('maxRating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Maximum rating must be between 1 and 5'),

    query('page')
        .optional()
        .isInt({ min: 1 }).withMessage('Page must be a positive integer'),

    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),

    query('sortBy')
        .optional()
        .isIn(['recent', 'rating', 'upvotes', 'severity']).withMessage('Invalid sort field'),

    query('sortOrder')
        .optional()
        .isIn(['asc', 'desc']).withMessage('Sort order must be either "asc" or "desc"')
];