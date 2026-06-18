import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarX } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCard } from "@/components/match-card";
import { useMatches } from "@/api/matches";
import { useTeams } from "@/api/teams";
import { useTournamentDetail } from "@/api/tournaments";
import { useMyPredictions, useSavePrediction } from "@/api/predictions";
import { usePools } from "@/api/pools";
import { matchToPartida, teamToSelecao } from "@/api/adapters";
import { useAuthStore } from "@/store/auth-store";
import type { Selecao } from "@/api/types";

export const Route = createFileRoute("/app/palpites")({
  head: () => ({ meta: [{ title: "Meus palpites — Bolão Copa" }] }),
  component: PalpitesPage,
});

type Tab = "proximos" | "meus" | "encerrados";

const TBD: Selecao = { id: "", nome: "A definir", flag: "🏳️", grupo: "" };

function PalpitesPage() {
  const poolId = useAuthStore((s) => s.poolId) ?? "";
  const pools = usePools();
  const tournamentId = pools.data?.find((p) => p.id === poolId)?.tournament_id ?? "";

  const tournament = useTournamentDetail(tournamentId);
  const teams = useTeams();
  const matches = useMatches(tournamentId);
  const predictions = useMyPredictions(poolId);
  const savePrediction = useSavePrediction(poolId);

  const [tab, setTab] = useState<Tab>("proximos");

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

  const predictionByMatch = useMemo(() => {
    const map = new Map<string, { home: number; away: number; points: number | null }>();
    (predictions.data ?? []).forEach((p) =>
      map.set(p.match_id, { home: p.home_score, away: p.away_score, points: p.points_awarded }),
    );
    return map;
  }, [predictions.data]);

  const partidas = useMemo(
    () => (matches.data ?? []).map((m) => matchToPartida(m, stageNameById.get(m.stage_id) ?? "")),
    [matches.data, stageNameById],
  );

  const filtered = useMemo(() => {
    if (tab === "encerrados") return partidas.filter((p) => p.status === "finished");
    if (tab === "meus") return partidas.filter((p) => predictionByMatch.has(p.id));
    return partidas.filter((p) => p.status !== "finished");
  }, [tab, partidas, predictionByMatch]);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof partidas>();
    [...filtered]
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))
      .forEach((m) => {
        const key = new Date(m.date).toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "long",
        });
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(m);
      });
    return Array.from(map.entries());
  }, [filtered]);

  const isPending =
    tournament.isPending || teams.isPending || matches.isPending || predictions.isPending;
  const isError = teams.isError || matches.isError || predictions.isError;

  const save = (matchId: string, home: number, away: number) => {
    savePrediction.mutate(
      { matchId, body: { home_score: home, away_score: away } },
      {
        onSuccess: () => toast.success("Palpite salvo!"),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Não foi possível salvar"),
      },
    );
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Meus palpites</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Registre seus placares antes do apito inicial.
        </p>
      </header>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="bg-surface">
          <TabsTrigger value="proximos">Próximos</TabsTrigger>
          <TabsTrigger value="meus">Meus palpites</TabsTrigger>
          <TabsTrigger value="encerrados">Encerrados</TabsTrigger>
        </TabsList>
      </Tabs>

      {isPending ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-2xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="mt-6 rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar os palpites.</p>
          <button
            onClick={() => {
              matches.refetch();
              teams.refetch();
              predictions.refetch();
            }}
            className="mt-4 inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {grouped.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
              <CalendarX className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhum jogo nessa categoria.</p>
            </div>
          )}
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
                    prediction={predictionByMatch.get(m.id)}
                    onSave={(home, away) => save(m.id, home, away)}
                    saving={savePrediction.isPending && savePrediction.variables?.matchId === m.id}
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
