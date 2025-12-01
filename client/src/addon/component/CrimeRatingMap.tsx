// components/map/CrimeRatingMap.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
    MapPin, AlertTriangle, Shield,
    Star, User, Filter, RefreshCw,
    Maximize2, Minimize2, Plus, X,
    MessageSquare, Share2
} from 'lucide-react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface CrimePin {
    _id: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    location: {
        lat: number;
        lng: number;
        address: string;
    };
    crimeType: string;
    rating: 1 | 2 | 3 | 4 | 5;
    description: string;
    evidence?: string[];
    reportedAt: string;
    verified: boolean;
    upvotes: number;
    downvotes: number;
    commentsCount: number;
    tags?: string[];
}

interface AreaStats {
    totalPins: number;
    averageRating: number;
    safetyScore: number;
}

// Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Component to handle map click events
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
        click: (e) => {
            const { lat, lng } = e.latlng;
            onMapClick(lat, lng);
        },
    });
    return null;
}

export const CrimeRatingMap: React.FC = () => {
    // State
    const [crimePins, setCrimePins] = useState<CrimePin[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPin, setSelectedPin] = useState<CrimePin | null>(null);
    const [showAddPinModal, setShowAddPinModal] = useState(false);
    const [areaStats, setAreaStats] = useState<AreaStats | null>(null);
    const [crimeTypeFilter, setCrimeTypeFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Form state
    const [newPin, setNewPin] = useState({
        crimeType: 'theft',
        rating: 3,
        description: '',
        tags: '',
        location: {
            lat: 23.256047,
            lng: 77.482007,
            address: 'Central Area, Bhopal'
        }
    });

    // Map center (default to Bhopal)
    const center: [number, number] = [23.256047, 77.482007];
    const mapRef = useRef<any>(null);

    // Crime types
    const crimeTypes = [
        { id: 'all', name: 'All Crimes', icon: '🔍' },
        { id: 'theft', name: 'Theft', icon: '👜' },
        { id: 'burglary', name: 'Burglary', icon: '🏠' },
        { id: 'harassment', name: 'Harassment', icon: '🚨' },
        { id: 'assault', name: 'Assault', icon: '👊' },
        { id: 'scam', name: 'Scam', icon: '🎭' },
        { id: 'pickpocket', name: 'Pickpocket', icon: '👛' }
    ];

    // Initialize map - fetch data on component mount
    useEffect(() => {
        fetchCrimePins();
    }, []);

    const fetchCrimePins = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching crime pins from:', `${API_BASE_URL}/crime-pins`);

            // Try different possible endpoints
            const endpoints = [
                `${API_BASE_URL}/crime-pins`,
                `${API_BASE_URL}/crimepins`,
                `${API_BASE_URL}/pins`,
                `${API_BASE_URL}/reports`
            ];

            let response = null;
            let lastError = null;

            // Try each endpoint
            for (const endpoint of endpoints) {
                try {
                    console.log('Trying endpoint:', endpoint);
                    response = await axios.get(endpoint, {
                        timeout: 3000,
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    if (response.data) {
                        console.log('Successfully fetched from:', endpoint);
                        console.log('Response data:', response.data);
                        break;
                    }
                } catch (err) {
                    console.log('Failed to fetch from:', endpoint, err);
                    lastError = err;
                    continue;
                }
            }

            if (!response) {
                throw new Error('All API endpoints failed. Check backend server.');
            }

            // Handle different response formats
            let pinsData = [];

            if (Array.isArray(response.data)) {
                // Direct array response
                pinsData = response.data;
            } else if (response.data.data && Array.isArray(response.data.data)) {
                // Wrapped in data property
                pinsData = response.data.data;
            } else if (response.data.pins && Array.isArray(response.data.pins)) {
                // Wrapped in pins property
                pinsData = response.data.pins;
            } else if (response.data.reports && Array.isArray(response.data.reports)) {
                // Wrapped in reports property
                pinsData = response.data.reports;
            } else {
                // Try to extract any array from response
                const possibleArrays = Object.values(response.data).filter(val => Array.isArray(val));
                if (possibleArrays.length > 0) {
                    pinsData = possibleArrays[0] as any[]; // Cast to any[]
                } else {
                    throw new Error('Invalid response format: No array found');
                }
            }

            console.log('Parsed pins data:', pinsData);

            if (pinsData.length > 0) {
                // Transform data to match our interface
                const transformedPins = pinsData.map((pin: any) => ({
                    _id: pin._id || pin.id || `pin-${Math.random()}`,
                    userId: pin.userId || 'unknown',
                    userName: pin.userName || pin.user?.name || 'Anonymous',
                    userAvatar: pin.userAvatar || pin.user?.avatar,
                    location: {
                        lat: pin.location?.lat || pin.lat || pin.coordinates?.lat || center[0] + (Math.random() - 0.5) * 0.01,
                        lng: pin.location?.lng || pin.lng || pin.coordinates?.lng || center[1] + (Math.random() - 0.5) * 0.01,
                        address: pin.location?.address || pin.address || 'Unknown Location'
                    },
                    crimeType: pin.crimeType || pin.type || 'unknown',
                    rating: (pin.rating || 3) as 1 | 2 | 3 | 4 | 5,
                    description: pin.description || 'No description provided',
                    evidence: pin.evidence || [],
                    reportedAt: pin.reportedAt || pin.createdAt || pin.date || new Date().toISOString(),
                    verified: pin.verified || false,
                    upvotes: pin.upvotes || 0,
                    downvotes: pin.downvotes || 0,
                    commentsCount: pin.commentsCount || pin.comments?.length || 0,
                    tags: pin.tags || []
                }));

                setCrimePins(transformedPins);
                calculateAreaStats(transformedPins);
                console.log(`Loaded ${transformedPins.length} crime pins from backend`);
            } else {
                console.log('No pins found in response, using mock data');
                // Use mock data as fallback
                useMockData();
            }

        } catch (error: any) {
            console.error('Error fetching crime pins:', error);
            setError(`Failed to load crime reports: ${error.message}. Using sample data.`);
            // Use mock data as fallback
            useMockData();
        } finally {
            setLoading(false);
        }
    };

    const useMockData = () => {
        const mockCrimePins: CrimePin[] = [
            {
                _id: '1',
                userId: 'user1',
                userName: 'Rajesh Kumar',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh',
                location: { lat: 23.256047, lng: 77.482007, address: 'Main Street, Bhopal' },
                crimeType: 'theft',
                rating: 4,
                description: 'Multiple bike theft incidents at night.',
                evidence: [],
                reportedAt: new Date(Date.now() - 86400000).toISOString(),
                verified: true,
                upvotes: 15,
                downvotes: 2,
                commentsCount: 8,
                tags: ['night', 'bike-theft']
            },
            {
                _id: '2',
                userId: 'user2',
                userName: 'Priya Sharma',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
                location: { lat: 23.258047, lng: 77.484007, address: 'City Park, Bhopal' },
                crimeType: 'harassment',
                rating: 5,
                description: 'Women harassment after dark.',
                evidence: [],
                reportedAt: new Date(Date.now() - 172800000).toISOString(),
                verified: true,
                upvotes: 28,
                downvotes: 1,
                commentsCount: 12,
                tags: ['women-safety', 'dark']
            },
            {
                _id: '3',
                userId: 'user3',
                userName: 'Amit Patel',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
                location: { lat: 23.252047, lng: 77.480007, address: 'Market Road, Bhopal' },
                crimeType: 'pickpocket',
                rating: 3,
                description: 'Pickpocketing during market hours.',
                evidence: [],
                reportedAt: new Date(Date.now() - 259200000).toISOString(),
                verified: false,
                upvotes: 9,
                downvotes: 0,
                commentsCount: 5,
                tags: ['crowded', 'daytime']
            }
        ];

        setCrimePins(mockCrimePins);
        calculateAreaStats(mockCrimePins);
    };

    const calculateAreaStats = (pins: CrimePin[]) => {
        const totalPins = pins.length;
        const totalRating = pins.reduce((sum, pin) => sum + pin.rating, 0);
        const averageRating = totalPins > 0 ? totalRating / totalPins : 0;
        const safetyScore = Math.max(0, 100 - (averageRating * 20));

        setAreaStats({
            totalPins,
            averageRating: Number(averageRating.toFixed(1)),
            safetyScore: Math.round(safetyScore)
        });

        console.log('Area stats calculated:', {
            totalPins,
            averageRating,
            safetyScore
        });
    };

    const handleMapClick = (lat: number, lng: number) => {
        setNewPin(prev => ({
            ...prev,
            location: {
                lat,
                lng,
                address: 'Selected Location'
            }
        }));
        setShowAddPinModal(true);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors: { [key: string]: string } = {};

        if (!newPin.description.trim()) {
            errors.description = 'Description is required';
        } else if (newPin.description.trim().length < 10) {
            errors.description = 'Description must be at least 10 characters long';
        } else if (newPin.description.trim().length > 500) {
            errors.description = 'Description must be less than 500 characters';
        }

        if (!newPin.crimeType) {
            errors.crimeType = 'Crime type is required';
        }

        if (newPin.rating < 1 || newPin.rating > 5) {
            errors.rating = 'Rating must be between 1 and 5';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddPin = async () => {
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const pinData = {
                crimeType: newPin.crimeType,
                rating: newPin.rating,
                description: newPin.description.trim(),
                location: {
                    lat: newPin.location.lat,
                    lng: newPin.location.lng,
                    address: newPin.location.address
                },
                tags: newPin.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
                userId: 'current-user',
                userName: 'You',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
            };

            console.log('Submitting pin to backend:', pinData);

            // Try different endpoints for POST
            const endpoints = [
                `${API_BASE_URL}/crime-pins`,
                `${API_BASE_URL}/crimepins`,
                `${API_BASE_URL}/pins`,
                `${API_BASE_URL}/reports`
            ];

            let response = null;
            let lastError = null;

            for (const endpoint of endpoints) {
                try {
                    console.log('Trying POST to:', endpoint);
                    response = await axios.post(endpoint, pinData, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        validateStatus: (status) => status < 500,
                    });

                    if (response.status >= 200 && response.status < 300) {
                        console.log('Successfully posted to:', endpoint);
                        break;
                    }
                } catch (err) {
                    console.log('Failed to POST to:', endpoint, err);
                    lastError = err;
                    continue;
                }
            }

            if (!response) {
                throw new Error('All POST endpoints failed');
            }

            if (response.data.success === false) {
                const backendErrors: { [key: string]: string } = {};
                if (response.data.errors && Array.isArray(response.data.errors)) {
                    response.data.errors.forEach((err: any) => {
                        backendErrors[err.path] = err.msg;
                    });
                }
                setFormErrors(backendErrors);
                throw new Error('Backend validation failed');
            }

            // Parse response data
            const savedPin = response.data.data || response.data.pin || response.data;

            // Transform to our format
            const newCrimePin: CrimePin = {
                _id: savedPin._id || savedPin.id || `pin-${Date.now()}`,
                userId: savedPin.userId || 'current-user',
                userName: savedPin.userName || 'You',
                userAvatar: savedPin.userAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
                location: {
                    lat: savedPin.location?.lat || savedPin.lat || newPin.location.lat,
                    lng: savedPin.location?.lng || savedPin.lng || newPin.location.lng,
                    address: savedPin.location?.address || savedPin.address || newPin.location.address
                },
                crimeType: savedPin.crimeType || newPin.crimeType,
                rating: (savedPin.rating || newPin.rating) as 1 | 2 | 3 | 4 | 5,
                description: savedPin.description || newPin.description,
                evidence: savedPin.evidence || [],
                reportedAt: savedPin.reportedAt || savedPin.createdAt || new Date().toISOString(),
                verified: savedPin.verified || false,
                upvotes: savedPin.upvotes || 0,
                downvotes: savedPin.downvotes || 0,
                commentsCount: savedPin.commentsCount || 0,
                tags: savedPin.tags || newPin.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            console.log('New pin added:', newCrimePin);

            setCrimePins(prev => [newCrimePin, ...prev]);
            calculateAreaStats([newCrimePin, ...crimePins]);
            setShowAddPinModal(false);
            resetNewPin();

            alert('Report submitted successfully!');

        } catch (error: any) {
            console.error('Error adding pin:', error);

            if (Object.keys(formErrors).length > 0) {
                return;
            }

            // Create pin locally as fallback
            const newCrimePin: CrimePin = {
                _id: `pin-${Date.now()}`,
                userId: 'current-user',
                userName: 'You',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
                location: newPin.location,
                crimeType: newPin.crimeType,
                rating: newPin.rating as 1 | 2 | 3 | 4 | 5,
                description: newPin.description.trim(),
                evidence: [],
                reportedAt: new Date().toISOString(),
                verified: false,
                upvotes: 0,
                downvotes: 0,
                commentsCount: 0,
                tags: newPin.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            setCrimePins(prev => [newCrimePin, ...prev]);
            calculateAreaStats([newCrimePin, ...crimePins]);
            setShowAddPinModal(false);
            resetNewPin();

            alert('Report saved locally. Could not connect to backend.');
        }
    };

    const resetNewPin = () => {
        setNewPin({
            crimeType: 'theft',
            rating: 3,
            description: '',
            tags: '',
            location: {
                lat: center[0],
                lng: center[1],
                address: 'Central Area, Bhopal'
            }
        });
        setFormErrors({});
    };

    const handlePinVote = async (pinId: string, voteType: 'upvote' | 'downvote') => {
        try {
            await axios.post(`${API_BASE_URL}/crime-pins/${pinId}/vote`, { voteType });
            updatePinVotes(pinId, voteType);
        } catch (error) {
            console.error('Error voting:', error);
            updatePinVotes(pinId, voteType);
        }
    };

    const updatePinVotes = (pinId: string, voteType: 'upvote' | 'downvote') => {
        setCrimePins(prev => prev.map(pin => {
            if (pin._id === pinId) {
                return {
                    ...pin,
                    upvotes: voteType === 'upvote' ? pin.upvotes + 1 : pin.upvotes,
                    downvotes: voteType === 'downvote' ? pin.downvotes + 1 : pin.downvotes
                };
            }
            return pin;
        }));

        if (selectedPin && selectedPin._id === pinId) {
            setSelectedPin(prev => prev ? {
                ...prev,
                upvotes: voteType === 'upvote' ? prev.upvotes + 1 : prev.upvotes,
                downvotes: voteType === 'downvote' ? prev.downvotes + 1 : prev.downvotes
            } : null);
        }
    };

    const getPinColor = (rating: number) => {
        switch (rating) {
            case 1: return '#10B981';
            case 2: return '#3B82F6';
            case 3: return '#F59E0B';
            case 4: return '#EF4444';
            case 5: return '#7C2D12';
            default: return '#6B7280';
        }
    };

    const getPinIcon = (rating: number) => {
        const color = getPinColor(rating);
        return L.divIcon({
            html: `
                <div style="
                    background-color: ${color};
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                    <span style="font-size: 16px;">${rating}</span>
                </div>
            `,
            className: 'custom-marker',
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    };

    const getAreaColor = (score: number) => {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#3B82F6';
        if (score >= 40) return '#F59E0B';
        if (score >= 20) return '#EF4444';
        return '#7C2D12';
    };

    const filteredPins = crimePins.filter(pin => {
        if (crimeTypeFilter !== 'all' && pin.crimeType !== crimeTypeFilter) return false;
        if (ratingFilter !== 'all' && pin.rating !== ratingFilter) return false;
        return true;
    });

    return (
        <div className={`bg-white rounded-lg shadow-md overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50' : 'relative'}`}>
            {/* Header */}
            <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Safety Map
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Report and view crime incidents
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        >
                            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                        </button>
                        <button
                            onClick={() => {
                                setNewPin(prev => ({
                                    ...prev,
                                    location: {
                                        lat: center[0],
                                        lng: center[1],
                                        address: 'Central Area, Bhopal'
                                    }
                                }));
                                setShowAddPinModal(true);
                                setFormErrors({});
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus size={16} />
                            <span>Report Crime</span>
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle size={16} />
                            <span className="text-sm">{error}</span>
                        </div>
                    </div>
                )}

                {/* Data source info */}
                <div className="mt-2 text-xs text-gray-500">
                    {crimePins.length > 0 && crimePins[0]._id.includes('pin-') ?
                        'Using sample data' :
                        `Loaded ${crimePins.length} reports from backend`}
                </div>

                {/* Stats */}
                {areaStats && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{areaStats.totalPins}</div>
                            <div className="text-sm text-gray-600">Reports</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{areaStats.averageRating}</div>
                            <div className="text-sm text-gray-600">Avg Danger</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-xl font-bold text-gray-900">{areaStats.safetyScore}</div>
                            <div className="text-sm text-gray-600">Safety Score</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Map Container */}
            <div className="relative">
                {/* Filters */}
                <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter size={16} className="text-gray-700" />
                        <span className="font-medium text-gray-900">Filters</span>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Crime Type</label>
                            <select
                                value={crimeTypeFilter}
                                onChange={(e) => setCrimeTypeFilter(e.target.value)}
                                className="w-full px-3 py-2 text-sm border rounded-lg text-gray-900 bg-white"
                            >
                                {crimeTypes.map(type => (
                                    <option key={type.id} value={type.id} className="text-gray-900">
                                        {type.icon} {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Danger Level</label>
                            <select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                className="w-full px-3 py-2 text-sm border rounded-lg text-gray-900 bg-white"
                            >
                                <option value="all" className="text-gray-900">All Levels</option>
                                {[1, 2, 3, 4, 5].map(rating => (
                                    <option key={rating} value={rating} className="text-gray-900">
                                        {rating} ⭐ {rating === 1 ? 'Safe' : rating === 5 ? 'Very Dangerous' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={() => {
                                setCrimeTypeFilter('all');
                                setRatingFilter('all');
                            }}
                            className="w-full text-sm text-blue-600 hover:text-blue-800 text-gray-900"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Leaflet Map */}
                <div className="h-[400px] sm:h-[500px]">
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                        className="z-10"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        {/* Add map click handler */}
                        <MapClickHandler onMapClick={handleMapClick} />

                        {/* Safety area circle */}
                        {areaStats && (
                            <Circle
                                center={center}
                                radius={500}
                                pathOptions={{
                                    fillColor: getAreaColor(areaStats.safetyScore),
                                    color: getAreaColor(areaStats.safetyScore),
                                    fillOpacity: 0.2,
                                    weight: 2
                                }}
                            />
                        )}

                        {/* Crime pins */}
                        {filteredPins.map(pin => (
                            <Marker
                                key={pin._id}
                                position={[pin.location.lat, pin.location.lng]}
                                icon={getPinIcon(pin.rating)}
                                eventHandlers={{
                                    click: () => setSelectedPin(pin)
                                }}
                            >
                                <Popup>
                                    <div className="p-2 max-w-[200px]">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-bold text-gray-900">
                                                {pin.crimeType.charAt(0).toUpperCase() + pin.crimeType.slice(1)}
                                            </h3>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        className={i < pin.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-900 mb-2">{pin.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-700">
                                            <span>{pin.userName}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600">↑{pin.upvotes}</span>
                                                <span className="text-red-600">↓{pin.downvotes}</span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {pin._id.includes('pin-') ? 'Local report' : 'From backend'}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* Click to add prompt */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20">
                    <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm shadow-lg text-gray-900">
                        Click on map to report crime in that area
                    </div>
                </div>
            </div>

            {/* Crime List */}
            <div className="border-t border-gray-200">
                <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-gray-900">
                            Recent Reports ({filteredPins.length})
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={fetchCrimePins}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 text-gray-900"
                            >
                                <RefreshCw size={14} />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading reports...</span>
                        </div>
                    ) : filteredPins.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No reports found. Click on map to add the first report!
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredPins.slice(0, 5).map(pin => (
                                <div
                                    key={pin._id}
                                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                                    onClick={() => setSelectedPin(pin)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                                                style={{ backgroundColor: getPinColor(pin.rating) }}
                                            >
                                                {pin.rating}
                                            </div>
                                            <span className="font-medium text-gray-900">
                                                {pin.crimeType}
                                            </span>
                                            {pin._id.includes('pin-') && (
                                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                                    Local
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-600">
                                            {formatDistanceToNow(new Date(pin.reportedAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-900 line-clamp-2 mb-2">
                                        {pin.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-700">
                                        <span>{pin.userName}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-green-600">↑{pin.upvotes}</span>
                                            <span className="text-red-600">↓{pin.downvotes}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Pin Modal */}
            {showAddPinModal && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowAddPinModal(false)}
                    />
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fade-in relative z-[10000] max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Report Crime
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Help others stay safe
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowAddPinModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Location
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-900">
                                        <div className="flex justify-between">
                                            <span>Lat: {newPin.location.lat.toFixed(6)}</span>
                                            <span>Lng: {newPin.location.lng.toFixed(6)}</span>
                                        </div>
                                        <div className="mt-1 text-gray-600">{newPin.location.address}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Type of Crime *
                                    </label>
                                    <select
                                        value={newPin.crimeType}
                                        onChange={(e) => {
                                            setNewPin({ ...newPin, crimeType: e.target.value });
                                            setFormErrors(prev => ({ ...prev, crimeType: '' }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white ${formErrors.crimeType ? 'border-red-500' : ''
                                            }`}
                                    >
                                        {crimeTypes.slice(1).map(type => (
                                            <option key={type.id} value={type.id} className="text-gray-900">
                                                {type.icon} {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.crimeType && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.crimeType}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Danger Level (1=Safe, 5=Very Dangerous) *
                                    </label>
                                    <div className="flex justify-between">
                                        {[1, 2, 3, 4, 5].map(rating => (
                                            <button
                                                key={rating}
                                                type="button"
                                                onClick={() => {
                                                    setNewPin({ ...newPin, rating });
                                                    setFormErrors(prev => ({ ...prev, rating: '' }));
                                                }}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${newPin.rating === rating
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                    } ${formErrors.rating ? 'border border-red-500' : ''}`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                    {formErrors.rating && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.rating}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={newPin.description}
                                        onChange={(e) => {
                                            setNewPin({ ...newPin, description: e.target.value });
                                            setFormErrors(prev => ({ ...prev, description: '' }));
                                        }}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white ${formErrors.description ? 'border-red-500' : ''
                                            }`}
                                        rows={3}
                                        placeholder="What happened? When? Any details... (Minimum 10 characters)"
                                        required
                                    />
                                    {formErrors.description && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500">
                                        {newPin.description.length}/500 characters (min: 10)
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Tags (optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={newPin.tags}
                                        onChange={(e) => setNewPin({ ...newPin, tags: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                        placeholder="night, theft, crowded (separate with commas)"
                                    />
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={handleAddPin}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                    >
                                        Submit Report
                                    </button>
                                    <p className="text-xs text-center text-gray-600 mt-2">
                                        Your report helps keep the community safe
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Pin Details Modal */}
            {selectedPin && (
                <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setSelectedPin(null)}
                    />
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto animate-fade-in relative z-[10000]">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                                        style={{ backgroundColor: getPinColor(selectedPin.rating) }}
                                    >
                                        <span className="text-lg">{selectedPin.rating}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">
                                            {selectedPin.crimeType.charAt(0).toUpperCase() + selectedPin.crimeType.slice(1)}
                                        </h3>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={16}
                                                    className={i < selectedPin.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPin(null)}
                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-900">{selectedPin.description}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                                    <p className="text-gray-900">{selectedPin.location.address}</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Coordinates: {selectedPin.location.lat.toFixed(6)}, {selectedPin.location.lng.toFixed(6)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    {selectedPin.userAvatar ? (
                                        <img src={selectedPin.userAvatar} alt={selectedPin.userName} className="w-10 h-10 rounded-full" />
                                    ) : (
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="text-blue-500" size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <h5 className="font-medium text-gray-900">{selectedPin.userName}</h5>
                                        <p className="text-sm text-gray-600">
                                            Reported {formatDistanceToNow(new Date(selectedPin.reportedAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <div className="text-lg font-bold text-green-700">{selectedPin.upvotes}</div>
                                        <div className="text-sm text-green-800">Upvotes</div>
                                    </div>
                                    <div className="text-center p-3 bg-red-50 rounded-lg">
                                        <div className="text-lg font-bold text-red-700">{selectedPin.downvotes}</div>
                                        <div className="text-sm text-red-800">Downvotes</div>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <div className="text-lg font-bold text-blue-700">{selectedPin.commentsCount}</div>
                                        <div className="text-sm text-blue-800">Comments</div>
                                    </div>
                                </div>

                                {selectedPin.tags && selectedPin.tags.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPin.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-gray-100 text-gray-900 rounded-full text-sm"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={() => handlePinVote(selectedPin._id, 'upvote')}
                                        className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 font-medium"
                                    >
                                        👍 Helpful
                                    </button>
                                    <button
                                        onClick={() => handlePinVote(selectedPin._id, 'downvote')}
                                        className="flex-1 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 font-medium"
                                    >
                                        👎 Not Accurate
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200">
                                        <Share2 size={20} />
                                    </button>
                                </div>

                                <div className="pt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-500">
                                        {selectedPin._id.includes('pin-') ?
                                            'This is a locally saved report' :
                                            'This report is from the backend database'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrimeRatingMap;