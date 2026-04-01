import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/navigation";


export const metadata: Metadata = {
  title: "LuxeEstate - Premium Real Estate",
  description: "Find your sanctuary.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans selection:bg-mosque selection:text-white" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background-light text-nordic-dark font-display" suppressHydrationWarning>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
