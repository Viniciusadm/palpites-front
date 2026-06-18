import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/bolao/entrar")({
  head: () => ({
    meta: [{ title: "Entrar em bolão — Bolão Copa" }],
  }),
  component: EntrarBolao,
});

function EntrarBolao() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!code.trim()) {
      toast.error("Informe o código ou link do bolão");
      return;
    }
    toast.success("Bem-vindo ao bolão!");
    navigate({ to: "/app/palpites" });
  };

  return (
    <main className="mx-auto min-h-screen max-w-xl px-5 py-8">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>

      <div className="mt-10 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
          <KeyRound className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-bold sm:text-3xl">Entrar em um bolão</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cole o link de convite ou digite o código que você recebeu.
        </p>

        <div className="mt-8 space-y-2">
          <Label htmlFor="code">Código ou link</Label>
          <Input
            id="code"
            placeholder="COPA-2026-XK7 ou https://boloes.app/j/..."
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            className="h-12 text-base"
          />
        </div>

        <Button onClick={handleJoin} className="mt-6 h-12 w-full gold-gradient text-base font-semibold text-primary-foreground hover:opacity-90">
          Entrar no bolão
        </Button>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Não tem um código?{" "}
          <Link to="/bolao/criar" className="text-primary hover:underline">
            Crie seu próprio bolão
          </Link>
        </p>
      </div>
    </main>
  );
}
