// src/routes/sos.js
import express from 'express';
import {
    triggerSOS,
    getActiveAlerts,
    getNearbyAlerts,
    getAlertById,
    acceptAlert,
    cancelAlert
} from '../Controllers/sos.controller.js';
import Volunteer from '../models/volunteer.model.js';
import SOSAlert from '../models/SOSAlert.model.js';
import { authenticate } from '../Middlewares/auth.middleware.js'
const router = express.Router();

router.post('/trigger', triggerSOS);

router.get('/active', getActiveAlerts);
router.get('/nearby', getNearbyAlerts);
router.get('/:id', getAlertById);
router.put('/:id/accept', acceptAlert);
router.put('/:id/cancel', cancelAlert);

router.post('/:id/accept-by-volunteer', async (req, res) => {
    try {
        const { id } = req.params;
        const { volunteerId } = req.body;

        console.log(`Volunteer ${volunteerId} accepting SOS ${id}`);

        // Simple implementation without complex services
        const alert = await SOSAlert.findById(id);
        if (!alert) {
            return res.status(404).json({ success: false, message: 'Alert not found' });
        }

        alert.status = 'accepted';
        alert.acceptedBy = volunteerId;
        alert.acceptedAt = new Date();
        await alert.save();

        const volunteer = await Volunteer.findById(volunteerId).select('name phone skills rating currentLocation');

        res.json({
            success: true,
            message: 'SOS accepted successfully',
            data: {
                alert: {
                    ...alert.toObject(),
                    acceptedBy: volunteer
                },
                volunteer
            }
        });
    } catch (error) {
        console.error('Error accepting SOS:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

router.get('/completed', authenticate, async (req, res) => {
    try {
        const { volunteerId } = req.query;

        const alerts = await SOSAlert.find({
            acceptedBy: volunteerId,
            status: 'resolved'
        })
            .sort({ resolvedAt: -1 })
            .limit(20);

        res.json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Get completed alerts error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.put('/:id/complete', async (req, res) => {
    try {
        const { id } = req.params;

        const alert = await SOSAlert.findByIdAndUpdate(
            id,
            {
                status: 'resolved',
                resolvedAt: new Date()
            },
            { new: true }
        );

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'SOS alert not found'
            });
        }

        res.json({
            success: true,
            message: 'SOS marked as resolved',
            data: alert
        });
    } catch (error) {
        console.error('Complete SOS error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});
export default router;