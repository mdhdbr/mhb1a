
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [customerPhone, setCustomerPhone] = useState<string | null>(null);

  useEffect(() => {
    const verified = sessionStorage.getItem('customerVerified') === 'true';
    const phone = sessionStorage.getItem('customerPhone');
    if (!verified) {
      router.replace('/login');
    } else {
      setIsVerified(true);
      setCustomerPhone(phone);
    }
  }, [router]);

  const handleLogout = () => {
    const phone = sessionStorage.getItem('customerPhone');
    sessionStorage.removeItem('customerVerified');
    sessionStorage.removeItem('customerPhone');
    router.push(`/login?logged_out_name=${phone}`);
  };

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
      <header className="w-full max-w-6xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary"/>
          </div>
          <span className="font-bold text-lg sm:text-xl font-headline">Customer Portal</span>
        </div>
        <div className="flex items-center gap-4">
          {customerPhone && (
            <p className="hidden md:block text-sm text-muted-foreground">
              Signed in as <span className="font-semibold text-foreground">{customerPhone}</span>
            </p>
          )}
          <Button variant="outline" onClick={handleLogout} className="hidden md:flex">
            Logout
          </Button>
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
               {customerPhone && (
                <DropdownMenuItem disabled>
                    <span className="font-semibold text-foreground">{customerPhone}</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="w-full max-w-6xl flex-1">
        {children}
      </div>
    </div>
  );
}
