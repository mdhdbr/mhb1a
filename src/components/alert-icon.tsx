
"use client";

import { Hourglass, AlertTriangle, Info, Siren } from "lucide-react";
import type { AlertIconType } from "@/stores/alert-store";
import { AcceptanceAlertIcon } from './acceptance-alert-icon';
import { CalloutAlertIcon, LandlineAlertIcon, IntegrationAlertIcon, FlightAlertIcon, LateToPickupIcon, LateToDropOffIcon, WaitingTimeIcon } from './custom-alert-icons';


const iconMap: Record<AlertIconType, JSX.Element> = {
  hourglass: <Hourglass className="h-5 w-5 text-destructive" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  sos: <Siren className="h-5 w-5 text-red-600" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  acceptance: <AcceptanceAlertIcon />,
  callout: <CalloutAlertIcon />,
  landline: <LandlineAlertIcon />,
  integration: <IntegrationAlertIcon />,
  flight: <FlightAlertIcon />,
  pickup: <LateToPickupIcon />,
  dropoff: <LateToDropOffIcon />,
  waiting: <WaitingTimeIcon />,
};

export function AlertIcon({ type }: { type: AlertIconType }) {
  // This now safely returns the correct JSX element based on the string type.
  return iconMap[type] ?? null;
}
