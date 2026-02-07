/**
 * Geocoding utilities for converting coordinates to address
 * Uses Google Maps Geocoding API
 */

export interface AddressComponents {
  addressLine1: string;
  addressLine2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface ReverseGeocodeResult {
  success: boolean;
  address?: AddressComponents;
  error?: string;
}

/**
 * Reverse geocode coordinates to address components
 * Uses Google Maps Geocoding API
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  apiKey: string
): Promise<ReverseGeocodeResult> {
  try {
    // Make the API call without result_type filtering to get ALL possible data
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return {
        success: false,
        error: `Geocoding failed: ${data.status}`,
      };
    }

    // Merge components from ALL results to get maximum data
    const allComponents: any[] = [];
    const seenComponents = new Set<string>();

    // Collect unique components from all results
    for (const result of data.results) {
      for (const component of result.address_components) {
        const key = `${component.long_name}_${component.types.join('_')}`;
        if (!seenComponents.has(key)) {
          seenComponents.add(key);
          allComponents.push(component);
        }
      }
    }

    // Use the first result for formatted address
    const result = data.results[0];
    const components = allComponents;

    // Debug: Log the raw data to see what we're getting
    console.log('🔍 Geocoding API Response:', {
      formatted_address: result.formatted_address,
      total_results: data.results.length,
      merged_components: components.map((c: any) => ({
        name: c.long_name,
        types: c.types,
      })),
    });

    // Extract address components
    const addressData: Partial<AddressComponents> = {
      addressLine1: '',
      addressLine2: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
    };

    // Helper to find component by type (checks both long_name and short_name)
    const findComponent = (types: string[], preferLong = true): string => {
      const component = components.find((c: any) =>
        types.some((type) => c.types.includes(type))
      );
      if (!component) return '';

      return preferLong
        ? (component.long_name || component.short_name || '')
        : (component.short_name || component.long_name || '');
    };

    // Get reliable components from address_components first
    const postalCode = findComponent(['postal_code']);
    const state = findComponent(['administrative_area_level_1']);
    const locality = findComponent(['locality']);
    const adminArea2 = findComponent(['administrative_area_level_2']);

    // Parse formatted_address for more accurate extraction
    // Format example: "Bontoor, Harudtoor, near 100 bed hostel, Hardutoor, Jammu and Kashmir, Bontoor, 192201"
    const formattedAddress = result.formatted_address || '';
    const addressParts = formattedAddress.split(',').map((p: string) => p.trim()).filter(Boolean);

    console.log('🔍 Parsing formatted address:', {
      formatted_address: formattedAddress,
      parts: addressParts,
      postalCode_from_components: postalCode,
      state_from_components: state,
    });

    // Step 1: Extract pincode (last part that's all digits, or from components)
    let pincodeIndex = -1;
    for (let i = addressParts.length - 1; i >= 0; i--) {
      if (/^\d{6}$/.test(addressParts[i])) {
        addressData.postalCode = addressParts[i];
        pincodeIndex = i;
        break;
      }
    }
    // Fallback to component if not found in formatted address
    if (!addressData.postalCode) {
      addressData.postalCode = postalCode;
    }

    // Step 2: Extract state (usually second-to-last before pincode, or from components)
    // State is typically before the pincode
    if (pincodeIndex > 0) {
      // Check if the part before pincode is a state
      const potentialState = addressParts[pincodeIndex - 1];
      // State names are usually longer and contain spaces (e.g., "Jammu and Kashmir")
      if (potentialState && (potentialState.includes(' ') || potentialState.length > 10)) {
        addressData.state = potentialState;
      }
    }
    // Fallback to component if not found
    if (!addressData.state) {
      addressData.state = state;
    }

    // Step 3: Find state index in addressParts
    let stateIndex = -1;
    if (addressData.state) {
      stateIndex = addressParts.findIndex(p => p === addressData.state);
    }

    // Step 4: Extract landmark (parts that start with "near", "near to", "opposite", etc.)
    let landmarkIndex = -1;
    for (let i = 0; i < addressParts.length; i++) {
      const part = addressParts[i].toLowerCase();
      if (part.startsWith('near') || part.startsWith('opposite') || part.startsWith('behind') ||
          part.startsWith('beside') || part.startsWith('next to')) {
        addressData.landmark = addressParts[i];
        landmarkIndex = i;
        break;
      }
    }

    // Step 5: Extract city (part just before state, or from components)
    // City is typically the part immediately before the state
    if (stateIndex > 0) {
      const potentialCity = addressParts[stateIndex - 1];
      // Make sure it's not the landmark and not a duplicate of other parts
      if (potentialCity && landmarkIndex !== stateIndex - 1) {
        addressData.city = potentialCity;
      }
    }
    // Fallback to components
    if (!addressData.city) {
      addressData.city = locality || adminArea2 || '';
    }

    // Step 6: Find city index
    let cityIndex = -1;
    if (addressData.city) {
      cityIndex = addressParts.findIndex(p => p === addressData.city);
    }

    // Step 7: Extract addressLine1 and addressLine2
    // All remaining parts before landmark/city go into address lines
    const remainingParts: string[] = [];
    const usedIndices = new Set([pincodeIndex, stateIndex, cityIndex, landmarkIndex]);

    for (let i = 0; i < addressParts.length; i++) {
      if (!usedIndices.has(i)) {
        remainingParts.push(addressParts[i]);
      }
    }

    // Remove duplicates while preserving order
    const uniqueRemaining = remainingParts.filter((part, index, self) =>
      self.indexOf(part) === index
    );

    // Assign to address lines
    if (uniqueRemaining.length > 0) {
      addressData.addressLine1 = uniqueRemaining[0];
    }
    if (uniqueRemaining.length > 1) {
      addressData.addressLine2 = uniqueRemaining[1];
    }

    // Step 8: Ensure we have minimum required data
    // If addressLine1 is still empty, use first part
    if (!addressData.addressLine1 && addressParts.length > 0) {
      addressData.addressLine1 = addressParts[0];
    }

    // Log extracted data for debugging
    console.log('📍 Extracted Address Data:', {
      addressLine1: addressData.addressLine1,
      addressLine2: addressData.addressLine2,
      landmark: addressData.landmark,
      city: addressData.city,
      state: addressData.state,
      postalCode: addressData.postalCode,
    });

    return {
      success: true,
      address: addressData as AddressComponents,
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reverse geocode location',
    };
  }
}

/**
 * Get current location and reverse geocode it
 */
export async function getCurrentLocationAddress(
  apiKey: string
): Promise<ReverseGeocodeResult & { coordinates?: { lat: number; lng: number } }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({
        success: false,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const result = await reverseGeocode(lat, lng, apiKey);

        resolve({
          ...result,
          coordinates: { lat, lng },
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        resolve({
          success: false,
          error: errorMessage,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}
