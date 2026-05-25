import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Newspaper, Calendar, Clock, User, ArrowRight, Tag, Mail } from "lucide-react";

export const metadata = {
  title: `Blog ✦ ${siteConfig.name}`,
  description: "Discover the latest posts, insights, and updates from the ShikshaDisha team.",
};

const blogPosts = [
  {
    title: "How AI is Transforming Career Guidance in India",
    excerpt: "Discover how artificial intelligence is reshaping the way students and professionals navigate their career paths, making personalized guidance accessible to everyone.",
    author: "ShikshaDisha Team",
    date: "May 20, 2026",
    readTime: "5 min read",
    category: "AI & Technology",
    tags: ["AI", "Career Guidance", "Machine Learning"],
    gradient: "from-violet-500/20 to-purple-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
  },
  {
    title: "Top 10 In-Demand Skills for 2026",
    excerpt: "Stay ahead of the curve with our curated list of the most sought-after skills in today's job market, backed by real-time labor market data and industry insights.",
    author: "ShikshaDisha Team",
    date: "May 15, 2026",
    readTime: "7 min read",
    category: "Career Advice",
    tags: ["Skills", "Job Market", "Trends"],
    gradient: "from-indigo-500/20 to-blue-500/20",
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/30",
  },
  {
    title: "From Classroom to Career: Bridging the Skills Gap",
    excerpt: "Explore the disconnect between academic education and industry requirements, and learn how targeted upskilling can bridge the gap effectively.",
    author: "ShikshaDisha Team",
    date: "May 10, 2026",
    readTime: "6 min read",
    category: "Education",
    tags: ["Skills Gap", "Education", "Upskilling"],
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "group-hover:border-amber-500/30",
  },
  {
    title: "Building Your Personal Learning Roadmap with AI",
    excerpt: "Learn how ShikshaDisha's AI engine creates customized learning pathways tailored to your unique background, goals, and schedule.",
    author: "ShikshaDisha Team",
    date: "May 5, 2026",
    readTime: "4 min read",
    category: "Product Updates",
    tags: ["Product", "AI", "Learning Paths"],
    gradient: "from-emerald-500/20 to-teal-500/20",
    iconColor: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    borderColor: "group-hover:border-emerald-500/30",
  },
  {
    title: "Micro-Credentials: The Future of Skill Verification",
    excerpt: "Why micro-credentials are becoming the gold standard for skill verification and how they can boost your employability in a competitive job market.",
    author: "ShikshaDisha Team",
    date: "April 28, 2026",
    readTime: "5 min read",
    category: "Career Advice",
    tags: ["Micro-Credentials", "Certification", "Employability"],
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/30",
  },
  {
    title: "ShikshaDisha at SUDHEE CBIT Hackathon 2026",
    excerpt: "A behind-the-scenes look at our journey building ShikshaDisha during the SUDHEE CBIT Hackathon and how it evolved into a full-fledged platform.",
    author: "ShikshaDisha Team",
    date: "April 20, 2026",
    readTime: "8 min read",
    category: "Community",
    tags: ["Hackathon", "DevBandits", "SUDHEE"],
    gradient: "from-violet-500/20 to-indigo-500/20",
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
  },
];

export default function Blog() {
  return (
    <>
      <main className="min-h-screen w-full relative overflow-hidden bg-background text-foreground">
        <Navbar />

        {/* Decorative background glow */}
        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

        <div className="max-w-container mx-auto px-6 py-24 pt-32 md:pt-36 flex flex-col items-center gap-12 sm:gap-16">

          {/* Header section */}
          <div className="flex flex-col items-center text-center gap-4 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Newspaper className="size-3.5" />
              <span>Keep Up to Date</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              {siteConfig.name} Blog
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Discover our latest posts, insights, and updates from the team.
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {blogPosts.map((post, idx) => (
              <div
                key={idx}
                className={`group relative border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${post.borderColor}`}
              >
                {/* Category badge & gradient accent */}
                <div className={`w-full h-1 rounded-full bg-linear-to-r ${post.gradient} mb-1`} />

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

                <div className="flex flex-col gap-2 flex-1">
                  <h2 className="text-lg font-bold tracking-tight leading-snug group-hover:text-primary transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag, ti) => (
                    <span key={ti} className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Author & Date */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
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
            ))}
          </div>

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
