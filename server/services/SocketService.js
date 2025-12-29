import * as SOSService from './SOSService.js';
import * as VolunteerService from './VolunteerService.js';
import { SOCKET_EVENTS } from '../utils/constants.js';
import volunteerModel from '../models/volunteer.model.js';

let io = null;
const connectedVolunteers = new Map();

export const initialize = (socketIO) => {
    io = socketIO;
    setupSocketHandlers();
    console.log('✅ Socket Service Initialized');
    return io;
};

const setupSocketHandlers = () => {



    io.on('volunteer-location-update', async (data) => {
        try {
            const { volunteerId, location } = data;
            console.log(`📍 Volunteer ${volunteerId} location:`, location);

            // Update volunteer location in database
            await volunteerModel.findByIdAndUpdate(volunteerId, {
                currentLocation: location,
                lastActive: new Date()
            });

            // Find if this volunteer has any accepted alerts
            const acceptedAlerts = await SOSAlert.find({
                acceptedBy: volunteerId,
                status: 'accepted'
            });

            // Notify ALL users about volunteer location update
            if (acceptedAlerts.length > 0) {
                io.emit('volunteer-live-location', {
                    volunteerId,
                    location,
                    timestamp: new Date()
                });
                console.log(`📤 Broadcasted volunteer ${volunteerId} location to users`);
            }

        } catch (error) {
            console.error('❌ Volunteer location update error:', error);
        }
    });


    io.on('connection', (socket) => {
        console.log('🔌 User connected:', socket.id);

        // Volunteer joins the system
        socket.on(SOCKET_EVENTS.VOLUNTEER_JOIN, async (data) => {
            try {
                const { volunteerId, location } = data;
                console.log('🦸 Volunteer joining:', volunteerId);

                await VolunteerService.setOnlineStatus(volunteerId, true, socket.id);
                if (location) {
                    await VolunteerService.updateLocation(volunteerId, location);
                }

                connectedVolunteers.set(socket.id, volunteerId);
                socket.join('volunteers');

                console.log(`✅ Volunteer ${volunteerId} joined`);
            } catch (error) {
                console.error('❌ Volunteer join error:', error);
                socket.emit('error', { message: error.message });
            }
        });


        // Update your SocketService.js
        // In the connection handler, add:
        socket.on('volunteer-join', async (data) => {
            try {
                const { volunteerId, location } = data;
                console.log('🦸 Volunteer joining:', volunteerId);

                // Update volunteer status
                await VolunteerService.setOnlineStatus(volunteerId, true, socket.id);

                // Send active alerts to this volunteer
                const alerts = await SOSService.getActiveAlerts();
                socket.emit('initial-alerts', alerts);

                connectedVolunteers.set(socket.id, volunteerId);
                socket.join('volunteers');
            } catch (error) {
                console.error('Volunteer join error:', error);
            }
        });
        // User triggers SOS
        socket.on(SOCKET_EVENTS.SOS_TRIGGER, async (sosData) => {
            try {
                console.log('🚨 SOS Trigger received via socket');
                const alert = await SOSService.createSOSAlert(sosData);

                // Notify all volunteers about new SOS
                socket.broadcast.to('volunteers').emit(SOCKET_EVENTS.NEW_SOS_ALERT, alert);

                console.log(`✅ SOS Alert created and broadcasted: ${alert._id}`);
            } catch (error) {
                console.error('❌ SOS trigger error:', error);
                socket.emit('error', { message: error.message });
            }
        });


        socket.on('complete-sos', async (data) => {
            try {
                const { alertId, volunteerId } = data;

                const alert = await SOSAlert.findById(alertId);
                if (alert) {
                    alert.status = 'resolved';
                    alert.resolvedAt = new Date();
                    await alert.save();

                    // Notify user that SOS is resolved
                    io.emit('sos-resolved', {
                        alertId,
                        message: 'Emergency has been resolved'
                    });
                }

                // Update volunteer stats
                const volunteer = await volunteerModel.findById(volunteerId);
                if (volunteer) {
                    volunteer.completedCases += 1;
                    volunteer.isAvailable = true;
                    await volunteer.save();

                    // Notify volunteer of updated stats
                    io.to(socket.id).emit('volunteer-stats-updated', volunteer);
                }

            } catch (error) {
                console.error('Complete SOS error:', error);
            }
        });

        socket.on('accept-sos', async (data) => {
            try {
                const { alertId, volunteerId } = data;
                console.log(`🎯 Volunteer ${volunteerId} accepting SOS ${alertId}`);

                // Find the alert
                const alert = await SOSAlert.findById(alertId);
                if (!alert) {
                    socket.emit('error', { message: 'Alert not found' });
                    return;
                }

                // Get volunteer details WITH CURRENT LOCATION
                const volunteer = await volunteerModel.findById(volunteerId)
                    .select('name phone skills rating currentLocation isAvailable isOnline');

                if (!volunteer) {
                    socket.emit('error', { message: 'Volunteer not found' });
                    return;
                }

                // Update alert status
                alert.status = 'accepted';
                alert.acceptedBy = volunteerId;
                alert.acceptedAt = new Date();
                await alert.save();

                // IMPORTANT: Notify the USER (not just volunteers) that SOS was accepted
                // We need to emit to all connected clients
                io.emit('sos-accepted-by-volunteer', {
                    alertId,
                    alert: {
                        _id: alert._id,
                        status: alert.status,
                        acceptedAt: alert.acceptedAt
                    },
                    volunteer: {
                        _id: volunteer._id,
                        name: volunteer.name,
                        phone: volunteer.phone,
                        skills: volunteer.skills,
                        rating: volunteer.rating,
                        currentLocation: volunteer.currentLocation, // Include location!
                        isAvailable: volunteer.isAvailable,
                        isOnline: volunteer.isOnline
                    }
                });

                console.log(`✅ Volunteer ${volunteer.name} accepted SOS ${alertId}`);
                console.log('📤 Sent to user:', volunteer.currentLocation);

            } catch (error) {
                console.error('❌ Accept SOS error:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Location updates
        socket.on(SOCKET_EVENTS.LOCATION_UPDATE, async (data) => {
            try {
                const { volunteerId, location, alertId } = data;

                if (volunteerId) {
                    // Volunteer location update
                    await VolunteerService.updateLocation(volunteerId, location);

                    socket.broadcast.emit(SOCKET_EVENTS.VOLUNTEER_LOCATION_UPDATE, {
                        volunteerId,
                        location,
                        timestamp: new Date()
                    });
                } else if (alertId) {
                    // User location update
                    socket.broadcast.emit(SOCKET_EVENTS.USER_LOCATION_UPDATE, {
                        alertId,
                        location,
                        timestamp: new Date()
                    });
                }
            } catch (error) {
                console.error('❌ Location update error:', error);
                socket.emit('error', { message: error.message });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            const volunteerId = connectedVolunteers.get(socket.id);

            if (volunteerId) {
                await VolunteerService.setOnlineStatus(volunteerId, false);
                connectedVolunteers.delete(socket.id);
                console.log(`🔌 Volunteer ${volunteerId} disconnected`);
            }

            console.log('🔌 User disconnected:', socket.id);
        });
    });
};

export const emitToVolunteers = (event, data) => {
    if (io) {
        io.to('volunteers').emit(event, data);
    }
};