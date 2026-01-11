

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UserTable from '@/components/user-table';
import { useUser, useFirestore, useDoc, useMemoFirebase, useFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile, updateEmail } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ChangePasswordDialog from '@/components/change-password-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { exportDataToExcel } from '@/lib/backup';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ShieldCheck, ShieldOff, Copy, User, Users, Lock, Database, FileDown, Palette, Briefcase, Camera, Bell, Activity } from 'lucide-react';
import Image from 'next/image';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { UserProfile } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AgentStatusTable from '@/components/agent-status-table';
import UserActivityTracker from '@/components/user-activity-tracker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getInitials, cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OtpDialog from '@/components/otp-dialog';
import { useAlertStore } from '@/stores/alert-store';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAlertSettingsStore, type AlertRule, type AlertTimeThreshold } from '@/stores/alert-settings-store';


const backupCollections = [
    { id: 'users', label: 'Users' },
    { id: 'agents', label: 'Agents' },
    { id: 'drivers', label: 'Drivers' },
    { id: 'vehicles', label: 'Vehicles' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'incident_reports', label: 'Incident Reports' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'pricing', label: 'Pricing' },
];

async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed'));
        }
        resolve(blob);
      }, file.type, 0.9); // 0.9 is the quality
    };
    img.onerror = error => reject(error);
  });
}


const AppearanceTab = () => {
    const { toast } = useToast();
    
    const getInitialColor = (varName: string, defaultValue: string) => {
        if (typeof window === 'undefined') return defaultValue;
        const style = getComputedStyle(document.documentElement);
        return style.getPropertyValue(varName).trim() || defaultValue;
    };
    
    const [primaryColor, setPrimaryColor] = useState(() => getInitialColor('--primary', '262 82% 57%'));
    const [backgroundColor, setBackgroundColor] = useState(() => getInitialColor('--background', '240 20% 98%'));
    const [accentColor, setAccentColor] = useState(() => getInitialColor('--accent', '240 4.8% 95.9%'));

    const handleColorChange = (colorVar: string, value: string) => {
        if (typeof document !== 'undefined') {
            document.documentElement.style.setProperty(colorVar, value);
        }
    };
    
    useEffect(() => {
        handleColorChange('--primary', primaryColor);
        handleColorChange('--ring', primaryColor);
    }, [primaryColor]);

    useEffect(() => {
        handleColorChange('--background', backgroundColor);
    }, [backgroundColor]);
    
    useEffect(() => {
        handleColorChange('--accent', accentColor);
    }, [accentColor]);

    const handleSaveTheme = () => {
        toast({
            title: "Theme Saved (Simulated)",
            description: "In a real scenario, this would update globals.css."
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize the look and feel of your application. Changes are applied live.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color (HSL)</Label>
                    <Input 
                        id="primary-color" 
                        value={primaryColor} 
                        onChange={(e) => setPrimaryColor(e.target.value)} 
                        placeholder="e.g., 262 82% 57%"
                    />
                    <p className="text-xs text-muted-foreground">Controls buttons, active elements, and major highlights.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color (HSL)</Label>
                    <Input 
                        id="background-color" 
                        value={backgroundColor} 
                        onChange={(e) => setBackgroundColor(e.target.value)} 
                        placeholder="e.g., 240 20% 98%"
                    />
                     <p className="text-xs text-muted-foreground">Controls the main app background.</p>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color (HSL)</Label>
                    <Input 
                        id="accent-color" 
                        value={accentColor} 
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="e.g., 240 4.8% 95.9%"
                    />
                     <p className="text-xs text-muted-foreground">Controls secondary elements and hover states.</p>
                </div>
            </CardContent>
             <CardFooter>
                <Button onClick={handleSaveTheme}>Save Theme</Button>
            </CardFooter>
        </Card>
    );
};


const AlertsTab = () => {
    const { toast } = useToast();
    const { rules, setRuleEnabled, setRuleThreshold } = useAlertSettingsStore();

    const handleSaveAlerts = () => {
        toast({
            title: "Alert Settings Saved",
            description: "Your new alert rules have been applied system-wide.",
        });
    };
    
    type RuleRowProps = {
        ruleKey: AlertRule;
        code: string;
        label: string;
        description: string;
        hasThreshold?: boolean;
        thresholdUnit?: string;
    }

    const RuleRow = ({ ruleKey, code, label, description, hasThreshold = false, thresholdUnit = 'min' }: RuleRowProps) => {
        const rule = rules[ruleKey];
        if (!rule) return null;

        return (
            <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                    <Label htmlFor={ruleKey} className="text-base flex items-center gap-2">
                        <Badge variant="outline">{code}</Badge>
                        {label}
                    </Label>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div className="flex items-center gap-4">
                    {hasThreshold && (
                        <>
                            <Input
                                id={`${ruleKey}-time`}
                                type="number"
                                value={rule.threshold || ''}
                                onChange={(e) => {
                                    const next = parseInt(e.target.value, 10);
                                    if (Number.isFinite(next)) {
                                        setRuleThreshold(ruleKey as AlertTimeThreshold, next);
                                    }
                                }}
                                className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">{thresholdUnit}</span>
                        </>
                    )}
                    <Switch
                        id={ruleKey}
                        checked={rule.enabled}
                        onCheckedChange={(checked) => setRuleEnabled(ruleKey, checked)}
                    />
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>System Alert Rules</CardTitle>
                <CardDescription>Configure when to trigger automated alerts. These settings will apply across the system.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Job Workflow Alerts</h3>
                    <RuleRow ruleKey="late_accept" code="A" label="Late Accept" description="Driver does not accept job within configured time after job status = Received" hasThreshold />
                    <Separator />
                    <RuleRow ruleKey="soft_allocated" code="S" label="Soft Allocation" description="Job is soft-allocated and not confirmed X mins before pickup" hasThreshold />
                    <Separator />
                    <RuleRow ruleKey="driver_offline" code="X" label="Driver Offline" description="Driver logged out while having incomplete jobs" />
                </div>
                
                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">On-the-Road Alerts</h3>
                    <RuleRow ruleKey="late_pickup" code="P" label="Late to Pickup" description="Vehicle expected to arrive late to first pickup" hasThreshold />
                    <Separator />
                    <RuleRow ruleKey="late_dropoff" code="D" label="Late to Dropoff" description="Vehicle expected to be late to final drop" hasThreshold />
                    <Separator />
                    <RuleRow ruleKey="waiting_time" code="W" label="Excessive Waiting" description="Driver waiting longer than allowed threshold" hasThreshold />
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Passenger & Communication Alerts</h3>
                     <RuleRow ruleKey="callout" code="C" label="Callout" description="Passenger not found after arrival; driver selects No Show / Call Out" />
                     <Separator />
                     <RuleRow ruleKey="landline_callout" code="L" label="Landline Callout" description="SMS failed or passenger number is a landline" />
                     <Separator />
                     <RuleRow ruleKey="passenger_notified" code="PN" label="Passenger Notified (Info)" description="Show an informational alert when a passenger is successfully notified" />
                     <Separator />
                     <RuleRow ruleKey="passenger_not_notified" code="PF" label="Notification Failed" description="Alert when an automated passenger notification fails to send" />
                </div>
                
                 <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Logistics & Normal PAX Operations Alerts</h3>
                     <RuleRow ruleKey="schedule_shifted" code="T" label="Schedule Shifted" description="Pickup or drop-off time changed beyond threshold" hasThreshold />
                    <Separator />
                     <RuleRow ruleKey="trip_cancelled" code="TX" label="Trip Cancelled" description="Trip / job cancelled after assignment or acceptance" />
                    <Separator />
                     <RuleRow ruleKey="location_changed" code="LA" label="Location Changed" description="Pickup or drop-off location changed after job creation" />
                    <Separator />
                     <RuleRow ruleKey="terminal_gate_changed" code="LT" label="Terminal/Gate Changed" description="Arrival terminal, gate, bay, or dock has changed" />
                    <Separator />
                     <RuleRow ruleKey="schedule_not_validated" code="NV" label="Schedule Not Validated" description="Schedule not validated by planning/routing engine" />
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Airport-Specific Alerts</h3>
                     <RuleRow ruleKey="flight_delayed_early" code="F" label="Flight Delayed/Early" description="Linked flight is delayed or arrives early" />
                    <Separator />
                     <RuleRow ruleKey="flight_cancelled" code="FX" label="Flight Cancelled" description="Linked flight has been cancelled" />
                    <Separator />
                     <RuleRow ruleKey="airport_changed" code="FA" label="Airport Changed" description="Arrival or departure airport has changed" />
                    <Separator />
                     <RuleRow ruleKey="terminal_changed" code="FT" label="Terminal Changed" description="Arrival terminal has changed" />
                    <Separator />
                     <RuleRow ruleKey="flight_not_validated" code="FV" label="Flight Not Validated" description="Flight details not validated by flight checker" />
                </div>

                <div className="space-y-4 rounded-lg border p-4">
                    <h3 className="font-semibold text-lg">Integration Alerts</h3>
                    <RuleRow ruleKey="integration_info" code="I" label="Integration Info" description="Informational updates from external booking systems" />
                    <Separator />
                    <RuleRow ruleKey="integration_warning" code="I" label="Integration Warning" description="Third-party booking update failed or was partially processed" />
                </div>

            </CardContent>
            <CardFooter>
                <Button onClick={handleSaveAlerts}>Save Alert Settings</Button>
            </CardFooter>
        </Card>
    );
};


export default function SettingsPage() {
  const { user, auth } = useUser();
  const { firestore, storage } = useFirebase();
  const { toast } = useToast();
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'driver' | 'user'>('user');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [setup2fa, setSetup2fa] = useState<{ qrCode: string; manualKey: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isVerified, setIsVerified] = useState(false);


  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading, mutate } = useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile) {
        setFirstName(userProfile.firstName || '');
        setLastName(userProfile.lastName || '');
        setEmail(userProfile.email || '');
        setRole(userProfile.role || 'user');
        setPreviewUrl(userProfile.avatar || null);
    }
  }, [userProfile]);
  
  const hasProfileChanged = userProfile && (
    firstName !== (userProfile.firstName || '') || 
    lastName !== (userProfile.lastName || '') || 
    email !== (userProfile.email || '') ||
    role !== (userProfile.role || 'user') ||
    !!selectedFile
  );

  const handleProfileSave = async () => {
    if (!user || !firestore || !auth?.currentUser || !storage) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication services not available.' });
        return;
    }
    
    setIsSavingProfile(true);

    try {
        let avatarUrl = userProfile?.avatar;

        if (selectedFile) {
            const resizedBlob = await resizeImage(selectedFile, 256, 256);
            const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`);
            await uploadBytes(storageRef, resizedBlob);
            avatarUrl = await getDownloadURL(storageRef);
        }

        const userDocRef = doc(firestore, 'users', user.uid);
        const updatePayload: { [key: string]: any } = {
            firstName: firstName,
            lastName: lastName,
            role: role,
            avatar: avatarUrl || null,
        };
        
        if (email !== userProfile?.email) {
            if (auth.currentUser.providerData.some(p => p.providerId === 'password')) {
                await updateEmail(auth.currentUser, email);
                updatePayload.email = email;
            } else {
                 toast({
                    variant: 'destructive',
                    title: 'Update Skipped',
                    description: 'Email cannot be changed for social logins.',
                });
            }
        }

        await updateDoc(userDocRef, updatePayload);
        
        const authProfileUpdates: { displayName?: string, photoURL?: string } = {};
        const newDisplayName = `${firstName} ${lastName}`.trim();
        if (newDisplayName !== auth.currentUser.displayName) {
            authProfileUpdates.displayName = newDisplayName;
        }
        if (avatarUrl && avatarUrl !== auth.currentUser.photoURL) {
            authProfileUpdates.photoURL = avatarUrl;
        }
        if (Object.keys(authProfileUpdates).length > 0) {
            await updateProfile(auth.currentUser, authProfileUpdates);
        }
        
        await mutate();
        
        toast({ title: 'Profile Updated', description: 'Your profile has been saved successfully.' });
        setSelectedFile(null);

    } catch (error: any) {
        console.error('Error updating profile:', error);
        let description = 'Could not save your profile.';
        if (error.code === 'auth/requires-recent-login') {
            description = 'Changing your email requires a recent login. Please sign out and sign back in to change your email.';
        } else if (error.code === 'auth/email-already-in-use') {
            description = 'This email is already in use by another account.';
        }
        toast({ variant: 'destructive', title: 'Error', description: description });
    } finally {
        setIsSavingProfile(false);
    }
  };


  const handleBackup = async () => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Backup Failed", description: "Firestore connection is not available." });
        return;
    }
    if (selectedCollections.length === 0) {
        toast({ variant: "destructive", title: "Backup Failed", description: "Please select at least one data collection to back up." });
        return;
    }

    setIsBackingUp(true);
    try {
        const success = await exportDataToExcel(firestore, selectedCollections);
        if (success) {
            toast({ title: "Backup Successful", description: "Your selected data has been exported to an Excel file." });
        } else {
             toast({ variant: "destructive", title: "Backup Failed", description: "No data found in the selected collections to export." });
        }
    } catch (error) {
        console.error("Backup failed:", error);
        toast({ variant: "destructive", title: "Backup Failed", description: "Could not export data. Please check the console for errors." });
    } finally {
        setIsBackingUp(false);
    }
  };

  const handleCollectionSelect = (collectionId: string, checked: boolean) => {
    setSelectedCollections(prev => checked ? [...prev, collectionId] : prev.filter(id => id !== collectionId));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCollections(backupCollections.map(c => c.id));
    } else {
      setSelectedCollections([]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const areAllSelected = selectedCollections.length > 0 && selectedCollections.length === backupCollections.length;

  const handleEnable2fa = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    
    const response = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const data = await response.json();
        setSetup2fa({ qrCode: data.qrCode, manualKey: data.manualKey });
    } else {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: '2FA Setup Failed', description: errorData.error || 'Could not start 2FA setup process.'});
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!setup2fa || !otpCode || !userProfileRef || !user) return;
    setIsVerifying(true);
    const token = await user.getIdToken();

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      });

      if (response.ok) {
        toast({ title: 'Success', description: 'Two-Factor Authentication has been enabled.' });
        setSetup2fa(null);
        setOtpCode('');
        mutate();
      } else {
        const errorData = await response.json();
        toast({ variant: 'destructive', title: 'Verification Failed', description: errorData.error || 'The code is incorrect. Please try again.' });
      }

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    }
    
    setIsVerifying(false);
  };
  
  const handleDisable2fa = async () => {
    if (!userProfileRef || !firestore) return;
    
    try {
        await updateDoc(userProfileRef, {
            twoFactorEnabled: false,
            twoFactorSecret: null
        });
        
        toast({ title: '2FA Disabled', description: 'Two-Factor Authentication has been turned off.' });
        mutate();
    } catch(error) {
        console.error("Error disabling 2FA:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not disable 2FA." });
    }
  }
  
  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({ title: 'Copied!', description: 'Manual key copied to clipboard.' });
  }

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!isVerified) {
    return <OtpDialog onVerified={() => setIsVerified(true)} />;
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <h1 className="text-3xl font-bold font-headline">Settings</h1>
        <Button variant="outline" onClick={() => setIsVerified(false)}>
          <Lock className="mr-2 h-4 w-4" />
          Lock Page
        </Button>
      </div>


      <Tabs defaultValue="profile" orientation="vertical" className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
        <TabsList className="h-auto flex-col items-start justify-start p-1 bg-muted rounded-lg">
          <TabsTrigger value="profile" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <User className="mr-2 h-4 w-4" />Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Palette className="mr-2 h-4 w-4" />Appearance
          </TabsTrigger>
          <TabsTrigger value="security" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Lock className="mr-2 h-4 w-4" />Security
          </TabsTrigger>
          {userProfile?.role === 'admin' && (
            <>
              <TabsTrigger value="users" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Users className="mr-2 h-4 w-4" />Users
              </TabsTrigger>
              <TabsTrigger value="agents" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Briefcase className="mr-2 h-4 w-4" />Agents
              </TabsTrigger>
              <TabsTrigger value="alerts" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Bell className="mr-2 h-4 w-4" />Alerts
              </TabsTrigger>
              <TabsTrigger value="backup" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Database className="mr-2 h-4 w-4" />Backup
              </TabsTrigger>
              <TabsTrigger value="activity" className="w-full justify-start py-2 px-3 text-base data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Activity className="mr-2 h-4 w-4" />User Activity
              </TabsTrigger>
            </>
          )}
        </TabsList>
        
        <div className="min-h-[500px]">
          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>My Profile</CardTitle><CardDescription>This is your user profile information as it is stored in the database.</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={previewUrl || undefined} />
                            <AvatarFallback>{getInitials(userProfile || {})}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label htmlFor="first-name">First Name</Label><Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSavingProfile} /></div>
                      <div className="space-y-1.5"><Label htmlFor="last-name">Last Name</Label><Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSavingProfile} /></div>
                  </div>
                  <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSavingProfile} /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label>Role</Label>
                          <Select value={role} onValueChange={(value) => setRole(value as any)} disabled={isSavingProfile || userProfile?.role !== 'admin'}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="agent">Agent</SelectItem>
                                <SelectItem value="driver">Driver</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                          </Select>
                      </div>
                      <div className="space-y-1.5"><Label>User ID</Label><Input value={user?.uid || 'Unknown'} disabled title="User ID cannot be changed." /></div>
                  </div>
              </CardContent>
              <CardFooter className="justify-end">
                  <Button onClick={handleProfileSave} disabled={isSavingProfile || !hasProfileChanged}>{isSavingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isSavingProfile ? 'Saving...' : 'Save Changes'}</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <AppearanceTab />
          </TabsContent>

          <TabsContent value="security">
              <Card>
                  <CardHeader><CardTitle>Account Security</CardTitle><CardDescription>Manage your password and Two-Factor Authentication.</CardDescription></CardHeader>
                  <CardContent className="space-y-6">
                      <div>
                          <h3 className="font-semibold mb-2">Password</h3>
                          <div className="flex items-center justify-between p-4 bg-secondary border rounded-lg">
                              <p className="text-sm text-muted-foreground">Change your password to keep your account secure.</p>
                              <Button variant="outline" onClick={() => setChangePasswordOpen(true)}>Change Password</Button>
                          </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
                          {userProfile?.twoFactorEnabled ? (
                              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-green-600" /><div><p className="font-semibold">2FA is Enabled</p><p className="text-sm text-muted-foreground">Your account is protected.</p></div></div>
                                  <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive"><ShieldOff className="mr-2 h-4 w-4" />Disable</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will disable Two-Factor Authentication for your account. This is not recommended.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDisable2fa} className="bg-destructive hover:bg-destructive/90">Yes, Disable 2FA</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
                              </div>
                          ) : setup2fa ? (
                              <div className="space-y-4 p-4 border rounded-lg">
                                <div>
                                    <h4 className="font-semibold">Step 1: Scan QR Code</h4>
                                    <p className="text-sm text-muted-foreground">Scan this with your authenticator app. If you can't scan, use the manual key below.</p>
                                    <div className="mt-2 flex justify-center p-4 bg-white rounded-md"><Image src={setup2fa.qrCode} alt="2FA QR Code" width={200} height={200} /></div>
                                    <div className="mt-2 text-sm text-muted-foreground">
                                        <Label>Manual Setup Key</Label>
                                        <div className="flex items-center gap-2 p-2 bg-secondary rounded-md">
                                            <p className="font-mono text-xs flex-1 break-all">{setup2fa.manualKey}</p>
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCopyKey(setup2fa.manualKey)}><Copy className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold mt-4">Step 2: Verify Code</h4>
                                    <p className="text-sm text-muted-foreground">Enter the 6-digit code from your app to complete setup.</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input value={otpCode} onChange={(e) => setOtpCode(e.target.value)} placeholder="123456" maxLength={6} className="w-32 text-center tracking-widest"/>
                                        <Button onClick={handleVerifyAndEnable} disabled={isVerifying || otpCode.length !== 6}>{isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}{isVerifying ? 'Verifying...' : 'Verify & Enable'}</Button>
                                        <Button variant="ghost" onClick={() => setSetup2fa(null)}>Cancel</Button>
                                    </div>
                                </div>
                              </div>
                          ) : (
                              <div className="flex items-center justify-between p-4 bg-secondary border rounded-lg">
                                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                  <Button onClick={handleEnable2fa}><ShieldCheck className="mr-2 h-4 w-4" />Enable 2FA</Button>
                              </div>
                          )}
                      </div>
                  </CardContent>
              </Card>
          </TabsContent>

          {userProfile?.role === 'admin' && (
            <>
              <TabsContent value="users">
                  <Card>
                      <CardHeader>
                          <CardTitle>User Management</CardTitle>
                          <CardDescription>Add, edit, or remove users from the system.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <UserTable filterRole="all" />
                      </CardContent>
                  </Card>
              </TabsContent>
              <TabsContent value="agents">
                  <Card>
                      <CardHeader>
                          <CardTitle>Agent & Admin Management</CardTitle>
                          <CardDescription>View all admins and agents and their online status.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <AgentStatusTable />
                      </CardContent>
                  </Card>
              </TabsContent>
               <TabsContent value="alerts">
                  <AlertsTab />
              </TabsContent>
              <TabsContent value="backup">
                  <Card>
                      <CardHeader>
                          <CardTitle>Backup Data</CardTitle>
                          <CardDescription>Select data collections to export as a local Excel file.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <div className="space-y-4">
                              <div className="flex items-center space-x-2"><Checkbox id="select-all-backup" checked={areAllSelected} onCheckedChange={(checked) => handleSelectAll(checked as boolean)} /><Label htmlFor="select-all-backup" className="font-semibold">Select All</Label></div>
                              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-md">
                                  {backupCollections.map(collection => (<div key={collection.id} className="flex items-center space-x-2"><Checkbox id={collection.id} checked={selectedCollections.includes(collection.id)} onCheckedChange={(checked) => handleCollectionSelect(collection.id, checked as boolean)} /><Label htmlFor={collection.id}>{collection.label}</Label></div>))}
                              </div>
                          </div>
                      </CardContent>
                      <CardFooter>
                          <Button variant="secondary" onClick={handleBackup} disabled={isBackingUp || selectedCollections.length === 0} className="h-11">{isBackingUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}{isBackingUp ? 'Backing up...' : <><FileDown className="mr-2 h-4 w-4"/>Backup to Excel</>}</Button>
                      </CardFooter>
                  </Card>
              </TabsContent>
              <TabsContent value="activity">
                  <UserActivityTracker />
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>

      {/* Incident Report Card - Outside Tabs */}
      <Card className="mt-6">
          <CardHeader>
              <CardTitle>Incident Report</CardTitle>
              <CardDescription>File and manage incident reports for safety and compliance tracking.</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full">
                          <FileDown className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                          <p className="font-semibold">Incident Report System</p>
                          <p className="text-sm text-muted-foreground">Create, view, and manage incident reports for safety tracking.</p>
                      </div>
                  </div>
                  <Button onClick={() => window.location.href = '/dashboard/incident-report'} className="bg-orange-600 hover:bg-orange-700">
                      Open Incident Report
                  </Button>
              </div>
          </CardContent>
      </Card>

      <ChangePasswordDialog isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </div>
  );
}

