import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "Qreate Studios - Enterprise QR Code & Landing Page Platform",
  description: "Create dynamic QR codes, build landing pages with AI, track analytics, and manage multi-tenant deployments. Enterprise-grade platform with hosting, custom domains, and white-label support.",
  keywords: ["QR codes", "landing pages", "analytics", "AI content", "multi-tenant", "white-label", "enterprise"],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "Qreate Studios - Enterprise QR Code & Landing Page Platform",
    description: "Create dynamic QR codes, build landing pages with AI, and track analytics at scale.",
    type: "website",
    siteName: "Qreate Studios",
  },
  twitter: {
    card: "summary_large_image",
    title: "Qreate Studios",
    description: "Enterprise QR Code & Landing Page Platform",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
