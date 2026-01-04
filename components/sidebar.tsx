
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSkeleton,
  Collapsible,
  CollapsibleTrigger,
  SidebarMenuButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { allPages } from '@/lib/data';
import type { Page } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'user' | 'agent' | 'driver';
  allowedPages?: string[];
  avatar?: string;
}

const renderSubmenu = (item: Page, pathname: string) => {
    const isAnyChildActive = item.children?.some(child => pathname.startsWith(child.href!));
    
    return (
      <SidebarMenuItem key={item.label}>
        <Collapsible>
          <CollapsibleTrigger asChild>
            <SidebarMenuButton isActive={isAnyChildActive} className="group">
              <item.icon />
              <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
              <ChevronDown className="absolute right-2 top-2.5 size-4 transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=collapsed]:hidden" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <SidebarMenuSub>
            {item.children?.map(child => (
              <SidebarMenuSubItem key={child.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === child.href}
                  size="sm"
                  variant="default"
                  className="w-full justify-start h-8"
                >
                  <Link href={child.href!}>{child.label}</Link>
                </SidebarMenuButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </Collapsible>
      </SidebarMenuItem>
    );
}

export default function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userProfileRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const handleSignOut = async () => {
    if (!auth) return;
    const userName = user?.displayName || user?.email || 'User';

    toast({
        title: 'Signing Out...',
        description: `Signing out ${userName}...`,
    });

    // Simulate saving data. In a real app, this would be an API call.
    await new Promise(resolve => setTimeout(resolve, 500));

    await signOut(auth);
    
    router.push(`/login?logged_out_name=${encodeURIComponent(userName)}`);
  };

  const getInitials = (user: UserProfile) => {
    if (user.firstName && user.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  
  const getVisibleMenuItems = (pages: Page[]): Page[] => {
    return pages.reduce((acc: Page[], item) => {
        // A page is visible if it's not admin only, or if the user is an admin.
        const isAllowed = (href?: string) => {
            if (!href) return true; // For parent items without a direct link
            
            const pageDefinition = allPages.flatMap(p => p.children ? p.children : p).find(p => p.href === href);
            
            if (userProfile?.role === 'admin') return true;
            if (pageDefinition?.adminOnly) return false;

            return userProfile?.allowedPages?.includes(href) ?? false;
        };

        if (item.children) {
            const visibleChildren = getVisibleMenuItems(item.children);
            if (visibleChildren.length > 0) {
                acc.push({ ...item, children: visibleChildren });
            }
        } else if (isAllowed(item.href)) {
            acc.push(item);
        }
        return acc;
    }, []);
  };

  const menuItems = userProfile ? getVisibleMenuItems(allPages) : [];


  return (
    <>
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2 w-full text-left justify-center group-data-[state=expanded]:justify-start">
          <Logo className="w-8 h-8 text-primary shrink-0" />
          <span className="text-xl font-bold font-headline group-data-[state=collapsed]:hidden">EchoTrack</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {isProfileLoading ? (
          <div className="p-2 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <SidebarMenuSkeleton key={i} showIcon />
            ))}
          </div>
        ) : (
          <SidebarMenu>
            {menuItems.map((item) => {
                // Don't render hidden pages like location-picker
                if (item.href && item.href.includes('location-picker')) return null;

                if (item.children && item.children.length > 0) {
                    return renderSubmenu(item, pathname);
                }
                if (!item.icon || !item.href) return null;
                return (
                    <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                            isActive={pathname === item.href}
                            tooltip={item.label}
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon />
                                <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                );
            })}
          </SidebarMenu>
        )}
      </SidebarContent>
      <Separator />
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
             <div className="flex items-center gap-3 p-2 cursor-pointer hover:bg-sidebar-accent rounded-md">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.photoURL ?? undefined} alt="User avatar" />
                    <AvatarFallback>{userProfile ? getInitials(userProfile) : '...'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden group-data-[state=collapsed]:hidden">
                    <p className="font-semibold truncate">{userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.email || 'Administrator')}</p>
                    <p className="text-xs text-muted-foreground truncate">
                    {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Loading...'}
                    </p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 group-data-[state=collapsed]:hidden">
                    <ChevronDown className="h-4 w-4" />
                </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-56 mb-2">
            <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
    </>
  );
}
