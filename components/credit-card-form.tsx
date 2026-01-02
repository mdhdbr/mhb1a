

'use client';

import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CreditCard, User, Calendar, Lock, Loader2, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CreditCardFormProps = {
  onPaymentSuccess?: () => void;
}

export function CreditCardForm({ onPaymentSuccess }: CreditCardFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const { toast } = useToast();

  const handlePayment = () => {
    setIsProcessing(true);
    toast({
      title: "Processing Payment...",
      description: "Please wait while we securely process your transaction.",
    });

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      toast({
        title: "Payment Successful!",
        description: "Your payment has been confirmed.",
      });
      if(onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 2000);
  };


  return (
    <Card className="bg-muted border-dashed">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card Number</Label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="card-number" placeholder="•••• •••• •••• ••••" className="pl-10" disabled={isPaid} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-holder">Cardholder Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="card-holder" placeholder="e.g. Mohamed Hameed Buhari" className="pl-10" disabled={isPaid} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="expiry-date" placeholder="MM/YY" className="pl-10" disabled={isPaid} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="cvc" placeholder="•••" className="pl-10" disabled={isPaid} />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handlePayment} disabled={isProcessing || isPaid}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPaid && <CheckCircle className="mr-2 h-4 w-4" />}
            {isProcessing ? "Processing..." : isPaid ? "Payment Confirmed" : "Proceed to Payment"}
        </Button>
      </CardFooter>
    </Card>
  );
}
