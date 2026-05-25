"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BorderBeam } from "@/components/ui/border-beam";
import { Send, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { apiService } from "@/lib/api";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Cooldown logic
  const [cooldown, setCooldown] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("contactCooldown");
      if (saved) {
        const remaining = Math.ceil((parseInt(saved) - Date.now()) / 1000);
        return remaining > 0 ? remaining : 0;
      }
    }
    return 0;
  });

  // Alert Dialog States
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'success' | 'error'>('success');
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDesc, setDialogDesc] = useState("");

  useEffect(() => {
    if (cooldown > 0) {
      localStorage.setItem("contactCooldown", (Date.now() + cooldown * 1000).toString());
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      localStorage.removeItem("contactCooldown");
    }
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || loading) return;

    if (!name.trim() || !email.trim() || !phone.trim() || !title.trim() || !message.trim()) {
      setDialogType('error');
      setDialogTitle("Validation Error");
      setDialogDesc("Please fill out all the fields in the form.");
      setDialogOpen(true);
      return;
    }

    try {
      setLoading(true);
      let role = "guest";
      let plan = "guest";
      
      const token = typeof window !== "undefined" ? (localStorage.getItem("auth_token") || localStorage.getItem("token")) : null;
      if (token) {
        try {
          const profileRes = await apiService.getMe();
          if (profileRes.success && profileRes.data) {
            role = "student";
            plan = profileRes.data.subscription_tier || "free";
          }
        } catch (err) {
          // Guest user or token expired
        }
      }

      const res = await apiService.submitContact({
        name,
        email,
        phone,
        title,
        message,
        page: "/contact"
      });

      if (res.success) {
        setDialogType('success');
        setDialogTitle("Message Sent Successfully");
        setDialogDesc("Thank you for contacting ShikshaDisha! Our team will get back to you shortly.");
        setDialogOpen(true);
        
        // Reset form fields
        setName("");
        setEmail("");
        setPhone("");
        setTitle("");
        setMessage("");
        setCooldown(60);
      } else {
        throw new Error(res.error?.message || "Failed to send message.");
      }
    } catch (err: any) {
      setDialogType('error');
      setDialogTitle("Failed to Send Message");
      setDialogDesc(err.message || "An error occurred while trying to submit the contact form. Please try again.");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="relative overflow-hidden bg-card/50 backdrop-blur-md border border-border/80 shadow-2xl p-6 sm:p-8 rounded-2xl transition-all duration-300 hover:border-primary/20 hover:shadow-primary/5">
      {/* Premium Border Beam Animation */}
      <BorderBeam size={300} duration={8} borderWidth={1.5} colorFrom="var(--primary)" colorTo="var(--brand)" />

      <CardHeader className="p-0 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Send a Message</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mt-1">
          Have a question or custom inquiry? Let us know below.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold">
                Name
              </Label>
              <Input
                id="name"
                type="text"
                required
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading || cooldown > 0}
                className="w-full transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || cooldown > 0}
                className="w-full transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                required
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading || cooldown > 0}
                className="w-full transition-all duration-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Subject Title
              </Label>
              <Input
                id="title"
                type="text"
                required
                placeholder="e.g. Support Request"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading || cooldown > 0}
                className="w-full transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-semibold">
              Message
            </Label>
            <Textarea
              id="message"
              rows={5}
              required
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading || cooldown > 0}
              className="w-full min-h-[120px] transition-all duration-200"
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-4 h-11 relative overflow-hidden transition-all duration-300 active:scale-98 cursor-pointer flex items-center justify-center font-semibold"
            disabled={loading || cooldown > 0}
          >
            {cooldown > 0 ? (
              <>
                <Clock size={16} className="mr-2 animate-pulse" />
                Wait {cooldown}s to Send Again
              </>
            ) : loading ? (
              <>
                <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Sending Message...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send Message
              </>
            )}
          </Button>
        </form>
      </CardContent>

      {/* Radix Dialog Alert */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialogType === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-destructive" />
              )}
              {dialogTitle}
            </DialogTitle>
            <DialogDescription className="text-left mt-2">
              {dialogDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => setDialogOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
