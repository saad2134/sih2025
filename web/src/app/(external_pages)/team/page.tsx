import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Users, ExternalLink, Code } from "lucide-react";
import GithubLogo from "@/components/logos/github";

export const metadata = {
  title: `Our Team ✦ ${siteConfig.name}`,
  description: `Meet the DevBandits team behind ${siteConfig.name}, working to provide personalized roadmaps for future-ready skills.`,
};

const teamMembers = [
  {
    name: "Abdur Rahman Qasim",
    role: "🎯 Team Lead & Architect",
    github: "https://github.com/Abdur-rahman-01",
    avatarBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    initials: "AQ",
  },
  {
    name: "Fareed Ahmed Owais",
    role: "🔎 Lead Research Engineer",
    github: "https://github.com/FareedAhmedOwais",
    avatarBg: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
    initials: "FO",
  },
  {
    name: "Mohammed Saad Uddin",
    role: "🚀 Lead Full-stack & AI/ML Developer",
    github: "https://github.com/saad2134",
    avatarBg: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    initials: "SU",
  },
  {
    name: "Mohammed Abdul Rahman",
    role: "🖼️ Lead Front-end Developer",
    github: "https://github.com/Abdul-Rahman26",
    avatarBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    initials: "AR",
  },
];

export default function Team() {
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
              <Users className="size-3.5" />
              <span>The Builders</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              Our Team
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Meet <strong>DevBandits</strong>, the team driving {siteConfig.name} forward.
            </p>
          </div>

          {/* Originated As Hackathon Card */}
          <div className="w-full max-w-4xl border border-border/60 bg-linear-to-br from-violet-500/5 to-purple-500/5 dark:from-violet-500/10 dark:to-purple-500/5 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-dashed border-violet-500/30">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Code className="w-6 h-6 text-violet-500" />
            </div>
            <div className="flex flex-col gap-1.5 text-center sm:text-left">
              <h3 className="text-lg font-bold text-violet-850 dark:text-violet-200">Hackathon Origins</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                <strong>{siteConfig.name} originally was started as a hackathon project</strong> for SUDHEE CBIT Hackathon 2026 by the DevBandits team. Over time, it has evolved into a robust, AI-powered career navigation and labor market matching platform.
              </p>
            </div>
          </div>

          {/* Team Members Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="group relative border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-6 flex flex-col items-center sm:items-start gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:border-primary/30"
              >
                {/* Visual Avatar block */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border font-bold text-xl tracking-wider select-none shrink-0 ${member.avatarBg}`}>
                  {member.initials}
                </div>

                {/* Info block */}
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left gap-1">
                  <h2 className="text-xl font-bold tracking-tight">{member.name}</h2>
                  <p className="text-sm text-muted-foreground font-medium">{member.role}</p>
                </div>

                {/* Github Button */}
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-xl border bg-background/50 hover:bg-muted/50 mt-2 w-full sm:w-auto cursor-pointer"
                >
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 justify-center"
                  >
                    <GithubLogo className="w-4 h-4 shrink-0 fill-current" />
                    <span>GitHub Profile</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground ml-0.5" />
                  </a>
                </Button>
              </div>
            ))}
          </div>

        </div>

        <Footer />
      </main>
    </>
  );
}
