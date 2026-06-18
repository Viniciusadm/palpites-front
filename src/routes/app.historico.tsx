import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Check, X, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import {
  CURRENT_USER_ID,
  getSelecao,
  pointsFor,
} from "@/mocks/data";

export const Route = createFileRoute("/app/historico")({
  head: () => ({ meta: [{ title: "Histórico — Bolão Copa" }] }),
  component: HistoricoPage,
});

function HistoricoPage() {
  const partidas = useAppStore((s) => s.partidas);
  const palpites = useAppStore((s) => s.palpites);

  const meus = useMemo(
    () => palpites.filter((p) => p.userId === CURRENT_USER_ID),
    [palpites],
  );
  const matchById = useMemo(() => new Map(partidas.map((m) => [m.id, m])), [partidas]);

  const futuros = meus.filter((p) => matchById.get(p.matchId)?.status === "scheduled");
  const passados = meus
    .filter((p) => matchById.get(p.matchId)?.status === "finished")
    .sort((a, b) => +new Date(matchById.get(b.matchId)!.date) - +new Date(matchById.get(a.matchId)!.date));

  let acertos = 0;
  let erros = 0;
  let pontos = 0;
  passados.forEach((p) => {
    const m = matchById.get(p.matchId)!;
    const pts = pointsFor(p, m);
    pontos += pts;
    if (pts > 0) acertos += 1;
    else erros += 1;
  });

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Histórico</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe seu desempenho ao longo do bolão.</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Pontos" value={pontos} color="text-primary" Icon={TrendingUp} />
        <Stat label="Acertos" value={acertos} color="text-success" Icon={Check} />
        <Stat label="Erros" value={erros} color="text-destructive" Icon={X} />
        <Stat label="Futuros" value={futuros.length} color="text-muted-foreground" Icon={Clock} />
      </div>

      {futuros.length > 0 && (
        <Section title="Palpites futuros">
          <ul className="space-y-2">
            {futuros.map((p) => {
              const m = matchById.get(p.matchId)!;
              const home = getSelecao(m.homeId);
              const away = getSelecao(m.awayId);
              return (
                <li key={p.matchId} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm">
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                    {new Date(m.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                  <span className="flex-1 truncate">
                    {home.flag} {home.nome} <span className="text-muted-foreground">vs</span> {away.nome} {away.flag}
                  </span>
                  <span className="font-display font-bold tabular-nums">{p.home} × {p.away}</span>
                </li>
              );
            })}
          </ul>
        </Section>
      )}

      <Section title="Palpites anteriores">
        <ul className="space-y-2">
          {passados.map((p) => {
            const m = matchById.get(p.matchId)!;
            const pts = pointsFor(p, m);
            const home = getSelecao(m.homeId);
            const away = getSelecao(m.awayId);
            return (
              <li
                key={p.matchId}
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card p-3 text-sm",
                  pts === 10 && "border-success/40",
                  pts === 5 && "border-primary/40",
                  pts === 0 && "border-border",
                )}
              >
                <div
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full",
                    pts > 0 ? "bg-success/20 text-success" : "bg-destructive/15 text-destructive",
                  )}
                >
                  {pts > 0 ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {home.flag} {home.nome} <span className="text-muted-foreground">vs</span> {away.nome} {away.flag}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    Palpite: <span className="text-foreground">{p.home} × {p.away}</span> · Real:{" "}
                    <span className="text-foreground">{m.homeScore} × {m.awayScore}</span>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-semibold tabular-nums",
                    pts === 10 && "bg-success/20 text-success",
                    pts === 5 && "bg-primary/20 text-primary",
                    pts === 0 && "bg-muted text-muted-foreground",
                  )}
                >
                  {pts > 0 ? `+${pts}` : "0"} pts
                </span>
              </li>
            );
          })}
        </ul>
      </Section>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  Icon,
}: {
  label: string;
  value: number;
  color: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {label}
        <Icon className={cn("h-4 w-4", color)} />
      </div>
      <div className={cn("mt-2 font-display text-2xl font-bold tabular-nums", color)}>{value}</div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      {children}
    </section>
  );
}
