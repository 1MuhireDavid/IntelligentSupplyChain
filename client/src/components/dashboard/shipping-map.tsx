import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShippingRoute } from '@shared/schema';
import ReactMapGL, { Marker, Source, Layer, NavigationControl, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface ShippingMapProps {
  routes?: ShippingRoute[];
  fullSize?: boolean;
}

// Default viewport settings
const initialViewport = {
  latitude: 0,
  longitude: 25,
  zoom: 1.5,
};

// Mapbox public token - in a real app this should come from environment variables
const MAPBOX_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

export default function ShippingMap({ routes, fullSize = false }: ShippingMapProps) {
  const [viewport, setViewport] = useState(initialViewport);
  const [selectedRoute, setSelectedRoute] = useState<ShippingRoute | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Simple geography coordinates for demonstration
  // In a real app, these would be fetched from a geocoding service or database
  const locationCoordinates = {
    'Kigali': [30.0619, -1.9403],
    'Amsterdam': [4.9041, 52.3676],
    'Mombasa': [39.6682, -4.0435],
    'Dubai': [55.2708, 25.2048],
    'Shanghai': [121.4737, 31.2304],
    'Dar es Salaam': [39.2083, -6.7924],
    'New York': [-74.0060, 40.7128],
    'Nairobi': [36.8219, -1.2921],
    'London': [-0.1278, 51.5074]
  };

  // Create route data for the map
  const getRouteFeatures = () => {
    if (!routes || routes.length === 0) return { type: 'FeatureCollection', features: [] };

    return {
      type: 'FeatureCollection',
      features: routes.map(route => {
        const originCoords = locationCoordinates[route.origin as keyof typeof locationCoordinates] || [0, 0];
        const destCoords = locationCoordinates[route.destination as keyof typeof locationCoordinates] || [0, 0];
        
        return {
          type: 'Feature',
          properties: {
            routeId: route.id,
            origin: route.origin,
            destination: route.destination,
            status: route.status,
            mode: route.transportMode
          },
          geometry: {
            type: 'LineString',
            coordinates: [
              [originCoords[0], originCoords[1]],
              [destCoords[0], destCoords[1]]
            ]
          }
        };
      })
    };
  };

  // Layer style for routes
  const routeLayer = {
    id: 'routes',
    type: 'line',
    paint: {
      'line-width': 2,
      'line-color': [
        'match',
        ['get', 'status'],
        'active', '#1565C0',
        'pending', '#FFA000',
        'completed', '#2E7D32',
        '#1565C0' // default color
      ],
      'line-dasharray': [
        'match',
        ['get', 'mode'],
        'Air', [0, 0],
        'Sea', [2, 1],
        'Road', [1, 1],
        [0, 0] // default
      ]
    }
  };

  // Handler for marker click
  const handleMarkerClick = (route: ShippingRoute) => {
    setSelectedRoute(route);
  };

  // Get marker locations from routes
  const getMarkerLocations = () => {
    if (!routes || routes.length === 0) return [];

    const locations = new Set<string>();
    const markers = [];

    for (const route of routes) {
      if (!locations.has(route.origin)) {
        locations.add(route.origin);
        const coords = locationCoordinates[route.origin as keyof typeof locationCoordinates];
        if (coords) {
          markers.push({
            name: route.origin,
            longitude: coords[0],
            latitude: coords[1],
            isOrigin: true,
            route
          });
        }
      }

      if (!locations.has(route.destination)) {
        locations.add(route.destination);
        const coords = locationCoordinates[route.destination as keyof typeof locationCoordinates];
        if (coords) {
          markers.push({
            name: route.destination,
            longitude: coords[0],
            latitude: coords[1],
            isOrigin: false,
            route
          });
        }
      }
    }

    return markers;
  };

  // Customize the component based on whether it's full size or regular
  const height = fullSize ? '500px' : '300px';
  const headerText = fullSize ? 'Global Shipping Routes' : 'Global Shipping Routes';

  return (
    <Card className={`${fullSize ? '' : 'border-neutral-100'}`}>
      {!fullSize && (
        <CardHeader className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <CardTitle className="text-base font-semibold">{headerText}</CardTitle>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-success bg-opacity-10 text-success text-xs rounded-full font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-success mr-1"></span>
              {routes?.length || 0} Active Routes
            </span>
            <button className="text-neutral-400 hover:text-neutral-600">
              <span className="material-icons">fullscreen</span>
            </button>
          </div>
        </CardHeader>
      )}
      <CardContent className={`p-4 ${fullSize ? 'p-0' : ''}`}>
        <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
          <ReactMapGL
            {...viewport}
            width="100%"
            height="100%"
            onMove={evt => setViewport(evt.viewState)}
            mapStyle="mapbox://styles/mapbox/light-v11"
            mapboxAccessToken={MAPBOX_TOKEN}
            onLoad={() => setMapLoaded(true)}
          >
            {mapLoaded && (
              <>
                <Source id="routes-source" type="geojson" data={getRouteFeatures()}>
                  <Layer {...routeLayer as any} />
                </Source>
                
                {getMarkerLocations().map((marker, index) => (
                  <Marker
                    key={`${marker.name}-${index}`}
                    longitude={marker.longitude}
                    latitude={marker.latitude}
                    anchor="bottom"
                    onClick={() => handleMarkerClick(marker.route)}
                  >
                    <div className={`w-4 h-4 rounded-full ${marker.isOrigin ? 'bg-primary' : 'bg-accent-500'} border-2 border-white cursor-pointer`} />
                  </Marker>
                ))}
                
                {selectedRoute && (
                  <Popup
                    longitude={locationCoordinates[selectedRoute.destination as keyof typeof locationCoordinates]?.[0] || 0}
                    latitude={locationCoordinates[selectedRoute.destination as keyof typeof locationCoordinates]?.[1] || 0}
                    anchor="top"
                    onClose={() => setSelectedRoute(null)}
                    closeButton={true}
                  >
                    <div className="p-2">
                      <h3 className="font-medium text-sm">{selectedRoute.origin} → {selectedRoute.destination}</h3>
                      <p className="text-xs text-neutral-600 mt-1">
                        <span className="font-medium">Mode:</span> {selectedRoute.transportMode}
                      </p>
                      <p className="text-xs text-neutral-600">
                        <span className="font-medium">Transit time:</span> {selectedRoute.transitTime.toFixed(1)} days
                      </p>
                      <p className="text-xs text-neutral-600">
                        <span className="font-medium">Distance:</span> {selectedRoute.distance} km
                      </p>
                    </div>
                  </Popup>
                )}
                
                <NavigationControl position="top-right" />
              </>
            )}
          </ReactMapGL>
        </div>
        
        {!fullSize && (
          <div className="mt-4 flex flex-wrap gap-2">
            {routes?.slice(0, 5).map((route) => (
              <span key={route.id} className="px-3 py-1 bg-neutral-100 text-neutral-800 text-xs rounded-full whitespace-nowrap">
                {route.origin} - {route.destination}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
