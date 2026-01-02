
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UploadCloud, KeyRound, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInWithEmailAndPassword, type AuthError } from 'firebase/auth';
import type { IncidentReportData } from '@/lib/types';
import { useIncidentStore } from '@/stores/incident-store';
import { ClientBoundary } from '@/components/client-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import PasswordInput from '@/components/password-input';

function getFirebaseAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

function LoginForm({ onVerified }: { onVerified: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const { toast } = useToast();
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!auth) {
        toast({ variant: 'destructive', title: 'Error', description: 'Authentication service not available.' });
        setIsLoading(false);
        return;
    }

    try {
      // We re-authenticate to verify the user's identity
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Verification Successful', description: 'You may now file a report.' });
      onVerified();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: getFirebaseAuthErrorMessage(error as AuthError),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="font-headline">Verification Required</CardTitle>
                <CardDescription>Please re-enter your credentials to access the incident report page.</CardDescription>
            </CardHeader>
            <form onSubmit={handleVerify}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="verify-email">Email</Label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="verify-email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="verify-password">Password</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <PasswordInput
                                id="verify-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify and Proceed'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
      </div>
  )
}

const initialFormState: Omit<IncidentReportData, 'id' | 'photos'> = {
    incidentDate: '',
    incidentTime: '',
    location: '',
    vehicleInvolved: '',
    driverInvolved: '',
    incidentType: '',
    severity: 'low',
    description: '',
};

function IncidentReportForm() {
  const { toast } = useToast();
  const { addIncident } = useIncidentStore();
  const [formState, setFormState] = useState(initialFormState);
  const [photos, setPhotos] = useState<File[]>([]);
  const [incidentId, setIncidentId] = useState('');

  useEffect(() => {
    // Generate a unique ID on the client side to avoid hydration mismatch
    setIncidentId(`INC-${Date.now().toString().slice(-6)}`);
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormState(prev => ({...prev, [id]: value}));
  }

  const handleRadioChange = (value: string) => {
    setFormState(prev => ({...prev, severity: value as IncidentReportData['severity']}));
  }
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setPhotos(Array.from(e.target.files));
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newIncident: IncidentReportData = {
        ...formState,
        id: incidentId,
        photos: photos,
    };
    
    addIncident(newIncident);
    
    toast({
        title: "Report Submitted",
        description: `Your incident report ${newIncident.id} has been successfully submitted.`,
    });
    // Reset form
    setFormState(initialFormState);
    setPhotos([]);
    // Generate a new ID for the next report
    setIncidentId(`INC-${Date.now().toString().slice(-6)}`);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Incident Report</CardTitle>
        <p className="text-muted-foreground">
          Fill out the form below with all available details.
        </p>
      </CardHeader>
      <CardContent>
          <form onSubmit={handleSubmitReport} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="incident-id">Incident ID</Label>
                      <Input id="incident-id" value={incidentId} readOnly disabled />
                  </div>
                  <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="incidentDate">Incident Date</Label>
                      <Input id="incidentDate" type="date" value={formState.incidentDate} onChange={handleChange} />
                  </div>
                  <div className="sm:col-span-1 space-y-2">
                      <Label htmlFor="incidentTime">Incident Time</Label>
                      <Input id="incidentTime" type="time" value={formState.incidentTime} onChange={handleChange} />
                  </div>
              </div>
              <div className="space-y-2">
                  <Label htmlFor="location">Location of Incident</Label>
                  <Input id="location" placeholder="e.g., King Fahd Road, near Kingdom Centre" value={formState.location} onChange={handleChange} />
                  <p className="text-xs text-muted-foreground">Be as specific as possible.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <Label htmlFor="vehicleInvolved">Vehicle Involved</Label>
                      <Input id="vehicleInvolved" placeholder="e.g., SA-12345 or TRUCK-01" value={formState.vehicleInvolved} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="driverInvolved">Driver Involved</Label>
                      <Input id="driverInvolved" placeholder="e.g., Ali Ahmed" value={formState.driverInvolved} onChange={handleChange} />
                  </div>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="incidentType">Type of Incident</Label>
                   <Select value={formState.incidentType} onValueChange={(val) => setFormState(p => ({...p, incidentType: val}))}>
                      <SelectTrigger id="incidentType">
                          <SelectValue placeholder="Select an incident type" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="accident">Accident</SelectItem>
                          <SelectItem value="traffic-violation">Traffic Violation</SelectItem>
                          <SelectItem value="vehicle-breakdown">Vehicle Breakdown</SelectItem>
                          <SelectItem value="passenger-dispute">Passenger Dispute</SelectItem>
                          <SelectItem value="cargo-damage">Cargo Damage/Loss</SelectItem>
                          <SelectItem value="near-miss">Near Miss</SelectItem>
                          <SelectItem value="property-damage">Property Damage (Non-Vehicle)</SelectItem>
                          <SelectItem value="security-issue">Security Issue (Theft, etc.)</SelectItem>
                          <SelectItem value="fatigue-report">Driver Fatigue Report</SelectItem>
                          <SelectItem value="unsafe-condition">Unsafe Condition (Road, etc.)</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

              <div className="space-y-2">
                  <Label>Severity Level</Label>
                  <RadioGroup value={formState.severity} onValueChange={handleRadioChange} className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low">Low</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">Medium</Label>
                      </div>
                       <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high">High</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                          <RadioGroupItem value="critical" id="critical" />
                          <Label htmlFor="critical">Critical</Label>
                      </div>
                  </RadioGroup>
              </div>

              <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea id="description" placeholder="Describe what happened, the parties involved, and any damages." rows={5} value={formState.description} onChange={handleChange} />
              </div>

               <div className="space-y-2">
                  <Label htmlFor="photos">Attach Photos</Label>
                  <div className="flex items-center justify-center w-full">
                      <label
                          htmlFor="dropzone-file"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                      >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
                              <p className="mb-2 text-sm text-foreground">
                                  <span className="font-semibold text-primary">Upload files</span> or drag and drop
                              </p>

                              <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <input id="dropzone-file" type="file" className="hidden" multiple onChange={handleFileChange} />
                      </label>
                  </div> 
                  {photos.length > 0 && (
                      <div className="pt-2 text-sm text-muted-foreground">
                          Selected files: {photos.map(f => f.name).join(', ')}
                      </div>
                  )}
              </div>

              <Button type="submit" size="lg" className="w-full">Submit Report</Button>

          </form>
      </CardContent>
    </Card>
  );
}

const ReportFallback = () => (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <div>
                <Skeleton className="h-9 w-80" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <Skeleton className="h-9 w-28" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-5 w-64 mt-1" />
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-48 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </CardContent>
        </Card>
    </div>
);


export default function IncidentReportPage() {
  const { toast } = useToast();
  const [isVerified, setIsVerified] = useState(false);
  
  const handleLockPage = () => {
    setIsVerified(false);
    toast({ title: 'Page Locked', description: 'Please re-verify to access this page.' });
  };
  
  if (!isVerified) {
      return <LoginForm onVerified={() => setIsVerified(true)} />;
  }

  return (
    <ClientBoundary fallback={<ReportFallback />}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
              <h1 className="text-3xl font-bold font-headline">File an Incident Report</h1>
              <p className="text-muted-foreground mt-1">
              Document any incidents that occur on the road to ensure safety and compliance.
              </p>
          </div>
          <Button variant="outline" onClick={handleLockPage} className="w-full sm:w-auto">
              <Lock className="mr-2 h-4 w-4" />
              Lock Page
          </Button>
        </div>
        <IncidentReportForm />
      </div>
    </ClientBoundary>
  );
}
