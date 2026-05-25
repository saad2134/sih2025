import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Target, Compass, Cpu, Award, Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: `About Us ✦ ${siteConfig.name}`,
  description: "Discover our mission, vision, and team dedicated to guiding your career journey.",
};

export default function About() {
  const sections = [
    {
      title: "Our Mission",
      description: "At ShikshaDisha, we believe every learner deserves a clear, personalized path towards employable and future-ready skills. India’s skilling ecosystem offers countless opportunities, but many learners struggle to navigate their options. Our mission is to simplify this journey with the power of artificial intelligence.",
      icon: Target,
      iconColor: "text-violet-500",
      bgColor: "bg-violet-500/10",
      borderColor: "group-hover:border-violet-500/30",
    },
    {
      title: "What We Do",
      description: "ShikshaDisha acts as a career navigator and skilling assistant. We empower learners to discover training programs tailored to their academic background, receive adaptive learning pathways that evolve dynamically, track real-time labor market trends, and build micro-credentials.",
      icon: Compass,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "group-hover:border-indigo-500/30",
    },
    {
      title: "Our Approach",
      description: "We leverage state-of-the-art machine learning algorithms to build comprehensive student profiles, conduct skill gap analyses, and deliver personalized recommendation cards. By dynamically analyzing syllabus items and local job market datasets, we map the optimal path to career advancement.",
      icon: Cpu,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "group-hover:border-purple-500/30",
    },
    {
      title: "Why It Matters",
      description: "Skills are the ultimate foundation of modern employability, but upskilling shouldn't be a source of confusion. With ShikshaDisha, learners gain instant clarity on milestone achievements, while trainers and policymakers secure real-time insights to prepare tomorrow's workforce.",
      icon: Award,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "group-hover:border-pink-500/30",
    },
  ];

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
              <Compass className="size-3.5" />
              <span>Who We Are</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              About {siteConfig.name}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Empowering learners with AI-driven guidance, labor market insights, and personalized skill pathways.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              return (
                <div
                  key={idx}
                  className={`group relative border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${section.borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${section.bgColor}`}>
                      <Icon className={`w-5 h-5 ${section.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Call to action Card */}
          <div className="w-full max-w-5xl border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors duration-300">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Have questions or ideas?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                We'd love to hear from you. Get in touch with our team for inquiries, support, or partnership opportunities.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full sm:w-auto">
              <Button asChild className="w-full sm:w-auto h-11 px-6 rounded-xl font-medium shadow-md shadow-primary/10">
                <a href="/contact" className="flex items-center gap-2">
                  Contact Us
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
