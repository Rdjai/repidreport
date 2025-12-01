// src/routes/crimePin.routes.js
import express from 'express';
import { body, param, query } from 'express-validator';
import {
    createCrimePinController,
    getCrimePinsController,
    getCrimePinByIdController,
    updateCrimePinController,
    deleteCrimePinController,
    voteOnCrimePinController,
    addCommentController,
    getAreaStatsController,
    getHeatmapDataController
} from '../Controllers/crimePin.controller.js';

const router = express.Router();

// Create crime pin
router.post('/',
    [
        body('location.lat').isFloat({ min: -90, max: 90 }),
        body('location.lng').isFloat({ min: -180, max: 180 }),
        body('crimeType').isIn(['theft', 'burglary', 'harassment', 'assault', 'vandalism', 'scam', 'pickpocket', 'drug', 'traffic', 'pollution', 'other']),
        body('rating').isInt({ min: 1, max: 5 }),
        body('description').trim().isLength({ min: 10, max: 1000 }),
        body('tags').optional().isArray()
    ],
    createCrimePinController
);

// Get all crime pins
router.get('/',
    [
        query('lat').optional().isFloat({ min: -90, max: 90 }),
        query('lng').optional().isFloat({ min: -180, max: 180 }),
        query('radius').optional().isFloat({ min: 0.1, max: 100 }),
        query('crimeType').optional(),
        query('minRating').optional().isInt({ min: 1, max: 5 }),
        query('maxRating').optional().isInt({ min: 1, max: 5 }),
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('sortBy').optional().isIn(['recent', 'top', 'urgent'])
    ],
    getCrimePinsController
);

// Get single crime pin
router.get('/:id',
    [
        param('id').isMongoId()
    ],
    getCrimePinByIdController
);

// Update crime pin
router.put('/:id',
    [
        param('id').isMongoId(),
        body('description').optional().trim().isLength({ min: 10, max: 1000 }),
        body('status').optional().isIn(['active', 'resolved', 'spam'])
    ],
    updateCrimePinController
);

// Delete crime pin
router.delete('/:id',
    [
        param('id').isMongoId()
    ],
    deleteCrimePinController
);

// Vote on crime pin
router.post('/:id/vote',
    [
        param('id').isMongoId(),
        body('voteType').isIn(['upvote', 'downvote'])
    ],
    voteOnCrimePinController
);

// Add comment
router.post('/:id/comments',
    [
        param('id').isMongoId(),
        body('text').trim().isLength({ min: 1, max: 500 })
    ],
    addCommentController
);

// Get area statistics
router.get('/stats/area',
    [
        query('lat').isFloat({ min: -90, max: 90 }),
        query('lng').isFloat({ min: -180, max: 180 }),
        query('radius').optional().isFloat({ min: 0.1, max: 100 })
    ],
    getAreaStatsController
);

// Get heatmap data
router.get('/heatmap/data',
    [
        query('lat').isFloat({ min: -90, max: 90 }),
        query('lng').isFloat({ min: -180, max: 180 }),
        query('radius').optional().isFloat({ min: 0.1, max: 100 })
    ],
    getHeatmapDataController
);

export default router;