import Link from "next/link";

export default function HomePage() {
  return (
    <main id="main-content" className="container py-12 text-center">
      <h1 className="text-3xl font-bold">Prototipo PWA</h1>
      <p className="mt-4 text-muted-foreground">
        Analisi accessibilità abitativa con domotica assistiva.
      </p>
      <Link
        href="/preview"
        className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground"
      >
        Apri anteprima prototipo
      </Link>
    </main>
  );
}
