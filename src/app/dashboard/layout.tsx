
'use client';

import { SidebarProvider, SidebarWrapper, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/sidebar';
import Header from '@/components/header';
import { usePresence } from '@/hooks/use-presence';
import { usePathname } from 'next/navigation';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Logo from '@/components/icons/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  
  // This custom hook handles setting the user's online/offline status in Firestore.
  usePresence();

  // These specific pages have their own simplified layouts and should not be wrapped by this one.
  const isSpecialLayout = pathname.startsWith('/dashboard/driver') || pathname.startsWith('/customer') || pathname.startsWith('/dashboard/client');
  
  // This effect protects all dashboard routes.
  useEffect(() => {
    // Don't run auth check on special layout pages, as they have their own logic.
    if (!isSpecialLayout && !isUserLoading && !user) {
      router.replace('/login');
    }
  }, [user, isUserLoading, router, isSpecialLayout]);

  // If it's a special layout, render children directly without the dashboard shell.
  if (isSpecialLayout) {
    return <>{children}</>;
  }
  
  // While checking auth for standard dashboard pages, show a loading screen.
  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Render the full dashboard layout for standard pages.
  return (
    <SidebarProvider>
      <SidebarWrapper>
        <AppSidebar />
        <SidebarInset>
            <Header />
            <main className="relative flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarWrapper>
    </SidebarProvider>
  );
}

