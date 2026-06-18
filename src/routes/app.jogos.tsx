import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { MatchCard } from "@/components/match-card";
import { useAppStore } from "@/store/app-store";

export const Route = createFileRoute("/app/jogos")({
  head: () => ({ meta: [{ title: "Jogos — Bolão Copa" }] }),
  component: JogosPage,
});

function JogosPage() {
  const partidas = useAppStore((s) => s.partidas);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof partidas>();
    [...partidas]
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
  }, [partidas]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Jogos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Calendário completo da competição.</p>
      </header>
      <div className="space-y-8">
        {grouped.map(([date, items]) => (
          <section key={date}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {date}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((m) => (
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
