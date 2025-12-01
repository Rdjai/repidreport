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

// Base URL - Updated to a more common port
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
    const [loading, setLoading] = useState(false);
    const [selectedPin, setSelectedPin] = useState<CrimePin | null>(null);
    const [showAddPinModal, setShowAddPinModal] = useState(false);
    const [areaStats, setAreaStats] = useState<AreaStats | null>(null);
    const [crimeTypeFilter, setCrimeTypeFilter] = useState('all');
    const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    // Mock data for fallback
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

    // Initialize map
    useEffect(() => {
        fetchCrimePins();
    }, []);

    const fetchCrimePins = async () => {
        setLoading(true);
        setError(null);
        try {
            // Call actual API with error handling
            console.log('Fetching crime pins from:', `${API_BASE_URL}/crime-pins`);
            const response = await axios.get(`${API_BASE_URL}/crime-pins`, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                setCrimePins(response.data);
                calculateAreaStats(response.data);
                console.log('Fetched', response.data.length, 'crime pins');
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error: any) {
            console.error('Error fetching crime pins:', error);
            setError('Failed to load crime reports. Using sample data.');
            // Fallback to mock data
            setCrimePins(mockCrimePins);
            calculateAreaStats(mockCrimePins);
        } finally {
            setLoading(false);
        }
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
    };

    const handleAddPin = async () => {
        if (!newPin.description.trim()) {
            alert('Please enter a description');
            return;
        }

        try {
            const pinData = {
                ...newPin,
                userId: 'current-user',
                userName: 'You',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
                evidence: [],
                reportedAt: new Date().toISOString(),
                verified: false,
                upvotes: 0,
                downvotes: 0,
                commentsCount: 0,
                tags: newPin.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            console.log('Submitting pin:', pinData);
            // Call API to save pin
            const response = await axios.post(`${API_BASE_URL}/crime-pins`, pinData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const savedPin = response.data;
            console.log('Pin saved successfully:', savedPin);

            setCrimePins(prev => [savedPin, ...prev]);
            calculateAreaStats([savedPin, ...crimePins]);
            setShowAddPinModal(false);
            setNewPin({
                crimeType: 'theft',
                rating: 3,
                description: '',
                tags: '',
                location: {
                    lat: center[0],
                    lng: center[1],
                    address: 'Central Area'
                }
            });
        } catch (error: any) {
            console.error('Error adding pin:', error);

            // Fallback to local state if API fails
            const newCrimePin: CrimePin = {
                _id: `pin-${Date.now()}`,
                userId: 'current-user',
                userName: 'You',
                userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
                location: newPin.location,
                crimeType: newPin.crimeType,
                rating: newPin.rating as 1 | 2 | 3 | 4 | 5,
                description: newPin.description,
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
            setNewPin({
                crimeType: 'theft',
                rating: 3,
                description: '',
                tags: '',
                location: {
                    lat: center[0],
                    lng: center[1],
                    address: 'Central Area'
                }
            });

            alert('Report saved locally. API connection failed.');
        }
    };

    const handlePinVote = async (pinId: string, voteType: 'upvote' | 'downvote') => {
        try {
            // Call API to update vote
            await axios.post(`${API_BASE_URL}/crime-pins/${pinId}/vote`, { voteType });

            // Update local state
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
        } catch (error) {
            console.error('Error voting:', error);
            // Update locally even if API fails
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
                        <button
                            onClick={fetchCrimePins}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 text-gray-900"
                        >
                            <RefreshCw size={14} />
                            Refresh
                        </button>
                    </div>

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
                            {/* Modal Header with Close Button */}
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
                                        onChange={(e) => setNewPin({ ...newPin, crimeType: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                                    >
                                        {crimeTypes.slice(1).map(type => (
                                            <option key={type.id} value={type.id} className="text-gray-900">
                                                {type.icon} {type.name}
                                            </option>
                                        ))}
                                    </select>
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
                                                onClick={() => setNewPin({ ...newPin, rating })}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center ${newPin.rating === rating
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {rating}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        value={newPin.description}
                                        onChange={(e) => setNewPin({ ...newPin, description: e.target.value })}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 bg-white"
                                        rows={3}
                                        placeholder="What happened? When? Any details..."
                                    />
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
                            {/* Modal Header with Close Button */}
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
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-gray-900">Loading crime reports...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrimeRatingMap;