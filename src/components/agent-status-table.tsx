
'use client';

import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { useUserStore } from '@/stores/user-store';

export default function AgentStatusTable() {
  const { users, isLoading, error } = useUserStore();

  const filteredUsers = useMemo(() => {
    return users.filter(user => user.role && ['admin', 'agent'].includes(user.role));
  }, [users]);

  if (error) {
    return (
      <div className="text-destructive-foreground bg-destructive p-4 rounded-md">
        <p>
          <b>Error:</b> {error.message}
        </p>
      </div>
    );
  }

  return (
      <div className="border rounded-lg bg-card">
        <div className="flex items-center gap-4 px-4 py-3 border-b text-sm font-medium text-muted-foreground">
            <div className="flex-1">User</div>
            <div className="w-28 text-left">Status</div>
        </div>

        <div className="divide-y">
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            {!isLoading && filteredUsers && filteredUsers.map((user) => (
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
                <div className="w-28 flex items-center justify-start gap-2">
                    <span className={cn('h-2 w-2 rounded-full', user.status === 'online' ? 'bg-green-500' : 'bg-gray-400')} />
                    <p className="font-medium capitalize">{user.status || 'offline'}</p>
                </div>
              </div>
            ))}
        </div>
        {!isLoading && filteredUsers?.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No agents or admins found.
            </div>
        )}
      </div>
  );
}
