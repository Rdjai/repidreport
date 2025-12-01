import * as SOSService from '../services/SOSService.js';
import { RESPONSE_MESSAGES } from '../utils/constants.js';

// Trigger SOS alert
export const triggerSOS = async (req, res) => {
    try {
        const sosData = req.body;
        const alert = await SOSService.createSOSAlert(sosData);

        res.status(201).json({
            success: true,
            message: RESPONSE_MESSAGES.SOS_TRIGGERED,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get active SOS alerts
export const getActiveAlerts = async (req, res) => {
    try {
        const alerts = await SOSService.getActiveAlerts();

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get SOS alert by ID
export const getAlertById = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await SOSService.getAlertById(id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'SOS alert not found'
            });
        }

        res.json({
            success: true,
            data: alert
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept SOS alert
export const acceptAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId } = req.body;

        const alert = await SOSService.acceptAlert(id, volunteerId);

        res.json({
            success: true,
            message: RESPONSE_MESSAGES.SOS_ACCEPTED,
            data: alert
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Cancel SOS alert
export const cancelAlert = async (req, res) => {
    try {
        const { id } = req.params;
        const alert = await SOSService.cancelAlert(id);

        res.json({
            success: true,
            message: RESPONSE_MESSAGES.SOS_CANCELLED,
            data: alert
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get nearby alerts
export const getNearbyAlerts = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
        const alerts = await SOSService.getNearbyAlerts(location, parseInt(maxDistance));

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};