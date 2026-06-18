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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore } from "@/store/app-store";
import { toast } from "sonner";
import type { Partida, MatchStatus } from "@/mocks/data";
import { getSelecao } from "@/mocks/data";

export const Route = createFileRoute("/admin/partidas")({
  head: () => ({ meta: [{ title: "Admin · Partidas" }] }),
  component: PartidasAdmin,
});

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PartidasAdmin() {
  const partidas = useAppStore((s) => s.partidas);
  const selecoes = useAppStore((s) => s.selecoes);
  const add = useAppStore((s) => s.addPartida);
  const update = useAppStore((s) => s.updatePartida);
  const del = useAppStore((s) => s.deletePartida);

  const [editing, setEditing] = useState<Partida | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    homeId: "",
    awayId: "",
    date: toLocalInput(new Date().toISOString()),
    status: "scheduled" as MatchStatus,
    fase: "Grupo A",
  });

  const startCreate = () => {
    setEditing(null);
    setForm({
      homeId: selecoes[0]?.id ?? "",
      awayId: selecoes[1]?.id ?? "",
      date: toLocalInput(new Date().toISOString()),
      status: "scheduled",
      fase: "Grupo A",
    });
    setOpen(true);
  };
  const startEdit = (m: Partida) => {
    setEditing(m);
    setForm({
      homeId: m.homeId,
      awayId: m.awayId,
      date: toLocalInput(m.date),
      status: m.status,
      fase: m.fase,
    });
    setOpen(true);
  };
  const save = () => {
    if (!form.homeId || !form.awayId) return toast.error("Escolha as seleções");
    if (form.homeId === form.awayId) return toast.error("Seleções devem ser diferentes");
    const iso = new Date(form.date).toISOString();
    const payload = {
      ...form,
      date: iso,
      homeScore: null,
      awayScore: null,
    };
    if (editing) {
      update(editing.id, payload);
      toast.success("Partida atualizada");
    } else {
      add(payload);
      toast.success("Partida criada");
    }
    setOpen(false);
  };

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Partidas</h1>
          <p className="text-xs text-muted-foreground">{partidas.length} cadastradas</p>
        </div>
        <Button onClick={startCreate} className="gold-gradient text-primary-foreground hover:opacity-90">
          <Plus className="mr-1 h-4 w-4" /> Nova partida
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Time A</th>
              <th className="px-4 py-3 text-left">Time B</th>
              <th className="px-4 py-3 text-left">Data / Hora</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {partidas.map((m) => {
              const home = getSelecao(m.homeId);
              const away = getSelecao(m.awayId);
              const d = new Date(m.date);
              return (
                <tr key={m.id} className="border-t border-border/60 hover:bg-surface/50">
                  <td className="px-4 py-3">{home?.flag} {home?.nome}</td>
                  <td className="px-4 py-3">{away?.flag} {away?.nome}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {d.toLocaleDateString("pt-BR")} · {d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
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
                      onClick={() => {
                        del(m.id);
                        toast.success("Partida removida");
                      }}
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
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {selecoes.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.flag} {s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Visitante</Label>
                <Select value={form.awayId} onValueChange={(v) => setForm({ ...form, awayId: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {selecoes.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.flag} {s.nome}</SelectItem>
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
                <Input value={form.fase} onChange={(e) => setForm({ ...form, fase: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as MatchStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Não iniciado</SelectItem>
                  <SelectItem value="live">Ao vivo</SelectItem>
                  <SelectItem value="finished">Encerrado</SelectItem>
                </SelectContent>
              </Select>
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

function StatusPill({ status }: { status: MatchStatus }) {
  const map = {
    scheduled: { label: "Em breve", cls: "bg-primary/15 text-primary" },
    live: { label: "Ao vivo", cls: "bg-destructive/15 text-destructive" },
    finished: { label: "Encerrado", cls: "bg-muted text-muted-foreground" },
  } as const;
  const m = map[status];
  return <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${m.cls}`}>{m.label}</span>;
}
