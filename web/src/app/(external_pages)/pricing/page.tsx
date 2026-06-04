import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import { PricingSection } from "@/components/pricing/pricing-card";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Pricing ✦ ${siteConfig.name}`,
  description: "Choose the plan that fits your learning journey. Start free, upgrade when you're ready to accelerate your career.",
};


export default async function Pricing() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden">
        <Navbar />
        <div className="pt-16">
          <PricingSection />
        </div>
        <Footer />
      </main>
    </>
  );
}
