import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { computeRanking, CURRENT_USER_ID } from "@/mocks/data";
import { useAppStore } from "@/store/app-store";
import { ParticipantModal } from "@/components/participant-modal";

export const Route = createFileRoute("/app/ranking")({
  head: () => ({ meta: [{ title: "Ranking — Bolão Copa" }] }),
  component: RankingPage,
});

function RankingPage() {
  // Recompute whenever palpites/partidas change.
  const partidas = useAppStore((s) => s.partidas);
  const palpites = useAppStore((s) => s.palpites);
  const participantes = useAppStore((s) => s.participantes);
  const ranking = useMemo(() => computeRanking(), [partidas, palpites, participantes]);
  const [openId, setOpenId] = useState<string | null>(null);

  const podium = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Ranking</h1>
        <p className="mt-1 text-sm text-muted-foreground">Classificação geral do bolão.</p>
      </header>

      {/* Podium */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {podium.map((row, i) => {
          const isMe = row.participante.id === CURRENT_USER_ID;
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
              key={row.participante.id}
              onClick={() => setOpenId(row.participante.id)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all hover:border-primary/60",
                colors[i],
                i === 0 && "glow-gold",
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-display text-3xl font-bold tabular-nums text-muted-foreground">
                  #{i + 1}
                </span>
                {icons[i]}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-xs font-bold text-primary">
                  {row.participante.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">
                    {row.participante.nome}
                    {isMe && <span className="ml-1 text-[10px] text-primary">(você)</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{row.acertos} acertos</div>
                </div>
              </div>
              <div className="mt-4 font-display text-3xl font-bold gold-text tabular-nums">
                {row.pontos} <span className="text-sm font-medium text-muted-foreground">pts</span>
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
            {rest.map((row, i) => {
              const isMe = row.participante.id === CURRENT_USER_ID;
              return (
                <tr
                  key={row.participante.id}
                  onClick={() => setOpenId(row.participante.id)}
                  className={cn(
                    "cursor-pointer border-t border-border/60 transition-colors hover:bg-surface",
                    isMe && "bg-primary/5",
                  )}
                >
                  <td className="px-3 py-3 font-display font-semibold tabular-nums text-muted-foreground sm:px-4">
                    {i + 4}
                  </td>
                  <td className="px-3 py-3 sm:px-4">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-[11px] font-bold text-primary">
                        {row.participante.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
                      </div>
                      <span className="truncate font-medium">
                        {row.participante.nome}
                        {isMe && <span className="ml-1 text-[10px] text-primary">(você)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground sm:px-4">
                    {row.acertos}
                  </td>
                  <td className="px-3 py-3 text-right font-display font-bold tabular-nums text-primary sm:px-4">
                    {row.pontos}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ParticipantModal participantId={openId} onClose={() => setOpenId(null)} />
    </div>
  );
}
