// components/sos/LiveTrackingMap.tsx
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
    lat: number;
    lng: number;
    timestamp: Date;
}

interface LiveTrackingMapProps {
    userLocation: Location;
    volunteerLocation?: Location;
    isActive: boolean;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
    userLocation,
    volunteerLocation,
    isActive,
}) => {
    const mapRef = useRef<L.Map>(null);

    useEffect(() => {
        if (mapRef.current && userLocation) {
            mapRef.current.setView([userLocation.lat, userLocation.lng], 15);
        }
    }, [userLocation]);

    const getRoute = () => {
        if (!volunteerLocation) return [];
        return [[userLocation.lat, userLocation.lng], [volunteerLocation.lat, volunteerLocation.lng]];
    };

    return (
        <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg">
            <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {/* User Marker */}
                <Marker position={[userLocation.lat, userLocation.lng]}>
                    <Popup>
                        <div className="text-center">
                            <strong>Your Location</strong>
                            <br />
                            <span className="text-sm text-gray-600">
                                {userLocation.timestamp.toLocaleTimeString()}
                            </span>
                        </div>
                    </Popup>
                </Marker>

                {/* Volunteer Marker */}
                {volunteerLocation && (
                    <>
                        <Marker
                            position={[volunteerLocation.lat, volunteerLocation.lng]}
                            icon={L.icon({
                                iconUrl: '/volunteer-marker.png', // Custom volunteer icon
                                iconSize: [25, 41],
                                iconAnchor: [12, 41],
                            })}
                        >
                            <Popup>
                                <div className="text-center">
                                    <strong>Volunteer</strong>
                                    <br />
                                    <span className="text-sm text-gray-600">
                                        {volunteerLocation.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Route Line */}
                        <Polyline
                            positions={getRoute() as [number, number][]}
                            color="blue"
                            weight={4}
                            opacity={0.7}
                        />
                    </>
                )}
            </MapContainer>
        </div>
    );
};