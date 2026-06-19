import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Check, Copy, Trophy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreatePool } from "@/api/pools";
import { getToken } from "@/api/session";
import { buildInviteUrl } from "@/lib/invite";
import { useOnline } from "@/hooks/use-online";
import { useAuthStore } from "@/store/auth-store";

export const Route = createFileRoute("/bolao/criar")({
  head: () => ({ meta: [{ title: "Criar bolão — Bolão Copa" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined" && !getToken()) {
      throw redirect({ to: "/login" });
    }
  },
  component: CriarBolao,
});

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID;

function CriarBolao() {
  const [nome, setNome] = useState("");
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const setPoolId = useAuthStore((s) => s.setPoolId);
  const online = useOnline();
  const createPool = useCreatePool();

  const handleCreate = () => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
    if (!nome.trim()) {
      toast.error("Dê um nome ao seu bolão");
      return;
    }
    createPool.mutate(
      { name: nome.trim(), tournament_id: tournamentId },
      {
        onSuccess: (pool) => {
          setPoolId(pool.id);
          setInviteCode(pool.invite_code);
          toast.success("Bolão criado com sucesso!");
        },
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Não foi possível criar o bolão"),
      },
    );
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(buildInviteUrl(inviteCode));
      setCopied(true);
      toast.success("Link copiado!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      {!inviteCode ? (
        <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="grid h-12 w-12 place-items-center rounded-2xl gold-gradient">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Criar novo bolão</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Dê um nome para o seu bolão. Você poderá convidar participantes em seguida.
          </p>

          <div className="mt-8 space-y-2">
            <Label htmlFor="nome">Nome do bolão</Label>
            <Input
              id="nome"
              placeholder="Ex: Bolão da firma 2026"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="h-12 text-base"
            />
          </div>

          <Button
            onClick={handleCreate}
            disabled={createPool.isPending || !online}
            className="mt-6 h-12 w-full gold-gradient text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            {createPool.isPending ? "Criando..." : "Criar bolão"}
          </Button>
        </div>
      ) : (
        <div className="mt-10 rounded-3xl border border-primary/40 bg-card p-6 sm:p-8 glow-gold">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-success/20">
              <Check className="h-5 w-5 text-success" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">Pronto! "{nome}" está no ar</h2>
              <p className="text-sm text-muted-foreground">Compartilhe o link de convite abaixo</p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-border bg-input p-2">
            <code className="flex-1 truncate px-3 text-sm font-semibold tracking-wider text-foreground">
              {buildInviteUrl(inviteCode)}
            </code>
            <Button
              onClick={copyCode}
              size="sm"
              className="gold-gradient text-primary-foreground hover:opacity-90"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1.5 hidden sm:inline">{copied ? "Copiado" : "Copiar"}</span>
            </Button>
          </div>

          <Button
            onClick={() => navigate({ to: "/app/palpites" })}
            variant="outline"
            className="mt-4 w-full border-primary/40 hover:bg-primary/10"
          >
            Ir para o bolão →
          </Button>
        </div>
      )}
    </main>
  );
}
