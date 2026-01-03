
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/icons/logo';
import Link from 'next/link';

export default function CustomerLoginPage() {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handlePhoneSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate sending OTP
        setTimeout(() => {
        toast({
            title: 'OTP Sent',
            description: 'For this demo, please enter any 4 digits to log in.',
        });
        setIsLoading(false);
        setStep('otp');
        }, 500);
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate OTP validation
        setTimeout(() => {
        if (otp.length === 4) {
            toast({ title: 'Login Successful', description: 'Welcome!' });
            sessionStorage.setItem('customerVerified', 'true');
            sessionStorage.setItem('customerPhone', phoneNumber);
            router.push('/customer/dashboard');
        } else {
            toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Please enter a 4-digit OTP.',
            });
            setIsLoading(false);
        }
        }, 500);
    };

    return (
        <div className="w-full min-h-screen flex items-center justify-center bg-muted p-4">
            <div className="mx-auto w-full max-w-sm gap-6">
                <div className="grid gap-2 text-center">
                    <div className="flex justify-center items-center gap-4 mb-2">
                        <Logo className="h-10 w-10 text-primary" />
                        <h1 className="text-3xl font-bold font-headline text-foreground">
                            Customer Portal
                        </h1>
                    </div>
                    <p className="text-balance text-muted-foreground">
                        Sign in to book and manage your shipments
                    </p>
                </div>
                
                {step === 'otp' ? (
                    <form onSubmit={handleOtpSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">Enter OTP sent to {phoneNumber}</Label>
                            <Input
                                id="otp"
                                type="tel"
                                placeholder="••••"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                autoComplete="one-time-code"
                                className="h-11"
                            />
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            {isLoading ? 'Verifying...' : 'Verify & Login'}
                        </Button>
                        <Button
                            variant="link"
                            size="sm"
                            className="w-full"
                            onClick={() => setStep('phone')}
                        >
                            Back to phone number
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handlePhoneSubmit} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="customer-phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="customer-phone"
                                    type="tel"
                                    placeholder="e.g., 501234567"
                                    required
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    className="pl-10 h-11"
                                    autoComplete="tel"
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full h-11" disabled={isLoading}>
                            <LogIn className="mr-2 h-5 w-5" />
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                    </form>
                )}

                <div className="text-center">
                    <Button variant="link" asChild className="text-sm">
                        <Link href="/login">← Back to Main Login</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
