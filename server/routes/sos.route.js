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
export default router;