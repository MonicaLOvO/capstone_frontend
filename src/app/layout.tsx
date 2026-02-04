import "./globals.css";
import { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
import Link from "next/link";
import { AuthProvider } from "@/components/auth/authContext";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
});

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
    <html lang="en" className={ibmPlexSans.className}>
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <Link href="/signin">Go to Login</Link>
            {children}
          </AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
