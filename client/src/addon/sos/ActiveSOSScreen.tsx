// src/components/ActiveSOSScreen.tsx
import React from 'react';
import { useSOS } from '../../context/SOSContext';
import TrackingMap from '../component/TrackingMap';
import { Phone, MapPin, User, Shield, Navigation, Clock, AlertTriangle } from 'lucide-react';

// Add distance calculation helper
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const ActiveSOSScreen: React.FC = () => {
    const { currentAlert, cancelSOS, isConnected, userLocation, acceptedVolunteer } = useSOS();

    if (!currentAlert) return null;

    // Calculate distance if volunteer has location
    const volunteerDistance = acceptedVolunteer?.currentLocation && userLocation
        ? calculateDistance(
            acceptedVolunteer.currentLocation.lat,
            acceptedVolunteer.currentLocation.lng,
            userLocation.lat,
            userLocation.lng
        ).toFixed(2)
        : null;

    console.log('📊 ActiveSOSScreen Data:', {
        currentAlert,
        acceptedVolunteer,
        volunteerDistance,
        userLocation
    });

    return (
        <div className="min-h-screen bg-red-50">
            {/* Real-time Volunteer Tracking Header */}
            {acceptedVolunteer && acceptedVolunteer.currentLocation && (
                <div className="bg-green-50 border-b border-green-200">
                    <div className="max-w-7xl mx-auto px-4 py-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                                    <Navigation className="text-green-600" size={16} />
                                </div>
                                <div>
                                    <span className="font-semibold text-green-700">
                                        {acceptedVolunteer.name} is {volunteerDistance} km away
                                    </span>
                                    <span className="text-sm text-green-600 ml-2">
                                        • ETA: {volunteerDistance ? `${(parseFloat(volunteerDistance) * 3).toFixed(0)} min` : 'Calculating...'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-sm text-green-700 flex items-center">
                                <Clock className="mr-1" size={14} />
                                Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Header */}
            <div className="bg-red-600 text-white p-4 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Shield className="text-white" size={20} />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold">EMERGENCY SOS ACTIVE</h1>
                                <p className="text-red-100 text-sm">
                                    {acceptedVolunteer ? 'Help is on the way!' : 'Alerting nearby volunteers...'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm">Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
                            <p className="text-xs opacity-80">
                                Alert ID: {currentAlert._id?.slice(-8)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Status Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Volunteer Info */}
                        {acceptedVolunteer && (
                            <div className="bg-white rounded-lg shadow-md p-4">
                                <h3 className="font-bold text-lg mb-3 text-green-600 flex items-center">
                                    <User className="mr-2" size={20} />
                                    Help is Coming!
                                </h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium">Volunteer:</span>
                                        <span>{acceptedVolunteer.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Phone:</span>
                                        <a
                                            href={`tel:${acceptedVolunteer.phone}`}
                                            className="text-blue-600 hover:underline"
                                        >
                                            {acceptedVolunteer.phone}
                                        </a>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-medium">Skills:</span>
                                        <span>{acceptedVolunteer.skills?.join(', ') || 'General Assistance'}</span>
                                    </div>
                                    {volunteerDistance && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Distance:</span>
                                            <span className="text-green-600 font-semibold">{volunteerDistance} km</span>
                                        </div>
                                    )}
                                    {acceptedVolunteer.currentLocation && (
                                        <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                                            <p className="text-green-700 text-xs font-semibold flex items-center">
                                                <Navigation className="mr-1" size={12} />
                                                📍 Live Location Tracking Active
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Safety Instructions */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="font-bold text-lg mb-3">Safety Instructions</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Stay in a safe, visible location</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Keep your phone accessible</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Don't panic, help is coming</span>
                                </li>
                                <li className="flex items-start">
                                    <span className="text-green-500 mr-2">✅</span>
                                    <span>Wave when you see the volunteer</span>
                                </li>
                            </ul>
                        </div>

                        {/* Emergency Contacts */}
                        <div className="bg-white rounded-lg shadow-md p-4">
                            <h3 className="font-bold text-lg mb-3">Emergency Contacts</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    className="bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center"
                                    onClick={() => window.open('tel:100', '_self')}
                                >
                                    <Phone className="mr-2" size={16} />
                                    Police (100)
                                </button>
                                <button
                                    className="bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    onClick={() => window.open('tel:108', '_self')}
                                >
                                    <Phone className="mr-2" size={16} />
                                    Ambulance (108)
                                </button>
                            </div>
                        </div>

                        {/* Cancel Button */}
                        <button
                            onClick={cancelSOS}
                            className="w-full bg-gray-500 text-white py-3 rounded-lg font-semibold 
                       hover:bg-gray-600 transition-colors mt-4"
                        >
                            Cancel Emergency
                        </button>
                    </div>

                    {/* Map Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
                            <h3 className="font-bold text-lg mb-2 flex items-center">
                                <MapPin className="mr-2" size={20} />
                                Live Emergency Map
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Real-time tracking of your location and volunteer movement
                            </p>
                            {acceptedVolunteer && (
                                <div className="flex items-center text-sm text-green-700">
                                    <AlertTriangle className="mr-2" size={16} />
                                    <span>Volunteer location updates every 5 seconds</span>
                                </div>
                            )}
                        </div>

                        <TrackingMap />

                        {/* Alert Information */}
                        <div className="bg-white rounded-lg shadow-md p-4 mt-4">
                            <h3 className="font-bold text-lg mb-3">Alert Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Status:</span>
                                    <p className={`font-semibold capitalize ${currentAlert.status === 'active' ? 'text-orange-600' :
                                        currentAlert.status === 'accepted' ? 'text-green-600' :
                                            'text-gray-600'
                                        }`}>
                                        {currentAlert.status}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Severity:</span>
                                    <p className="text-red-600 font-semibold capitalize">{currentAlert.severity}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Time Activated:</span>
                                    <p className="text-gray-600">
                                        {new Date(currentAlert.createdAt).toLocaleTimeString()}
                                    </p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Description:</span>
                                    <p className="text-gray-600">{currentAlert.description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveSOSScreen;