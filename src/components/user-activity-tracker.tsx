'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { useUserStore } from '@/stores/user-store';
import { MapPin, Clock, Users, Eye, Activity } from 'lucide-react';

export default function UserActivityTracker() {
  const { users, isLoading, error } = useUserStore();

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const onlineUsers = users.filter(user => user.status === 'online').length;
    const offlineUsers = users.filter(user => user.status === 'offline').length;
    const activeToday = users.filter(user => {
      if (!user.lastSeen) return false;
      const lastSeen = user.lastSeen instanceof Date ? user.lastSeen : new Date(user.lastSeen.seconds * 1000);
      const today = new Date();
      return lastSeen.toDateString() === today.toDateString();
    }).length;

    return {
      totalUsers,
      onlineUsers,
      offlineUsers,
      activeToday,
      onlinePercentage: totalUsers > 0 ? Math.round((onlineUsers / totalUsers) * 100) : 0
    };
  }, [users]);

  const recentActivity = useMemo(() => {
    return users
      .filter(user => user.lastSeen)
      .sort((a, b) => {
        if (!a.lastSeen || !b.lastSeen) return 0;
        const timeA = a.lastSeen instanceof Date ? a.lastSeen.getTime() : a.lastSeen.seconds * 1000;
        const timeB = b.lastSeen instanceof Date ? b.lastSeen.getTime() : b.lastSeen.seconds * 1000;
        return timeB - timeA;
      })
      .slice(0, 10);
  }, [users]);

  const formatLastSeen = (lastSeen: any) => {
    if (!lastSeen) return 'Never';
    
    const date = lastSeen instanceof Date ? lastSeen : new Date(lastSeen.seconds * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-destructive-foreground bg-destructive p-4 rounded-md">
            <p><b>Error:</b> {error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-green-600">{stats.onlineUsers}</p>
                <p className="text-sm text-muted-foreground">Online Now</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold text-blue-600">{stats.activeToday}</p>
                <p className="text-sm text-muted-foreground">Active Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-sm font-bold text-orange-600">{stats.onlinePercentage}%</span>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-orange-600">{stats.onlinePercentage}%</p>
                <p className="text-sm text-muted-foreground">Online Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
          <CardDescription>Latest login activity and status updates across all users.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-4 px-4 py-3 border-b text-sm font-medium text-muted-foreground">
                <div className="flex-1">User</div>
                <div className="w-24 text-left">Status</div>
                <div className="w-32 text-left">Last Seen</div>
                <div className="w-20 text-left">Role</div>
              </div>
              
              {recentActivity.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground">
                  No user activity found.
                </div>
              ) : (
                recentActivity.map((user) => (
                  <div key={user.id} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50">
                    <div className="flex-1 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(user)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.firstName || 'N/A'} {user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="w-24 flex items-center justify-start gap-2">
                      <span className={cn('h-2 w-2 rounded-full', user.status === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
                      <p className="font-medium capitalize">{user.status || 'offline'}</p>
                    </div>
                    <div className="w-32 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm">{formatLastSeen(user.lastSeen)}</p>
                    </div>
                    <div className="w-20">
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role || 'user'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
