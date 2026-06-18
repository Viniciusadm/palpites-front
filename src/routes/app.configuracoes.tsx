import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Lock, Eye, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BOLAO_NAME } from "@/mocks/data";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Bolão Copa" }] }),
  component: ConfiguracoesPage,
});

function ConfiguracoesPage() {
  const [name, setName] = useState(BOLAO_NAME);
  const [notif, setNotif] = useState(true);
  const [priv, setPriv] = useState(false);
  const [public_, setPublic] = useState(true);

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajustes do bolão e da sua conta.</p>
      </header>

      <div className="space-y-4">
        <Card>
          <h2 className="font-display text-base font-semibold">Bolão</h2>
          <div className="mt-4 space-y-2">
            <Label htmlFor="bn">Nome do bolão</Label>
            <Input id="bn" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
          </div>
          <Button
            onClick={() => toast.success("Configurações salvas")}
            className="mt-4 gold-gradient font-semibold text-primary-foreground hover:opacity-90"
          >
            Salvar alterações
          </Button>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold">Preferências</h2>
          <div className="mt-4 space-y-3">
            <Row icon={Bell} label="Notificações de novos jogos" checked={notif} onChange={setNotif} />
            <Row icon={Eye} label="Mostrar ranking publicamente" checked={public_} onChange={setPublic} />
            <Row icon={Lock} label="Bolão privado (somente por convite)" checked={priv} onChange={setPriv} />
          </div>
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-destructive">Zona de risco</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você pode sair do bolão a qualquer momento. Seus palpites permanecerão visíveis no histórico.
          </p>
          <Button variant="outline" className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="mr-1.5 h-4 w-4" /> Sair do bolão
          </Button>
        </Card>
      </div>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-border bg-card p-5">{children}</div>;
}

function Row({
  icon: Icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
      <div className="flex items-center gap-3 text-sm">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
