
import Footer from "@/components/sections/footer/default";
import Navbar from "@/components/sections/navbar/default";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: `Refunds Policy ✦ ${siteConfig.name}`,
  description: "Learn about our refund policy for Premium subscriptions and billing.",
};

export default async function Refunds() {
  return (
    <>
      <main className="min-h-screen w-full overflow-hidden ">
        <Navbar />

        <section className="mx-auto max-w-4xl px-6 md:px-12 py-24 pt-32 md:pt-32">
          <h1 className="text-4xl font-bold text-foreground mb-2">Refunds Policy</h1>
          <p className="text-sm text-muted-foreground mb-10">Last Updated: February 2026</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p>
              Thank you for choosing <strong>{siteConfig.name}</strong>. We want you to be completely satisfied with your Premium subscription.
              This Refunds Policy outlines our terms regarding cancellations and refunds.
            </p>

            <h2>1. 14-Day Free Trial</h2>
            <p>
              All Premium subscriptions include a <strong>14-day free trial</strong>. During this period, you can explore all Premium features
              at no cost. No payment information is required to start your trial.
            </p>

            <h2>2. Paid Subscription Refunds</h2>
            <ul>
              <li><strong>First 14 Days:</strong> If you cancel within the first 14 days of your paid subscription, you may request a full refund. Contact our support team within this period.</li>
              <li><strong>After 14 Days:</strong> Refunds are not available for cancellations after the 14-day trial period. However, you can cancel at any time to avoid future charges.</li>
              <li><strong>Annual Plans:</strong> The same 14-day refund policy applies to annual subscription plans.</li>
            </ul>

            <h2>3. How to Request a Refund</h2>
            <p>
              To request a refund, please contact our support team within 14 days of your purchase:
            </p>
            <ul>
              <li>Email: {siteConfig.links.email.replace('mailto:', '')}</li>
              <li>Use the chat support on our website</li>
              <li>Submit a request through your account settings</li>
            </ul>
            <p>
              Refunds are typically processed within <strong>5-10 business days</strong> and credited back to your original payment method.
            </p>

            <h2>4. Cancellation</h2>
            <p>
              You can cancel your Premium subscription at any time from your account settings. After cancellation:
            </p>
            <ul>
              <li>You will retain access to Premium features until the end of your current billing period</li>
              <li>No further charges will be made after cancellation</li>
              <li>Your account will automatically downgrade to Freemium</li>
            </ul>

            <h2>5. What&apos;s Not Refundable</h2>
            <ul>
              <li>One-time purchases (such as individual consultation sessions)</li>
              <li>Any charges made after the 14-day trial period</li>
              <li>Third-party services or products purchased through our platform</li>
            </ul>

            <h2>6. Special Circumstances</h2>
            <p>
              We understand that exceptional situations may arise. If you believe you have a special case, please contact our support team.
              We review such requests on a case-by-case basis and may offer partial refunds or credits at our discretion.
            </p>

            <h2>7. Changes to This Policy</h2>
            <p>
              We may update this Refunds Policy from time to time. Any changes will be posted on this page with an updated &quot;Last Updated&quot; date.
              Continued use of our Service after changes constitutes acceptance of the updated policy.
            </p>

            <h2>8. Contact Us</h2>
            <p>
              If you have any questions about our Refunds Policy, please contact us at:{" "}
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
