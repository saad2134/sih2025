import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Our Team ✦ ${siteConfig.name}`,
  description:
    `Meet the DevBandits team behind ${siteConfig.name}, working to provide personalized roadmaps for future-ready skills.`,
};

const teamMembers = [
  {
    name: "Abdur Rahman Qasim",
    role: "🎯 Team Lead",
    github: "https://github.com/Abdur-rahman-01",
  },
  {
    name: "Fareed Ahmed Owais",
    role: "🔎 Research Engineer",
    github: "https://github.com/FareedAhmedOwais",
  },
  {
    name: "Mohammed Saad Uddin",
    role: "🚀 Full-stack + AI/ML Developer",
    github: "https://github.com/saad2134",
  },
  {
    name: "Mohammed Abdul Rahman",
    role: "🖼️ Front-end Developer",
    github: "https://github.com/Abdul-Rahman26",
  },

];

export default function Team() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden ">

        <Navbar />

        <section className="mx-auto max-w-4xl px-12 py-24 pt-32 md:pt-32">
          <h1 className="text-4xl font-bold text-foreground mb-2">Our SUDHEE CBIT Hackathon 2026 Team</h1>
          <p className="text-sm text-muted-foreground mb-10">
            Meet <strong>DevBandits</strong>, the talented team driving {siteConfig.name} forward.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="relative group border border-border rounded-lg p-6 flex flex-col items-start gap-2 hover:shadow-lg transition-shadow overflow-hidden"
              >
                {/* Glow background */}
                <div className="absolute top-0 left-0 h-full w-full translate-y-[1rem] opacity-80 transition-all duration-500 ease-in-out group-hover:translate-y-[-2rem] group-hover:opacity-100 pointer-events-none">
                  <Glow variant="bottom" />
                </div>

                {/* Content on top of Glow */}
                <h2 className="text-xl font-semibold relative z-10">{member.name}</h2>
                <p className="text-sm relative z-10">{member.role}</p>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline text-sm mt-2 relative z-10"
                >
                  GitHub Profile
                </a>
              </div>
            ))}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
