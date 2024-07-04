'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

export enum TimeToggleEnum {
  FreeMode,
  RealTimeMode,
}

interface TimeToggleContextType {
  TimeType: TimeToggleEnum;
  setTimeType: (type: TimeToggleEnum) => void;
}

const TimeToggleContext = createContext<TimeToggleContextType | undefined>(undefined);

interface TimeToggleProviderProps {
  children: ReactNode;
}

export const TimeToggleProvider: React.FC<TimeToggleProviderProps> = ({ children }) => {
  const [timeToggleState, setTimeToggle] = useState<TimeToggleEnum>(TimeToggleEnum.FreeMode);

  const setTimeType = (type: TimeToggleEnum) => {
    setTimeToggle(type);
  }

  return (
    <TimeToggleContext.Provider value={{ TimeType: timeToggleState, setTimeType }}>
      {children}
    </TimeToggleContext.Provider>
  );
};

export const useTimeToggle = () => {
  const context = useContext(TimeToggleContext);
  if (context === undefined) {
    throw new Error('map toogle context must be used within an map toggle provider');
  }
  return context;
};
