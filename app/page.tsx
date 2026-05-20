import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="container flex min-h-[80vh] flex-col items-center justify-center py-12 text-center">
      <div className="max-w-xl space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Analisi Accessibilità Abitativa
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Un prototipo PWA avanzato che utilizza l&apos;intelligenza artificiale per rilevare barriere architettoniche e suggerire soluzioni domotiche assistive.
        </p>
        <div className="pt-4">
          <Link
            href="/preview"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-sm hover:shadow-md hover:bg-primary/95 transition-all duration-200 active:scale-[0.98]"
          >
            Apri anteprima prototipo
          </Link>
        </div>
      </div>
    </main>
  );
}
