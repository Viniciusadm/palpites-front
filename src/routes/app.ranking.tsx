import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMembers, usePools, useRanking } from "@/api/pools";
import { useAuthStore } from "@/store/auth-store";
import { ParticipantModal } from "@/components/participant-modal";
import { Skeleton } from "@/components/ui/skeleton";
import type { RankingEntry } from "@/api/types";

export const Route = createFileRoute("/app/ranking")({
  head: () => ({ meta: [{ title: "Ranking — Bolão Copa" }] }),
  component: RankingPage,
});

function RankingPage() {
  const poolId = useAuthStore((s) => s.poolId) ?? "";
  const userId = useAuthStore((s) => s.userId);
  const pools = usePools();
  const ranking = useRanking(poolId);
  const members = useMembers(poolId);
  const [selected, setSelected] = useState<RankingEntry | null>(null);

  const tournamentId = pools.data?.find((p) => p.id === poolId)?.tournament_id ?? "";

  const myMemberIds = useMemo(() => {
    const set = new Set<string>();
    (members.data ?? []).forEach((m) => {
      if (m.user_id === userId) set.add(m.id);
    });
    return set;
  }, [members.data, userId]);

  const standings = ranking.data ?? [];
  const podium = standings.slice(0, 3);
  const rest = standings.slice(3);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">Classificação geral do bolão.</p>
      </header>

      {ranking.isPending ? (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      ) : ranking.isError ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar o ranking.</p>
          <button
            onClick={() => ranking.refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      ) : standings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Ranking ainda não disponível.</p>
        </div>
      ) : (
        <>
          <div className="mb-8 grid gap-3 sm:grid-cols-3">
            {podium.map((row, i) => {
              const isMe = myMemberIds.has(row.pool_member_id);
              const colors = [
                "border-primary/60 bg-primary/10",
                "border-border bg-card",
                "border-border bg-card",
              ];
              const icons = [
                <Trophy key="t" className="h-5 w-5 text-primary" />,
                <Medal key="m" className="h-5 w-5 text-muted-foreground" />,
                <Award key="a" className="h-5 w-5 text-muted-foreground" />,
              ];
              return (
                <button
                  key={row.pool_member_id}
                  onClick={() => setSelected(row)}
                  className={cn(
                    "rounded-2xl border p-5 text-left transition-all hover:border-primary/60",
                    colors[i],
                    i === 0 && "glow-gold",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-3xl font-bold tabular-nums text-muted-foreground">
                      #{row.position}
                    </span>
                    {icons[i]}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
                      {row.display_name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">
                        {row.display_name}
                        {isMe && <span className="ml-1 text-[10px] text-primary">(você)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{row.hits_count} acertos</div>
                    </div>
                  </div>
                  <div className="mt-4 font-display text-3xl font-bold gold-text tabular-nums">
                    {row.total_points}{" "}
                    <span className="text-sm font-medium text-muted-foreground">pts</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full min-w-[320px] text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left sm:px-4">#</th>
                  <th className="px-3 py-3 text-left sm:px-4">Participante</th>
                  <th className="px-3 py-3 text-right sm:px-4">Acertos</th>
                  <th className="px-3 py-3 text-right sm:px-4">Pontos</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((row) => {
                  const isMe = myMemberIds.has(row.pool_member_id);
                  return (
                    <tr
                      key={row.pool_member_id}
                      onClick={() => setSelected(row)}
                      className={cn(
                        "cursor-pointer border-t border-border/60 transition-colors hover:bg-surface",
                        isMe && "bg-primary/5",
                      )}
                    >
                      <td className="px-3 py-3 font-display font-semibold tabular-nums text-muted-foreground sm:px-4">
                        {row.position}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                            {row.display_name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <span className="truncate font-medium">
                            {row.display_name}
                            {isMe && <span className="ml-1 text-[10px] text-primary">(você)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted-foreground sm:px-4">
                        {row.hits_count}
                      </td>
                      <td className="px-3 py-3 text-right font-display font-bold tabular-nums text-primary sm:px-4">
                        {row.total_points}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <ParticipantModal
        entry={selected}
        poolId={poolId}
        tournamentId={tournamentId}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
