'use client';

import { useState } from 'react';
import { useAuth, useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword, AuthError } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import PasswordInput from '@/components/password-input';


type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangePasswordDialog({ isOpen, onClose }: Props) {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getFirebaseAuthErrorMessage = (error: AuthError): string => {
    switch (error.code) {
        case 'auth/wrong-password':
            return 'The current password you entered is incorrect.';
        case 'auth/weak-password':
            return 'The new password is too weak. It must be at least 6 characters long.';
        case 'auth/requires-recent-login':
            return 'This action is sensitive and requires a recent login. Please log out and log back in to change your password.';
        default:
            return error.message || 'An unexpected error occurred.';
    }
  };


  const handleSaveChanges = async () => {
    if (!user || !user.email) {
      toast({ variant: 'destructive', title: 'Error', description: 'No authenticated user found.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
        toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters long.' });
        return;
    }

    setIsSaving(true);
    
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      // Re-authenticate the user
      await reauthenticateWithCredential(user, credential);

      // If re-authentication is successful, update the password
      await updatePassword(user, newPassword);

      toast({ title: 'Success', description: 'Your password has been updated successfully.' });
      onClose();

    } catch (error: any) {
      console.error('Password change error:', error);
      toast({
        variant: 'destructive',
        title: 'Password Change Failed',
        description: getFirebaseAuthErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
      // Clear password fields for security
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and a new password to update your account.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
