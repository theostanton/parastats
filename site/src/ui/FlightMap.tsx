'use client'

import React, {useEffect, useRef, useState} from 'react';
import mapboxgl from 'mapbox-gl';
import {Polyline} from '@parastats/common';
import 'mapbox-gl/dist/mapbox-gl.css';

// Note: You'll need to set this to your Mapbox access token
// For development, you can create a free account at https://account.mapbox.com/
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface FlightMapProps {
    polyline: Polyline;
    takeoffSite?: { name: string; lat: number; lng: number } | null;
    landingSite?: { name: string; lat: number; lng: number } | null;
    className?: string;
}

export default function FlightMap({polyline, takeoffSite, landingSite, className}: FlightMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!mapContainer.current || !polyline || polyline.length === 0) return;

        // Check if Mapbox token is available
        if (!MAPBOX_TOKEN) {
            console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
            return;
        }

        // Initialize map
        mapboxgl.accessToken = MAPBOX_TOKEN;

        // Calculate bounds from polyline
        const bounds = new mapboxgl.LngLatBounds();
        polyline.forEach(([lat, lng]) => {
            bounds.extend([lng, lat]); // Note: Mapbox expects [lng, lat]
        });

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                bounds: bounds,
                fitBoundsOptions: {
                    padding: 50
                },
                pitch: 60, // Tilt the map for 3D effect
                bearing: 0 // Rotation angle
            });
        } catch (error) {
            console.error('Failed to initialize Mapbox map:', error);
            // Try with a basic style as fallback
            try {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: 'mapbox://styles/mapbox/satellite-v9',
                    bounds: bounds,
                    fitBoundsOptions: {
                        padding: 50
                    },
                    pitch: 60, // Tilt the map for 3D effect
                    bearing: 0 // Rotation angle
                });
            } catch (fallbackError) {
                console.error('Failed to initialize fallback map:', fallbackError);
                return;
            }
        }

        // Add error handling for map style loading
        map.current.on('error', (e) => {
            console.error('Mapbox GL error:', e.error);
        });

        map.current.on('load', () => {
            if (!map.current) return;

            try {
                // Enable 3D terrain (optional, may fail if terrain is not available)
                map.current.addSource('mapbox-terrain', {
                    type: 'raster-dem',
                    url: 'mapbox://mapbox.terrain-rgb'
                });

                map.current.setTerrain({
                    source: 'mapbox-terrain',
                    exaggeration: 1.5
                });
            } catch (error) {
                console.warn('Terrain not available:', error);
                // Continue without terrain
            }

            // Add flight path
            const flightLineCoordinates = polyline.map(([lat, lng]) => [lng, lat]);

            map.current.addSource('flight-path', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: flightLineCoordinates
                    }
                }
            });

            map.current.addLayer({
                id: 'flight-path',
                type: 'line',
                source: 'flight-path',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3b82f6', // Primary blue color
                    'line-width': 4,
                    'line-opacity': 0.8
                }
            });

            // Add takeoff marker
            if (takeoffSite) {
                new mapboxgl.Marker({
                    color: '#22c55e', // Green for takeoff
                    scale: 1.2
                })
                    .setLngLat([takeoffSite.lng, takeoffSite.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="font-weight: bold; color: #22c55e;">🛫 Takeoff</div>
            <div>${takeoffSite.name}</div>
          `))
                    .addTo(map.current);
            }

            // Add landing marker
            if (landingSite) {
                new mapboxgl.Marker({
                    color: '#ef4444', // Red for landing
                    scale: 1.2
                })
                    .setLngLat([landingSite.lng, landingSite.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="font-weight: bold; color: #ef4444;">🛬 Landing</div>
            <div>${landingSite.name}</div>
          `))
                    .addTo(map.current);
            }

            // Add navigation controls
            map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
            map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

            setIsLoaded(true);
        });

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, [polyline, takeoffSite, landingSite]);

    if (!MAPBOX_TOKEN) {
        return (
            <div className={className} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                gap: 'var(--space-2)'
            }}>
                <div>📍 Map not available</div>
                <div style={{fontSize: 'var(--font-size-xs)'}}>
                    Mapbox access token required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.
                </div>
            </div>
        );
    }

    if (!polyline || polyline.length === 0) {
        return (
            <div className={className} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--border-radius-lg)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)'
            }}>
                No flight path data available
            </div>
        );
    }

    return (
        <div className={className} style={{position: 'relative'}}>
            <div
                ref={mapContainer}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 'var(--border-radius-lg)',
                    overflow: 'hidden'
                }}
            />
            {!isLoaded && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(248, 250, 252, 0.9)',
                    borderRadius: 'var(--border-radius-lg)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)'
                }}>
                    Loading flight map...
                </div>
            )}
        </div>
    );
}