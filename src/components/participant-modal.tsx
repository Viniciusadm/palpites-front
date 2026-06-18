import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppStore } from "@/store/app-store";
import {
  computeRanking,
  getSelecao,
  pointsFor,
  type Partida,
  type Palpite,
} from "@/mocks/data";
import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

export function ParticipantModal({
  participantId,
  onClose,
}: {
  participantId: string | null;
  onClose: () => void;
}) {
  const partidas = useAppStore((s) => s.partidas);
  const palpites = useAppStore((s) => s.palpites);

  const data = useMemo(() => {
    if (!participantId) return null;
    const ranking = computeRanking();
    const idx = ranking.findIndex((r) => r.participante.id === participantId);
    if (idx < 0) return null;
    const row = ranking[idx];
    const userPalpites = palpites.filter((p) => p.userId === participantId);
    const byMatch = new Map<string, Palpite>(userPalpites.map((p) => [p.matchId, p]));
    const items = partidas
      .filter((m) => byMatch.has(m.id))
      .sort((a, b) => +new Date(b.date) - +new Date(a.date));
    return { row, items, byMatch, position: idx + 1 };
  }, [participantId, partidas, palpites]);

  if (!data) {
    return (
      <Dialog open={!!participantId} onOpenChange={(o) => !o && onClose()}>
        <DialogContent />
      </Dialog>
    );
  }

  const { row, items, byMatch, position } = data;

  return (
    <Dialog open={!!participantId} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl border-border bg-card p-0">
        <div className="border-b border-border p-6">
          <DialogHeader>
            <DialogTitle className="sr-only">{row.participante.nome}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-base font-bold text-primary">
              {row.participante.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl font-bold">{row.participante.nome}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/15 px-2 py-0.5 font-semibold text-primary">
                  <Trophy className="h-3 w-3" /> #{position}
                </span>
                <span>{row.acertos} acertos</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-bold gold-text tabular-nums">{row.pontos}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">pontos</div>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4">
          <h4 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Histórico de palpites
          </h4>
          <ul className="space-y-2">
            {items.map((m) => {
              const p = byMatch.get(m.id)!;
              const pts = m.status === "finished" ? pointsFor(p, m) : null;
              const home = getSelecao(m.homeId);
              const away = getSelecao(m.awayId);
              return (
                <li key={m.id} className="rounded-xl border border-border/60 bg-surface p-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-lg">{home.flag}</span>
                    <span className="min-w-0 flex-1 truncate text-right">{home.nome}</span>
                    <div className="flex shrink-0 items-center gap-2 px-2 font-display font-bold tabular-nums">
                      <span className={cn(pts === 10 && "text-success")}>{p.home}</span>
                      <span className="text-muted-foreground">×</span>
                      <span className={cn(pts === 10 && "text-success")}>{p.away}</span>
                    </div>
                    <span className="min-w-0 flex-1 truncate">{away.nome}</span>
                    <span className="text-lg">{away.flag}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>
                      {m.status === "finished"
                        ? `Resultado oficial: ${m.homeScore} × ${m.awayScore}`
                        : m.status === "live"
                          ? "Em andamento"
                          : "A jogar"}
                    </span>
                    {pts !== null && (
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 font-semibold tabular-nums",
                          pts === 10 && "bg-success/20 text-success",
                          pts === 5 && "bg-primary/20 text-primary",
                          pts === 0 && "bg-destructive/15 text-destructive",
                        )}
                      >
                        {pts > 0 ? `+${pts}` : "0"} pts
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
