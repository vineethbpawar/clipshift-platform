export interface GeolocationData {
  lat: number;
  lng: number;
  city?: string;
  area?: string;
  pincode?: string;
  address?: string;
}

export const detectLocation = (): Promise<GeolocationData> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
              },
            }
          );
          
          if (!response.ok) {
            throw new Error("Failed to fetch address details");
          }

          const data = await response.json();
          const address = data.address;

          resolve({
            lat: latitude,
            lng: longitude,
            city: address.city || address.town || address.village || address.suburb,
            area: address.suburb || address.neighbourhood || address.road,
            pincode: address.postcode,
            address: data.display_name
          });
        } catch (error) {
          // Resolve with just coordinates if reverse geocoding fails
          resolve({
            lat: latitude,
            lng: longitude
          });
        }
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error("Location access denied by user"));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error("Location information is unavailable"));
            break;
          case error.TIMEOUT:
            reject(new Error("Location request timed out"));
            break;
          default:
            reject(new Error("An unknown error occurred"));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};

export const searchLocation = async (query: string): Promise<GeolocationData[]> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }

    const data = await response.json();
    return data.map((item: any) => ({
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      city: item.address.city || item.address.town || item.address.village || item.address.suburb || item.display_name.split(',')[0],
      address: item.display_name
    }));
  } catch (error) {
    console.error("Geocoding error:", error);
    return [];
  }
};
