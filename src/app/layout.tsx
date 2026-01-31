import "./globals.css";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/600.css";
import { ReactNode } from "react";
import ThemeRegistry from "@/components/ThemeRegistry";

export const metadata = {
  title: "Capstone WMS",
  description: "Warehouse Management System",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
