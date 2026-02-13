import type { Metadata } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dayhoff — AI Bioinformatics Workbench",
  description: "AI-powered bioinformatics learning workbench",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark text-[20px]">
      <body className="bg-dayhoff-bg-primary font-sans text-gray-200 antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
