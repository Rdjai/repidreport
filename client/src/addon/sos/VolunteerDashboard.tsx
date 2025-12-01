// src/pages/VolunteerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
    MapPin, Bell, User, LogOut, Navigation,
    Phone, Clock, AlertTriangle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

interface SOSAlert {
    _id: string;
    userId: string;
    userInfo: {
        name: string;
        phone: string;
    };
    location: {
        lat: number;
        lng: number;
        address?: string;
    };
    severity: string;
    createdAt: string;
    distance?: number;
}

const VolunteerDashboard: React.FC = () => {
    const [socket, setSocket] = useState<any>(null);
    const [alerts, setAlerts] = useState<SOSAlert[]>([]);
    const [acceptedAlert, setAcceptedAlert] = useState<SOSAlert | null>(null);
    const [isAvailable, setIsAvailable] = useState(true);
    const [volunteerLocation, setVolunteerLocation] = useState<{ lat: number, lng: number } | null>(null);
    const navigate = useNavigate();

    const volunteerData = JSON.parse(localStorage.getItem('volunteerData') || '{}');
    const token = localStorage.getItem('volunteerToken');

    useEffect(() => {
        if (!token) {
            navigate('/volunteer/login');
            return;
        }

        console.log('🎯 Initializing volunteer dashboard...');

        // Connect to Socket.io
        const socketInstance = io('https://repidreport-zynl.onrender.com', {
            auth: { token }
        });

        // Socket event handlers
        socketInstance.on('connect', () => {
            console.log('✅ Socket connected as volunteer');

            // Join volunteer room
            socketInstance.emit('volunteer-join', {
                volunteerId: volunteerData._id,
                location: volunteerLocation
            });
        });

        socketInstance.on('new-sos-alert', (alert: SOSAlert) => {
            console.log('🚨 Received SOS alert:', alert);
            setAlerts(prev => [alert, ...prev]);
        });

        setSocket(socketInstance);

        // Start sending location updates
        let locationInterval: NodeJS.Timeout;
        let watchId: number;

        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        timestamp: new Date()
                    };

                    console.log('📍 Volunteer location update:', location);
                    setVolunteerLocation({ lat: location.lat, lng: location.lng });

                    // Send location to server
                    if (token && socketInstance.connected) {
                        // Send to server API
                        axios.put('https://repidreport-zynl.onrender.com/api/volunteer/location', {
                            lat: location.lat,
                            lng: location.lng
                        }, {
                            headers: { Authorization: `Bearer ${token}` }
                        }).catch(console.error);

                        // Send via socket for real-time updates
                        socketInstance.emit('volunteer-location-update', {
                            volunteerId: volunteerData._id,
                            location
                        });
                    }
                },
                (error) => {
                    console.error('❌ Geolocation error:', error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );

            // Also send periodic updates via interval
            locationInterval = setInterval(() => {
                if (volunteerLocation && socketInstance.connected) {
                    socketInstance.emit('volunteer-location-update', {
                        volunteerId: volunteerData._id,
                        location: {
                            ...volunteerLocation,
                            timestamp: new Date()
                        }
                    });
                }
            }, 5000); // Update every 5 seconds
        }

        return () => {
            console.log('🧹 Cleaning up volunteer dashboard');

            // Clear intervals
            if (locationInterval) clearInterval(locationInterval);
            if (watchId) navigator.geolocation.clearWatch(watchId);

            // Disconnect socket
            socketInstance.disconnect();
        };
    }, [token, navigate, volunteerData._id]);

    // Update the "Get Directions" button in VolunteerDashboard.tsx:

    const handleGetDirections = () => {
        if (!acceptedAlert) return;

        const userLocation = acceptedAlert.location;
        const destination = `${userLocation.lat},${userLocation.lng}`;

        // Get current volunteer location
        if (volunteerLocation) {
            const origin = `${volunteerLocation.lat},${volunteerLocation.lng}`;

            // Option 1: Open Google Maps
            window.open(`https://www.google.com/maps/dir/${origin}/${destination}`, '_blank');

            // Option 2: Open OpenStreetMap (free, no API key needed)
            window.open(`https://www.openstreetmap.org/directions?engine=graphhopper_foot&route=${origin};${destination}`, '_blank');

            // Option 3: Use device's default map app
            // if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            //   window.open(`maps://maps.google.com/maps?daddr=${destination}`);
            // } else if (/Android/i.test(navigator.userAgent)) {
            //   window.open(`google.navigation:q=${destination}`);
            // } else {
            //   window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
            // }
        } else {
            // If volunteer location not available, just show destination
            window.open(`https://www.google.com/maps?q=${destination}`, '_blank');
        }
    };

    // Update handleAcceptAlert in VolunteerDashboard.tsx

    const handleAcceptAlert = async (alert: SOSAlert) => {
        try {
            console.log('🎯 Accepting alert:', alert._id);

            // Get volunteer's current location
            const currentVolunteerLocation = volunteerLocation || await getCurrentLocation();

            // Create volunteer data with location
            const volunteerDataWithLocation = {
                ...volunteerData,
                currentLocation: currentVolunteerLocation ? {
                    lat: currentVolunteerLocation.lat,
                    lng: currentVolunteerLocation.lng,
                    timestamp: new Date()
                } : null // Handle case where currentVolunteerLocation is null
            };

            // Send accept request to server

            const response = await axios.post(
                'https://repidreport-zynl.onrender.com/api/volunteer/accept-sos',
                {
                    alertId: alert._id,
                    volunteerId: volunteerData._id,
                    volunteerLocation: currentVolunteerLocation // Send location too
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log('✅ Alert accepted response:', response.data);

            // Notify via socket with FULL volunteer data
            if (socket) {
                socket.emit('accept-sos', {
                    alertId: alert._id,
                    volunteerId: volunteerData._id,
                    volunteer: volunteerDataWithLocation // Send full volunteer data
                });

                console.log('📤 Sent socket event with volunteer:', volunteerDataWithLocation);
            }

            // Update local state
            setAcceptedAlert(alert);
            setAlerts(prev => prev.filter(a => a._id !== alert._id));

            // Start sending location updates
            startLocationUpdates();

        } catch (error: any) {
            console.error('❌ Error accepting alert:', error);
            // alert(error.response?.data?.message || 'Error accepting SOS');
        }
    };

    // Add function to start location updates
    const startLocationUpdates = () => {
        let locationInterval: NodeJS.Timeout | null = null; // Declare locationInterval

        if (locationInterval) clearInterval(locationInterval);

        locationInterval = setInterval(() => {
            if (volunteerLocation && socket?.connected) {
                const locationData = {
                    lat: volunteerLocation.lat,
                    lng: volunteerLocation.lng,
                    timestamp: new Date(),
                    speed: 5 + Math.random() * 10 // Simulate movement speed
                };

                socket.emit('volunteer-location-update', {
                    volunteerId: volunteerData._id,
                    location: locationData
                });

                console.log('📡 Sent location update:', locationData);
            }
        }, 3000); // Update every 3 seconds
    };

    const handleCompleteAlert = async () => {
        if (!acceptedAlert) return;
        setAcceptedAlert(null);
        // Mark as complete on server
    };

    const handleLogout = () => {
        localStorage.removeItem('volunteerToken');
        localStorage.removeItem('volunteerData');
        navigate('/volunteer/login');
    };

    const calculateDistance = (alertLat: number, alertLng: number) => {
        if (!volunteerLocation) return '--';
        const R = 6371;
        const dLat = (alertLat - volunteerLocation.lat) * Math.PI / 180;
        const dLon = (alertLng - volunteerLocation.lng) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(volunteerLocation.lat * Math.PI / 180) *
            Math.cos(alertLat * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return (R * c).toFixed(1);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="text-blue-600" size={20} />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg">Welcome, {volunteerData.name}</h1>
                                <p className="text-sm text-gray-500">{volunteerData.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${isAvailable ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                <button
                                    onClick={() => setIsAvailable(!isAvailable)}
                                    className={`px-3 py-1 rounded-full text-sm font-medium ${isAvailable
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {isAvailable ? 'Available' : 'Busy'}
                                </button>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-600"
                            >
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Panel - Alerts */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <Bell className="text-blue-500 mr-2" size={20} />
                                    <h3 className="font-semibold">Active Alerts</h3>
                                </div>
                                <p className="text-2xl font-bold mt-2">{alerts.length}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <CheckCircle className="text-green-500 mr-2" size={20} />
                                    <h3 className="font-semibold">Completed</h3>
                                </div>
                                <p className="text-2xl font-bold mt-2">{volunteerData.completedCases || 0}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-4">
                                <div className="flex items-center">
                                    <Navigation className="text-purple-500 mr-2" size={20} />
                                    <h3 className="font-semibold">Rating</h3>
                                </div>
                                <p className="text-2xl font-bold mt-2">{volunteerData.rating || 0}/5</p>
                            </div>
                        </div>

                        {/* Alerts List */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-4 border-b">
                                <h2 className="font-bold text-lg flex items-center">
                                    <AlertTriangle className="text-red-500 mr-2" size={20} />
                                    Nearby SOS Alerts
                                </h2>
                            </div>
                            <div className="divide-y">
                                {alerts.map(alert => (
                                    <div key={alert._id} className="p-4 hover:bg-gray-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold text-red-600">Emergency Alert</h3>
                                                <p className="text-sm text-gray-600">
                                                    {alert.userInfo.name} • {alert.severity.toUpperCase()}
                                                </p>
                                            </div>
                                            <span className="text-sm text-gray-500">
                                                {new Date(alert.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-600 mb-3">
                                            <MapPin size={14} className="mr-1" />
                                            <span>{calculateDistance(alert.location.lat, alert.location.lng)} km away</span>
                                            <Phone size={14} className="ml-4 mr-1" />
                                            <span>{alert.userInfo.phone}</span>
                                        </div>

                                        <button
                                            onClick={() => handleAcceptAlert(alert)}
                                            disabled={!isAvailable}
                                            className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isAvailable ? 'Accept & Help' : 'Mark as Busy'}
                                        </button>
                                    </div>
                                ))}
                                {alerts.length === 0 && (
                                    <div className="p-8 text-center text-gray-500">
                                        <Bell className="mx-auto mb-2 text-gray-400" size={32} />
                                        <p>No active alerts in your area</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel - Active Assistance */}
                    <div className="space-y-6">
                        {acceptedAlert ? (
                            <div className="bg-white rounded-lg shadow p-4">
                                <h3 className="font-bold text-lg mb-4 text-green-600 flex items-center">
                                    <CheckCircle className="mr-2" size={20} />
                                    Active Assistance
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold">Assisting:</h4>
                                        <p className="text-lg">{acceptedAlert.userInfo.name}</p>
                                        <a
                                            href={`tel:${acceptedAlert.userInfo.phone}`}
                                            className="text-blue-600 hover:underline flex items-center"
                                        >
                                            <Phone size={14} className="mr-1" />
                                            {acceptedAlert.userInfo.phone}
                                        </a>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold">Location:</h4>
                                        <p className="text-sm text-gray-600">
                                            {acceptedAlert.location.address ||
                                                `${acceptedAlert.location.lat.toFixed(4)}, ${acceptedAlert.location.lng.toFixed(4)}`}
                                        </p>
                                        <p className="text-sm text-green-600 mt-1">
                                            {calculateDistance(acceptedAlert.location.lat, acceptedAlert.location.lng)} km distance
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold">Severity:</h4>
                                        <p className={`font-semibold ${acceptedAlert.severity === 'critical' ? 'text-red-600' :
                                            acceptedAlert.severity === 'high' ? 'text-orange-600' :
                                                'text-yellow-600'
                                            }`}>
                                            {acceptedAlert.severity.toUpperCase()}
                                        </p>
                                    </div>

                                    <div className="space-y-2">


                                        <button
                                            onClick={handleGetDirections}
                                            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 flex items-center justify-center"
                                        >
                                            <Navigation className="mr-2" size={16} />
                                            Get Directions
                                        </button>
                                        <button
                                            onClick={handleCompleteAlert}
                                            className="w-full bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600"
                                        >
                                            Mark as Complete
                                        </button>
                                        <button className="w-full bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600">
                                            Cancel Assistance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="text-blue-600" size={32} />
                                </div>
                                <h3 className="font-bold text-lg mb-2">Ready to Help</h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    You're currently available to accept SOS alerts. When someone needs help, you'll see it here.
                                </p>
                                {volunteerLocation && (
                                    <div className="text-xs text-gray-500">
                                        Your location: {volunteerLocation.lat.toFixed(4)}, {volunteerLocation.lng.toFixed(4)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <h3 className="font-bold text-lg mb-3">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="bg-blue-50 text-blue-700 p-3 rounded-lg hover:bg-blue-100 text-sm font-medium">
                                    Update Location
                                </button>
                                <button className="bg-green-50 text-green-700 p-3 rounded-lg hover:bg-green-100 text-sm font-medium">
                                    Call Police
                                </button>
                                <button className="bg-purple-50 text-purple-700 p-3 rounded-lg hover:bg-purple-100 text-sm font-medium">
                                    Emergency Contacts
                                </button>
                                <button className="bg-red-50 text-red-700 p-3 rounded-lg hover:bg-red-100 text-sm font-medium">
                                    Panic Button
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default VolunteerDashboard;

function getCurrentLocation(): { lat: number; lng: number; } | PromiseLike<{ lat: number; lng: number; } | null> | null {
    throw new Error('Function not implemented.');
}

