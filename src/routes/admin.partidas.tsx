import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useTeams } from "@/api/teams";
import { useTournamentDetail } from "@/api/tournaments";
import { useMatches, useCreateMatch, useUpdateMatch, useDeleteMatch } from "@/api/matches";
import type { MatchResponse, MatchStatus, TeamResponse } from "@/api/types";

export const Route = createFileRoute("/admin/partidas")({
  head: () => ({ meta: [{ title: "Admin · Partidas" }] }),
  component: PartidasAdmin,
});

const tournamentId = import.meta.env.VITE_TOURNAMENT_ID;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PartidasAdmin() {
  const tournament = useTournamentDetail(tournamentId);
  const teams = useTeams();
  const matches = useMatches(tournamentId);
  const createMatch = useCreateMatch(tournamentId);
  const updateMatch = useUpdateMatch(tournamentId);
  const deleteMatch = useDeleteMatch(tournamentId);

  const [editing, setEditing] = useState<MatchResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    stageId: "",
    homeId: "",
    awayId: "",
    date: toLocalInput(new Date().toISOString()),
    status: "scheduled" as MatchStatus,
  });

  const teamList = teams.data ?? [];
  const stages = tournament.data?.stages ?? [];
  const matchList = matches.data ?? [];
  const saving = createMatch.isPending || updateMatch.isPending;

  const teamsById = useMemo(() => {
    const map = new Map<string, TeamResponse>();
    (teams.data ?? []).forEach((t) => map.set(t.id, t));
    return map;
  }, [teams.data]);

  const stageNameById = useMemo(() => {
    const map = new Map<string, string>();
    (tournament.data?.stages ?? []).forEach((s) => map.set(s.id, s.name));
    return map;
  }, [tournament.data]);

  const teamLabel = (id: string | null) => {
    const t = id ? teamsById.get(id) : undefined;
    return t ? `${t.flag_emoji ?? "🏳️"} ${t.name}` : "A definir";
  };

  const startCreate = () => {
    setEditing(null);
    setForm({
      stageId: stages[0]?.id ?? "",
      homeId: teamList[0]?.id ?? "",
      awayId: teamList[1]?.id ?? "",
      date: toLocalInput(new Date().toISOString()),
      status: "scheduled",
    });
    setOpen(true);
  };
  const startEdit = (m: MatchResponse) => {
    setEditing(m);
    setForm({
      stageId: m.stage_id,
      homeId: m.home_team_id ?? "",
      awayId: m.away_team_id ?? "",
      date: toLocalInput(m.kickoff_at),
      status: m.status,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.stageId) return toast.error("Escolha a fase");
    if (!form.homeId || !form.awayId) return toast.error("Escolha as seleções");
    if (form.homeId === form.awayId) return toast.error("Seleções devem ser diferentes");
    const kickoff_at = new Date(form.date).toISOString();
    const opts = {
      onSuccess: () => {
        toast.success(editing ? "Partida atualizada" : "Partida criada");
        setOpen(false);
      },
      onError: (error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível salvar"),
    };
    if (editing) {
      updateMatch.mutate(
        {
          matchId: editing.id,
          body: {
            stage_id: form.stageId,
            home_team_id: form.homeId,
            away_team_id: form.awayId,
            kickoff_at,
            status: form.status,
          },
        },
        opts,
      );
    } else {
      createMatch.mutate(
        {
          stage_id: form.stageId,
          home_team_id: form.homeId,
          away_team_id: form.awayId,
          kickoff_at,
        },
        opts,
      );
    }
  };

  const remove = (m: MatchResponse) => {
    deleteMatch.mutate(m.id, {
      onSuccess: () => toast.success("Partida removida"),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível remover"),
    });
  };

  const isPending = tournament.isPending || teams.isPending || matches.isPending;
  const isError = tournament.isError || teams.isError || matches.isError;

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Partidas</h1>
          <p className="text-xs text-muted-foreground">{matchList.length} cadastradas</p>
        </div>
        <Button
          onClick={startCreate}
          className="gold-gradient text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-1 h-4 w-4" /> Nova partida
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : isError ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar as partidas.</p>
          <button
            onClick={() => {
              tournament.refetch();
              teams.refetch();
              matches.refetch();
            }}
            className="mt-4 inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Mandante</th>
                <th className="px-4 py-3 text-left">Visitante</th>
                <th className="px-4 py-3 text-left">Fase</th>
                <th className="px-4 py-3 text-left">Data / Hora</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {matchList.map((m) => {
                const d = new Date(m.kickoff_at);
                return (
                  <tr key={m.id} className="border-t border-border/60 hover:bg-surface/50">
                    <td className="px-4 py-3">{teamLabel(m.home_team_id)}</td>
                    <td className="px-4 py-3">{teamLabel(m.away_team_id)}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {stageNameById.get(m.stage_id) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {d.toLocaleDateString("pt-BR")} ·{" "}
                      {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={m.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(m)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => remove(m)}
                        disabled={deleteMatch.isPending}
                        className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nova"} partida</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mandante</Label>
                <Select value={form.homeId} onValueChange={(v) => setForm({ ...form, homeId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.flag_emoji ?? "🏳️"} {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Visitante</Label>
                <Select value={form.awayId} onValueChange={(v) => setForm({ ...form, awayId: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamList.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.flag_emoji ?? "🏳️"} {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Data e horário</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Fase</Label>
                <Select
                  value={form.stageId}
                  onValueChange={(v) => setForm({ ...form, stageId: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {editing && (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as MatchStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Não iniciado</SelectItem>
                    <SelectItem value="live">Ao vivo</SelectItem>
                    <SelectItem value="finished">Encerrado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="gold-gradient text-primary-foreground hover:opacity-90"
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ status }: { status: MatchStatus }) {
  const map = {
    scheduled: { label: "Em breve", cls: "bg-primary/15 text-primary" },
    live: { label: "Ao vivo", cls: "bg-destructive/15 text-destructive" },
    finished: { label: "Encerrado", cls: "bg-muted text-muted-foreground" },
  } as const;
  const m = map[status];
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${m.cls}`}>{m.label}</span>;
}
