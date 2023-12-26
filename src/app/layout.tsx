import { SITE_NAME } from "~/name";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { AxiomWebVitals } from "next-axiom";
import "~/styles/globals.css";
import { Providers } from "./providers";
import { Open_Sans } from "next/font/google";
import clsx from "clsx";
import { env } from "~/env.mjs";

export const metadata = {
  title: SITE_NAME,
  description: "TODO",
};

// @@NOTE custom font
const sans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={clsx("h-full", sans.variable)}>
      <body className='bg-gray-100'>
      {/* @@NOTE all our providers. Client ones can be put in <Providers/>*/}
        <Toaster richColors />
        <Analytics />
        <AxiomWebVitals />
        <Providers>{children}</Providers>
        {env.VERCEL_ENV === "preview" && ( // Displays banner when on preview
          <div className="pointer-events-none fixed bottom-0 left-0 right-0 top-0 z-[100] border-8 border-orange-500 p-8">
            <div className="fixed left-0 right-0 top-0 flex justify-center">
              <div className="mt-0.5 rounded-b-xl bg-orange-500 px-2 py-1.5 text-xs text-white">
                Test Data
              </div>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
