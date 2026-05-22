"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Play } from "lucide-react";
import AppUI from "@/components/logos/app_icon";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}
