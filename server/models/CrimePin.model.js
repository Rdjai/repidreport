// src/models/CrimePin.js
import mongoose from 'mongoose';
import { hashIp } from '../utils/ipUtils.js';

const { Schema } = mongoose;

const crimePinSchema = new Schema({
    location: {
        lat: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        lng: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        address: {
            type: String,
            default: 'Location not specified'
        }
    },
    crimeType: {
        type: String,
        required: true,
        enum: ['theft', 'burglary', 'harassment', 'assault', 'vandalism', 'scam', 'pickpocket', 'drug', 'traffic', 'pollution', 'other']
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 1000
    },
    reportedAt: {
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    downvotes: {
        type: Number,
        default: 0,
        min: 0
    },
    comments: [{
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tags: [String],
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['active', 'resolved', 'spam'],
        default: 'active'
    },
    ipHash: {
        type: String,
        select: false
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            delete ret.ipHash;
            return ret;
        }
    }
});

// Virtuals
crimePinSchema.virtual('safetyScore').get(function () {
    return Math.max(0, 100 - (this.rating * 20));
});

// Indexes
crimePinSchema.index({ location: '2dsphere' });
crimePinSchema.index({ crimeType: 1 });
crimePinSchema.index({ rating: 1 });
crimePinSchema.index({ createdAt: -1 });

// Pre-save middleware
crimePinSchema.pre('save', function (next) {
    if (this.rating === 1 || this.rating === 2) {
        this.severity = 'low';
    } else if (this.rating === 3) {
        this.severity = 'medium';
    } else if (this.rating === 4) {
        this.severity = 'high';
    } else if (this.rating === 5) {
        this.severity = 'critical';
    }
    next();
});

// Static methods
crimePinSchema.statics.findByLocation = function (lat, lng, radius = 10) {
    const radiusInRadians = radius / 6378.1;
    return this.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radiusInRadians]
            }
        },
        status: 'active'
    });
};

crimePinSchema.statics.getAreaStats = async function (lat, lng, radius = 5) {
    const pins = await this.findByLocation(lat, lng, radius);

    if (pins.length === 0) {
        return {
            totalPins: 0,
            averageRating: 0,
            safetyScore: 100,
            crimeDistribution: {},
            recentReports: 0
        };
    }

    const totalRating = pins.reduce((sum, pin) => sum + pin.rating, 0);
    const averageRating = totalRating / pins.length;
    const safetyScore = Math.max(0, Math.round(100 - (averageRating * 20)));

    const crimeDistribution = {};
    pins.forEach(pin => {
        crimeDistribution[pin.crimeType] = (crimeDistribution[pin.crimeType] || 0) + 1;
    });

    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentReports = pins.filter(pin =>
        new Date(pin.createdAt) > oneWeekAgo
    ).length;

    return {
        totalPins: pins.length,
        averageRating: averageRating.toFixed(2),
        safetyScore,
        crimeDistribution,
        recentReports,
        lastUpdated: new Date()
    };
};

export const CrimePin = mongoose.model('CrimePin', crimePinSchema);