# Anteprima prototipo PWA in Cursor

## Porta corretta

L'app usa la porta **3000**, non 3300.

- Corretto: http://localhost:3000/preview
- Sbagliato: http://localhost:3300 (dara errore)

## Metodo 1 — Un clic (consigliato)

1. Apri in Cursor la cartella **domotica-accessibilita-pwa** (File → Apri cartella).
2. Premi **F5** oppure vai su **Run and Debug** (icona play a sinistra).
3. Scegli **Anteprima PWA (porta 3000)** e avvia.
4. Si apre il browser sul prototipo.

## Metodo 2 — Tastiera

1. `Ctrl+Shift+B` avvia il server.
2. Quando nel terminale compare `Ready`, apri:
   http://localhost:3000/preview

## Metodo 3 — Simple Browser in Cursor

1. Avvia il server con **F5** o `Ctrl+Shift+B`.
2. `Ctrl+Shift+P` → **Simple Browser: Show**
3. Incolla: `http://localhost:3000/preview`

## Se vedi errore di connessione

- Il server non e avviato: usa **F5** prima.
- Stai usando la porta sbagliata: usa **3000**, non 3300.
- Apri la cartella **domotica-accessibilita-pwa**, non solo "Progetti".
