import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";

export const metadata: Metadata = {
  title: "Accessibilità Domotica",
  description: "Prototipo PWA analisi accessibilità abitativa",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>
        <a href="#main-content" className="sr-only">
          Salta al contenuto
        </a>
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-background/80 backdrop-blur-md text-foreground">
          <div className="container flex h-14 items-center justify-between">
            <span className="font-semibold tracking-tight">Accessibilità Domotica</span>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/preview" className="text-sm font-medium text-primary hover:underline transition-colors">
                Anteprima
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
