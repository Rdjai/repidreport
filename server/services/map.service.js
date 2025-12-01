// src/services/map.service.js
export class MapService {
    static getPinColor(rating) {
        switch (rating) {
            case 1: return '#10B981'; // Green
            case 2: return '#3B82F6'; // Blue
            case 3: return '#F59E0B'; // Yellow
            case 4: return '#EF4444'; // Red
            case 5: return '#7C2D12'; // Brown
            default: return '#6B7280'; // Gray
        }
    }

    static getAreaColor(score) {
        if (score >= 80) return '#10B981';
        if (score >= 60) return '#3B82F6';
        if (score >= 40) return '#F59E0B';
        if (score >= 20) return '#EF4444';
        return '#7C2D12';
    }

    static getSafetyLevel(score) {
        if (score >= 80) return 'Very Safe';
        if (score >= 60) return 'Safe';
        if (score >= 40) return 'Moderate';
        if (score >= 20) return 'Risky';
        return 'Dangerous';
    }

    static clusterPins(pins, zoomLevel = 12) {
        const clusters = [];
        const clusterDistance = 0.01 / Math.pow(2, zoomLevel - 10);

        for (const pin of pins) {
            let addedToCluster = false;

            for (const cluster of clusters) {
                const distance = Math.sqrt(
                    Math.pow(pin.location.lat - cluster.lat, 2) +
                    Math.pow(pin.location.lng - cluster.lng, 2)
                );

                if (distance < clusterDistance) {
                    cluster.count++;
                    cluster.totalRating += pin.rating;
                    cluster.crimeTypes.add(pin.crimeType);
                    addedToCluster = true;
                    break;
                }
            }

            if (!addedToCluster) {
                clusters.push({
                    type: 'cluster',
                    lat: pin.location.lat,
                    lng: pin.location.lng,
                    count: 1,
                    totalRating: pin.rating,
                    crimeTypes: new Set([pin.crimeType])
                });
            }
        }

        return clusters.map(cluster => ({
            ...cluster,
            crimeTypes: Array.from(cluster.crimeTypes),
            avgRating: cluster.totalRating / cluster.count
        }));
    }
}

export default MapService;