import { useState } from "react";
import { Lock, Check, Clock, CircleDot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CURRENT_USER_ID,
  getSelecao,
  pointsFor,
  type Partida,
} from "@/mocks/data";
import { useAppStore } from "@/store/app-store";

function StatusBadge({ status }: { status: Partida["status"] }) {
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

function TeamSide({
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

export function MatchCard({ match }: { match: Partida }) {
  const home = getSelecao(match.homeId);
  const away = getSelecao(match.awayId);
  const palpite = useAppStore((s) =>
    s.palpites.find((p) => p.userId === CURRENT_USER_ID && p.matchId === match.id),
  );
  const setPalpite = useAppStore((s) => s.setPalpite);

  const [h, setH] = useState<string>(palpite?.home?.toString() ?? "");
  const [a, setA] = useState<string>(palpite?.away?.toString() ?? "");

  const locked = match.status !== "scheduled";
  const pts = palpite && match.status === "finished" ? pointsFor(palpite, match) : 0;

  const save = () => {
    const hn = parseInt(h, 10);
    const an = parseInt(a, 10);
    if (isNaN(hn) || isNaN(an) || hn < 0 || an < 0) {
      toast.error("Informe um placar válido");
      return;
    }
    setPalpite(match.id, hn, an);
    toast.success("Palpite salvo!");
  };

  const date = new Date(match.date);
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
    <article className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40">
      <header className="flex items-center justify-between border-b border-border/60 bg-surface/60 px-4 py-2.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground/80">{match.fase}</span>
          <span>•</span>
          <span>{dateStr} • {timeStr}</span>
        </div>
        <StatusBadge status={match.status} />
      </header>

      <div className="px-4 py-5">
        <div className="flex items-center gap-3">
          <TeamSide flag={home.flag} name={home.nome} align="left" />

          {locked ? (
            <div className="flex shrink-0 items-center gap-1 px-2">
              <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {match.homeScore}
              </span>
              <span className="text-muted-foreground">×</span>
              <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
                {match.awayScore}
              </span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-1.5 px-1">
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={h}
                onChange={(e) => setH(e.target.value)}
                className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
                placeholder="-"
              />
              <span className="text-sm text-muted-foreground">×</span>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={20}
                value={a}
                onChange={(e) => setA(e.target.value)}
                className="h-11 w-12 text-center text-lg font-bold tabular-nums sm:w-14"
                placeholder="-"
              />
            </div>
          )}

          <TeamSide flag={away.flag} name={away.nome} align="right" />
        </div>

        {locked && palpite && (
          <div className="mt-4 flex items-center justify-between rounded-xl bg-surface px-3 py-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
              Seu palpite: <span className="font-semibold text-foreground tabular-nums">{palpite.home} × {palpite.away}</span>
            </div>
            {match.status === "finished" && (
              <span
                className={cn(
                  "rounded-md px-2 py-0.5 font-semibold tabular-nums",
                  pts === 10 && "bg-success/20 text-success",
                  pts === 5 && "bg-primary/20 text-primary",
                  pts === 0 && "bg-destructive/15 text-destructive",
                )}
              >
                {pts > 0 ? `+${pts} pts` : "0 pts"}
              </span>
            )}
          </div>
        )}

        {!locked && (
          <Button
            onClick={save}
            size="sm"
            className="mt-4 w-full gold-gradient font-semibold text-primary-foreground hover:opacity-90"
          >
            Salvar palpite
          </Button>
        )}
      </div>
    </article>
  );
}
