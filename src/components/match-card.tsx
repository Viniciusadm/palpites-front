import { useState } from "react";
import { Lock, Check, Clock, CircleDot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOnline } from "@/hooks/use-online";
import { type Partida, type Selecao } from "@/api/types";

export function StatusBadge({ status }: { status: Partida["status"] }) {
  if (status === "live") {
    return (
      <Badge className="border-0 bg-destructive/20 text-destructive">
        <CircleDot className="mr-1 h-3 w-3 animate-pulse" />
        AO VIVO
      </Badge>
    );
  }
  if (status === "finished") {
    return (
      <Badge variant="secondary" className="border-0 bg-muted text-muted-foreground">
        <Check className="mr-1 h-3 w-3" />
        Encerrado
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="border-0 bg-primary/15 text-primary">
      <Clock className="mr-1 h-3 w-3" />
      Em breve
    </Badge>
  );
}

export function TeamSide({
  flag,
  name,
  align,
}: {
  flag: string;
  name: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <span className="text-2xl leading-none sm:text-3xl">{flag}</span>
      <span className="min-w-0 truncate text-sm font-semibold sm:text-base">{name}</span>
    </div>
  );
}

export function MatchCard({
  match,
  home,
  away,
  editable = true,
  prediction,
  onSave,
  saving = false,
}: {
  match: Partida;
  home: Selecao;
  away: Selecao;
  editable?: boolean;
  prediction?: { home: number; away: number; points: number | null };
  onSave?: (home: number, away: number) => void;
  saving?: boolean;
}) {
  const [h, setH] = useState<string>(prediction?.home?.toString() ?? "");
  const [a, setA] = useState<string>(prediction?.away?.toString() ?? "");
  const online = useOnline();

  const date = new Date(match.date);
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const noTeams = !home.id || !away.id;
  const tooFar = date.getTime() - Date.now() >= FIVE_DAYS_MS;
  const notOpenYet = editable && match.status === "scheduled" && (noTeams || tooFar);

  const locked = !editable || match.status !== "scheduled" || notOpenYet;
  const pts = match.status === "finished" ? (prediction?.points ?? 0) : 0;

  const save = () => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
    const hn = parseInt(h, 10);
    const an = parseInt(a, 10);
    if (isNaN(hn) || isNaN(an) || hn < 0 || an < 0) {
      toast.error("Informe um placar válido");
      return;
    }
    onSave?.(hn, an);
  };

  const dateStr = date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
  const timeStr = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40",
        notOpenYet && "opacity-60",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/60 bg-surface/60 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">{match.fase}</span>
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
          <TeamSide flag={home.flag} name={home.nome} align="left" />

          {locked ? (
            <div className="flex shrink-0 items-center gap-1 px-2">
              <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {match.homeScore ?? "–"}
              </span>
              <span className="text-muted-foreground">×</span>
              <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {match.awayScore ?? "–"}
              </span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 px-1">
              <NumericInput
                maxLength={2}
                value={h}
                onChange={setH}
                className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
                placeholder="-"
              />
              <span className="text-sm text-muted-foreground">×</span>
              <NumericInput
                maxLength={2}
                value={a}
                onChange={setA}
                className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
                placeholder="-"
              />
            </div>
          )}

          <TeamSide flag={away.flag} name={away.nome} align="right" />
        </div>

        {editable && locked && prediction && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Seu palpite:{" "}
              <span className="font-semibold text-foreground tabular-nums">
                {prediction.home} × {prediction.away}
              </span>
            </div>
            {match.status === "finished" && prediction.points !== null && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 font-semibold tabular-nums",
                  pts > 0 ? "bg-success/20 text-success" : "bg-destructive/15 text-destructive",
                )}
              >
                {pts > 0 ? `+${pts} pts` : "0 pts"}
              </span>
            )}
          </div>
        )}

        {notOpenYet && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" />
            {noTeams ? "Aguardando definição dos times" : "Palpites abrem mais perto do jogo"}
          </div>
        )}

        {!locked && (
          <Button
            onClick={save}
            size="sm"
            disabled={saving || !online}
            className="mt-4 w-full gold-gradient font-semibold text-primary-foreground hover:opacity-90"
          >
            {saving ? "Salvando..." : "Salvar palpite"}
          </Button>
        )}
      </div>
    </article>
  );
}
