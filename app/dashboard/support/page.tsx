
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="space-y-6">
       <div>
            <h1 className="text-3xl font-bold font-headline">Support Center</h1>
            <p className="text-muted-foreground mt-1">Get help with the Pro Seed platform.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Contact Support Card */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>Our team is ready to assist you with any questions or issues.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full h-12 text-base" asChild>
                <a href="mailto:support@pro-seed.com">
                    <Mail className="mr-2 h-5 w-5" />
                    Email Us
                </a>
            </Button>
            <Button className="w-full h-12 text-base" asChild>
                <a href="tel:+966111234567">
                    <Phone className="mr-2 h-5 w-5" />
                    Call Us
                </a>
            </Button>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">Support hours: Sunday - Thursday, 9:00 AM to 6:00 PM (AST).</p>
          </CardFooter>
        </Card>

        {/* Chat & SMS Module Card */}
        <Card>
          <CardHeader>
            <CardTitle>Communications Module</CardTitle>
            <CardDescription>Communicate directly with drivers and customers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
                <MessageSquare className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">Live Chat</h4>
                    <p className="text-sm text-muted-foreground">Initiate a real-time chat with drivers or support agents directly from the dispatch or map view.</p>
                </div>
            </div>
             <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold">SMS Module</h4>
                    <p className="text-sm text-muted-foreground">Send automated SMS notifications to customers for booking confirmations, driver ETAs, and payment links.</p>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="secondary" className="w-full h-12" asChild>
                <Link href="/dashboard/sms">Go to Communications Hub</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
