import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useOnline } from "@/hooks/use-online";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/api/teams";
import type { TeamResponse } from "@/api/types";

export const Route = createFileRoute("/admin/selecoes")({
  head: () => ({ meta: [{ title: "Admin · Seleções" }] }),
  component: SelecoesAdmin,
});

function SelecoesAdmin() {
  const online = useOnline();
  const teams = useTeams();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  const [editing, setEditing] = useState<TeamResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", flag: "" });

  const list = teams.data ?? [];
  const saving = createTeam.isPending || updateTeam.isPending;

  const startCreate = () => {
    setEditing(null);
    setForm({ name: "", code: "", flag: "" });
    setOpen(true);
  };
  const startEdit = (t: TeamResponse) => {
    setEditing(t);
    setForm({ name: t.name, code: t.code, flag: t.flag_emoji ?? "" });
    setOpen(true);
  };

  const save = () => {
    if (!online) return toast.error("Sem conexão. Conecte-se para realizar esta ação.");
    if (!form.name.trim()) return toast.error("Informe o nome");
    if (!form.code.trim()) return toast.error("Informe o código");
    const body = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      flag_emoji: form.flag.trim() || null,
    };
    const opts = {
      onSuccess: () => {
        toast.success(editing ? "Seleção atualizada" : "Seleção criada");
        setOpen(false);
      },
      onError: (error: unknown) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível salvar"),
    };
    if (editing) updateTeam.mutate({ id: editing.id, body }, opts);
    else createTeam.mutate(body, opts);
  };

  const remove = (t: TeamResponse) => {
    if (!online) {
      toast.error("Sem conexão. Conecte-se para realizar esta ação.");
      return;
    }
    deleteTeam.mutate(t.id, {
      onSuccess: () => toast.success("Seleção removida"),
      onError: (error) =>
        toast.error(error instanceof Error ? error.message : "Não foi possível remover"),
    });
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Seleções</h1>
          <p className="text-xs text-muted-foreground">{list.length} cadastradas</p>
        </div>
        <Button
          onClick={startCreate}
          disabled={!online}
          className="gold-gradient text-primary-foreground hover:opacity-90"
        >
          <Plus className="mr-1 h-4 w-4" /> Nova seleção
        </Button>
      </div>

      {teams.isPending ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : teams.isError ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Não foi possível carregar as seleções.</p>
          <button
            onClick={() => teams.refetch()}
            className="mt-4 inline-flex items-center justify-center rounded-md gold-gradient px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma seleção cadastrada.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <article
              key={t.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40"
            >
              <span className="text-3xl leading-none">{t.flag_emoji ?? "🏳️"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.name}</p>
                <span className="mt-0.5 inline-block rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                  {t.code}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => startEdit(t)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => remove(t)}
                  disabled={deleteTeam.isPending || !online}
                  className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nova"} seleção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Código</Label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="BRA"
                  maxLength={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Bandeira (emoji)</Label>
                <Input
                  value={form.flag}
                  onChange={(e) => setForm({ ...form, flag: e.target.value })}
                  placeholder="🇧🇷"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={save}
              disabled={saving || !online}
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
