
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/login');
        }
    }, [isUserLoading, user, router]);

    const handleLogout = async () => {
        if (!auth) return;
        await signOut(auth);
        toast({ title: 'Logged Out', description: 'You have been successfully signed out.' });
        router.push('/login');
    }

    // While checking session or if not verified, show a loading screen to prevent content flash
    if (isUserLoading || !user) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 animate-spin" />
                <p className="text-muted-foreground">Loading Customer Dashboard...</p>
                </div>
            </div>
        );
    }


  return (
    <div className="min-h-screen bg-muted flex flex-col items-center p-4 sm:p-8">
       <header className="w-full max-w-6xl flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold text-lg font-headline">Customer Portal</span>
            </div>
            <div className="flex items-center gap-4">
                {user.email && (
                    <p className="text-sm text-muted-foreground">
                        Signed in as <span className="font-semibold text-foreground">{user.email}</span>
                    </p>
                )}
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
       </header>
        <div className="w-full max-w-6xl flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {children}
        </div>
    </div>
  );
}
