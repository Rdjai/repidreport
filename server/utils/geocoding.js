// src/utils/geocoding.js
import axios from 'axios';

export const reverseGeocode = async (lat, lng) => {
    try {
        // Using OpenStreetMap's Nominatim API (free, no API key needed)
        const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
                lat,
                lon: lng,
                format: 'json',
                zoom: 18,
                addressdetails: 1
            },
            headers: {
                'User-Agent': 'CrimeMapApp/1.0'
            },
            timeout: 5000
        });

        if (response.data && response.data.display_name) {
            return response.data.display_name;
        }

        return 'Location not specified';
    } catch (error) {
        console.error('Geocoding error:', error.message);
        return 'Location not specified';
    }
};