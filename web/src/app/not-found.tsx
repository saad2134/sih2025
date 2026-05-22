"use client"

import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent animate-gradient">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Page Not Found
          </h2>
          <p className="text-lg text-muted-foreground">
            Oops! The page you're looking for seems to have vanished into the digital void.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="group">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4 transition-transform group-hover:scale-110" />
              Go Home
            </Link>
          </Button>
          
          <Button variant="outline" size="lg" onClick={() => window.history.back()} className="group">
            <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Go Back
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          Or return to the <Link href="/" className="text-primary hover:underline">landing page</Link>
        </div>
      </div>
    </div>
  );
}