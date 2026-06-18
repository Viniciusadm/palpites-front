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
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam } from "@/api/teams";
import type { TeamResponse } from "@/api/types";

export const Route = createFileRoute("/admin/selecoes")({
  head: () => ({ meta: [{ title: "Admin · Seleções" }] }),
  component: SelecoesAdmin,
});

function SelecoesAdmin() {
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
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Bandeira</th>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="px-4 py-3 text-left">Código</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {list.map((t) => (
                <tr key={t.id} className="border-t border-border/60 hover:bg-surface/50">
                  <td className="px-4 py-3 text-2xl">{t.flag_emoji ?? "🏳️"}</td>
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      {t.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button size="icon" variant="ghost" onClick={() => startEdit(t)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(t)}
                      disabled={deleteTeam.isPending}
                      className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
