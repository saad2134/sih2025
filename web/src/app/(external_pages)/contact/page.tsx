import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { Mail, Github, Clock } from "lucide-react";
import ContactForm from "./ContactForm";

export const metadata = {
  title: `Contact Us ✦ ${siteConfig.name}`,
  description: "Get in touch with the team for support, inquiries, or feedback.",
};


export default async function Contact() {
  return (
    <>
      <main className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        <Navbar />

        {/* Decorative background glow */}
        <Glow variant="top" className="opacity-70 dark:opacity-35 pointer-events-none" />

        <section className="relative mx-auto max-w-6xl px-6 pt-32 pb-24 md:px-12 md:pt-40">
          {/* Header Title Section */}
          <div className="space-y-4 mb-16 animate-fade-in">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              Contact Our Team
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Have questions, feedback, or need assistance? We'd love to hear from you. Fill out the form or reach out directly.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Contact Information */}
            <div className="lg:col-span-5 space-y-6 animate-fade-in">
              <h2 className="text-2xl font-bold tracking-tight mb-4">Get in Touch</h2>

              {/* Card 1: Email */}
              <Card className="bg-card/50 backdrop-blur-md border border-border/80 transition-all duration-300 hover:scale-[1.02] hover:bg-card/80 hover:border-primary/30 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center space-x-4 p-5 pb-2">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Email Us</CardTitle>
                    <CardDescription className="text-xs">For support and inquiries</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <a
                    href={siteConfig.links.email}
                    className="text-sm font-medium text-primary hover:underline transition-all flex items-center mt-2"
                  >
                    {siteConfig.links.email.replace('mailto:', '')}
                  </a>
                </CardContent>
              </Card>

              {/* Card 2: GitHub Community */}
              <Card className="bg-card/50 backdrop-blur-md border border-border/80 transition-all duration-300 hover:scale-[1.02] hover:bg-card/80 hover:border-primary/30 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center space-x-4 p-5 pb-2">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Github className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Community & Code</CardTitle>
                    <CardDescription className="text-xs">Join our open source project</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <a
                    href={siteConfig.links.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary hover:underline transition-all flex items-center mt-2"
                  >
                    saad2134/shiksha-disha
                  </a>
                </CardContent>
              </Card>

              {/* Card 3: Hours & Support */}
              <Card className="bg-card/50 backdrop-blur-md border border-border/80 transition-all duration-300 hover:scale-[1.02] hover:bg-card/80 hover:border-primary/30 hover:shadow-lg">
                <CardHeader className="flex flex-row items-center space-x-4 p-5 pb-2">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Operating Hours</CardTitle>
                    <CardDescription className="text-xs">When we are active</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <p className="text-sm text-muted-foreground mt-2">
                    Monday – Friday, 9:00 AM – 6:00 PM IST
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    Typically responding within 24 hours.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7 animate-fade-in">
              <ContactForm />
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
