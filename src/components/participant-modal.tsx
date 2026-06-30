import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useMemberPredictions } from "@/api/pools";
import { useMatches } from "@/api/matches";
import { useTeams } from "@/api/teams";
import { toTeam } from "@/api/adapters";
import type { MatchResponse, RankingEntry } from "@/api/types";
import type { Team } from "@/api/types";

const TBD: Team = { id: "", name: "A definir", flag: "🏳️", group: "" };

export function ParticipantModal({
  entry,
  poolId,
  tournamentId,
  onClose,
}: {
  entry: RankingEntry | null;
  poolId: string;
  tournamentId: string;
  onClose: () => void;
}) {
  const predictions = useMemberPredictions(poolId, entry?.pool_member_id ?? null);
  const matches = useMatches(tournamentId);
  const teams = useTeams();

  const matchById = useMemo(() => {
    const map = new Map<string, MatchResponse>();
    (matches.data ?? []).forEach((m) => map.set(m.id, m));
    return map;
  }, [matches.data]);

  const teamsById = useMemo(() => {
    const map = new Map<string, Team>();
    (teams.data ?? []).forEach((t) => map.set(t.id, toTeam(t)));
    return map;
  }, [teams.data]);

  const items = useMemo(() => {
    return [...(predictions.data ?? [])].sort(
      (a, b) => +new Date(b.kickoff_at) - +new Date(a.kickoff_at),
    );
  }, [predictions.data]);

  if (!entry) {
    return (
      <Dialog open={false} onOpenChange={(o) => !o && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const teamsFor = (matchId: string) => {
    const m = matchById.get(matchId);
    return {
      home: (m?.home_team_id && teamsById.get(m.home_team_id)) || TBD,
      away: (m?.away_team_id && teamsById.get(m.away_team_id)) || TBD,
    };
  };

  return (
    <Dialog open={!!entry} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card p-0">
        <div className="border-b border-border p-6">
          <DialogHeader>
            <DialogTitle className="sr-only">{entry.display_name}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-base font-bold text-primary">
              {entry.display_name
                .split(" ")
                .map((s) => s[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-bold">{entry.display_name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary">
                  <Trophy className="h-3 w-3" /> #{entry.position}
                </span>
                <span>{entry.hits_count} acertos</span>
                {entry.penalties_count > 0 && <span>{entry.penalties_count} pênaltis</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold gold-text tabular-nums">
                {entry.total_points}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                pontos
              </div>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico de palpites
          </h4>
          {predictions.isPending ? (
            <p className="px-2 text-sm text-muted-foreground">Carregando...</p>
          ) : predictions.isError ? (
            <p className="px-2 text-sm text-muted-foreground">
              Não foi possível carregar os palpites.
            </p>
          ) : items.length === 0 ? (
            <p className="px-2 text-sm text-muted-foreground">Nenhum palpite registrado.</p>
          ) : (
            <ul className="space-y-2">
              {items.map((p) => {
                const { home, away } = teamsFor(p.match_id);
                const pts = p.points_awarded;
                const finished = p.match_status === "finished";
                return (
                  <li
                    key={p.match_id}
                    className="rounded-xl border border-border/60 bg-surface p-3"
                  >
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-lg">{home.flag}</span>
                      <span className="min-w-0 flex-1 truncate text-right">{home.name}</span>
                      <div className="flex shrink-0 items-center gap-2 px-2 font-display font-bold tabular-nums">
                        <span>{p.prediction_home}</span>
                        <span className="text-muted-foreground">×</span>
                        <span>{p.prediction_away}</span>
                      </div>
                      <span className="min-w-0 flex-1 truncate">{away.name}</span>
                      <span className="text-lg">{away.flag}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {finished
                          ? `Resultado oficial: ${p.result_home} × ${p.result_away}`
                          : p.match_status === "live"
                            ? "Em andamento"
                            : "A jogar"}
                      </span>
                      {pts !== null && (
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 font-semibold tabular-nums",
                            pts > 0
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/15 text-destructive",
                          )}
                        >
                          {pts > 0 ? `+${pts}` : "0"} pts
                        </span>
                      )}
                    </div>
                    {p.prediction_penalties_pick && (
                      <div className="mt-1.5 text-[11px] text-muted-foreground">
                        Pênaltis:{" "}
                        <span className="font-medium text-foreground">
                          {p.prediction_penalties_pick === "home" ? home.name : away.name}
                        </span>
                        {finished && p.result_penalties_winner && (
                          <>
                            {" "}
                            • venceu:{" "}
                            <span className="font-medium text-foreground">
                              {p.result_penalties_winner === "home" ? home.name : away.name}
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
