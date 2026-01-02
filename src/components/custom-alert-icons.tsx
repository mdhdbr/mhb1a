"use client";

import React from 'react';

const createIcon = (
  letter: string,
  bgColorClass: string,
  textColorClass: string
) => {
  return () => (
    <div
      className={`h-5 w-5 rounded-sm flex items-center justify-center ${bgColorClass}`}
    >
      <span className={`font-bold text-sm ${textColorClass}`}>{letter}</span>
    </div>
  );
};

export const CalloutAlertIcon = createIcon('C', 'bg-red-600', 'text-white');
export const LandlineAlertIcon = createIcon('L', 'bg-yellow-500', 'text-black');
export const IntegrationAlertIcon = createIcon('I', 'bg-blue-500', 'text-white');
export const FlightAlertIcon = createIcon('F', 'bg-purple-600', 'text-white');
