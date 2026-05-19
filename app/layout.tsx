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
        <header className="border-b border-border bg-card">
          <div className="container flex h-14 items-center gap-6">
            <span className="font-semibold">Accessibilità Domotica</span>
            <nav>
              <Link href="/preview" className="text-primary underline">
                Anteprima prototipo
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
