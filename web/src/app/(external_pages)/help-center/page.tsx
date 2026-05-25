import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { LifeBuoy, BookOpen, CreditCard, Monitor, ChevronDown, Mail, ArrowRight } from "lucide-react";

export const metadata = {
  title: `Help Center ✦ ${siteConfig.name}`,
  description: "Find answers to your questions and get support for our products and services.",
};

const faqCategories = [
  {
    title: "Getting Started",
    icon: LifeBuoy,
    iconColor: "text-violet-500",
    bgColor: "bg-violet-500/10",
    borderColor: "group-hover:border-violet-500/30",
    questions: [
      { q: "What is ShikshaDisha?", a: "ShikshaDisha is an AI-powered career navigation platform that helps learners discover personalized skill pathways, track labor market trends, and build employable skills." },
      { q: "How do I create an account?", a: "Click the 'Get Started' button on the homepage and sign up using your email address or Google account. It's completely free." },
      { q: "Is ShikshaDisha really free?", a: "Yes! We offer a free tier with access to 50+ courses, basic progress tracking, and community forum access. Premium plans unlock additional features." },
    ],
  },
  {
    title: "Courses & Learning",
    icon: BookOpen,
    iconColor: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    borderColor: "group-hover:border-indigo-500/30",
    questions: [
      { q: "What types of courses are available?", a: "We offer courses across technology, business, design, data science, and soft skills. Each course includes video lessons, quizzes, and hands-on projects." },
      { q: "How are course recommendations generated?", a: "Our AI analyzes your academic background, skill level, career goals, and labor market trends to recommend the most relevant courses for you." },
      { q: "Can I earn certificates?", a: "Yes! Free users get 1 certificate per month, while Pro and Premium users get unlimited certificates upon course completion." },
    ],
  },
  {
    title: "Account & Billing",
    icon: CreditCard,
    iconColor: "text-purple-500",
    bgColor: "bg-purple-500/10",
    borderColor: "group-hover:border-purple-500/30",
    questions: [
      { q: "How do I upgrade my plan?", a: "Go to your account settings and select 'Billing'. You can choose between Pro (₹499/month) and Premium (₹999/month) plans." },
      { q: "Can I cancel my subscription?", a: "Yes, you can cancel anytime from your billing settings. Your access will continue until the end of the current billing period." },
      { q: "Is there a refund policy?", a: "We offer a 7-day money-back guarantee on all paid plans. Contact our support team to initiate a refund." },
    ],
  },
  {
    title: "Technical Support",
    icon: Monitor,
    iconColor: "text-pink-500",
    bgColor: "bg-pink-500/10",
    borderColor: "group-hover:border-pink-500/30",
    questions: [
      { q: "What browsers are supported?", a: "ShikshaDisha works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated." },
      { q: "How do I reset my password?", a: "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within minutes." },
      { q: "Who do I contact for technical issues?", a: "You can reach our support team via the contact form or email us directly. We typically respond within 24 hours." },
    ],
  },
];

export default function HelpCenter() {
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
              <LifeBuoy className="size-3.5" />
              <span>Get Answers</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-balance leading-tight bg-gradient-to-r from-primary via-brand-foreground to-brand bg-clip-text text-transparent pb-1">
              Help Center
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground text-balance max-w-2xl font-medium">
              Find answers to your questions and get support for our products and services.
            </p>
          </div>

          {/* FAQ Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">
            {faqCategories.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div
                  key={idx}
                  className={`group relative border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-6 sm:p-8 flex flex-col gap-4 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 ${category.borderColor}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${category.bgColor}`}>
                      <Icon className={`w-5 h-5 ${category.iconColor}`} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{category.title}</h2>
                  </div>
                  <div className="space-y-3">
                    {category.questions.map((item, qi) => (
                      <details key={qi} className="group/details cursor-pointer">
                        <summary className="flex items-center justify-between gap-2 text-sm font-semibold text-foreground py-2 border-b border-border/40 hover:text-primary transition-colors list-none">
                          <span>{item.q}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open/details:rotate-180" />
                        </summary>
                        <p className="text-sm text-muted-foreground mt-2 pb-2 leading-relaxed">
                          {item.a}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Call to action Card */}
          <div className="w-full max-w-5xl border border-border/60 bg-linear-to-b from-card/60 to-card/20 dark:from-primary/5 dark:to-primary/0 backdrop-blur-md rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-primary/40 transition-colors duration-300">
            <div className="flex flex-col gap-2 text-center md:text-left">
              <h3 className="text-xl font-bold flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Still have questions?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
                Can't find what you're looking for? Our support team is here to help you out.
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
