// models/Volunteer.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const VolunteerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    skills: [{
        type: String,
        enum: ['First Aid', 'Self Defense', 'Counseling', 'Legal Aid', 'Medical', 'Security', 'Community Support']
    }],
    currentLocation: {
        lat: Number,
        lng: Number,
        address: String,
        timestamp: Date
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    completedCases: {
        type: Number,
        default: 0
    },
    socketId: String,
    lastActive: Date
}, {
    timestamps: true
});

// Hash password before saving
VolunteerSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
VolunteerSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Volunteer', VolunteerSchema);