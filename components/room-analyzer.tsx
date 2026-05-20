"use client";

import { useCallback, useId, useRef, useState } from "react";
import { AlertCircle, Camera, Loader2 } from "lucide-react";

import { AnalysisResults } from "@/components/analysis-results";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ROOM_TYPE_LABELS } from "@/lib/constants/room-labels";
import type { RoomAnalysis, RoomType } from "@/lib/schemas/room-analysis";
import { roomTypeSchema } from "@/lib/schemas/room-analysis";
import { uploadRoomPhoto } from "@/lib/storage/upload-room-photo";

type AnalyzerPhase = "idle" | "uploading" | "analyzing" | "done" | "error";

interface RoomAnalyzerProps {
  roomId: string;
  roomName?: string;
  demoMode?: boolean;
}

export function RoomAnalyzer({
  roomId,
  roomName,
  demoMode = false,
}: RoomAnalyzerProps) {
  const formId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);

  const [roomType, setRoomType] = useState<RoomType>("soggiorno");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<AnalyzerPhase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);

  const announce = useCallback((message: string) => {
    if (liveRegionRef.current) {
      liveRegionRef.current.textContent = message;
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setErrorMessage(null);
    setAnalysis(null);

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    announce(`Foto selezionata: ${file.name}`);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setErrorMessage("Seleziona una foto della stanza prima di analizzare.");
      announce("Seleziona una foto della stanza prima di analizzare.");
      return;
    }

    setErrorMessage(null);
    setAnalysis(null);
    setPhase("uploading");
    announce(
      demoMode ? "Preparazione analisi demo..." : "Caricamento foto in corso."
    );

    let imageUrl: string | undefined;
    if (demoMode) {
      await new Promise((r) => setTimeout(r, 800));
    } else {
      const upload = await uploadRoomPhoto(selectedFile, roomId);
      if (!upload.ok) {
        setPhase("error");
        setErrorMessage(upload.error);
        announce(upload.error);
        return;
      }
      imageUrl = upload.publicUrl;
    }

    setPhase("analyzing");
    announce("Analisi accessibilità in corso. Attendere.");

    try {
      const response = await fetch("/api/analyze-room", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          roomType,
          roomId,
          demo: demoMode,
        }),
      });

      const payload = (await response.json()) as {
        analysis?: RoomAnalysis;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          payload.error ?? "Analisi non riuscita. Riprova più tardi."
        );
      }

      if (!payload.analysis) {
        throw new Error("Risposta dell'analisi non valida.");
      }

      setAnalysis(payload.analysis);
      setPhase("done");
      announce(
        `Analisi completata. ${payload.analysis.issues.length} ostacoli rilevati.`
      );
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Errore durante l'analisi. Riprova.";
      setPhase("error");
      setErrorMessage(message);
      announce(message);
    }
  };

  const isBusy = phase === "uploading" || phase === "analyzing";
  const roomTypes = roomTypeSchema.options;

  return (
    <section
      aria-labelledby={`${formId}-title`}
      className="mx-auto w-full max-w-2xl space-y-6"
    >
      <div
        ref={liveRegionRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <Card>
        <CardHeader>
          <CardTitle id={`${formId}-title`}>
            Analisi accessibilità{roomName ? `: ${roomName}` : ""}
          </CardTitle>
          <CardDescription>
            Scatta o carica una foto della stanza. L&apos;intelligenza artificiale
            rileverà ostacoli e suggerirà soluzioni domotiche.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor={`${formId}-room-type`}>Tipo di stanza</Label>
            <Select
              value={roomType}
              onValueChange={(value) => setRoomType(value as RoomType)}
              disabled={isBusy}
            >
              <SelectTrigger
                id={`${formId}-room-type`}
                aria-describedby={`${formId}-room-type-hint`}
              >
                <SelectValue placeholder="Seleziona il tipo di stanza" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {ROOM_TYPE_LABELS[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p
              id={`${formId}-room-type-hint`}
              className="text-sm text-muted-foreground"
            >
              Il tipo di stanza aiuta l&apos;analisi a concentrarsi sui rischi
              più comuni.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`${formId}-photo`}>Foto della stanza</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                ref={fileInputRef}
                id={`${formId}-photo`}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="sr-only"
                disabled={isBusy}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-11 min-w-[44px]"
              >
                <Camera className="mr-2 h-5 w-5" aria-hidden />
                Scegli foto
              </Button>
              {selectedFile && (
                <span className="text-sm text-card-foreground/90 font-medium">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              Formati: JPEG, PNG, WebP. Massimo 10 MB.
            </p>
          </div>

          {previewUrl && (
            <figure className="overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Anteprima della foto caricata per l'analisi accessibilità"
                className="max-h-64 w-full bg-muted object-contain"
              />
            </figure>
          )}

          {isBusy && (
            <div
              role="status"
              aria-busy="true"
              className="space-y-3 rounded-xl border border-border bg-muted/20 p-4 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <Loader2
                  className="h-6 w-6 animate-spin text-primary"
                  aria-hidden
                />
                <p className="font-medium text-card-foreground">
                  {phase === "uploading"
                    ? "Caricamento foto in corso…"
                    : "Analisi accessibilità in corso…"}
                </p>
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )}

          {errorMessage && (
            <Alert variant="destructive" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden />
              <AlertTitle>Errore</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Button
            type="button"
            onClick={handleAnalyze}
            disabled={isBusy || !selectedFile}
            className="min-h-11 w-full sm:w-auto"
            aria-describedby={
              !selectedFile ? `${formId}-analyze-hint` : undefined
            }
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                Attendere…
              </>
            ) : (
              "Analizza stanza"
            )}
          </Button>
          {!selectedFile && (
            <p id={`${formId}-analyze-hint`} className="sr-only">
              Seleziona prima una foto per abilitare l&apos;analisi.
            </p>
          )}
        </CardContent>
      </Card>

      {analysis && phase === "done" && (
        <AnalysisResults analysis={analysis} roomType={roomType} />
      )}
    </section>
  );
}
