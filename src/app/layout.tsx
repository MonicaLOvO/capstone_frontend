import "./globals.css";
import { ReactNode } from "react";
import { IBM_Plex_Sans } from "next/font/google";
import ThemeRegistry from "@/components/ThemeRegistry";
<<<<<<< HEAD
import Link from "next/link";
import { AuthProvider } from "@/components/auth/authContext";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["400", "600"],
  subsets: ["latin"],
});
=======
import { AuthProvider } from "@/auth/AuthProvider";
>>>>>>> 4060615909edf3090acb8e72583ecb5b5493f6c8

export const metadata = {
  title: "Capstone WMS",
  description: "Warehouse Management System",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
<<<<<<< HEAD
    <html lang="en" className={ibmPlexSans.className}>
      <body>
        <ThemeRegistry>
          <AuthProvider>
            <Link href="/signin">Go to Login</Link>
            {children}
          </AuthProvider>
=======
    <html lang="en">
      <body suppressHydrationWarning>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
>>>>>>> 4060615909edf3090acb8e72583ecb5b5493f6c8
        </ThemeRegistry>
      </body>
    </html>
  );
}
