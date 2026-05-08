import { useState, useEffect, useRef, useCallback } from 'react';

const STEP_THRESHOLD = 1.2;    // m/s² above gravity, must exceed this to count a step
const MIN_STEP_MS = 280;        // minimum milliseconds between steps (~max 3.5 steps/s)
const GRAVITY = 9.81;
const STEP_LENGTH_M = 0.762;    // average adult stride length

function todayKey() {
    return `daily_steps_${new Date().toISOString().slice(0, 10)}`;
}

export type PermissionState = 'unknown' | 'granted' | 'denied' | 'unavailable';

export function usePedometer() {
    const [steps, setSteps] = useState<number>(() => {
        const stored = localStorage.getItem(todayKey());
        return stored ? parseInt(stored, 10) : 0;
    });
    const [permissionState, setPermissionState] = useState<PermissionState>('unknown');

    const lastStepMs = useRef(0);
    const smoothMag   = useRef(GRAVITY);
    const wasBelow    = useRef(true);
    const cleanupRef  = useRef<(() => void) | null>(null);

    const handleMotion = useCallback((event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        if (!acc || acc.x == null || acc.y == null || acc.z == null) return;

        // Total magnitude of acceleration vector
        const raw = Math.sqrt(acc.x ** 2 + acc.y ** 2 + acc.z ** 2);

        // Low-pass filter to reduce noise (70% previous, 30% new)
        smoothMag.current = smoothMag.current * 0.7 + raw * 0.3;
        const linear = smoothMag.current - GRAVITY;

        const now = Date.now();

        // Zero-crossing peak detection: step counted on upward threshold crossing
        if (wasBelow.current && linear > STEP_THRESHOLD) {
            if (now - lastStepMs.current > MIN_STEP_MS) {
                lastStepMs.current = now;
                setSteps(prev => {
                    const next = prev + 1;
                    localStorage.setItem(todayKey(), String(next));
                    return next;
                });
            }
            wasBelow.current = false;
        } else if (linear <= 0) {
            wasBelow.current = true;
        }
    }, []);

    const startListening = useCallback(() => {
        window.addEventListener('devicemotion', handleMotion);
        cleanupRef.current = () => window.removeEventListener('devicemotion', handleMotion);
        setPermissionState('granted');
    }, [handleMotion]);

    useEffect(() => {
        if (!window.DeviceMotionEvent) {
            setPermissionState('unavailable');
            return;
        }
        // iOS 13+ requires explicit user permission
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            setPermissionState('unknown');
            return;
        }
        // Android + older iOS: start immediately
        startListening();
        return () => cleanupRef.current?.();
    }, [startListening]);

    const requestPermission = useCallback(async () => {
        if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') return;
        try {
            const result = await (DeviceMotionEvent as any).requestPermission();
            if (result === 'granted') {
                startListening();
            } else {
                setPermissionState('denied');
            }
        } catch {
            setPermissionState('denied');
        }
    }, [startListening]);

    const distance = parseFloat(((steps * STEP_LENGTH_M) / 1000).toFixed(2));
    const calories  = Math.round(steps * 0.04);

    return { steps, calories, distance, permissionState, requestPermission };
}
