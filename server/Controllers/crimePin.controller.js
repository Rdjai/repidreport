// src/controllers/crimePin.controller.js
import { validationResult } from 'express-validator';
import { getClientIp } from '../utils/ipUtils.js';
import {
    createCrimePin,
    getCrimePins,
    getCrimePinById,
    updateCrimePin,
    deleteCrimePin,
    voteOnCrimePin,
    addComment,
    getAreaStats,
    getHeatmapData
} from '../services/crimePin.service.js';

// Create new crime pin
export const createCrimePinController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const clientIp = getClientIp(req);
        const crimePinData = req.body;

        const crimePin = await createCrimePin(crimePinData, clientIp);

        res.status(201).json({
            success: true,
            message: 'Crime report submitted successfully',
            data: crimePin
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create crime report'
        });
    }
};

// Get all crime pins
export const getCrimePinsController = async (req, res) => {
    try {
        const result = await getCrimePins(req.query);

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to fetch crime reports'
        });
    }
};

// Get single crime pin
export const getCrimePinByIdController = async (req, res) => {
    try {
        const crimePin = await getCrimePinById(req.params.id);

        res.json({
            success: true,
            data: crimePin
        });
    } catch (error) {
        if (error.message === 'Crime report not found') {
            return res.status(404).json({
                success: false,
                message: 'Crime report not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch crime report'
        });
    }
};

// Update crime pin
export const updateCrimePinController = async (req, res) => {
    try {
        const crimePin = await updateCrimePin(req.params.id, req.body);

        res.json({
            success: true,
            message: 'Crime report updated successfully',
            data: crimePin
        });
    } catch (error) {
        if (error.message === 'Crime report not found') {
            return res.status(404).json({
                success: false,
                message: 'Crime report not found'
            });
        }
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update crime report'
        });
    }
};

// Delete crime pin
export const deleteCrimePinController = async (req, res) => {
    try {
        const result = await deleteCrimePin(req.params.id);

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        if (error.message === 'Crime report not found') {
            return res.status(404).json({
                success: false,
                message: 'Crime report not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete crime report'
        });
    }
};

// Vote on crime pin
export const voteOnCrimePinController = async (req, res) => {
    try {
        const { voteType } = req.body;

        if (!['upvote', 'downvote'].includes(voteType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid vote type'
            });
        }

        const crimePin = await voteOnCrimePin(req.params.id, voteType);

        res.json({
            success: true,
            message: `Successfully ${voteType}d crime report`,
            data: crimePin
        });
    } catch (error) {
        if (error.message === 'Crime report not found') {
            return res.status(404).json({
                success: false,
                message: 'Crime report not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to vote on crime report'
        });
    }
};

// Add comment
export const addCommentController = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const comment = await addComment(req.params.id, text.trim());

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment
        });
    } catch (error) {
        if (error.message === 'Crime report not found') {
            return res.status(404).json({
                success: false,
                message: 'Crime report not found'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to add comment'
        });
    }
};

// Get area statistics
export const getAreaStatsController = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        const stats = await getAreaStats(lat, lng, radius);

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get area statistics'
        });
    }
};

// Get heatmap data
export const getHeatmapDataController = async (req, res) => {
    try {
        const { lat, lng, radius } = req.query;
        const heatmapData = await getHeatmapData(lat, lng, radius);

        res.json({
            success: true,
            data: heatmapData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get heatmap data'
        });
    }
};