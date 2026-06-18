import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/match-card";
import { useAppStore } from "@/store/app-store";
import { CURRENT_USER_ID } from "@/mocks/data";
import { CalendarX } from "lucide-react";

export const Route = createFileRoute("/app/palpites")({
  head: () => ({ meta: [{ title: "Meus palpites — Bolão Copa" }] }),
  component: PalpitesPage,
});

type Tab = "proximos" | "meus" | "encerrados";

function PalpitesPage() {
  const partidas = useAppStore((s) => s.partidas);
  const palpites = useAppStore((s) => s.palpites);
  const [tab, setTab] = useState<Tab>("proximos");

  const filtered = useMemo(() => {
    if (tab === "encerrados") return partidas.filter((p) => p.status === "finished");
    if (tab === "meus") {
      const ids = new Set(palpites.filter((p) => p.userId === CURRENT_USER_ID).map((p) => p.matchId));
      return partidas.filter((p) => ids.has(p.id));
    }
    return partidas.filter((p) => p.status !== "finished");
  }, [tab, partidas, palpites]);

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
                <MatchCard key={m.id} match={m} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
