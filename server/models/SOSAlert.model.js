// src/models/SOSAlert.js
import mongoose from 'mongoose';
import { SOS_STATUS } from '../utils/constants.js';

const SOSAlertSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    userInfo: {
        name: String,
        phone: String
    },
    location: {
        lat: {
            type: Number,
            required: true
        },
        lng: {
            type: Number,
            required: true
        },
        address: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    photo: String,
    status: {
        type: String,
        enum: Object.values(SOS_STATUS),
        default: SOS_STATUS.ACTIVE
    },
    acceptedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: String,
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    acceptedAt: Date,
    resolvedAt: Date,
    cancelledAt: Date
});

// Index for geospatial queries
SOSAlertSchema.index({ location: '2dsphere' });
SOSAlertSchema.index({ status: 1, createdAt: -1 });

const SOSAlert = mongoose.model('SOSAlert', SOSAlertSchema);
export default SOSAlert;