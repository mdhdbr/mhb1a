
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const LocationPickerMapWithNoSSR = dynamic(() => import('@/components/location-picker-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

export default function LocationPickerPage() {
  return (
    <Suspense fallback={
        <div className="h-full w-full bg-muted flex items-center justify-center">
            <p>Loading location picker...</p>
        </div>
    }>
      <div className="w-full flex items-center justify-center -m-4 lg:-m-6">
        <div className="w-[1200px] h-[1080px] rounded-lg overflow-hidden shadow-2xl border">
            <LocationPickerMapWithNoSSR />
        </div>
      </div>
    </Suspense>
  );
}
