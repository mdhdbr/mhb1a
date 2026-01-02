
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const CustomerLocationPickerMapWithNoSSR = dynamic(() => import('@/components/customer-location-picker-map'), {
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
      <div className="min-h-screen w-full flex items-center justify-center bg-muted p-4">
        <div className="w-full max-w-[1080px] h-[calc(100vh-4rem)] rounded-lg overflow-hidden shadow-2xl border">
          <CustomerLocationPickerMapWithNoSSR />
        </div>
      </div>
    </Suspense>
  );
}
