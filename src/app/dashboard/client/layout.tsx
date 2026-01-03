
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);
    const [clientPhone, setClientPhone] = useState<string | null>(null);

    useEffect(() => {
        const verified = sessionStorage.getItem('clientVerified') === 'true';
        const phone = sessionStorage.getItem('clientPhone');
        if (!verified) {
            router.replace('/login');
        } else {
            setIsVerified(true);
            setClientPhone(phone);
        }
    }, [router]);

    const handleLogout = () => {
        sessionStorage.removeItem('clientVerified');
        sessionStorage.removeItem('clientPhone');
        router.push('/login');
    }

    // While checking session or if not verified, show a loading screen to prevent content flash
    if (!isVerified) {
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
                {clientPhone && (
                    <p className="text-sm text-muted-foreground">
                        Signed in as <span className="font-semibold text-foreground">{clientPhone}</span>
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
