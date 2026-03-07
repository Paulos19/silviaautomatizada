import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Silvia Dashboard",
  description: "Painel Administrativo Hospitalar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.className} ${outfit.variable} antialiased bg-background text-foreground h-full min-h-screen`}
        suppressHydrationWarning
      >
        <div className="ambient-bg" />
        {children}
      </body>
    </html>
  );
}
