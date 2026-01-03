
'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Vehicle, VehicleResult } from '@/lib/types';
import { useVehicleJobStore } from '@/stores/job-store';
import { useMapStore } from '@/stores/map-store';
import TrackingSearchPanel from '@/components/tracking-search-panel';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { ClientBoundary } from '@/components/client-boundary';
import { motion, AnimatePresence } from 'framer-motion';


const MapWithNoSSR = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <p>Loading map...</p>
    </div>
  ),
});

export default function TrackingPage() {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { vehicles } = useVehicleJobStore();
  const { showRoutes, showIncidents } = useMapStore();
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  const handlePanelSelect = (vehicleResult: VehicleResult | null) => {
    if (!vehicleResult) {
      setSelectedVehicle(null);
      return;
    }
    const fullVehicle = vehicles.find(v => v.licensePlate === vehicleResult.licensePlate);
    setSelectedVehicle(fullVehicle || null);
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center -m-4 lg:-m-6">
        <div className="w-[1200px] h-[960px] relative overflow-hidden rounded-lg shadow-lg border">
            <div className="absolute inset-0 z-0">
                <ClientBoundary>
                    <MapWithNoSSR
                        vehicles={vehicles}
                        onVehicleSelect={setSelectedVehicle}
                        selectedVehicle={selectedVehicle}
                        showRoutes={showRoutes}
                        showIncidents={showIncidents}
                    />
                </ClientBoundary>
                </div>  
                    
                    <AnimatePresence>
                        {!isPanelVisible && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-4 right-4 z-20"
                            >
                                <Button 
                                    variant="secondary"
                                    onClick={() => setIsPanelVisible(true)}
                                    className="shadow-lg rounded-full h-12 w-12"
                                >
                                    <ChevronLeft className="h-6 w-6" />
                                    <span className="sr-only">Show Panel</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                    {isPanelVisible && (
                        <motion.div
                            initial={{ width: 0, opacity: 0, x: 400 }}
                            animate={{ width: 400, opacity: 1, x: 0 }}
                            exit={{ width: 0, opacity: 0, x: 400 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute top-4 right-4 bottom-4 w-[400px] h-[calc(100%-2rem)] z-10 shadow-2xl rounded-lg overflow-hidden"
                        >
                            <ClientBoundary>
                                <TrackingSearchPanel onVehicleSelect={handlePanelSelect} onToggleVisibility={() => setIsPanelVisible(false)} />
                            </ClientBoundary>
                        </motion.div>
                    )}
                    </AnimatePresence>
        </div>
    </div>
  );
}
