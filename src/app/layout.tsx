import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FIXORA | Field Service Ecosystem',
  description: 'AI-Powered Opportunity Assistant & Service Platform',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased min-h-screen flex justify-center">
        {/* Constrain container for native mobile-first display on wider screens */}
        <div className="w-full max-w-md bg-white min-h-screen shadow-lg flex flex-col relative">
          {children}
        </div>
      </body>
    </html>
  );
}