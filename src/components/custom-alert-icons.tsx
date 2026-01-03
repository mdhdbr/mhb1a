
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

// New Icons based on the image
export const LateToPickupIcon = createIcon('P', 'bg-red-600', 'text-white');
export const LateToDropOffIcon = createIcon('D', 'bg-red-600', 'text-white');
export const WaitingTimeIcon = createIcon('W', 'bg-red-600', 'text-white');
