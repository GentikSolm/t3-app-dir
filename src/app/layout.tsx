import { SITE_NAME } from "~/name";
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
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
