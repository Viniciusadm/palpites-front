import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, ClipboardCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useOnline } from "@/hooks/use-online";
import { useMe } from "@/api/auth";
import { type Partida, type Selecao } from "@/api/types";
import { MatchCardShell, ScoreInputs, StatusBadge, TeamSide } from "@/components/match-card-shell";

export { StatusBadge, TeamSide };

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
  const me = useMe();
  const isAdmin = me.data?.user.role === "admin";

  const date = new Date(match.date);
  const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
  const RESULT_READY_MS = 110 * 60 * 1000;
  const canEnterResult =
    isAdmin && match.status === "live" && Date.now() - date.getTime() >= RESULT_READY_MS;
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

  const score = locked ? (
    <div className="flex shrink-0 items-center gap-1 px-1">
      <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
        {match.homeScore ?? "–"}
      </span>
      <span className="text-muted-foreground">×</span>
      <span className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
        {match.awayScore ?? "–"}
      </span>
    </div>
  ) : (
    <ScoreInputs home={h} away={a} onHome={setH} onAway={setA} />
  );

  return (
    <>
      {canEnterResult && (
        <Link
          to="/admin/partidas"
          className="group mb-2 flex items-center gap-2.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <ClipboardCheck className="h-4 w-4 shrink-0" />
          <span className="flex-1 leading-tight">Já é possível lançar o resultado</span>
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
      <MatchCardShell
        fase={match.fase}
        dateISO={match.date}
        status={match.status}
        home={{ flag: home.flag, name: home.nome }}
        away={{ flag: away.flag, name: away.nome }}
        dimmed={notOpenYet}
        score={score}
      >
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
      </MatchCardShell>
    </>
  );
}
