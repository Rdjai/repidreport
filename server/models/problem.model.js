import mongoose from 'mongoose';

const ProblemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Infrastructure', 'Safety', 'Health', 'Environment', 'Transport', 'Other'],
        default: 'Other'
    },
    location: {
        lat: Number,
        lng: Number,
        address: String
    },
    userId: {
        type: String,
        required: true
    },
    userInfo: {
        name: String,
        email: String,
        phone: String
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    evidence: [{
        url: String,
        type: {
            type: String,
            enum: ['image', 'video', 'document']
        },
        filename: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    upvotes: {
        type: Number,
        default: 0
    },
    voters: [String],
    comments: [{
        userId: String,
        userInfo: {
            name: String,
            email: String
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Volunteer'
    },
    assignedAt: Date,
    resolvedAt: Date,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

ProblemSchema.index({ location: '2dsphere' });
ProblemSchema.index({ status: 1, createdAt: -1 });
ProblemSchema.index({ upvotes: -1, createdAt: -1 });
ProblemSchema.index({ category: 1, status: 1 });

export default mongoose.model('Problem', ProblemSchema);