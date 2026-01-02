
'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BarChart, Bus, Car, CheckCircle, FileText, Fuel, Shield, Wrench, Route } from "lucide-react";
import Link from "next/link";
import Logo from '@/components/icons/logo';

const features = [
  {
    icon: <Car className="h-8 w-8 text-primary" />,
    title: "Passenger Transport",
    points: [
      "Luxury Sedan, MPV, SUV, VVIP vehicles",
      "Staff bus scheduling",
      "OTP-based pickup verification",
      "Passenger addons (wheelchair, baby seat, etc.)",
    ],
  },
  {
    icon: <Route className="h-8 w-8 text-primary" />,
    title: "Road Logistics",
    points: [
      "Crane trailers & container carriers",
      "Low-bed trucks & mini-wagons",
      "Luggage transport services",
      "Real-time load tracking",
    ],
  },
  {
    icon: <Fuel className="h-8 w-8 text-primary" />,
    title: "Mobile Services",
    points: [
      "Mobile fuel delivery",
      "On-site tyre services",
      "Mobile mechanics",
      "Vendor marketplace with ratings",
    ],
  },
  {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Driver Safety",
    points: [
      "iAuditor-style pre-trip checks",
      "Fatigue monitoring & alerts",
      "Incident reporting system",
      "Digital vehicle inspections",
    ],
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: "Compliance",
    points: [
      "Vehicle renewal tracking",
      "License & insurance management",
      "Driver training modules",
      "Document lifecycle automation",
    ],
  },
  {
    icon: <BarChart className="h-8 w-8 text-primary" />,
    title: "Business Intelligence",
    points: [
      "Real-time KPI dashboards",
      "Utilization analytics",
      "Empty-km reduction metrics",
      "PPT/PDF export ready",
    ],
  },
];

const stats = [
    { value: "1,000+", label: "Drivers" },
    { value: "500+", label: "Vehicle Tracked" },
    { value: "24/7", label: "Operations Support" },
    { value: "2", label: "Major Corridors" },
]

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
            {/* Left Section */}
            <div className="flex-1 flex justify-start">
                <div className="flex items-center gap-3">
                    <Logo className="h-8 w-8 text-primary" />
                    <span className="font-bold text-lg font-headline">Pro Seed</span>
                </div>
            </div>

            {/* Center Section */}
            <div className="flex-1 flex justify-center">
                <p className="text-sm text-muted-foreground font-semibold">Bismillah - In the name of Allah</p>
            </div>

            {/* Right Section */}
            <div className="flex-1 flex justify-end">
                {/* Navigation removed as requested */}
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="text-center py-16 lg:py-24">
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight font-headline">
            The Future of Fleet Management is Here
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            A unified digital road logistics network connecting vehicle owners, drivers, and businesses requiring freight & passenger transport across key economic corridors.
          </p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/login">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="https://portfolio-ten-pearl-35.vercel.app/index.html" target="_blank" rel="noopener noreferrer">
                Learn More
              </Link>
            </Button>
          </div>
        </section>

        {/* Sub-features Section */}
        <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <CheckCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl font-headline">100% Productivity</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">Eliminate dead mileage through intelligent job allocation and real-time route optimization.</p>
            </div>
             <div className="flex flex-col items-center">
                 <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Wrench className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl font-headline">Real-Time Operations</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">Live tracking of over 1,000 vehicles with instant dispatch capabilities for maximum efficiency.</p>
            </div>
             <div className="flex flex-col items-center">
                 <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4">
                    <Bus className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-xl font-headline">Unified Platform</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">A single, integrated system for passengers, logistics, and essential mobile services.</p>
            </div>
        </section>

        {/* Key Features Section */}
        <section className="py-16 bg-secondary -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 font-headline">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-3 rounded-lg">{feature.icon}</div>
                      <CardTitle className="font-headline">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-muted-foreground">
                      {feature.points.map((point) => (
                        <li key={point} className="flex items-start">
                           <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0" />
                           <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Capacity & Scale Section */}
        <section className="py-16">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-headline">Proven Capacity & Scale</h2>
                <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">Our network is built for reliability and growth, supporting thousands of operations daily across major economic zones.</p>
            </div>
            <div className="mt-12">
              <Card className="shadow-2xl bg-card border-2 border-primary/20">
                <CardContent className="p-8">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map(stat => (
                        <div key={stat.label}>
                            <p className="text-4xl lg:text-5xl font-bold text-primary font-headline">{stat.value}</p>
                            <p className="text-muted-foreground mt-1 font-semibold">{stat.label}</p>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center">
           <div className="flex items-center gap-3">
                <Logo className="h-8 w-8 text-primary" />
                <span className="font-bold text-lg font-headline">Pro Seed</span>
            </div>
          <p className="text-muted-foreground text-sm mt-4 sm:mt-0">&copy; {new Date().getFullYear()} Pro Seed. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
