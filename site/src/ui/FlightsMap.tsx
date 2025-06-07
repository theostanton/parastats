'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightWithSites } from '@parastats/common';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface FlightsMapProps {
  flights: FlightWithSites[];
  className?: string;
}

// Generate a color for each pilot/wing combination
function getFlightColor(pilotId: string, wing: string): string {
  const colors = [
    '#3b82f6', // Blue
    '#ef4444', // Red  
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#8b5cf6', // Violet
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#f97316', // Orange
    '#6366f1', // Indigo
  ];
  
  const hash = (pilotId + wing).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}

export default function FlightsMap({ flights, className }: FlightsMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !flights.length) return;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;
    console.log('Initializing map with token:', MAPBOX_TOKEN.substring(0, 20) + '...');

    // Calculate bounds from all flight polylines
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidPolylines = false;
    
    flights.forEach(flight => {
      if (flight.polyline && flight.polyline.length > 0) {
        hasValidPolylines = true;
        flight.polyline.forEach(([lat, lng]) => {
          bounds.extend([lng, lat]);
        });
      }
      // Also include takeoff and landing sites
      if (flight.takeoff) {
        bounds.extend([flight.takeoff.lng, flight.takeoff.lat]);
      }
      if (flight.landing) {
        bounds.extend([flight.landing.lng, flight.landing.lat]);
      }
    });

    // If no valid polylines, center on France (common paragliding area)
    if (!hasValidPolylines) {
      bounds.extend([2.3, 46.2]); // France center
      bounds.extend([2.4, 46.3]);
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [2.3, 46.2], // Center on France
        zoom: 6,
        pitch: 60, // Tilt the map for 3D effect
        bearing: 0 // Rotation angle
      });
    } catch (error) {
      console.error('Failed to initialize Mapbox map:', error);
      return;
    }

    // Add error handling for map style loading
    map.current.on('error', (e) => {
      console.error('Mapbox GL error:', e.error);
    });

    map.current.on('load', () => {
      if (!map.current) return;
      
      // Fit to bounds if we have valid polylines
      if (hasValidPolylines) {
        map.current.fitBounds(bounds, {
          padding: 50
        });
      }

      try {
        // Enable 3D terrain (optional)
        map.current.addSource('mapbox-terrain', {
          type: 'raster-dem',
          url: 'mapbox://mapbox.terrain-rgb'
        });

        map.current.setTerrain({
          source: 'mapbox-terrain',
          exaggeration: 1.2
        });
      } catch (error) {
        console.warn('Terrain not available:', error);
      }

      // Track unique sites for markers
      const sites = new Map();
      
      // Add flight paths
      flights.forEach((flight, index) => {
        if (flight.polyline && flight.polyline.length > 0) {
          const flightLineCoordinates = flight.polyline.map(([lat, lng]) => [lng, lat]);
          const color = getFlightColor(String(flight.pilot_id), flight.wing || 'unknown');
          
          const sourceId = `flight-${index}`;
          const layerId = `flight-line-${index}`;
          
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                flightId: flight.strava_activity_id,
                wing: flight.wing,
                pilotName: flight.pilot?.first_name || 'Unknown',
                pilotId: flight.pilot_id
              },
              geometry: {
                type: 'LineString',
                coordinates: flightLineCoordinates
              }
            }
          });

          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': color,
              'line-width': 3,
              'line-opacity': 0.7
            }
          });

          // Add click handler for flight paths
          map.current!.on('click', layerId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const properties = feature.properties;
              
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-weight: bold; color: ${color};">✈️ Flight Path</div>
                  <div><strong>Pilot:</strong> ${properties?.pilotName}</div>
                  <div><strong>Wing:</strong> ${properties?.wing}</div>
                  <div><strong>Flight ID:</strong> ${properties?.flightId}</div>
                  <div style="margin-top: 8px;">
                    <a href="/flights/${properties?.flightId}" 
                       style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                       View Flight Details →
                    </a>
                  </div>
                `)
                .addTo(map.current!);
            }
          });

          // Change cursor on hover
          map.current!.on('mouseenter', layerId, () => {
            map.current!.getCanvas().style.cursor = 'pointer';
          });

          map.current!.on('mouseleave', layerId, () => {
            map.current!.getCanvas().style.cursor = '';
          });
        }

        // Collect unique sites
        if (flight.takeoff && !sites.has(flight.takeoff.ffvl_sid)) {
          sites.set(flight.takeoff.ffvl_sid, { ...flight.takeoff, type: 'takeoff' });
        }
        if (flight.landing && !sites.has(flight.landing.ffvl_sid)) {
          sites.set(flight.landing.ffvl_sid, { ...flight.landing, type: 'landing' });
        }
      });

      // Add site markers
      sites.forEach((site) => {
        new mapboxgl.Marker({
          color: site.type === 'takeoff' ? '#22c55e' : '#ef4444',
          scale: 0.8
        })
          .setLngLat([site.lng, site.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="font-weight: bold; color: ${site.type === 'takeoff' ? '#22c55e' : '#ef4444'};">
              ${site.type === 'takeoff' ? '🛫' : '🛬'} ${site.name}
            </div>
            <div style="margin: 4px 0;">
              <strong>Altitude:</strong> ${site.alt}m<br>
              <strong>Site ID:</strong> ${site.ffvl_sid}
            </div>
            <div style="margin-top: 8px;">
              <a href="/sites/${site.slug}" 
                 style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                 View Site Details →
              </a>
            </div>
          `))
          .addTo(map.current!);
      });

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
  }, [flights]);

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

  if (!flights.length) {
    return (
      <div className={className} style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--border-radius-lg)',
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--font-size-sm)',
        padding: 'var(--space-6)'
      }}>
        No flights to display on map
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
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
          Loading flights map...
        </div>
      )}
      
      {/* Map Legend */}
      {isLoaded && flights.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-4)',
          left: 'var(--space-4)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: 'var(--space-3)',
          borderRadius: 'var(--border-radius-md)',
          fontSize: 'var(--font-size-xs)',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)'
        }}>
          <div style={{fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-1)'}}>
            All Flights Overview
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
            <div><span style={{color: '#22c55e'}}>🛫</span> Takeoff sites</div>
            <div><span style={{color: '#ef4444'}}>🛬</span> Landing sites</div>
            <div><span>—</span> Flight paths (colored by pilot/wing)</div>
            <div style={{marginTop: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)'}}>
              {flights.length} total flights
            </div>
          </div>
        </div>
      )}
    </div>
  );
}