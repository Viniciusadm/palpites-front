import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, Lock, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { usePools, useUpdatePool, useLeavePool } from "@/api/pools";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/api/notifications";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationPreference } from "@/api/types";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Bolão Copa" }] }),
  component: ConfiguracoesPage,
});

function label(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ConfiguracoesPage() {
  const navigate = useNavigate();
  const poolId = useAuthStore((s) => s.poolId) ?? "";
  const userId = useAuthStore((s) => s.userId);
  const pools = usePools();
  const pool = pools.data?.find((p) => p.id === poolId);
  const isOwner = pool?.owner_user_id === userId;

  const updatePool = useUpdatePool(poolId);
  const leavePool = useLeavePool(poolId);
  const prefs = useNotificationPreferences(poolId);
  const updatePrefs = useUpdateNotificationPreferences(poolId);

  const [name, setName] = useState("");
  const [rankingPublic, setRankingPublic] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (!pool) return;
    setName(pool.name);
    setRankingPublic(pool.ranking_public);
    setIsPrivate(pool.visibility === "private");
  }, [pool]);

  const saveSettings = () => {
    if (!pool) return;
    if (!name.trim()) {
      toast.error("Dê um nome ao bolão");
      return;
    }
    updatePool.mutate(
      {
        name: name.trim(),
        visibility: isPrivate ? "private" : "public",
        ranking_public: rankingPublic,
        prediction_lock_offset_minutes: pool.prediction_lock_offset_minutes,
        status: pool.status,
      },
      {
        onSuccess: () => toast.success("Configurações salvas"),
        onError: (error) =>
          toast.error(error instanceof Error ? error.message : "Não foi possível salvar"),
      },
    );
  };

  const togglePref = (pref: NotificationPreference) => {
    const next = (prefs.data ?? []).map((p) => ({
      type: p.type,
      channel: p.channel,
      enabled: p.id === pref.id ? !p.enabled : p.enabled,
    }));
    updatePrefs.mutate(next, {
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível atualizar"),
    });
  };

  const leave = () => {
    leavePool.mutate(undefined, {
      onSuccess: () => {
        toast.success("Você saiu do bolão");
        navigate({ to: "/" });
      },
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível sair"),
    });
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ajustes do bolão e da sua conta.</p>
      </header>

      <div className="space-y-4">
        <Card>
          <h2 className="font-display text-base font-semibold">Bolão</h2>
          {!isOwner && (
            <p className="mt-1 text-xs text-muted-foreground">
              Apenas o administrador pode alterar estes ajustes.
            </p>
          )}
          <div className="mt-4 space-y-2">
            <Label htmlFor="bn">Nome do bolão</Label>
            <Input
              id="bn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isOwner}
              className="h-11"
            />
          </div>
          <div className="mt-4 space-y-3">
            <Row
              icon={Eye}
              label="Mostrar ranking publicamente"
              checked={rankingPublic}
              onChange={setRankingPublic}
              disabled={!isOwner}
            />
            <Row
              icon={Lock}
              label="Bolão privado (somente por convite)"
              checked={isPrivate}
              onChange={setIsPrivate}
              disabled={!isOwner}
            />
          </div>
          {isOwner && (
            <Button
              onClick={saveSettings}
              disabled={updatePool.isPending}
              className="mt-4 gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              {updatePool.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold">Notificações</h2>
          {prefs.isPending ? (
            <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>
          ) : prefs.isError ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Não foi possível carregar as preferências.
            </p>
          ) : (prefs.data ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">Nenhuma preferência disponível.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {prefs.data!.map((p) => (
                <Row
                  key={p.id}
                  label={`${label(p.type)} · ${label(p.channel)}`}
                  checked={p.enabled}
                  onChange={() => togglePref(p)}
                  disabled={updatePrefs.isPending}
                />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="font-display text-base font-semibold text-destructive">Zona de risco</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Você pode sair do bolão a qualquer momento. Seus palpites permanecerão visíveis no
            histórico.
          </p>
          <Button
            onClick={leave}
            disabled={leavePool.isPending}
            variant="outline"
            className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            {leavePool.isPending ? "Saindo..." : "Sair do bolão"}
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
  disabled,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface px-3 py-2.5">
      <div className="flex items-center gap-3 text-sm">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        {label}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
