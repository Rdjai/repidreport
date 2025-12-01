import {useState, useCallback} from "react";

interface GeolocationPosition {
  lat: number;
  lon: number;
  accuracy: number;
}

interface GeolocationState {
  loading: boolean;
  error: GeolocationPositionError | Error | null;
  position: GeolocationPosition | null;
}

export function useGeolocation({
  enableHighAccuracy = true,
  timeout = 15000,
  maximumAge = 300000, // 5 minutes
} = {}) {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    position: null,
  });

  const fetchLocation = useCallback(() => {
    setState({loading: true, error: null, position: null});

    if (!navigator.geolocation) {
      const error = new Error("Geolocation is not supported by this browser");
      setState({loading: false, error, position: null});
      return Promise.reject(error);
    }

    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const position = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          };
          setState({
            loading: false,
            error: null,
            position,
          });
          resolve(position);
        },
        (err) => {
          let errorMessage = "Failed to get location";
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case err.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
            default:
              errorMessage =
                "An unknown error occurred while retrieving location";
          }
          const error = new Error(errorMessage);
          setState({loading: false, error, position: null});
          reject(error);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  // Function to get address from coordinates using reverse geocoding
  const getAddressFromCoordinates = useCallback(
    async (lat: number, lon: number): Promise<string> => {
      try {
        // Using OpenStreetMap Nominatim API for reverse geocoding (free)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
          {
            headers: {
              "User-Agent": "RapidReport-App/1.0",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address");
        }

        const data = await response.json();

        if (data.display_name) {
          return data.display_name;
        }

        // Fallback to coordinates if no address found
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      } catch (error) {
        console.error("Error getting address:", error);
        // Return coordinates as fallback
        return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
    },
    []
  );

  return {
    ...state,
    fetchLocation,
    getAddressFromCoordinates,
  };
}
