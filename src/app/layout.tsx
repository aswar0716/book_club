import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "The Reading Nook",
  description: "Your private book club by the fire",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex" style={{ background: "var(--bg-deep)" }}>
        <Sidebar />
        <main className="flex-1 min-h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
