
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { allPages } from '@/lib/data';
import ChangePasswordDialog from './change-password-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { Camera, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

async function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
          return reject(new Error('Could not get canvas context'));
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(blob => {
        if (!blob) {
            return reject(new Error('Canvas to Blob conversion failed'));
        }
        resolve(blob);
      }, file.type, 0.9); // 0.9 is the quality
    };
    img.onerror = error => reject(error);
  });
}

export default function EditUserDialog({ user: initialUser, isOpen, onClose }: { user: UserProfile, isOpen: boolean, onClose: () => void; }) {
  const { auth, firestore, storage } = useFirebase();
  const { user: currentUser } = useUser();
  const { toast } = useToast();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'agent' | 'driver' | 'user'>('user');
  const [isSaving, setIsSaving] = useState(false);
  const [allowedPages, setAllowedPages] = useState<string[]>([]);
  const [isChangePasswordOpen, setChangePasswordOpen] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditingSelf = currentUser?.uid === initialUser.id;

  useEffect(() => {
    if (isOpen && initialUser) {
      setFirstName(initialUser.firstName || '');
      setLastName(initialUser.lastName || '');
      setEmail(initialUser.email || '');
      setRole(initialUser.role || 'user');
      setAllowedPages(initialUser.allowedPages || []);
      setPreviewUrl(initialUser.avatar || null);
      setSelectedFile(null); // Reset file selection when dialog opens
    }
  }, [initialUser, isOpen]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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

  const handleSaveChanges = async () => {
    if (!firestore || !auth || !storage || !currentUser) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Firebase services not available. Please try again.',
        });
        return;
    }
    setIsSaving(true);
    
    try {
      let avatarUrl = initialUser.avatar;

      if (selectedFile) {
        const resizedBlob = await resizeImage(selectedFile, 256, 256);
        const storageRef = ref(storage, `avatars/${initialUser.id}/avatar.jpg`);
        await uploadBytes(storageRef, resizedBlob);
        avatarUrl = await getDownloadURL(storageRef);
      }

      const userRef = doc(firestore, 'users', initialUser.id);
      const pagesToSave = role === 'admin' ? allPages.flatMap(p => p.children ? p.children.map(c => c.href!) : (p.href ? [p.href] : [])).filter(Boolean) : allowedPages;

      const updatePayload: { [key: string]: any } = {
        firstName,
        lastName,
        role: role,
        allowedPages: pagesToSave,
        email,
        avatar: avatarUrl || null,
      };

      await updateDoc(userRef, updatePayload);

      if (isEditingSelf && auth.currentUser) {
        const authUpdates: { displayName?: string; photoURL?: string } = {};
        const newDisplayName = `${firstName} ${lastName}`.trim();
        if (newDisplayName !== currentUser.displayName) {
          authUpdates.displayName = newDisplayName;
        }
        if (avatarUrl && avatarUrl !== currentUser.photoURL) {
          authUpdates.photoURL = avatarUrl;
        }
        if (Object.keys(authUpdates).length > 0) {
          await updateProfile(auth.currentUser, authUpdates);
        }
      }

      toast({ title: 'Success', description: 'User profile updated successfully.' });
      onClose();
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update user profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const areAllPagesSelected = allPages.flatMap(p => p.children ? p.children.map(c => c.href!) : (p.href ? [p.href] : [])).filter(Boolean).length === allowedPages.length;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify the details for {initialUser.email || 'this user'}.
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="permissions">Permissions</TabsTrigger>
                {isEditingSelf && <TabsTrigger value="security">Security</TabsTrigger>}
            </TabsList>
            <TabsContent value="profile" className="py-4 space-y-4">
                 <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={previewUrl || undefined} />
                            <AvatarFallback>{getInitials(initialUser)}</AvatarFallback>
                        </Avatar>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Image
                        </Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
            </TabsContent>
            <TabsContent value="permissions" className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select value={role} onValueChange={(value) => setRole(value as any)}>
                        <SelectTrigger id="role">
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
                <div className="space-y-2">
                    <Label>Page Access</Label>
                    <ScrollArea className="h-48 w-full rounded-md border p-4">
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="select-all"
                                    checked={areAllPagesSelected}
                                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                                />
                                <label
                                    htmlFor="select-all"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Select All
                                </label>
                            </div>
                            {allPages.flatMap(page => page.children ? page.children : [page]).filter(p => p.href && !p.adminOnly).map(page => (
                                <div key={page.href!} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={page.href!}
                                        checked={allowedPages.includes(page.href!)}
                                        onCheckedChange={(checked) => handlePageAccessChange(page.href!, checked as boolean)}
                                    />
                                    <label
                                        htmlFor={page.href!}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {page.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                  </div>
                )}
                 {role === 'admin' && (
                    <div className="text-sm text-muted-foreground p-4 bg-secondary rounded-md">
                        Admins have access to all pages by default.
                    </div>
                )}
            </TabsContent>
            {isEditingSelf && (
                 <TabsContent value="security" className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} disabled />
                         <p className="text-xs text-muted-foreground">Changing your email is not supported in this interface.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Password</Label>
                        <Button variant="secondary" className="w-full justify-start" onClick={() => setChangePasswordOpen(true)}>
                            Change Password...
                        </Button>
                    </div>
                </TabsContent>
            )}
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {isEditingSelf && (
        <ChangePasswordDialog isOpen={isChangePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
      )}
    </>
  );
}
