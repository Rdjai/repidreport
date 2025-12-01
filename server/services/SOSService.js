// services/SOSService.js
import SOSAlert from '../models/SOSAlert.model.js';
import { SOS_STATUS } from '../utils/constants.js';

export const createSOSAlert = async (alertData) => {
    try {
        const alert = new SOSAlert(alertData);
        await alert.save();
        return alert;
    } catch (error) {
        throw new Error(`Failed to create SOS alert: ${error.message}`);
    }
};

export const acceptAlert = async (alertId, volunteerId) => {
    try {
        const alert = await SOSAlert.findById(alertId);
        if (!alert) throw new Error('SOS alert not found');
        if (alert.status !== SOS_STATUS.ACTIVE) throw new Error('SOS alert is no longer active');

        alert.status = SOS_STATUS.ACCEPTED;
        alert.acceptedBy = volunteerId;
        alert.acceptedAt = new Date();

        await alert.save();
        return await alert.populate('acceptedBy', 'name phone skills rating currentLocation');
    } catch (error) {
        throw new Error(`Failed to accept alert: ${error.message}`);
    }
};


export const getAlertById = async (alertId) => {
    try {
        return await SOSAlert.findById(alertId)
            .populate('acceptedBy', 'name phone skills rating currentLocation');
    } catch (error) {
        throw new Error(`Failed to get alert: ${error.message}`);
    }
};

export const getActiveAlerts = async () => {
    try {
        return await SOSAlert.find({ status: SOS_STATUS.ACTIVE })
            .populate('acceptedBy', 'name phone skills rating')
            .sort({ createdAt: -1 });
    } catch (error) {
        throw new Error(`Failed to get active alerts: ${error.message}`);
    }
};

export const cancelAlert = async (alertId) => {
    try {
        const alert = await SOSAlert.findByIdAndUpdate(
            alertId,
            { status: SOS_STATUS.CANCELLED, cancelledAt: new Date() },
            { new: true }
        );
        if (!alert) throw new Error('SOS alert not found');
        return alert;
    } catch (error) {
        throw new Error(`Failed to cancel alert: ${error.message}`);
    }
};