import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Collaborative Notes - BLOQ QUANTUM",
  description: "Real-time collaborative note-taking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

