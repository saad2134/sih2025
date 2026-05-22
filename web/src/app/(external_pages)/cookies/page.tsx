import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import Glow from "@/components/ui/glow";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Cookie Policy ✦ ${siteConfig.name}`,
  description: "Understand how the platform uses cookies and similar technologies.",
};

export default async function CookiePolicy() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden ">
        <Navbar />

        <section className="mx-auto max-w-4xl px-12 py-24 pt-32 md:pt-32 sm:gap-48">
          <h1 className="text-4xl font-bold text-foreground mb-2">Cookie Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last Updated: October 2025</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p>
              This Cookie Policy explains how <strong>{siteConfig.name}</strong> uses cookies and similar
              technologies when you visit our website or use our services.
            </p>

            <h2>1. What Are Cookies?</h2>
            <p>
              Cookies are small text files stored on your device when you access a website. They help us
              provide a better user experience by remembering preferences, enabling functionality, and
              analyzing site performance.
            </p>

            <h2>2. How We Use Cookies</h2>
            <ul>
              <li><strong>Essential Cookies</strong> – required for core site functionality.</li>
              <li><strong>Performance Cookies</strong> – help us understand how users interact with our app.</li>
              <li><strong>Functional Cookies</strong> – remember your preferences and settings.</li>
              <li><strong>Analytics Cookies</strong> – used to track usage trends and improve the Service.</li>
            </ul>

            <h2>3. Third-Party Cookies</h2>
            <p>
              We may use trusted third-party services (such as analytics providers) that place cookies on your
              device to help us measure and improve performance.
            </p>

            <h2>4. Managing Cookies</h2>
            <p>
              You can control or disable cookies through your browser settings. Please note that disabling
              certain cookies may affect the functionality of the Service.
            </p>

            <h2>5. Updates to This Policy</h2>
            <p>
              We may update this Cookie Policy from time to time. Changes will be posted here with an updated
              revision date.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              For questions about this Cookie Policy, contact us at:{" "}
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
