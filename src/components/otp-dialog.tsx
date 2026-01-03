
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Props = {
  onVerified: () => void;
};

export default function OtpDialog({ onVerified }: Props) {
  const [step, setStep] = useState<'enter-phone' | 'enter-otp'>('enter-phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock sending OTP
    await new Promise(resolve => setTimeout(resolve, 500));

    setIsLoading(false);
    setStep('enter-otp');
    toast({ title: 'Verification Code Sent', description: `A code was sent to ${phoneNumber}. For this demo, use '12345'.` });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock verifying OTP
    await new Promise(resolve => setTimeout(resolve, 500));

    if (otp === '12345') {
      toast({ title: 'Verification Successful', description: 'Access granted.' });
      onVerified();
    } else {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: 'The code you entered is incorrect. Please try again.',
      });
    }
    setIsLoading(false);
  };
  
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="mt-4 font-headline text-2xl">
              {step === 'enter-phone' ? 'Verify Your Identity' : 'Enter Verification Code'}
            </CardTitle>
            <CardDescription>
              {step === 'enter-phone'
                ? 'To access settings, please complete this verification step.'
                : `A 6-digit code was sent to your registered phone number.`}
            </CardDescription>
          </CardHeader>
          {step === 'enter-phone' ? (
            <form onSubmit={handleSendOtp}>
              <CardContent>
                <div className="space-y-2">
                    <Label htmlFor="phone">Registered Phone Number</Label>
                    <Input
                        id="phone"
                        type="tel"
                        placeholder="Your phone number"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        autoComplete="tel"
                    />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={isLoading || !phoneNumber}>
                  {isLoading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </CardFooter>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Verification Code</Label>
                  <Input
                    id="otp"
                    type="tel"
                    placeholder="12345"
                    required
                    value={otp}
                    onChange={handleOtpChange}
                    className="text-center tracking-[0.5em]"
                    maxLength={6}
                    autoComplete="one-time-code"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-4">
                <Button className="w-full" type="submit" disabled={isLoading || otp.length < 5}>
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </Button>
                <Button variant="link" type="button" onClick={() => setStep('enter-phone')}>
                    Go Back
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
