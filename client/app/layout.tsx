import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Providers } from "./features/providers/Provider";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "AutoGrader",
  description: "AI-powered assignment grading tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar/>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </Providers>
      </body>
    </html>
  );
}
