
'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import Logo from '@/components/icons/logo';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { allPages, Page } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { SidebarMenuSkeleton } from './ui/sidebar';

type UserProfile = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'admin' | 'user' | 'agent' | 'driver';
  allowedPages?: string[];
  avatar?: string;
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

    await new Promise(resolve => setTimeout(resolve, 500));
    await signOut(auth);
    
    router.push(`/login?logged_out_name=${encodeURIComponent(userName)}`);
  };
  
  const getVisibleMenuItems = (pages: Page[]): Page[] => {
    if (!userProfile) return [];

    const isAllowed = (page: Page) => {
      if (userProfile.role === 'admin') return true;
      if (page.adminOnly) return false;
      if (!page.href) return true;
      return userProfile.allowedPages?.includes(page.href) ?? false;
    };

    return pages.filter(isAllowed);
  };

  const menuItems = userProfile ? getVisibleMenuItems(allPages) : [];


  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 p-2 w-full text-left justify-center group-data-[state=expanded]:justify-start">
          <Logo className="w-8 h-8 text-primary shrink-0" />
          <span className="text-xl font-bold font-headline group-data-[state=collapsed]:hidden">Pro Seed</span>
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
                    <AvatarImage src={userProfile?.avatar ?? undefined} alt="User avatar" />
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
  );
}
