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
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";
import type { Selecao } from "@/mocks/data";

export const Route = createFileRoute("/admin/selecoes")({
  head: () => ({ meta: [{ title: "Admin · Seleções" }] }),
  component: SelecoesAdmin,
});

function SelecoesAdmin() {
  const selecoes = useAppStore((s) => s.selecoes);
  const add = useAppStore((s) => s.addSelecao);
  const update = useAppStore((s) => s.updateSelecao);
  const del = useAppStore((s) => s.deleteSelecao);

  const [editing, setEditing] = useState<Selecao | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ nome: "", flag: "", grupo: "A" });

  const startCreate = () => {
    setEditing(null);
    setForm({ nome: "", flag: "", grupo: "A" });
    setOpen(true);
  };
  const startEdit = (s: Selecao) => {
    setEditing(s);
    setForm({ nome: s.nome, flag: s.flag, grupo: s.grupo });
    setOpen(true);
  };
  const save = () => {
    if (!form.nome.trim()) return toast.error("Informe o nome");
    if (editing) {
      update(editing.id, form);
      toast.success("Seleção atualizada");
    } else {
      add(form);
      toast.success("Seleção criada");
    }
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Seleções</h1>
          <p className="text-xs text-muted-foreground">{selecoes.length} cadastradas</p>
        </div>
        <Button onClick={startCreate} className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> Nova seleção
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Bandeira</th>
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">Grupo</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {selecoes.map((s) => (
              <tr key={s.id} className="border-t border-border/60 hover:bg-surface/50">
                <td className="px-4 py-3 text-2xl">{s.flag}</td>
                <td className="px-4 py-3 font-medium">{s.nome}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                    {s.grupo}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => startEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      del(s.id);
                      toast.success("Seleção removida");
                    }}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar" : "Nova"} seleção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Bandeira (emoji)</Label>
                <Input value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })} placeholder="🇧🇷" />
              </div>
              <div className="space-y-1.5">
                <Label>Grupo</Label>
                <Input value={form.grupo} onChange={(e) => setForm({ ...form, grupo: e.target.value.toUpperCase() })} maxLength={1} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} className="gold-gradient text-primary-foreground hover:opacity-90">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
