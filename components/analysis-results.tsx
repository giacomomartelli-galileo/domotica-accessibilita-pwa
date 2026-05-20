"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Home,
  Lightbulb,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DANGER_LEVEL_LABELS,
  ISSUE_TYPE_LABELS,
  ROOM_TYPE_LABELS,
} from "@/lib/constants/room-labels";
import type { DangerLevel, RoomAnalysis, RoomType } from "@/lib/schemas/room-analysis";
import { cn } from "@/lib/utils";

interface AnalysisResultsProps {
  analysis: RoomAnalysis;
  roomType: RoomType;
}

const DANGER_BADGE_VARIANT: Record<
  DangerLevel,
  "secondary" | "default" | "destructive"
> = {
  low: "secondary",
  medium: "default",
  high: "destructive",
};

const DANGER_ICON: Record<DangerLevel, typeof ShieldAlert> = {
  low: CheckCircle2,
  medium: AlertTriangle,
  high: ShieldAlert,
};

function DangerBadge({ level }: { level: DangerLevel }) {
  const Icon = DANGER_ICON[level];
  return (
    <Badge
      variant={DANGER_BADGE_VARIANT[level]}
      className="gap-1 text-sm font-semibold"
    >
      <Icon className="h-3.5 w-3.5" aria-hidden />
      <span>{DANGER_LEVEL_LABELS[level]}</span>
    </Badge>
  );
}

export function AnalysisResults({ analysis, roomType }: AnalysisResultsProps) {
  const { summary, issues } = analysis;
  const allSuggestions = issues.flatMap((issue) =>
    issue.domotic_suggestions.map((suggestion) => ({
      ...suggestion,
      issueType: issue.type,
      issueDescription: issue.description,
    }))
  );

  const hasIssues = issues.length > 0;

  return (
    <article
      aria-labelledby="analysis-results-title"
      className="mx-auto w-full max-w-3xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle
            id="analysis-results-title"
            className="flex items-center gap-2 text-xl"
          >
            <Home className="h-6 w-6 text-primary" aria-hidden />
            Report: {ROOM_TYPE_LABELS[roomType]}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed text-card-foreground/90">
            {summary}
          </CardDescription>
        </CardHeader>
      </Card>

      <section aria-labelledby="obstacles-heading">
        <h2
          id="obstacles-heading"
          className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
        >
          <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden />
          Ostacoli rilevati
          <span className="sr-only">: {issues.length} elementi</span>
          <Badge variant="outline" aria-hidden>
            {issues.length}
          </Badge>
        </h2>

        {!hasIssues ? (
          <Card>
            <CardContent className="flex items-start gap-3 pt-6">
              <CheckCircle2
                className="mt-0.5 h-6 w-6 shrink-0 text-emerald-400"
                aria-hidden
              />
              <p className="text-base text-card-foreground/90">
                Nessun ostacolo significativo rilevato in questa foto. Puoi
                scattare un&apos;altra inquadratura per una verifica più
                completa.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ol className="space-y-4" role="list">
            {issues.map((issue, index) => (
              <li key={`${issue.type}-${index}`}>
                <Card
                  className={cn(
                    "border-l-4",
                    issue.danger_level === "high" && "border-l-destructive",
                    issue.danger_level === "medium" && "border-l-primary",
                    issue.danger_level === "low" && "border-l-muted-foreground"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <CardTitle className="text-base font-semibold">
                        <span className="sr-only">Ostacolo {index + 1}: </span>
                        {ISSUE_TYPE_LABELS[issue.type]}
                      </CardTitle>
                      <DangerBadge level={issue.danger_level} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-relaxed text-card-foreground/90">
                      {issue.description}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>

      {allSuggestions.length > 0 && (
        <section aria-labelledby="solutions-heading">
          <h2
            id="solutions-heading"
            className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground"
          >
            <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
            Soluzioni domotiche consigliate
            <span className="sr-only">: {allSuggestions.length} proposte</span>
            <Badge variant="outline" aria-hidden>
              {allSuggestions.length}
            </Badge>
          </h2>

          <ul className="space-y-4" role="list">
            {allSuggestions.map((suggestion, index) => (
              <li key={`${suggestion.product_name}-${index}`}>
                <Card className="bg-secondary/40 border-border/40">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">
                      {suggestion.product_name}
                    </CardTitle>
                    <CardDescription>
                      <Badge variant="secondary" className="font-normal bg-primary/20 text-primary-foreground border-transparent">
                        {suggestion.category}
                      </Badge>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-card-foreground">
                        Riferito a:{" "}
                      </span>
                      {ISSUE_TYPE_LABELS[suggestion.issueType]}
                    </p>
                    {suggestion.installation_notes && (
                      <p className="text-base leading-relaxed text-card-foreground/90">
                        <span className="font-medium text-card-foreground">Note installazione: </span>
                        {suggestion.installation_notes}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
