
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  KeyRound,
  Phone,
  CreditCard,
  LogIn,
  User as UserIcon,
  ShieldCheck,
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type AuthError,
  type User,
} from 'firebase/auth';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PasswordInput from '@/components/password-input';
import { verify2faCode } from '@/ai/flows/2fa-flow';
import type { UserProfile } from '@/lib/types';


function getFirebaseAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/invalid-email': return 'Please enter a valid email address.';
    case 'auth/user-disabled': return 'This user account has been disabled.';
    case 'auth/user-not-found': return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password': return 'Incorrect password. Please try again.';
    case 'auth/email-already-in-use': return 'This email is already in use. Please sign in.';
    case 'auth/weak-password': return 'Password should be at least 6 characters.';
    default: return 'An unexpected error occurred. Please try again.';
  }
}

function StaffLoginForm() {
  const [email, setEmail] = useState('mdhdbr@hotmail.com');
  const [password, setPassword] = useState('password');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!auth || !firestore) {
        throw new Error("Firebase services not available.");
      }
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      const userDocRef = doc(firestore, 'users', loggedInUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
          const profile = userDoc.data() as UserProfile;
          if (profile.role === 'driver') {
            router.push('/dashboard/driver');
            return;
          }
          if (profile.twoFactorEnabled && profile.twoFactorSecret) {
              setUserProfile(profile);
              setStep('2fa');
              setIsLoading(false);
              toast({ title: 'Verification Required', description: 'Please enter your 2FA code.'});
              return;
          }
      } else {
        await setDoc(userDocRef, {
          id: loggedInUser.uid, email: loggedInUser.email, firstName: 'Admin', lastName: 'User', role: 'admin',
        });
      }
      
      toast({ title: 'Login Successful', description: `Welcome back, ${loggedInUser.displayName || loggedInUser.email}!` });
      router.push('/dashboard');
    } catch (error) {
      toast({ variant: 'destructive', title: 'Login Failed', description: getFirebaseAuthErrorMessage(error as AuthError) });
      setIsLoading(false);
    }
  };

  const handleVerify2fa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.twoFactorSecret) {
        toast({ variant: 'destructive', title: 'Error', description: '2FA is not configured for this user.' });
        return;
    }
    setIsLoading(true);
    try {
        const { success } = await verify2faCode({ encryptedSecret: userProfile.twoFactorSecret, code: otp });
        if(success) {
            toast({ title: 'Login Successful', description: 'Welcome back!' });
            router.push('/dashboard');
        } else {
            toast({ variant: 'destructive', title: '2FA Failed', description: 'The code is incorrect. Please try again.' });
            setIsLoading(false);
        }
    } catch (error) {
        toast({ variant: 'destructive', title: 'Error', description: 'An error occurred during 2FA verification.' });
        setIsLoading(false);
    }
  }

  if (step === '2fa') {
    return (
        <form onSubmit={handleVerify2fa} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="otp-2fa">Two-Factor Code</Label>
                <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="otp-2fa" placeholder="123456" required value={otp} onChange={(e) => setOtp(e.target.value)} className="pl-10 h-11" autoComplete="one-time-code" />
                </div>
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Sign In'}
            </Button>
            <Button variant="link" size="sm" onClick={() => setStep('credentials')}>Back to password</Button>
        </form>
    );
  }

  return (
    <form onSubmit={handleSignIn} className="grid gap-4">
        <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" type="email" placeholder="mdhdbr@hotmail.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-11" autoComplete="email" /></div>
        </div>
        <div className="grid gap-2">
            <div className="flex items-center"><Label htmlFor="password">Password</Label></div>
            <div className="relative"><KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><PasswordInput id="password" placeholder="••••••••" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-11" autoComplete="current-password" /></div>
        </div>
        <Button type="submit" className="w-full h-11" disabled={isLoading}>{isLoading ? 'Signing In...' : 'Sign In'}</Button>
    </form>
  )
}

function DriverLoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('+966 501234567');
    const [driverId, setDriverId] = useState('DL-445');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
        if (phoneNumber && driverId) {
            toast({ title: 'Sign In Successful', description: 'Welcome! Redirecting to your dashboard.' });
            router.push('/dashboard/driver'); 
        } else {
            toast({ variant: 'destructive', title: 'Sign In Failed', description: 'Please enter both phone number and driver ID.' });
            setIsLoading(false);
        }
        }, 1000);
    };

    return (
        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="phone-number" className="flex items-center text-foreground"><Phone className="h-4 w-4 mr-2" />Phone Number</Label><Input id="phone-number" type="tel" placeholder="+966 501234567" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required className="h-11" /></div>
          <div className="space-y-2"><Label htmlFor="driver-id" className="flex items-center text-foreground"><CreditCard className="h-4 w-4 mr-2" />Driver ID</Label><Input id="driver-id" type="text" placeholder="DL-445" value={driverId} onChange={(e) => setDriverId(e.target.value)} required className="h-11" /></div>
          <Button type="submit" className="w-full h-11" disabled={isLoading}><LogIn className="mr-2 h-5 w-5" />{isLoading ? 'Signing In...' : 'Sign In'}</Button>
        </form>
    )
}

function CustomerLoginForm() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
        toast({ title: 'OTP Sent', description: 'For this demo, please enter any 4 digits to log in.' });
        setIsLoading(false);
        setStep('otp');
        }, 500);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
        if (otp.length === 4) {
            toast({ title: 'Login Successful', description: `Welcome, ${phoneNumber}!` });
            sessionStorage.setItem('customerVerified', 'true');
            sessionStorage.setItem('customerPhone', phoneNumber);
            router.push('/customer/dashboard');
        } else {
            toast({ variant: 'destructive', title: 'Login Failed', description: 'Please enter a 4-digit OTP.' });
            setIsLoading(false);
        }
        }, 500);
    };

    if (step === 'otp') {
        return (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="otp">Enter OTP sent to {phoneNumber}</Label><Input id="otp" type="tel" placeholder="••••" required value={otp} onChange={(e) => setOtp(e.target.value)} autoComplete="one-time-code" className="h-11" /></div>
                <Button type="submit" className="w-full h-11" disabled={isLoading}>{isLoading ? 'Verifying...' : 'Verify & Login'}</Button>
                <Button variant="link" size="sm" className="w-full" onClick={() => setStep('phone')}>Back to password</Button>
            </form>
        );
    }
    
    return (
         <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="customer-phone">Phone Number</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="customer-phone" type="tel" placeholder="e.g., 501234567" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="pl-10 h-11" autoComplete="tel" /></div></div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}><LogIn className="mr-2 h-5 w-5" />{isLoading ? 'Sending OTP...' : 'Send OTP'}</Button>
        </form>
    );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const loggedOutName = searchParams.get('logged_out_name');
    if (loggedOutName) {
        toast({ title: 'Signed Out', description: `You (${loggedOutName}) have been successfully signed out.` });
        router.replace('/login', { scroll: false });
    }
  }, [searchParams, router, toast]);

  useEffect(() => {
    const checkUserRoleAndRedirect = async () => {
        if (!isUserLoading && user && firestore) {
            const userDocRef = doc(firestore, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().role === 'driver') {
                router.push('/dashboard/driver');
            } else {
                router.push('/dashboard');
            }
        }
    };
    checkUserRoleAndRedirect();
  }, [user, isUserLoading, router, firestore]);

  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2"><Logo className="h-8 w-8 animate-spin" /><p className="text-muted-foreground">Loading...</p></div>
      </main>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-muted p-4">
        <div className="mx-auto w-full max-w-sm gap-6">
            <div className="grid gap-2 text-center">
                <div className="flex justify-center items-center gap-4 mb-2"><Logo className="h-10 w-10 text-primary" /><h1 className="text-3xl font-bold font-headline text-foreground">Pro Seed</h1></div>
                <p className="text-balance text-muted-foreground">Sign in to your account to continue</p>
            </div>
            
            <Tabs defaultValue="staff" className="w-full">
                <TabsList className="grid w-full grid-cols-3"><TabsTrigger value="staff">Staff</TabsTrigger><TabsTrigger value="driver">Driver</TabsTrigger><TabsTrigger value="customer">Customer</TabsTrigger></TabsList>
                <TabsContent value="staff" className="pt-4"><StaffLoginForm /></TabsContent>
                <TabsContent value="driver" className="pt-4"><DriverLoginForm /></TabsContent>
                <TabsContent value="customer" className="pt-4"><CustomerLoginForm /></TabsContent>
            </Tabs>

            <div className="text-center"><Button variant="link" asChild className="text-sm"><Link href="/">← Back to Home</Link></Button></div>
        </div>
    </div>
  );
}
