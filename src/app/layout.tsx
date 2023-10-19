import { SITE_NAME } from "~/name";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import "~/styles/globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: SITE_NAME,
  description: "Desc",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Toaster richColors />
        <Analytics />
        <AxiomWebVitals />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
