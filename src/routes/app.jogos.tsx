import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { CalendarX } from "lucide-react";
import { MatchCard } from "@/components/match-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeams } from "@/api/teams";
import { useMatches } from "@/api/matches";
import { useTournamentDetail } from "@/api/tournaments";
import { matchToPartida, teamToSelecao } from "@/api/adapters";
import { formatGroupDate } from "@/lib/datetime";
import type { Selecao } from "@/api/types";

export const Route = createFileRoute("/app/jogos")({
  head: () => ({ meta: [{ title: "Jogos — Bolão Copa" }] }),
  component: JogosPage,
});

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID;

const TBD: Selecao = { id: "", nome: "A definir", flag: "🏳️", grupo: "" };

function JogosPage() {
  const tournament = useTournamentDetail(tournamentId);
  const teams = useTeams();
  const matches = useMatches(tournamentId);

  const teamsById = useMemo(() => {
    const map = new Map<string, Selecao>();
    (teams.data ?? []).forEach((t) => map.set(t.id, teamToSelecao(t)));
    return map;
  }, [teams.data]);

  const stageNameById = useMemo(() => {
    const map = new Map<string, string>();
    (tournament.data?.stages ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [tournament.data]);

  const grouped = useMemo(() => {
    const partidas = (matches.data ?? []).map((m) =>
      matchToPartida(m, stageNameById.get(m.stage_id) ?? ""),
    );
    const map = new Map<string, typeof partidas>();
    [...partidas]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .forEach((m) => {
        const key = formatGroupDate(m.date);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      });
    return Array.from(map.entries());
  }, [matches.data, stageNameById]);

  const isPending = tournament.isPending || teams.isPending || matches.isPending;
  const isError = tournament.isError || teams.isError || matches.isError;

  const retry = () => {
    tournament.refetch();
    teams.refetch();
    matches.refetch();
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Jogos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Calendário completo da competição.</p>
      </header>

      {isPending ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar os jogos.</p>
          <button
            onClick={retry}
            className="mt-4 inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      ) : grouped.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <CalendarX className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Nenhum jogo cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([date, items]) => (
            <section key={date}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {date}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    home={teamsById.get(m.homeId) ?? TBD}
                    away={teamsById.get(m.awayId) ?? TBD}
                    editable={false}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
