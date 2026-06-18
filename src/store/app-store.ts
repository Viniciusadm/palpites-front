import { create } from "zustand";
import {
  partidas as seedPartidas,
  palpites as seedPalpites,
  selecoes as seedSelecoes,
  participantes as seedParticipantes,
  type Partida,
  type Palpite,
  type Selecao,
  type Participante,
  CURRENT_USER_ID,
} from "@/mocks/data";

interface AppState {
  partidas: Partida[];
  palpites: Palpite[];
  selecoes: Selecao[];
  participantes: Participante[];
  setPalpite: (matchId: string, home: number, away: number) => void;
  addPartida: (p: Omit<Partida, "id">) => void;
  updatePartida: (id: string, patch: Partial<Partida>) => void;
  deletePartida: (id: string) => void;
  addSelecao: (s: Omit<Selecao, "id">) => void;
  updateSelecao: (id: string, patch: Partial<Selecao>) => void;
  deleteSelecao: (id: string) => void;
  removeParticipante: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  partidas: seedPartidas,
  palpites: seedPalpites,
  selecoes: seedSelecoes,
  participantes: seedParticipantes,
  setPalpite: (matchId, home, away) =>
    set((s) => {
      const idx = s.palpites.findIndex((p) => p.userId === CURRENT_USER_ID && p.matchId === matchId);
      const next = [...s.palpites];
      if (idx >= 0) next[idx] = { ...next[idx], home, away };
      else next.push({ userId: CURRENT_USER_ID, matchId, home, away });
      return { palpites: next };
    }),
  addPartida: (p) =>
    set((s) => ({ partidas: [...s.partidas, { ...p, id: `m${Date.now()}` }] })),
  updatePartida: (id, patch) =>
    set((s) => ({ partidas: s.partidas.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
  deletePartida: (id) =>
    set((s) => ({ partidas: s.partidas.filter((m) => m.id !== id) })),
  addSelecao: (sel) =>
    set((s) => ({ selecoes: [...s.selecoes, { ...sel, id: `s${Date.now()}` }] })),
  updateSelecao: (id, patch) =>
    set((s) => ({ selecoes: s.selecoes.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
  deleteSelecao: (id) =>
    set((s) => ({ selecoes: s.selecoes.filter((x) => x.id !== id) })),
  removeParticipante: (id) =>
    set((s) => ({ participantes: s.participantes.filter((p) => p.id !== id) })),
}));
