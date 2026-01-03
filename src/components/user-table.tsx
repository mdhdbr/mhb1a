
'use client';

import { useState, useCallback, useMemo } from 'react';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { useFirebase, useUser } from '@/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { UserPlus, MoreHorizontal } from 'lucide-react';
import EditUserDialog from './edit-user-dialog';
import AddUserDialog from './add-user-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { UserProfile } from '@/lib/types';
import { useUserStore } from '@/stores/user-store';


type ActionDialogState = {
  isOpen: boolean;
  user: UserProfile | null;
  type: 'delete' | 'password' | null;
}

const UserActionsMenu = ({ user, onEdit, onResetPassword, onDelete }: { user: UserProfile, onEdit: (user: UserProfile) => void, onResetPassword: (user: UserProfile) => void, onDelete: (user: UserProfile) => void }) => {
    const { user: currentUser } = useUser();
    
    const isSelf = currentUser?.uid === user.id;
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(user)}>
                    Edit User
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onResetPassword(user)}>
                    Reset Password (Dev)
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                    className="text-destructive focus:bg-destructive/10 focus:text-destructive" 
                    onSelect={() => onDelete(user)}
                    disabled={isSelf}
                >
                    Delete User
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default function UserTable({ filterRole = 'all' }: { filterRole?: 'all' | 'agent' | 'driver' | 'user' | 'admin' | Array<'agent' | 'admin'> }) {
  const { firestore } = useFirebase();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const { users, isLoading, error } = useUserStore();

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [actionDialog, setActionDialog] = useState<ActionDialogState>({ isOpen: false, user: null, type: null });

  const { data: userProfile, isLoading: isProfileLoading } = useUserStore(state => ({
      data: state.users.find(u => u.id === currentUser?.uid),
      isLoading: state.isLoading,
  }));

  const isAdmin = userProfile?.role === 'admin';
  
  const filteredUsers = useMemo(() => {
    if (filterRole === 'all') {
      return users;
    }
    if (Array.isArray(filterRole)) {
      return users.filter(user => user.role && filterRole.includes(user.role as 'agent' | 'admin'));
    }
    return users.filter(user => user.role === filterRole);
  }, [users, filterRole]);

  const handleEdit = useCallback((user: UserProfile) => {
    setEditingUser(user);
  }, []);

  const handleCloseEdit = () => {
    setEditingUser(null);
  }

  const handlePromptDelete = useCallback((user: UserProfile) => {
    setActionDialog({ isOpen: true, user, type: 'delete' });
  }, []);

  const handlePromptPasswordReset = useCallback((user: UserProfile) => {
    setActionDialog({ isOpen: true, user, type: 'password' });
  }, []);

  const handleCloseActionDialog = useCallback(() => {
    setActionDialog({ isOpen: false, user: null, type: null });
  }, []);
  
  const handleDeleteUser = async () => {
    if (!actionDialog.user || !firestore) return;

    try {
      const userRef = doc(firestore, 'users', actionDialog.user.id);
      await deleteDoc(userRef);

      toast({
        title: "User Deleted",
        description: `The user ${actionDialog.user.email} has been removed from the database.`,
      });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete user profile.",
      });
    } finally {
      handleCloseActionDialog();
    }
  }

  if (error) {
    return (
      <div className="text-destructive-foreground bg-destructive p-4 rounded-md">
        <p>
          <b>Error:</b> {error.message.includes("permission-denied") || error.message.includes("Missing or insufficient permissions")
            ? "You don't have permission to view users. Please contact your administrator."
            : error.message}
        </p>
      </div>
    );
  }

  if (!isProfileLoading && !isAdmin) {
    return (
        <div className="text-muted-foreground bg-secondary p-4 rounded-md text-center">
            <p>User management is only available to administrators.</p>
        </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddUserDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      <div className="border rounded-lg bg-card">
        <div className="flex items-center gap-4 px-4 py-3 border-b text-sm font-medium text-muted-foreground">
            <div className="flex-1">User</div>
            <div className="w-28 text-left">Status</div>
            <div className="w-28 text-left">Role</div>
            <div className="w-12 text-right">Actions</div>
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
                  <Skeleton className="h-6 w-20" />
                  <div className="w-12 flex justify-end"><Skeleton className="h-8 w-8" /></div>
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
                <div className="w-28 flex justify-start">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                  </Badge>
                </div>
                <div className="w-12 flex justify-end">
                    <UserActionsMenu 
                        user={user}
                        onEdit={handleEdit}
                        onResetPassword={handlePromptPasswordReset}
                        onDelete={handlePromptDelete}
                    />
                </div>
              </div>
            ))}
        </div>
        {!isLoading && filteredUsers?.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No users found for this filter.
            </div>
        )}
      </div>

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onClose={handleCloseEdit}
        />
      )}

      <AddUserDialog
        isOpen={isAddUserDialogOpen}
        onClose={() => { setIsAddUserDialogOpen(false);}}
      />

       <AlertDialog open={actionDialog.isOpen} onOpenChange={(open) => !open && handleCloseActionDialog()}>
            <AlertDialogContent>
              {actionDialog.type === 'password' && (
                <>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Reset User Password (Dev Tool)</AlertDialogTitle>
                      <AlertDialogDescription asChild>
                        <div>
                            Please inform the user <span className="font-semibold">{actionDialog.user?.email}</span> that their temporary password is:
                        </div>
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="my-4 p-2 bg-secondary rounded-md text-center font-mono text-lg tracking-wider">
                    password123
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This is a development feature. The user must change this password upon their next login.
                  </p>
                  <AlertDialogFooter>
                      <AlertDialogAction onClick={handleCloseActionDialog}>Acknowledge</AlertDialogAction>
                  </AlertDialogFooter>
                </>
              )}
              {actionDialog.type === 'delete' && (
                <>
                  <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this user?</AlertDialogTitle>
                      <AlertDialogDescription>
                          This will permanently delete the profile for <span className="font-semibold">{actionDialog.user?.email}</span>. This action cannot be undone.
                      </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                      <AlertDialogCancel onClick={handleCloseActionDialog}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">Delete User</AlertDialogAction>
                  </AlertDialogFooter>
                </>
              )}
            </AlertDialogContent>
        </AlertDialog>
    </>
  );
}

    
