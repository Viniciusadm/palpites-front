import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, Lock, LogOut, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  usePools,
  useUpdatePool,
  useLeavePool,
  useScoringRules,
  useUpdateScoringRules,
} from "@/api/pools";
import { useNotificationPreferences, useUpdateNotificationPreferences } from "@/api/notifications";
import { useOnline } from "@/hooks/use-online";
import { useAuthStore } from "@/store/auth-store";
import type { NotificationPreference, ScoringRuleKey } from "@/api/types";

export const Route = createFileRoute("/app/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Bolão Copa" }] }),
  component: ConfiguracoesPage,
});

const SCORING_RULES: { key: ScoringRuleKey; label: string; help: string; fallback: number }[] = [
  {
    key: "exact_score",
    label: "Placar exato",
    help: "Quando o palpite acerta o placar exato da partida.",
    fallback: 10,
  },
  {
    key: "correct_outcome",
    label: "Acertar o resultado",
    help: "Quando acerta o vencedor (ou o empate), mas não o placar.",
    fallback: 5,
  },
  {
    key: "correct_goal_difference",
    label: "Acertar o saldo de gols",
    help: "Quando acerta o resultado e também a diferença de gols.",
    fallback: 0,
  },
];

const MIN_RULE_POINTS = 0;
const MAX_RULE_POINTS = 1000;

function label(value: string) {
  const text = value.replace(/_/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function ConfiguracoesPage() {
  const navigate = useNavigate();
  const poolId = useAuthStore((s) => s.poolId) ?? "";
  const userId = useAuthStore((s) => s.userId);
  const online = useOnline();
  const pools = usePools();
  const pool = pools.data?.find((p) => p.id === poolId);
  const isOwner = pool?.owner_user_id === userId;

  const updatePool = useUpdatePool(poolId);
  const leavePool = useLeavePool(poolId);
  const prefs = useNotificationPreferences(poolId);
  const updatePrefs = useUpdateNotificationPreferences(poolId);
  const scoringRules = useScoringRules(poolId);
  const updateScoring = useUpdateScoringRules(poolId);

  const [name, setName] = useState("");
  const [rankingPublic, setRankingPublic] = useState(true);
  const [isPrivate, setIsPrivate] = useState(false);
  const [points, setPoints] = useState<Record<ScoringRuleKey, string>>({
    exact_score: "10",
    correct_outcome: "5",
    correct_goal_difference: "0",
  });

  useEffect(() => {
    if (!pool) return;
    setName(pool.name);
    setRankingPublic(pool.ranking_public);
    setIsPrivate(pool.visibility === "private");
  }, [pool]);

  useEffect(() => {
    if (!scoringRules.data) return;
    setPoints(() => {
      const next = {} as Record<ScoringRuleKey, string>;
      for (const rule of SCORING_RULES) {
        const found = scoringRules.data!.find((r) => r.rule_key === rule.key);
        next[rule.key] = String(found?.points ?? rule.fallback);
      }
      return next;
    });
  }, [scoringRules.data]);

  const saveSettings = () => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
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

  const saveScoring = () => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
    const rules = [];
    for (const rule of SCORING_RULES) {
      const raw = points[rule.key].trim();
      const value = Number(raw);
      if (
        raw === "" ||
        !Number.isInteger(value) ||
        value < MIN_RULE_POINTS ||
        value > MAX_RULE_POINTS
      ) {
        toast.error(`"${rule.label}" deve ser um número inteiro entre 0 e 1000`);
        return;
      }
      rules.push({ rule_key: rule.key, points: value });
    }
    updateScoring.mutate(rules, {
      onSuccess: () => toast.success("Pontuação atualizada — ranking recalculado"),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível salvar"),
    });
  };

  const togglePref = (pref: NotificationPreference) => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
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
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
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
              disabled={updatePool.isPending || !online}
              className="mt-4 gold-gradient font-semibold text-primary-foreground hover:opacity-90"
            >
              {updatePool.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          )}
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-display text-base font-semibold">
            <Target className="h-4 w-4 text-muted-foreground" />
            Pontuação
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {isOwner
              ? "Defina quantos pontos cada acerto vale. Alterar recalcula o ranking."
              : "Apenas o administrador pode alterar estes ajustes."}
          </p>
          {scoringRules.isPending ? (
            <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>
          ) : scoringRules.isError ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Não foi possível carregar a pontuação.
            </p>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                {SCORING_RULES.map((rule) => (
                  <div key={rule.key} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <Label htmlFor={`pts-${rule.key}`}>{rule.label}</Label>
                      <Input
                        id={`pts-${rule.key}`}
                        type="number"
                        inputMode="numeric"
                        min={MIN_RULE_POINTS}
                        max={MAX_RULE_POINTS}
                        value={points[rule.key]}
                        onChange={(e) =>
                          setPoints((prev) => ({ ...prev, [rule.key]: e.target.value }))
                        }
                        disabled={!isOwner}
                        className="h-11 w-24 text-center"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{rule.help}</p>
                  </div>
                ))}
              </div>
              {isOwner && (
                <Button
                  onClick={saveScoring}
                  disabled={updateScoring.isPending || !online}
                  className="mt-4 gold-gradient font-semibold text-primary-foreground hover:opacity-90"
                >
                  {updateScoring.isPending ? "Salvando..." : "Salvar pontuação"}
                </Button>
              )}
            </>
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
                  disabled={updatePrefs.isPending || !online}
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={leavePool.isPending || !online}
                variant="outline"
                className="mt-4 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                {leavePool.isPending ? "Saindo..." : "Sair do bolão"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sair do bolão?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Seus palpites permanecerão visíveis no histórico.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={leave}
                  disabled={leavePool.isPending || !online}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Sair do bolão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
