import { createFileRoute } from "@tanstack/react-router";
import { Copy, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { BOLAO_LINK, CURRENT_USER_ID } from "@/mocks/data";

export const Route = createFileRoute("/app/participantes")({
  head: () => ({ meta: [{ title: "Participantes — Bolão Copa" }] }),
  component: ParticipantesPage,
});

function ParticipantesPage() {
  const participantes = useAppStore((s) => s.participantes);
  const remove = useAppStore((s) => s.removeParticipante);
  const me = participantes.find((p) => p.id === CURRENT_USER_ID);
  const isOwner = !!me?.isOwner;

  const copy = async () => {
    await navigator.clipboard.writeText(BOLAO_LINK);
    toast.success("Link de convite copiado!");
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Participantes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {participantes.length} pessoas no bolão.
          </p>
        </div>
        {isOwner && (
          <Button onClick={copy} className="gold-gradient text-primary-foreground hover:opacity-90">
            <Copy className="mr-1.5 h-4 w-4" /> Copiar convite
          </Button>
        )}
      </header>

      <ul className="grid gap-2.5 sm:grid-cols-2">
        {participantes.map((p) => (
          <li
            key={p.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary text-sm font-bold text-primary">
              {p.nome.split(" ").map((s) => s[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold">{p.nome}</span>
                {p.isOwner && (
                  <span className="rounded-md bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                    ADMIN
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className={p.active ? "text-success" : "text-muted-foreground"}>
                  ● {p.active ? "Ativo" : "Inativo"}
                </span>
                <span>·</span>
                <span>
                  Entrou em{" "}
                  {new Date(p.joinedAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
            {isOwner && !p.isOwner && (
              <Button
                onClick={() => {
                  remove(p.id);
                  toast.success(`${p.nome} foi removido`);
                }}
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                aria-label="Remover participante"
              >
                <UserMinus className="h-4 w-4" />
              </Button>
            )}
          </li>
        ))}
      </ul>

      {participantes.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">Ainda não há participantes.</p>
        </div>
      )}
    </div>
  );
}
