
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Mail,
  KeyRound,
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  type AuthError,
} from 'firebase/auth';
import Link from 'next/link';

function getFirebaseAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState('mdhdbr@hotmail.com');
  const [password, setPassword] = useState('password');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedInUser = userCredential.user;

      if (firestore && loggedInUser) {
        const userDocRef = doc(firestore, 'users', loggedInUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          await setDoc(userDocRef, {
            id: loggedInUser.uid,
            email: loggedInUser.email,
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
          });
        }
      }
      
      toast({
        title: 'Login Successful',
        description: 'Redirecting to dashboard...',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: getFirebaseAuthErrorMessage(error as AuthError),
      });
      setIsLoading(false);
    }
  };
  
  if (isUserLoading || (!isUserLoading && user)) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-muted">
        <div className="mx-auto grid w-[350px] gap-6">
            <div className="grid gap-2 text-center">
                <div className="flex justify-center items-center gap-4 mb-2">
                    <Logo className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold font-headline text-foreground">
                        MHB Logistics
                    </h1>
                </div>
                <p className="text-balance text-muted-foreground">
                    Sign in to your account to continue
                </p>
            </div>
            <form onSubmit={handleSignIn} className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="mdhdbr@hotmail.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            autoComplete="email"
                        />
                    </div>
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10"
                            autoComplete="current-password"
                        />
                    </div>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                 <Button variant="link" asChild>
                    <Link href="/">← Back to Home</Link>
                </Button>
            </form>
        </div>
    </div>
  );
}
