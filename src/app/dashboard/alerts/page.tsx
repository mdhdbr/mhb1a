
'use client';

import { useState, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAlertStore } from "@/stores/alert-store";
import { cn } from "@/lib/utils";
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';

export default function AlertsPage() {
  const { alerts } = useAlertStore();
  const { toast } = useToast();
  const firestore = useFirestore();

  const getSeverityClass = (severity: string) => {
    return severity === 'critical' ? "bg-red-600 text-white border-red-700" : "";
  }
  
  const handleAddTestAlert = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Firestore Error", description: "Firestore is not available." });
        return;
    }
    try {
        await addDoc(collection(firestore, "fatigueEvents"), {
            driverId: "TEST123",
            driverName: "Test Driver",
            fatigueLevel: "high",
            score: 85,
            source: "control_panel",
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Test Alert Added",
            description: "A manual fatigue event has been logged to Firestore.",
        });
    } catch (error) {
        console.error("Error adding test alert:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not add test alert to Firestore.",
        });
    }
  };

  return (
    <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="font-headline">Productivity Alerts</CardTitle>
            <Button variant="outline" size="sm" onClick={handleAddTestAlert}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Test Fatigue Alert
            </Button>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
                {alerts.map((alert) => (
                    <div key={alert.alertId} className={cn("flex items-center gap-4 p-4 border rounded-lg", alert.severity === 'critical' ? 'bg-destructive/90 text-destructive-foreground' : 'bg-secondary/50')}>
                        <div className="w-24 text-center">
                            <span className="text-xs text-muted-foreground font-mono">{alert.icon}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                                <p className="font-semibold">{alert.type}</p>
                                <span className={cn("text-xs", alert.severity === 'critical' ? 'text-destructive-foreground/80' : 'text-muted-foreground')}>
                                  {alert.triggeredAt ? formatDistanceToNow(alert.triggeredAt.toDate(), { addSuffix: true }) : ''}
                                </span>
                            </div>
                            <p className={cn("text-sm", alert.severity === 'critical' ? 'text-destructive-foreground/90' : 'text-muted-foreground')}>{alert.message}</p>
                        </div>
                        <Badge
                          variant={alert.severity === 'critical' || alert.severity === 'warning' ? 'destructive' : 'secondary'}
                          className={getSeverityClass(alert.severity)}
                        >
                          {alert.severity}
                        </Badge>
                    </div>
                ))}
                {alerts.length === 0 && (
                    <div className="text-center p-8 text-muted-foreground">
                        No alerts at the moment.
                    </div>
                )}
            </div>
        </CardContent>
    </Card>
  );
}

// Simple hash function for generating a consistent ID from a string
if (typeof String.prototype.hashCode === 'undefined') {
    Object.defineProperty(String.prototype, 'hashCode', {
        value: function() {
            var hash = 0, i, chr;
            if (this.length === 0) return hash;
            for (i = 0; i < this.length; i++) {
            chr   = this.charCodeAt(i);
            hash  = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
            }
            return Math.abs(hash); // Return absolute value for safety
        }
    });
}
declare global {
    interface String {
        hashCode(): number;
    }
}
