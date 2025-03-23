import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "~/styles/globals.css";
import { ThemeProvider } from "~/providers/theme-provider";
import AuthProvider from "~/providers/auth-provider";
import QueryClientProviderWrapper from "~/providers/query-client-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Notebin.io | Code Sharing Platform",
  description:
    "A modern, fast, and secure platform for developers to share code snippets.",
  keywords: [
    "code sharing",
    "code snippets",
    "developer tools",
    "collaboration",
    "programming",
    "code review",
  ],
  authors: [{ name: "Notebin.io" }],
  creator: "Notebin.io",
  publisher: "Notebin.io",
  robots: "index, follow",
  metadataBase: new URL("https://notebin.io"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://notebin.io",
    title: "Notebin.io - Modern Code Sharing Platform",
    description:
      "Share and collaborate on code snippets easily with Notebin.io. A modern, fast, and secure platform for developers.",
    siteName: "Notebin.io",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Notebin.io - Code Sharing Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Notebin.io - Modern Code Sharing Platform",
    description:
      "Share and collaborate on code snippets easily with Notebin.io",
    images: ["/og-image.png"],
    creator: "@notebinio",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryClientProviderWrapper>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
