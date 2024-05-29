'use client'

import { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

export const Mapbox: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [is3D, setIs3D] = useState(false);

  useEffect(() => {
    mapboxgl.accessToken = 
      'pk.eyJ1IjoidG1hbG9uZXkiLCJhIjoiY2x3ZnF6MTR3MDBvczJrczdycHRldzAzMCJ9.o492x_ZQTRZiuqt8-r6YxA';

    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-74.0060152, 40.7127281],
        zoom: 9,
        maxZoom: 15,
        attributionControl: false
      });

      // Add zoom controls
      map.addControl(new mapboxgl.NavigationControl(), "top-left");

      // Add your custom markers and lines here

      // Clean up on unmount
      return () => map.remove();
    }
  }, []);

  return (
    <div ref={mapContainer} className="h-full w-full relative"/>
  );
}