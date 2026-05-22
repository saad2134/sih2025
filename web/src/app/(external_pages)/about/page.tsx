import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `About Us ✦ ${siteConfig.name}`,
  description: "Discover our mission, vision, and team dedicated to guiding your career journey.",
};


export default async function About() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden ">
        <Navbar />

        <section className="mx-auto max-w-4xl px-12 py-24 pt-32 md:pt-32 sm:gap-48">
          <h1 className="text-4xl font-bold text-foreground mb-2">About {siteConfig.name}</h1>
          <p className="text-sm text-muted-foreground mb-10">Empowering learners with AI-driven guidance</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <h2>Our Mission</h2>
            <p>
              At <strong>{siteConfig.name}</strong>, we believe every learner deserves a clear, personalized path
              towards employable and future-ready skills. India’s skilling ecosystem offers countless
              opportunities, but many learners struggle to navigate their options. Our mission is to simplify
              this journey with the power of artificial intelligence.
            </p>

            <h2>What We Do</h2>
            <p>
               {siteConfig.name} acts as a career navigator and skilling assistant, helping learners:
            </p>
            <ul>
              <li>Discover training programs aligned with their goals and background.</li>
              <li>Receive adaptive learning pathways that evolve with their progress.</li>
              <li>Stay updated with real-time labour market demands and future skill needs.</li>
              <li>Build confidence through stackable skills, micro-credentials, and certifications.</li>
            </ul>

            <h2>Our Approach</h2>
            <p>
              We leverage AI and machine learning to profile learners, match them with industry-aligned
              opportunities, and provide dynamic recommendations. Whether you’re a student, job seeker, or
              professional looking to upskill,  {siteConfig.name} is designed to support your growth.
            </p>

            <h2>Why It Matters</h2>
            <p>
              Skills are the foundation of employability, but the journey to acquire them should not be
              overwhelming. With {siteConfig.name}, learners gain clarity, trainers receive actionable insights, and
              policymakers access real-time intelligence to shape India’s workforce of the future.
            </p>

            <h2>Contact Us</h2>
            <p>
              Have questions or ideas? We'd love to hear from you at{" "}
              <a href={siteConfig.links.email} className="text-primary underline">
                {siteConfig.links.email.replace('mailto:', '')}
              </a>
            </p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
