import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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

// Script to prevent flash of incorrect theme
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('micromove-theme');
      var resolved = theme;
      if (!theme || theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.classList.add(resolved);
      document.documentElement.style.colorScheme = resolved;
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
