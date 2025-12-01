// controllers/VolunteerController.js
import Volunteer from '../models/volunteer.model.js';
import jwt from 'jsonwebtoken';
import * as VolunteerService from '../services/VolunteerService.js';
import SOSAlert from '../models/SOSAlert.model.js'
import { SOS_STATUS } from '../utils/constants.js'
// Register new volunteer
export const register = async (req, res) => {
    try {
        const { name, email, password, phone, skills } = req.body;

        // Check if volunteer exists
        const existingVolunteer = await Volunteer.findOne({ email });
        if (existingVolunteer) {
            return res.status(400).json({
                success: false,
                message: 'Volunteer already exists'
            });
        }

        const volunteer = new Volunteer({
            name,
            email,
            password,
            phone,
            skills: skills || []
        });

        await volunteer.save();

        // Create JWT token
        const token = jwt.sign(
            { id: volunteer._id, email: volunteer.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Remove password from response
        const volunteerData = volunteer.toObject();
        delete volunteerData.password;

        res.status(201).json({
            success: true,
            message: 'Volunteer registered successfully',
            token,
            data: volunteerData
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login volunteer
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find volunteer
        const volunteer = await Volunteer.findOne({ email }).select('+password');
        if (!volunteer) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await volunteer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { id: volunteer._id, email: volunteer.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        // Remove password from response
        const volunteerData = volunteer.toObject();
        delete volunteerData.password;

        res.json({
            success: true,
            message: 'Login successful',
            token,
            data: volunteerData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get volunteer profile
export const getProfile = async (req, res) => {
    try {
        const volunteer = await Volunteer.findById(req.user.id).select('-password');
        if (!volunteer) {
            return res.status(404).json({
                success: false,
                message: 'Volunteer not found'
            });
        }

        res.json({
            success: true,
            data: volunteer
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update volunteer availability
export const updateAvailability = async (req, res) => {
    try {
        const { isAvailable } = req.body;
        const volunteer = await Volunteer.findByIdAndUpdate(
            req.user.id,
            { isAvailable },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Availability updated',
            data: volunteer
        });
    } catch (error) {
        console.error('Update availability error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update volunteer location
export const updateLocation = async (req, res) => {
    try {
        const { lat, lng, address } = req.body;

        const updateData = {
            currentLocation: {
                lat,
                lng,
                address,
                timestamp: new Date()
            },
            lastActive: new Date()
        };

        const volunteer = await Volunteer.findByIdAndUpdate(
            req.user.id,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'Location updated',
            data: volunteer
        });
    } catch (error) {
        console.error('Update location error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get nearby volunteers (for users)
export const getNearby = async (req, res) => {
    try {
        const { lat, lng, maxDistance = 5000 } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                success: false,
                message: 'Latitude and longitude are required'
            });
        }

        const volunteers = await Volunteer.find({
            isAvailable: true,
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [parseFloat(lng), parseFloat(lat)]
                    },
                    $maxDistance: parseInt(maxDistance)
                }
            }
        }).select('name phone skills rating currentLocation completedCases');

        res.json({
            success: true,
            data: volunteers
        });
    } catch (error) {
        console.error('Get nearby error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Accept SOS request// controllers/VolunteerController.js
// Update the acceptSOS function:

export const acceptSOS = async (req, res) => {
    try {
        const { alertId } = req.body;
        const volunteerId = req.user.id;

        console.log(`✅ Volunteer ${volunteerId} accepting SOS ${alertId}`);

        // Import SOS service here to avoid circular dependencies


        // Find the alert
        const alert = await SOSAlert.findById(alertId);
        if (!alert) {
            return res.status(404).json({
                success: false,
                message: 'SOS alert not found'
            });
        }

        // Check if alert is still active
        if (alert.status !== SOS_STATUS.ACTIVE) {
            return res.status(400).json({
                success: false,
                message: 'SOS alert is no longer active'
            });
        }

        // Update alert status
        alert.status = SOS_STATUS.ACCEPTED;
        alert.acceptedBy = volunteerId;
        alert.acceptedAt = new Date();

        await alert.save();

        // Populate volunteer info
        const populatedAlert = await SOSAlert.findById(alertId)
            .populate('acceptedBy', 'name phone skills rating currentLocation');

        res.json({
            success: true,
            message: 'SOS alert accepted successfully',
            data: populatedAlert
        });
    } catch (error) {
        console.error('❌ Accept SOS error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};