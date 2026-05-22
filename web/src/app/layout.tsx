import "@/app/globals.css";

import { Providers } from "@/components/providers";
import { inter } from "@/lib/fonts";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="overflow-x-hidden ">
      <body className={`${inter.className}  antialiased overflow-x-hidden`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
