import { getDistance } from 'geolib';
import { SCHOOL_LOCATION } from '../config/constants';

export interface Location {
  latitude: number;
  longitude: number;
}

export function isWithinRadius(userLocation: Location, targetLocation = SCHOOL_LOCATION): boolean {
  const distance = getDistance(
    { latitude: userLocation.latitude, longitude: userLocation.longitude },
    { latitude: targetLocation.latitude, longitude: targetLocation.longitude }
  );

  return distance <= targetLocation.radius;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );
  });
}

export function watchPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    onError({
      code: 2,
      message: 'Geolocation is not supported by your browser',
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3
    });
    return 0;
  }

  return navigator.geolocation.watchPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  });
}

export function clearWatch(watchId: number): void {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
  }
}