// src/contexts/SOSContext.tsx
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import type { SOSContextType, SOSAlert, Volunteer, Location } from '../types/sos';

const SOSContext = createContext<SOSContextType | undefined>(undefined);

// Get environment variables with fallbacks
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

console.log('API URL:', API_URL);
console.log('Socket URL:', SOCKET_URL);

export const useSOS = (): SOSContextType => {
    const context = useContext(SOSContext);
    if (!context) {
        throw new Error('useSOS must be used within an SOSProvider');
    }
    return context;
};

interface SOSProviderProps {
    children: ReactNode;
}
export const SOSProvider: React.FC<SOSProviderProps> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [currentAlert, setCurrentAlert] = useState<SOSAlert | null>(null);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [acceptedVolunteer, setAcceptedVolunteer] = useState<Volunteer | null>(null);

    useEffect(() => {
        console.log('🔌 Initializing socket connection to:', SOCKET_URL);

        const newSocket = io(SOCKET_URL, {
            timeout: 5000,
            reconnectionAttempts: 3,
        });

        newSocket.on('connect', () => {
            setIsConnected(true);
            console.log('✅ Connected to server');
        });

        newSocket.on('connect_error', (error) => {
            console.error('❌ Socket connection error:', error);
            setIsConnected(false);
        });

        // NEW: Listen for volunteer accepting SOS
        newSocket.on('sos-accepted-by-volunteer', (data: {
            alertId: string;
            volunteer: Volunteer
        }) => {
            console.log('🎯 REAL VOLUNTEER ACCEPTED SOS:', data.volunteer);
            console.log('📍 Volunteer Location:', data.volunteer.currentLocation);

            if (currentAlert && currentAlert._id === data.alertId) {
                // Set the real volunteer with their location
                setAcceptedVolunteer(data.volunteer);

                // Update current alert
                setCurrentAlert(prev => prev ? {
                    ...prev,
                    status: 'accepted',
                    acceptedBy: data.volunteer
                } : null);

                // Add to volunteers list
                setVolunteers(prev => {
                    const exists = prev.some(v => v._id === data.volunteer._id);
                    if (!exists) {
                        return [data.volunteer, ...prev];
                    }
                    return prev.map(v =>
                        v._id === data.volunteer._id ? data.volunteer : v
                    );
                });
            }
        });

        // NEW: Listen for live volunteer location updates
        newSocket.on('volunteer-live-location', (data: {
            volunteerId: string;
            location: Location;
            timestamp: Date;
        }) => {
            console.log('📍 REAL VOLUNTEER LIVE LOCATION:', data);

            // Update accepted volunteer location
            if (acceptedVolunteer && acceptedVolunteer._id === data.volunteerId) {
                setAcceptedVolunteer(prev => prev ? {
                    ...prev,
                    currentLocation: {
                        ...data.location,
                        timestamp: data.timestamp
                    }
                } : null);
            }

            // Update in volunteers list
            setVolunteers(prev =>
                prev.map(vol =>
                    vol._id === data.volunteerId
                        ? {
                            ...vol,
                            currentLocation: {
                                ...data.location,
                                timestamp: data.timestamp
                            }
                        }
                        : vol
                )
            );
        });

        // NEW: Listen for new volunteers joining nearby
        newSocket.on('new-volunteer-nearby', (volunteer: Volunteer) => {
            console.log('🦸 NEW VOLUNTEER NEARBY:', volunteer.name);
            setVolunteers(prev => {
                const exists = prev.some(v => v._id === volunteer._id);
                if (!exists) {
                    return [...prev, volunteer];
                }
                return prev;
            });
        });

        setSocket(newSocket);

        return () => {
            console.log('🔌 Cleaning up socket connection');
            newSocket.close();
        };
    }, [currentAlert?._id, acceptedVolunteer?._id]);
    const getCurrentLocation = (): Promise<Location> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            console.log('🌍 Getting current location...');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: Location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    console.log('📍 Location obtained:', location);
                    setUserLocation(location);
                    resolve(location);
                },
                (error) => {
                    console.error('❌ Geolocation error:', error);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    const triggerSOS = async (photo: string | null = null): Promise<SOSAlert> => {
        try {
            console.log('🚨 Starting SOS trigger process...');

            const location = await getCurrentLocation();

            const alertData = {
                userId: `user-${Date.now()}`,
                userInfo: {
                    name: 'Emergency User',
                    phone: '+1234567890'
                },
                location,
                photo,
                description: 'Emergency assistance needed',
                severity: 'high',
                timestamp: new Date().toISOString()
            };

            console.log('📡 Sending SOS to:', `${API_URL}/sos/trigger`);
            console.log('📦 SOS Data:', alertData);

            const response = await axios.post(
                `${API_URL}/sos/trigger`,
                alertData,
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log('✅ SOS Response:', response.data);

            const newAlert: SOSAlert = response.data.data;
            setCurrentAlert(newAlert);

            if (socket) {
                socket.emit('sos-trigger', alertData);
            }

            return newAlert;
        } catch (error: any) {
            console.error('❌ Error triggering SOS:', error);

            if (error.code === 'ERR_NETWORK') {
                throw new Error('Cannot connect to server. Please check if the backend is running.');
            } else if (error.response) {
                throw new Error(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
            } else {
                throw new Error(`Failed to send SOS: ${error.message}`);
            }
        }
    };

    const cancelSOS = async (): Promise<void> => {
        if (!currentAlert) {
            console.warn('No active alert to cancel');
            return;
        }

        try {
            console.log('🛑 Canceling SOS:', currentAlert._id);

            await axios.put(
                `${API_URL}/sos/${currentAlert._id}/cancel`,
                {},
                { timeout: 5000 }
            );

            if (socket) {
                socket.emit('sos-cancelled', { alertId: currentAlert._id });
            }

            setCurrentAlert(null);
            console.log('✅ SOS canceled successfully');
        } catch (error: any) {
            console.error('❌ Error canceling SOS:', error);
            throw new Error(`Failed to cancel SOS: ${error.message}`);
        }
    };

    const acceptSOS = async (alertId: string, volunteerId: string): Promise<SOSAlert> => {
        try {
            console.log('✅ Accepting SOS:', alertId, 'by volunteer:', volunteerId);

            const response = await axios.put(
                `${API_URL}/sos/${alertId}/accept`,
                { volunteerId },
                { timeout: 5000 }
            );

            if (socket) {
                socket.emit('accept-sos', { alertId, volunteerId });
            }

            return response.data.data;
        } catch (error: any) {
            console.error('❌ Error accepting SOS:', error);
            throw new Error(`Failed to accept SOS: ${error.message}`);
        }
    };

    const updateLocation = (location: Location): void => {
        setUserLocation(location);
        if (socket && currentAlert) {
            socket.emit('location-update', {
                alertId: currentAlert._id,
                location
            });
        }
    };

    const value: SOSContextType = {
        socket,
        isConnected,
        currentAlert,
        volunteers,
        userLocation,
        triggerSOS,
        cancelSOS,
        acceptSOS,
        updateLocation,
        getCurrentLocation,
        acceptedVolunteer: null
    };

    return (
        <SOSContext.Provider value={value}>
            {children}
        </SOSContext.Provider>
    );
};