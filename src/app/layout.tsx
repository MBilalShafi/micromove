import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MicroMove - AI Procrastination Killer",
  description: "Big tasks → tiny wins. 5 minutes at a time. Break overwhelming tasks into tiny, manageable micro-steps.",
  keywords: ["productivity", "procrastination", "task management", "focus", "timer", "AI"],
  authors: [{ name: "Bilal Shafi" }],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" },
    ],
    apple: [
      { url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🚀</text></svg>" },
    ],
  },
  openGraph: {
    title: "MicroMove - AI Procrastination Killer",
    description: "Big tasks → tiny wins. 5 minutes at a time.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MicroMove - AI Procrastination Killer",
    description: "Big tasks → tiny wins. 5 minutes at a time.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#8b5cf6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
