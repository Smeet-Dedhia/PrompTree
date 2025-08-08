import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PromptTree",
  description: "Manage and compose prompts with drag-and-drop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="h-screen flex flex-col">
          <header className="bg-white border-b px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">PromptTree</h1>
            <p className="text-sm text-gray-600">Manage and compose prompts with ease</p>
          </header>
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
