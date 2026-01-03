
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMapWithNoSSR = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-screen bg-muted flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

export default function LocationPickerPage() {
  return (
    <Suspense fallback={
        <div className="h-screen w-screen bg-muted flex items-center justify-center">
            <p>Loading location picker...</p>
        </div>
    }>
      <div className="h-[calc(100vh-4rem)] w-full -m-4 lg:-m-6">
        <LocationPickerMapWithNoSSR />
      </div>
    </Suspense>
  );
}
