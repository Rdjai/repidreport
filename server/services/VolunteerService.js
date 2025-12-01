// src/services/VolunteerService.js
import Volunteer from '../models/volunteer.model.js';

// Register new volunteer
export const registerVolunteer = async (volunteerData) => {
    try {
        const volunteer = new Volunteer(volunteerData);
        await volunteer.save();
        return volunteer;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Volunteer with this email already exists');
        }
        throw new Error(`Failed to register volunteer: ${error.message}`);
    }
};

// Update volunteer location
export const updateLocation = async (volunteerId, location) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            volunteerId,
            {
                currentLocation: {
                    lat: location.lat,
                    lng: location.lng,
                    timestamp: new Date()
                },
                lastActive: new Date()
            },
            { new: true }
        );

        if (!volunteer) {
            throw new Error('Volunteer not found');
        }

        return volunteer;
    } catch (error) {
        throw new Error(`Failed to update location: ${error.message}`);
    }
};

// Set volunteer online status
export const setOnlineStatus = async (volunteerId, isOnline, socketId = null) => {
    try {
        const updateData = {
            isOnline,
            lastActive: new Date()
        };

        if (socketId) {
            updateData.socketId = socketId;
        }

        const volunteer = await Volunteer.findByIdAndUpdate(
            volunteerId,
            updateData,
            { new: true }
        );

        if (!volunteer) {
            throw new Error('Volunteer not found');
        }

        return volunteer;
    } catch (error) {
        throw new Error(`Failed to update online status: ${error.message}`);
    }
};

// Get nearby available volunteers
export const getNearbyVolunteers = async (location, maxDistance = 5000) => {
    try {
        return await Volunteer.find({
            isAvailable: true,
            isOnline: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [location.lng, location.lat]
                    },
                    $maxDistance: maxDistance
                }
            }
        }).select('name phone skills rating currentLocation responseTime');
    } catch (error) {
        throw new Error(`Failed to get nearby volunteers: ${error.message}`);
    }
};

// Get volunteer by ID
export const getVolunteerById = async (volunteerId) => {
    try {
        return await Volunteer.findById(volunteerId);
    } catch (error) {
        throw new Error(`Failed to get volunteer: ${error.message}`);
    }
};

// Update volunteer availability
export const updateAvailability = async (volunteerId, isAvailable) => {
    try {
        const volunteer = await Volunteer.findByIdAndUpdate(
            volunteerId,
            {
                isAvailable,
                lastActive: new Date()
            },
            { new: true }
        );

        if (!volunteer) {
            throw new Error('Volunteer not found');
        }

        return volunteer;
    } catch (error) {
        throw new Error(`Failed to update availability: ${error.message}`);
    }
};