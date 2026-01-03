'use client';
import L from 'leaflet';

const createIcon = (svg: string) => {
    return L.divIcon({
      html: svg,
      className: 'bg-transparent border-0',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });
};

export const plannedPickupIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#22c55e" stroke="#ffffff" stroke-width="1.5"/>
    <text x="12" y="14" font-size="12" font-weight="bold" fill="white" text-anchor="middle">P</text>
  </svg>`
);

export const plannedDropoffIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" fill="#ef4444" stroke="#ffffff" stroke-width="1.5"/>
    <text x="12" y="14" font-size="12" font-weight="bold" fill="white" text-anchor="middle">D</text>
  </svg>`
);

export const intermediateStopIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8-0-0-1_16 0Z" fill="#3b82f6" stroke="#ffffff" stroke-width="1.5"/>
    <text x="12" y="14" font-size="12" font-weight="bold" fill="white" text-anchor="middle">S</text>
  </svg>`
);

export const actualPickupIcon = createIcon(
   `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-truck">
    <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/>
    <path d="M14 9h4l4 4v4h-2"/>
    <circle cx="7" cy="18" r="2"/>
    <circle cx="17" cy="18" r="2"/>
  </svg>`
);

export const actualDropoffIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-flag">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" x2="4" y1="22" y2="15"/>
  </svg>`
);

export const statusChangeIcon = createIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#fbbf24" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`
);
