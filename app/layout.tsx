import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// AUTH: Import AuthProvider to wrap the app with authentication context
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Property Listings Map",
  description: "Zillow-like property listings application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        {/* AUTH: Wrap children with AuthProvider for authentication state management */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

