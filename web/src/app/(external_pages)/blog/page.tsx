"use client";

import React, { useState, useMemo } from "react";
import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import {
  Newspaper, Calendar, Clock, User, ArrowRight, Tag, Mail,
  BrainCircuit, TrendingUp, GraduationCap, Compass, ShieldCheck,
  Rocket, ArrowUpDown, ChevronDown, ImageIcon,
} from "lucide-react";

const blogPosts = [
  {
    id: "how-ai-is-transforming-career-guidance-in-india",
    title: "How AI is Transforming Career Guidance in India",
    excerpt: "Discover how artificial intelligence is reshaping the way students and professionals navigate their career paths, making personalized guidance accessible to everyone.",
    author: "ShikshaDisha Team",
    date: "May 20, 2026",
    dateObj: new Date("2026-05-20"),
    readTime: "5 min read",
    category: "AI & Technology",
    tags: ["AI", "Career Guidance", "Machine Learning"],
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
    mediaIcon: BrainCircuit,
    mediaLabel: "AI",
  },
  {
    id: "top-10-in-demand-skills-for-2026",
    title: "Top 10 In-Demand Skills for 2026",
    excerpt: "Stay ahead of the curve with our curated list of the most sought-after skills in today's job market, backed by real-time labor market data and industry insights.",
    author: "ShikshaDisha Team",
    date: "May 15, 2026",
    dateObj: new Date("2026-05-15"),
    readTime: "7 min read",
    category: "Career Advice",
    tags: ["Skills", "Job Market", "Trends"],
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/30",
    mediaIcon: TrendingUp,
    mediaLabel: "Trends",
  },
  {
    id: "from-classroom-to-career-bridging-the-skills-gap",
    title: "From Classroom to Career: Bridging the Skills Gap",
    excerpt: "Explore the disconnect between academic education and industry requirements, and learn how targeted upskilling can bridge the gap effectively.",
    author: "ShikshaDisha Team",
    date: "May 10, 2026",
    dateObj: new Date("2026-05-10"),
    readTime: "6 min read",
    category: "Education",
    tags: ["Skills Gap", "Education", "Upskilling"],
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/30",
    mediaIcon: GraduationCap,
    mediaLabel: "Education",
  },
  {
    id: "building-your-personal-learning-roadmap-with-ai",
    title: "Building Your Personal Learning Roadmap with AI",
    excerpt: "Learn how ShikshaDisha's AI engine creates customized learning pathways tailored to your unique background, goals, and schedule.",
    author: "ShikshaDisha Team",
    date: "May 5, 2026",
    dateObj: new Date("2026-05-05"),
    readTime: "4 min read",
    category: "Product Updates",
    tags: ["Product", "AI", "Learning Paths"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/30",
    mediaIcon: Rocket,
    mediaLabel: "Product",
  },
  {
    id: "micro-credentials-the-future-of-skill-verification",
    title: "Micro-Credentials: The Future of Skill Verification",
    excerpt: "Why micro-credentials are becoming the gold standard for skill verification and how they can boost your employability in a competitive job market.",
    author: "ShikshaDisha Team",
    date: "April 28, 2026",
    dateObj: new Date("2026-04-28"),
    readTime: "5 min read",
    category: "Career Advice",
    tags: ["Micro-Credentials", "Certification", "Employability"],
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/30",
    mediaIcon: ShieldCheck,
    mediaLabel: "Credentials",
  },
  {
    id: "shikshadisha-at-sudhee-cbit-hackathon-2026",
    title: "ShikshaDisha at SUDHEE CBIT Hackathon 2026",
    excerpt: "A behind-the-scenes look at our journey building ShikshaDisha during the SUDHEE CBIT Hackathon and how it evolved into a full-fledged platform.",
    author: "ShikshaDisha Team",
    date: "April 20, 2026",
    dateObj: new Date("2026-04-20"),
    readTime: "8 min read",
    category: "Community",
    tags: ["Hackathon", "DevBandits", "SUDHEE"],
    gradient: "from-violet-500/20 to-indigo-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
    mediaIcon: Compass,
    mediaLabel: "Community",
  },
];

const categories = Array.from(new Set(blogPosts.map((p) => p.category)));
type SortKey = "newest" | "oldest" | "az" | "za";

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [showSort, setShowSort] = useState(false);

  const filtered = useMemo(() => {
    let result = activeCategory
      ? blogPosts.filter((p) => p.category === activeCategory)
      : [...blogPosts];

    switch (sort) {
      case "newest":
        result.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());
        break;
      case "oldest":
        result.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
        break;
      case "az":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "za":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
    }

    return result;
  }, [activeCategory, sort]);

  const sortLabels: Record<SortKey, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
    az: "A-Z",
    za: "Z-A",
  };

  return (
    <>
      <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">
        <Navbar />

        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

        <div className="max-w-container mx-auto px-6 py-24 pt-32 md:pt-36 flex flex-col items-center gap-10 sm:gap-12">

          {/* Header section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Newspaper className="size-3.5" />
              <span>Keep Up to Date</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              Blog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Discover our latest posts, insights, and updates from the team.
            </p>
          </div>

          {/* Filter & Sort Bar */}
          <div className="w-full max-w-5xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                  activeCategory === null
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    activeCategory === cat
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 text-muted-foreground border-border/60 hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full border border-border/60 bg-card/50 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                {sortLabels[sort]}
                <ChevronDown className={`w-3 h-3 transition-transform ${showSort ? "rotate-180" : ""}`} />
              </button>
              {showSort && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
                  <div className="absolute right-0 top-full mt-1 z-20 w-44 bg-card border border-border/60 rounded-xl shadow-xl backdrop-blur-md overflow-hidden">
                    {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                      <button
                        key={key}
                        onClick={() => { setSort(key); setShowSort(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-muted/50 ${
                          sort === key ? "text-primary font-medium" : "text-muted-foreground"
                        }`}
                      >
                        {sortLabels[key]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results Count */}
          <div className="w-full max-w-5xl text-xs text-muted-foreground -mt-2">
            {filtered.length === 0
              ? "No posts match this filter."
              : `Showing ${filtered.length} ${filtered.length === 1 ? "post" : "posts"}`}
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {filtered.map((post, idx) => {
              const MediaIcon = post.mediaIcon;
              return (
                <Link
                  key={idx}
                  href={`/blog/${post.id}`}
                  className={`group relative border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl flex flex-col hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 cursor-pointer overflow-hidden ${post.borderColor}`}
                >
                  {/* Media / Hero Image Placeholder */}
                  <div className={`relative w-full h-40 bg-linear-to-br ${post.gradient} flex items-center justify-center overflow-hidden`}>
                    <MediaIcon className={`w-12 h-12 ${post.iconColor} opacity-40 group-hover:opacity-60 group-hover:scale-110 transition-all duration-500`} />
                    <span className={`absolute bottom-2 left-3 text-[10px] font-bold uppercase tracking-widest ${post.iconColor} opacity-30`}>
                      {post.mediaLabel}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col gap-3 flex-1">
                    {/* Category badge & read time */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full ${post.bgColor} ${post.iconColor} font-medium`}>
                        <Tag className="w-3 h-3" />
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <h2 className="text-lg font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Author & Date */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="w-full max-w-5xl text-center py-12">
              <p className="text-muted-foreground">Try selecting a different category.</p>
            </div>
          )}

          {/* Call to action Card */}
          <div className="w-full max-w-5xl border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors duration-300">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Want to contribute?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Have an idea for a post or want to share your story? We'd love to feature guest contributors.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium shadow-md shadow-primary/10">
                <a href="/contact" className="flex items-center gap-2">
                  Write for Us
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          </div>

        </div>

        <Footer />
      </main>
    </>
  );
}
