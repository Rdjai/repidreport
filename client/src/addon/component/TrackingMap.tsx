// src/components/TrackingMap.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSOS } from '../../context/SOSContext';
import type { Location } from '../../types/sos';

// Fix for default markers - IMPORTANT!
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Custom icons
const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const volunteerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const safeZoneIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Set default icon
L.Marker.prototype.options.icon = defaultIcon;

interface MapUpdaterProps {
    center: [number, number];
}

const MapUpdater: React.FC<MapUpdaterProps> = ({ center }) => {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 15);
    }, [center, map]);

    return null;
};

interface SafeZone {
    id: number;
    name: string;
    location: [number, number];
    radius: number;
}

// Update src/components/TrackingMap.tsx

const TrackingMap: React.FC = () => {
    const { userLocation, currentAlert, acceptedVolunteer, volunteers } = useSOS();

    // Safe zones around the user's location
    const safeZones: SafeZone[] = userLocation ? [
        {
            id: 1,
            name: "Police Station",
            location: [userLocation.lat + 0.001, userLocation.lng + 0.001],
            radius: 200
        },
        {
            id: 2,
            name: "Hospital",
            location: [userLocation.lat - 0.001, userLocation.lng + 0.001],
            radius: 150
        },
        {
            id: 3,
            name: "Community Center",
            location: [userLocation.lat + 0.001, userLocation.lng - 0.001],
            radius: 180
        },
    ] : [];

    if (!userLocation) {
        return (
            <div className="h-96 w-full bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting your location...</p>
                </div>
            </div>
        );
    }

    const center: [number, number] = [userLocation.lat, userLocation.lng];

    console.log('🗺️ Map Data:', {
        userLocation,
        acceptedVolunteer,
        volunteerLocation: acceptedVolunteer?.currentLocation,
        hasAcceptedVolunteer: !!acceptedVolunteer,
        volunteerCount: volunteers.length
    });

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg border-2 border-gray-300">
            <MapContainer
                center={center}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
            >
                <MapUpdater center={center} />

                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User Location - ALWAYS VISIBLE */}
                <Marker position={center} icon={userIcon}>
                    <Popup>
                        <div className="text-center">
                            <strong className="text-red-600">🚨 Your Location</strong>
                            <br />
                            <span className="text-sm text-gray-600">
                                Lat: {userLocation.lat.toFixed(6)}
                                <br />
                                Lng: {userLocation.lng.toFixed(6)}
                                <br />
                                {acceptedVolunteer ? '🦸 Help is coming!' : '🔄 Alerting volunteers...'}
                            </span>
                        </div>
                    </Popup>
                </Marker>

                {/* Safe Zones */}
                {safeZones.map(zone => (
                    <React.Fragment key={zone.id}>
                        <Circle
                            center={zone.location}
                            radius={zone.radius}
                            pathOptions={{
                                color: 'blue',
                                fillColor: 'blue',
                                fillOpacity: 0.1,
                                weight: 2
                            }}
                        />
                        <Marker position={zone.location} icon={safeZoneIcon}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-blue-600">🛡️ {zone.name}</strong>
                                    <br />
                                    <span className="text-sm text-gray-600">
                                        Safe Zone - {zone.radius}m radius
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                ))}

                {/* REAL ACCEPTED VOLUNTEER */}
                {acceptedVolunteer && acceptedVolunteer.currentLocation && (
                    <>
                        <Marker
                            position={[
                                acceptedVolunteer.currentLocation.lat,
                                acceptedVolunteer.currentLocation.lng
                            ]}
                            icon={volunteerIcon}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-green-600">🦸 {acceptedVolunteer.name}</strong>
                                    <br />
                                    <span className="text-sm">📞 {acceptedVolunteer.phone}</span>
                                    <br />
                                    <span className="text-sm text-green-600 font-semibold">
                                        Coming to help you!
                                    </span>
                                    <br />
                                    <span className="text-xs text-gray-500">
                                        Skills: {acceptedVolunteer.skills?.join(', ') || 'General Assistance'}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Route from volunteer to user */}
                        <Polyline
                            positions={[
                                [acceptedVolunteer.currentLocation.lat, acceptedVolunteer.currentLocation.lng],
                                center
                            ]}
                            color="green"
                            weight={4}
                            opacity={0.7}
                            dashArray="10, 10"
                        />

                        {/* Distance info on map */}
                        <Marker
                            position={[
                                (acceptedVolunteer.currentLocation.lat + userLocation.lat) / 2,
                                (acceptedVolunteer.currentLocation.lng + userLocation.lng) / 2
                            ]}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong className="text-blue-600">Distance</strong>
                                    <br />
                                    <span className="text-sm">
                                        {calculateDistance(
                                            acceptedVolunteer.currentLocation.lat,
                                            acceptedVolunteer.currentLocation.lng,
                                            userLocation.lat,
                                            userLocation.lng
                                        ).toFixed(2)} km away
                                    </span>
                                </div>
                            </Popup>
                        </Marker>
                    </>
                )}

                {/* OTHER NEARBY VOLUNTEERS */}
                {volunteers
                    .filter(v => !acceptedVolunteer || v._id !== acceptedVolunteer._id)
                    .map((volunteer, index) => (
                        volunteer.currentLocation && (
                            <Marker
                                key={volunteer._id || index}
                                position={[volunteer.currentLocation.lat, volunteer.currentLocation.lng]}
                                icon={volunteerIcon}
                                opacity={0.7}
                            >
                                <Popup>
                                    <div className="text-center">
                                        <strong className="text-green-600">🦸 {volunteer.name}</strong>
                                        <br />
                                        <span className="text-sm">Nearby Volunteer</span>
                                        <br />
                                        <span className="text-xs text-gray-600">
                                            Skills: {volunteer.skills?.join(', ')}
                                            <br />
                                            Distance: {calculateDistance(
                                                volunteer.currentLocation.lat,
                                                volunteer.currentLocation.lng,
                                                userLocation.lat,
                                                userLocation.lng
                                            ).toFixed(2)} km
                                        </span>
                                    </div>
                                </Popup>
                            </Marker>
                        )
                    ))}
            </MapContainer>
        </div>
    );
};

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

export default TrackingMap;