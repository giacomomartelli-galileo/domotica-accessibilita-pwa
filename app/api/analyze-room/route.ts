import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { NextResponse } from "next/server";

import { ROOM_TYPE_LABELS } from "@/lib/constants/room-labels";
import { getMockRoomAnalysis } from "@/lib/demo/mock-analysis";
import {
  analyzeRoomRequestSchema,
  roomAnalysisSchema,
} from "@/lib/schemas/room-analysis";
import { createClient } from "@/lib/supabase/server";

// AUMENTIAMO IL TIMEOUT A 60 SECONDI PER L'ANALISI AI
export const maxDuration = 60;

const SYSTEM_PROMPT = `Sei un esperto di accessibilità abitativa e domotica assistiva per persone con disabilità motorie.
Analizza la foto della stanza e identifica ostacoli fisici rilevanti per la mobilità.
Per ogni ostacolo proponi soluzioni domotiche concrete in italiano chiaro.`;

function shouldUseMockAi() {
  return process.env.USE_MOCK_AI === "true" || !process.env.OPENAI_API_KEY;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = analyzeRoomRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dati non validi.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { imageUrl, roomType, demo } = parsed.data;

    if (demo || shouldUseMockAi()) {
      await new Promise((r) => setTimeout(r, 1200));
      return NextResponse.json({
        analysis: getMockRoomAnalysis(roomType),
        mock: true,
      });
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "URL immagine richiesto." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Autenticazione richiesta." }, { status: 401 });
    }

    // --- NUOVA LOGICA DI DOWNLOAD SICURO ---
    // Estraiamo il nome del file dall'URL (es: "cartella/nomefile.jpg")
    const filePath = imageUrl.split('/').slice(-2).join('/'); 

    const { data: fileData, error: downloadError } = await supabase.storage
      .from('stanze') // ASSICURATI che il nome bucket qui sia corretto!
      .download(filePath);

    if (downloadError) {
      console.error("Errore download storage:", downloadError);
      return NextResponse.json({ error: "Impossibile scaricare l'immagine." }, { status: 500 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    // ---------------------------------------

    const roomLabel = ROOM_TYPE_LABELS[roomType];
    const { object: analysis } = await generateObject({
      model: openai("gpt-4o"),
      schema: roomAnalysisSchema,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analizza questa foto di: ${roomLabel}.` },
            { 
              type: "image", 
              image: base64Image // Passiamo il dato binario, non l'URL
            },
          ],
        },
      ],
    });

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Errore API:", error);
    return NextResponse.json({ error: "Errore interno durante l'analisi." }, { status: 500 });
  }
}