"use client";

import React, { useState, useEffect } from 'react';
import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { 
  Calendar, Sparkles, Milestone, CheckCircle2, ListTodo, 
  Activity, ArrowRight, Compass, ShieldCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PlansNUpdates() {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'changelog'>('roadmap');

  useEffect(() => {
    document.title = `Plans & Updates ✦ ${siteConfig.name}`;
  }, []);

  const roadmapItems = [
    {
      quarter: "Q3 2026",
      title: "Mobile Platform & Portfolios",
      status: "In Progress",
      statusColor: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Bringing learning and portfolios closer to mobile platforms and expanding AI capabilities.",
      icon: Activity,
      iconColor: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "hover:border-violet-500/30",
      features: [
        "Mobile App Beta (iOS & Android) for learning on the go.",
        "One-click resume translation into a beautiful personal portfolio website.",
        "AI-powered Mock Interviews with real-time video and audio analysis feedback."
      ]
    },
    {
      quarter: "Q4 2026",
      title: "P2P Collaboration & Mentorship",
      status: "Planned",
      statusColor: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Enabling expert networks and peer learning groups for community-driven skilling.",
      icon: ListTodo,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "hover:border-indigo-500/30",
      features: [
        "Industry Expert Booking system for 1-on-1 mentorship.",
        "Peer-to-Peer Study Rooms with real-time collaborative code playgrounds.",
        "Vernacular language course translation support for regional languages (Bengali, Telugu, Marathi)."
      ]
    },
    {
      quarter: "Q1 2027",
      title: "Direct Recruiter & Offline Sync",
      status: "Researching",
      statusColor: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Direct talent matching and offline learning support to bridge the employment divide.",
      icon: Sparkles,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "hover:border-purple-500/30",
      features: [
        "Direct recruiter portal matching students based on verified NSQF milestones.",
        "AI Automatic Internship Matchmaker.",
        "Offline-first client sync to save data and continue learning without constant internet."
      ]
    }
  ];

  const changelogItems = [
    {
      version: "v1.2.0",
      title: "Database Resumes & Direct Sharing",
      date: "May 25, 2026",
      description: "Created database-backed storage of multiple resumes, autosave engine, unauthenticated public sharing links with direct routing `/resume/[id]`, and CodeQL secure hostname sanitization.",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      badgeColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      updates: [
        "Implemented full PostgreSQL CRUD storage for student resumes.",
        "Created auto-save mechanism with 1s debounce on editing.",
        "Added direct unauthenticated share links with CodeQL safe checks.",
        "Applied secondary button aesthetics for builder controls."
      ]
    },
    {
      version: "v1.1.0",
      title: "Course Discovery & Milestone Overrides",
      date: "April 20, 2026",
      description: "Added automated online course discovery utilizing Google SerpAPI and Gemini 2.5 Flash model, bookmarked courses, and manual milestone study mode overrides.",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      badgeColor: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
      updates: [
        "Integrated SerpAPI search index for discovery matching.",
        "Created manual overrides for milestone study modes.",
        "Replaced native browser alerts with custom drawer dialogs.",
        "Implemented bookmarked/saved courses schema and UI."
      ]
    },
    {
      version: "v1.0.0",
      title: "Initial Platform Launch",
      date: "March 15, 2026",
      description: "The initial launch of the ShikshaDisha skilling ecosystem. Provided core student profile creation, VARK assessment test, and dynamic roadmaps.",
      icon: ShieldCheck,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
      badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20",
      updates: [
        "Launched the VARK assessment questionnaire.",
        "Built core AI learning path map algorithm.",
        "Integrated NSQF difficulty and sector alignment.",
        "Launched user dashboard with streak metrics."
      ]
    }
  ];

  return (
    <>
      <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        <Navbar />

        {/* Decorative background glow */}
        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

        <section className="relative mx-auto max-w-5xl px-6 pt-32 pb-24 md:px-12 md:pt-40 flex flex-col items-center gap-12 animate-fade-in">
          
          {/* Header Title Section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Compass className="size-3.5" />
              <span>Platform Development</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              Plans & Updates
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Track our upcoming features, product roadmap milestones, and chronological release change logs.
            </p>
          </div>

          {/* Custom Tabs Switcher */}
          <div className="flex bg-muted/60 p-1 rounded-xl border border-border/40 backdrop-blur-md w-full max-w-md shrink-0">
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'roadmap'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Milestone className="w-4 h-4" />
              Product Roadmap
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                activeTab === 'changelog'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Changelog & Updates
            </button>
          </div>

          {/* Active Tab Content */}
          <div className="w-full max-w-3xl min-h-[400px]">
            {activeTab === 'roadmap' ? (
              <div className="space-y-8">
                {roadmapItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <Card 
                      key={idx} 
                      className={`bg-card/50 backdrop-blur-md border border-border/80 transition-all duration-300 hover:bg-card/80 ${item.borderColor}`}
                    >
                      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 pb-2">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${item.bgColor}`}>
                            <Icon className={`w-6 h-6 ${item.iconColor}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-bold tracking-widest text-primary uppercase">{item.quarter}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                                {item.status}
                              </span>
                            </div>
                            <CardTitle className="text-xl font-bold mt-1">{item.title}</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 pt-2 space-y-4">
                        <CardDescription className="text-sm text-muted-foreground font-medium">
                          {item.description}
                        </CardDescription>
                        <ul className="space-y-2 pt-2 border-t border-border/40">
                          {item.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-3 text-sm">
                              <span className="text-primary mt-1">✦</span>
                              <span className="text-muted-foreground leading-relaxed">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="relative border-l border-border/80 pl-6 ml-4 space-y-12 animate-fade-in">
                {changelogItems.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div key={idx} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full border-4 border-background flex items-center justify-center ${item.bgColor}`}>
                        <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                      </span>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${item.badgeColor}`}>
                            {item.version}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-semibold">
                            <Calendar className="w-3 h-3" />
                            {item.date}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold">{item.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl font-medium">
                          {item.description}
                        </p>
                        
                        <div className="bg-card/30 border border-border/40 rounded-xl p-4 mt-2 max-w-2xl">
                          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-2">Key Updates</h4>
                          <ul className="space-y-1.5">
                            {item.updates.map((update, uIdx) => (
                              <li key={uIdx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                                <span className="text-emerald-500 mt-0.5">✓</span>
                                <span className="leading-relaxed">{update}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Call to action Card */}
          <div className="w-full max-w-5xl border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors duration-300">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Want to suggest a feature?
              </h3>
              <p className="text-sm text-muted-foreground max-w-lg">
                We design and prioritize features based on community feedback. Reach out to our team with your suggestions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium shadow-md shadow-primary/10">
                <a href="/contact" className="flex items-center gap-2">
                  Submit Feedback
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

        </section>

        <Footer />
      </main>
    </>
  );
}
