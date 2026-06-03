import { siteConfig } from "@/config/site";
import StatusPageClient from "./status-client";

export const metadata = {
  title: `Status ✦ ${siteConfig.name}`,
  description: "Monitor the current status of the platform services.",
};

export default function StatusPage() {
  return <StatusPageClient />;
}