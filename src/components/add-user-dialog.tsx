
'use client';

import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { allPages } from '@/lib/data';
import PasswordInput from './password-input';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddUserDialog({ isOpen, onClose }: Props) {
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'driver' | 'user'>('user');
  const [isSaving, setIsSaving] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);

  const handlePageAccessChange = (pageHref: string, checked: boolean) => {
    setAllowedPages(prev =>
      checked ? [...prev, pageHref] : prev.filter(p => p !== pageHref)
    );
  };
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
        const allValidPages = allPages.flatMap(p => p.children ? p.children.map(c => c.href!) : (p.href ? [p.href] : [])).filter(Boolean);
        setAllowedPages(allValidPages);
    } else {
        setAllowedPages([]);
    }
  }

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setRole('user');
    setAllowedPages([]);
  }

  const handleAddUser = async () => {
    if (!auth || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'Firebase services not available.' });
      return;
    }
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Email and password are required.' });
      return;
    }
    if (!emailRegex.test(email)) {
        toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid email address.' });
        return;
    }
    if (password.length < 6) {
        toast({ variant: 'destructive', title: 'Weak Password', description: 'Password must be at least 6 characters long.' });
        return;
    }
    
    setIsSaving(true);

    try {
        // Step 1: Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Step 2: Update the user's auth profile
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`.trim(),
        });
        
        // Step 3: Create the user document in Firestore
        const userRef = doc(firestore, 'users', user.uid);
        const pagesToSave = role === 'admin' ? allPages.flatMap(p => p.children ? p.children.map(c => c.href!) : (p.href ? [p.href] : [])).filter(Boolean) : allowedPages;

        await setDoc(userRef, {
            id: user.uid,
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: role,
            allowedPages: pagesToSave,
            status: 'offline',
            lastSeen: serverTimestamp()
        });

        toast({
            title: 'User Added',
            description: `${email} has been successfully added.`,
        });
        resetForm();
        onClose();

    } catch (error: any) {
        console.error('Error adding user:', error);
        let description = "Failed to add user.";
        if (error.code === 'auth/email-already-in-use') {
            description = "This email address is already in use by another account."
        }
        toast({
            variant: 'destructive',
            title: 'Error',
            description,
        });
    } finally {
        setIsSaving(false);
    }
  };

  const areAllPagesSelected = allPages.flatMap(p => p.children ? p.children.map(c => c.href!) : (p.href ? [p.href] : [])).filter(Boolean).length === allowedPages.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { resetForm(); } onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Enter the user's details and a temporary password. They can change it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email-add" className="text-right">
              Email
            </Label>
            <Input
              id="email-add"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              placeholder="user@example.com"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password-add" className="text-right">
              Password
            </Label>
             <PasswordInput
              id="password-add"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              autoComplete="new-password"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName-add" className="text-right">
              First Name
            </Label>
            <Input
              id="firstName-add"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName-add" className="text-right">
              Last Name
            </Label>
            <Input
              id="lastName-add"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role-add" className="text-right">
              Role
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as any)}>
              <SelectTrigger className="col-span-3" id="role-add">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="driver">Driver</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
           {role !== 'admin' && (
            <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Page Access</Label>
                <div className="col-span-3 space-y-2">
                  <ScrollArea className="h-48 w-full rounded-md border p-4">
                      <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                              <Checkbox
                                  id="select-all-add"
                                  checked={areAllPagesSelected}
                                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                              />
                              <label
                                  htmlFor="select-all-add"
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                  Select All
                              </label>
                          </div>
                          {allPages.flatMap(page => page.children ? page.children : [page]).filter(p => p.href && !p.adminOnly).map(page => (
                              <div key={page.href! + '-add'} className="flex items-center space-x-2">
                                  <Checkbox
                                      id={page.href! + '-add'}
                                      checked={allowedPages.includes(page.href!)}
                                      onCheckedChange={(checked) => handlePageAccessChange(page.href!, checked as boolean)}
                                  />
                                  <label
                                      htmlFor={page.href! + '-add'}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                      {page.label}
                                  </label>
                              </div>
                          ))}
                      </div>
                  </ScrollArea>
                </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} disabled={isSaving}>
            {isSaving ? 'Adding User...' : 'Add User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
