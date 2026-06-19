import { useState } from "react";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { StatusBadge, TeamSide } from "@/components/match-card";
import { toast } from "sonner";
import type { MatchResponse } from "@/api/types";

export function AdminMatchCard({
  match,
  home,
  away,
  fase,
  onEnterResult,
  savingResult = false,
  onEdit,
  onRemove,
  removing = false,
}: {
  match: MatchResponse;
  home: { flag: string; name: string };
  away: { flag: string; name: string };
  fase: string;
  onEnterResult: (home: number, away: number) => void;
  savingResult?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  removing?: boolean;
}) {
  const [h, setH] = useState<string>(match.home_score?.toString() ?? "");
  const [a, setA] = useState<string>(match.away_score?.toString() ?? "");

  const noTeams = !match.home_team_id || !match.away_team_id;
  const hasResult = match.home_score !== null && match.away_score !== null;

  const date = new Date(match.kickoff_at);
  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const save = () => {
    const hn = parseInt(h, 10);
    const an = parseInt(a, 10);
    if (isNaN(hn) || isNaN(an) || hn < 0 || an < 0) {
      toast.error("Informe um placar válido");
      return;
    }
    onEnterResult(hn, an);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/60 bg-surface/60 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">{fase || "—"}</span>
        <span className="hidden sm:inline">•</span>
        <span className="order-last w-full sm:order-none sm:w-auto">
          {dateStr} • {timeStr}
        </span>
        <span className="ml-auto">
          <StatusBadge status={match.status} />
        </span>
      </header>

      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <TeamSide flag={home.flag} name={home.name} align="left" />

          <div className="flex shrink-0 items-center gap-1.5 px-1">
            <NumericInput
              maxLength={2}
              value={h}
              onChange={setH}
              disabled={noTeams}
              className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
              placeholder="-"
            />
            <span className="text-sm text-muted-foreground">×</span>
            <NumericInput
              maxLength={2}
              value={a}
              onChange={setA}
              disabled={noTeams}
              className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
              placeholder="-"
            />
          </div>

          <TeamSide flag={away.flag} name={away.name} align="right" />
        </div>

        {noTeams ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            Defina as duas seleções antes de lançar o resultado
          </div>
        ) : (
          <Button
            onClick={save}
            size="sm"
            disabled={savingResult}
            className="mt-4 w-full gold-gradient font-semibold text-primary-foreground hover:opacity-90"
          >
            {savingResult ? "Salvando..." : hasResult ? "Atualizar resultado" : "Salvar resultado"}
          </Button>
        )}

        <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
          <Button size="icon" variant="ghost" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onRemove}
            disabled={removing}
            className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}
