'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightWithSites, Site } from '@parastats/common';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface PilotMapProps {
  flights: FlightWithSites[];
  pilotName: string;
  className?: string;
}

export default function PilotMap({ flights, pilotName, className }: PilotMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !flights || flights.length === 0) return;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Calculate bounds from all flights and sites
    const bounds = new mapboxgl.LngLatBounds();
    
    flights.forEach(flight => {
      // Add polyline points to bounds
      if (flight.polyline && flight.polyline.length > 0) {
        flight.polyline.forEach(([lat, lng]) => {
          bounds.extend([lng, lat]);
        });
      }
      
      // Add site locations to bounds
      if (flight.takeoff) {
        bounds.extend([flight.takeoff.lng, flight.takeoff.lat]);
      }
      if (flight.landing) {
        bounds.extend([flight.landing.lng, flight.landing.lat]);
      }
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

      // Add flight paths
      flights.forEach((flight, index) => {
        if (flight.polyline && flight.polyline.length > 0) {
          const flightLineCoordinates = flight.polyline.map(([lat, lng]) => [lng, lat]);
          
          // Create unique source ID for each flight
          const sourceId = `flight-path-${index}`;
          const layerId = `flight-line-${index}`;
          
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                flightId: flight.strava_activity_id,
                wing: flight.wing,
                date: flight.start_date
              },
              geometry: {
                type: 'LineString',
                coordinates: flightLineCoordinates
              }
            }
          });

          // Add flight path with semi-transparent blue
          map.current!.addLayer({
            id: layerId,
            type: 'line',
            source: sourceId,
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 2,
              'line-opacity': 0.6
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
                  <div style="font-weight: bold; color: #3b82f6;">✈️ Flight</div>
                  <div><strong>Wing:</strong> ${properties?.wing}</div>
                  <div><strong>ID:</strong> ${properties?.flightId}</div>
                  <div style="margin-top: 8px;">
                    <a href="/flights/${properties?.flightId}" 
                       style="color: #3b82f6; text-decoration: none; font-size: 12px;">
                       View Details →
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
      });

      // Collect unique sites for markers
      const siteMap = new Map<string, {site: Site, flightCount: number, isLanding: boolean, isTakeoff: boolean}>();
      
      flights.forEach(flight => {
        if (flight.takeoff) {
          const existing = siteMap.get(flight.takeoff.ffvl_sid);
          if (existing) {
            existing.flightCount++;
            existing.isTakeoff = true;
          } else {
            siteMap.set(flight.takeoff.ffvl_sid, {
              site: flight.takeoff,
              flightCount: 1,
              isTakeoff: true,
              isLanding: false
            });
          }
        }
        
        if (flight.landing) {
          const existing = siteMap.get(flight.landing.ffvl_sid);
          if (existing) {
            existing.flightCount++;
            existing.isLanding = true;
          } else {
            siteMap.set(flight.landing.ffvl_sid, {
              site: flight.landing,
              flightCount: 1,
              isTakeoff: false,
              isLanding: true
            });
          }
        }
      });

      // Add site markers
      siteMap.forEach(({site, flightCount, isTakeoff, isLanding}) => {
        let color = '#6b7280'; // Default gray
        let icon = '📍';
        let label = 'Site';
        
        if (isTakeoff && isLanding) {
          color = '#8b5cf6'; // Purple for both takeoff and landing
          icon = '🔄';
          label = 'Takeoff & Landing';
        } else if (isTakeoff) {
          color = '#22c55e'; // Green for takeoff
          icon = '🛫';
          label = 'Takeoff';
        } else if (isLanding) {
          color = '#ef4444'; // Red for landing
          icon = '🛬';
          label = 'Landing';
        }

        const marker = new mapboxgl.Marker({
          color: color,
          scale: Math.min(1.5, 0.8 + (flightCount * 0.1)) // Scale based on flight count
        })
          .setLngLat([site.lng, site.lat])
          .setPopup(new mapboxgl.Popup().setHTML(`
            <div style="font-weight: bold; color: ${color};">${icon} ${label}</div>
            <div style="font-weight: bold;">${site.name}</div>
            <div style="font-size: 12px; color: #666;">
              ${flightCount} flight${flightCount !== 1 ? 's' : ''}
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
  }, [flights, pilotName]);

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

  if (!flights || flights.length === 0) {
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
        No flight data available for {pilotName}
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
          Loading pilot activity map...
        </div>
      )}
      
      {/* Map Legend */}
      {isLoaded && (
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
            {pilotName}'s Flying Activity
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
            <div><span style={{color: '#22c55e'}}>🛫</span> Takeoff sites</div>
            <div><span style={{color: '#ef4444'}}>🛬</span> Landing sites</div>
            <div><span style={{color: '#8b5cf6'}}>🔄</span> Both takeoff & landing</div>
            <div><span style={{color: '#3b82f6'}}>—</span> Flight paths</div>
          </div>
        </div>
      )}
    </div>
  );
}