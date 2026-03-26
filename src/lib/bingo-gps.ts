"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export type GpsStatus = "requesting" | "active" | "denied" | "unavailable";

interface GpsPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGpsTrackingReturn {
  position: GpsPosition | null;
  status: GpsStatus;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

/** Haversine distance in meters between two lat/lng points */
export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function useGpsTracking(): UseGpsTrackingReturn {
  const [position, setPosition] = useState<GpsPosition | null>(null);
  const [status, setStatus] = useState<GpsStatus>("requesting");
  const [isPaused, setIsPaused] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus("unavailable");
      return;
    }

    setStatus("requesting");

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const now = Date.now();
        // Throttle to 3 seconds
        if (now - lastUpdateRef.current < 3000) return;
        lastUpdateRef.current = now;

        setPosition({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setStatus("active");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
        } else {
          setStatus("unavailable");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const pause = useCallback(() => {
    stopWatching();
    setIsPaused(true);
  }, [stopWatching]);

  const resume = useCallback(() => {
    setIsPaused(false);
    startWatching();
  }, [startWatching]);

  useEffect(() => {
    startWatching();
    return stopWatching;
  }, [startWatching, stopWatching]);

  return { position, status, pause, resume, isPaused };
}
