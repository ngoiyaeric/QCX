'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

export enum MapToggleEnum {
  RealTimeMode,
  MapBox,
  EarthEngine,
}

interface MapToggleContextType {
  mapType: MapToggleEnum;
  setMapType: (type: MapToggleEnum) => void;
}

const MapToggleContext = createContext<MapToggleContextType | undefined>(undefined);

interface MapToggleProviderProps {
  children: ReactNode;
}

export const MapToggleProvider: React.FC<MapToggleProviderProps> = ({ children }) => {
  const [mapType, setMapType] = useState<MapToggleEnum>(MapToggleEnum.RealTimeMode);

  return (
    <MapToggleContext.Provider value={{ mapType, setMapType }}>
      {children}
    </MapToggleContext.Provider>
  );
};

export const useMapToggle = () => {
  const context = useContext(MapToggleContext);
  if (context === undefined) {
    throw new Error('MapToggleContext must be used within a MapToggleProvider');
  }
  return context;
};
