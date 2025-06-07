'use client'

import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { FlightWithSites, Site } from '@parastats/common';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface SiteMapProps {
  site: Site;
  flights: FlightWithSites[];
  className?: string;
}

export default function SiteMap({ site, flights, className }: SiteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || !site) return;

    // Check if Mapbox token is available
    if (!MAPBOX_TOKEN) {
      console.error('Mapbox access token is required. Please set NEXT_PUBLIC_MAPBOX_TOKEN environment variable.');
      return;
    }

    // Initialize map
    mapboxgl.accessToken = MAPBOX_TOKEN;

    // Calculate bounds from site and flight paths
    const bounds = new mapboxgl.LngLatBounds();
    
    // Add site location to bounds
    bounds.extend([site.lng, site.lat]);
    
    // Add flight polylines to bounds
    flights.forEach(flight => {
      if (flight.polyline && flight.polyline.length > 0) {
        flight.polyline.forEach(([lat, lng]) => {
          bounds.extend([lng, lat]);
        });
      }
    });

    // If no flights, create a reasonable bounds around the site
    if (flights.length === 0) {
      const padding = 0.01; // ~1km in degrees
      bounds.extend([site.lng - padding, site.lat - padding]);
      bounds.extend([site.lng + padding, site.lat + padding]);
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        bounds: bounds,
        fitBoundsOptions: {
          padding: flights.length > 0 ? 50 : 100
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
            padding: flights.length > 0 ? 50 : 100
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

      // Add site marker with distinctive styling
      const siteMarker = new mapboxgl.Marker({
        color: '#8b5cf6', // Purple for the main site
        scale: 2
      })
        .setLngLat([site.lng, site.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div style="font-weight: bold; color: #8b5cf6; font-size: 16px;">🏔️ ${site.name}</div>
          <div style="margin: 8px 0;">
            <strong>Altitude:</strong> ${site.alt}m<br>
            <strong>Coordinates:</strong> ${site.lat.toFixed(6)}, ${site.lng.toFixed(6)}<br>
            <strong>Site ID:</strong> ${site.ffvl_sid}
          </div>
          <div style="color: #666; font-size: 12px;">
            ${flights.length} flight${flights.length !== 1 ? 's' : ''} recorded
          </div>
        `))
        .addTo(map.current);

      // Add flight paths
      const takeoffFlights = flights.filter(f => f.takeoff?.ffvl_sid === site.ffvl_sid);
      const landingFlights = flights.filter(f => f.landing?.ffvl_sid === site.ffvl_sid);

      // Add takeoff flights (green paths)
      takeoffFlights.forEach((flight, index) => {
        if (flight.polyline && flight.polyline.length > 0) {
          const flightLineCoordinates = flight.polyline.map(([lat, lng]) => [lng, lat]);
          
          const sourceId = `takeoff-flight-${index}`;
          const layerId = `takeoff-line-${index}`;
          
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                flightId: flight.strava_activity_id,
                wing: flight.wing,
                type: 'takeoff',
                pilotName: flight.pilot?.first_name || 'Unknown'
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
              'line-color': '#22c55e', // Green for takeoff flights
              'line-width': 3,
              'line-opacity': 0.7
            }
          });

          // Add click handler
          map.current!.on('click', layerId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const properties = feature.properties;
              
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-weight: bold; color: #22c55e;">🛫 Takeoff Flight</div>
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
      });

      // Add landing flights (red paths)
      landingFlights.forEach((flight, index) => {
        if (flight.polyline && flight.polyline.length > 0 && flight.landing?.ffvl_sid === site.ffvl_sid) {
          const flightLineCoordinates = flight.polyline.map(([lat, lng]) => [lng, lat]);
          
          const sourceId = `landing-flight-${index}`;
          const layerId = `landing-line-${index}`;
          
          map.current!.addSource(sourceId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {
                flightId: flight.strava_activity_id,
                wing: flight.wing,
                type: 'landing',
                pilotName: flight.pilot?.first_name || 'Unknown'
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
              'line-color': '#ef4444', // Red for landing flights
              'line-width': 3,
              'line-opacity': 0.7
            }
          });

          // Add click handler
          map.current!.on('click', layerId, (e) => {
            if (e.features && e.features[0]) {
              const feature = e.features[0];
              const properties = feature.properties;
              
              new mapboxgl.Popup()
                .setLngLat(e.lngLat)
                .setHTML(`
                  <div style="font-weight: bold; color: #ef4444;">🛬 Landing Flight</div>
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
  }, [site, flights]);

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
          Loading site map...
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
            {site.name} Flight Activity
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
            <div><span style={{color: '#8b5cf6'}}>🏔️</span> {site.name}</div>
            <div><span style={{color: '#22c55e'}}>—</span> Takeoff flights ({flights.filter(f => f.takeoff?.ffvl_sid === site.ffvl_sid).length})</div>
            <div><span style={{color: '#ef4444'}}>—</span> Landing flights ({flights.filter(f => f.landing?.ffvl_sid === site.ffvl_sid).length})</div>
          </div>
        </div>
      )}
    </div>
  );
}