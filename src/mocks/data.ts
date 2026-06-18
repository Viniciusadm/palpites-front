// Mock data for the World Cup bolão app

export type MatchStatus = "scheduled" | "live" | "finished";

export interface Selecao {
  id: string;
  nome: string;
  flag: string; // emoji
  grupo: string;
}

export interface Partida {
  id: string;
  homeId: string;
  awayId: string;
  date: string; // ISO
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  fase: string;
}

export interface Participante {
  id: string;
  nome: string;
  joinedAt: string;
  active: boolean;
  isOwner?: boolean;
}

export interface Palpite {
  userId: string;
  matchId: string;
  home: number;
  away: number;
}

export const selecoes: Selecao[] = [
  { id: "qat", nome: "Catar", flag: "🇶🇦", grupo: "A" },
  { id: "ecu", nome: "Equador", flag: "🇪🇨", grupo: "A" },
  { id: "sen", nome: "Senegal", flag: "🇸🇳", grupo: "A" },
  { id: "ned", nome: "Holanda", flag: "🇳🇱", grupo: "A" },
  { id: "eng", nome: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", grupo: "B" },
  { id: "irn", nome: "Irã", flag: "🇮🇷", grupo: "B" },
  { id: "usa", nome: "EUA", flag: "🇺🇸", grupo: "B" },
  { id: "wal", nome: "País de Gales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", grupo: "B" },
  { id: "arg", nome: "Argentina", flag: "🇦🇷", grupo: "C" },
  { id: "ksa", nome: "Arábia Saudita", flag: "🇸🇦", grupo: "C" },
  { id: "mex", nome: "México", flag: "🇲🇽", grupo: "C" },
  { id: "pol", nome: "Polônia", flag: "🇵🇱", grupo: "C" },
  { id: "fra", nome: "França", flag: "🇫🇷", grupo: "D" },
  { id: "aus", nome: "Austrália", flag: "🇦🇺", grupo: "D" },
  { id: "den", nome: "Dinamarca", flag: "🇩🇰", grupo: "D" },
  { id: "tun", nome: "Tunísia", flag: "🇹🇳", grupo: "D" },
  { id: "esp", nome: "Espanha", flag: "🇪🇸", grupo: "E" },
  { id: "crc", nome: "Costa Rica", flag: "🇨🇷", grupo: "E" },
  { id: "ger", nome: "Alemanha", flag: "🇩🇪", grupo: "E" },
  { id: "jpn", nome: "Japão", flag: "🇯🇵", grupo: "E" },
  { id: "bel", nome: "Bélgica", flag: "🇧🇪", grupo: "F" },
  { id: "can", nome: "Canadá", flag: "🇨🇦", grupo: "F" },
  { id: "mar", nome: "Marrocos", flag: "🇲🇦", grupo: "F" },
  { id: "cro", nome: "Croácia", flag: "🇭🇷", grupo: "F" },
  { id: "bra", nome: "Brasil", flag: "🇧🇷", grupo: "G" },
  { id: "srb", nome: "Sérvia", flag: "🇷🇸", grupo: "G" },
  { id: "sui", nome: "Suíça", flag: "🇨🇭", grupo: "G" },
  { id: "cmr", nome: "Camarões", flag: "🇨🇲", grupo: "G" },
  { id: "por", nome: "Portugal", flag: "🇵🇹", grupo: "H" },
  { id: "gha", nome: "Gana", flag: "🇬🇭", grupo: "H" },
  { id: "uru", nome: "Uruguai", flag: "🇺🇾", grupo: "H" },
  { id: "kor", nome: "Coreia do Sul", flag: "🇰🇷", grupo: "H" },
];

// Build a tournament-ish set of matches across a few days.
const now = Date.now();
const day = 24 * 60 * 60 * 1000;

function iso(offsetDays: number, hour: number) {
  const d = new Date(now + offsetDays * day);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const partidas: Partida[] = [
  // Finished (past)
  { id: "m1", homeId: "qat", awayId: "ecu", date: iso(-6, 13), status: "finished", homeScore: 0, awayScore: 2, fase: "Grupo A" },
  { id: "m2", homeId: "eng", awayId: "irn", date: iso(-6, 16), status: "finished", homeScore: 6, awayScore: 2, fase: "Grupo B" },
  { id: "m3", homeId: "sen", awayId: "ned", date: iso(-5, 13), status: "finished", homeScore: 0, awayScore: 2, fase: "Grupo A" },
  { id: "m4", homeId: "usa", awayId: "wal", date: iso(-5, 19), status: "finished", homeScore: 1, awayScore: 1, fase: "Grupo B" },
  { id: "m5", homeId: "arg", awayId: "ksa", date: iso(-4, 10), status: "finished", homeScore: 1, awayScore: 2, fase: "Grupo C" },
  { id: "m6", homeId: "den", awayId: "tun", date: iso(-4, 13), status: "finished", homeScore: 0, awayScore: 0, fase: "Grupo D" },
  { id: "m7", homeId: "mex", awayId: "pol", date: iso(-3, 16), status: "finished", homeScore: 0, awayScore: 0, fase: "Grupo C" },
  { id: "m8", homeId: "fra", awayId: "aus", date: iso(-3, 19), status: "finished", homeScore: 4, awayScore: 1, fase: "Grupo D" },
  { id: "m9", homeId: "bra", awayId: "srb", date: iso(-2, 16), status: "finished", homeScore: 2, awayScore: 0, fase: "Grupo G" },
  { id: "m10", homeId: "por", awayId: "gha", date: iso(-2, 13), status: "finished", homeScore: 3, awayScore: 2, fase: "Grupo H" },
  // Live (today)
  { id: "m11", homeId: "esp", awayId: "ger", date: iso(0, 16), status: "live", homeScore: 1, awayScore: 1, fase: "Grupo E" },
  { id: "m12", homeId: "bel", awayId: "mar", date: iso(0, 13), status: "live", homeScore: 0, awayScore: 2, fase: "Grupo F" },
  // Upcoming
  { id: "m13", homeId: "cro", awayId: "can", date: iso(1, 13), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo F" },
  { id: "m14", homeId: "jpn", awayId: "crc", date: iso(1, 16), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo E" },
  { id: "m15", homeId: "uru", awayId: "kor", date: iso(2, 10), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo H" },
  { id: "m16", homeId: "sui", awayId: "cmr", date: iso(2, 13), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo G" },
  { id: "m17", homeId: "arg", awayId: "mex", date: iso(2, 19), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo C" },
  { id: "m18", homeId: "fra", awayId: "den", date: iso(3, 16), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo D" },
  { id: "m19", homeId: "bra", awayId: "sui", date: iso(3, 13), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo G" },
  { id: "m20", homeId: "por", awayId: "uru", date: iso(4, 19), status: "scheduled", homeScore: null, awayScore: null, fase: "Grupo H" },
];

export const participantes: Participante[] = [
  { id: "u1", nome: "Você", joinedAt: iso(-10, 9), active: true, isOwner: true },
  { id: "u2", nome: "João Silva", joinedAt: iso(-10, 10), active: true },
  { id: "u3", nome: "Maria Souza", joinedAt: iso(-9, 11), active: true },
  { id: "u4", nome: "Pedro Costa", joinedAt: iso(-9, 14), active: true },
  { id: "u5", nome: "Ana Lima", joinedAt: iso(-8, 9), active: true },
  { id: "u6", nome: "Lucas Pereira", joinedAt: iso(-8, 18), active: true },
  { id: "u7", nome: "Carla Mendes", joinedAt: iso(-7, 8), active: true },
  { id: "u8", nome: "Rafael Alves", joinedAt: iso(-7, 12), active: true },
  { id: "u9", nome: "Beatriz Rocha", joinedAt: iso(-6, 15), active: false },
  { id: "u10", nome: "Felipe Castro", joinedAt: iso(-6, 19), active: true },
  { id: "u11", nome: "Juliana Reis", joinedAt: iso(-5, 10), active: true },
  { id: "u12", nome: "Thiago Nunes", joinedAt: iso(-5, 16), active: true },
];

// Random-but-stable palpites for finished + live + a few future matches
function r(seed: number) {
  // simple seeded pseudo-random 0..3
  const x = Math.sin(seed) * 10000;
  return Math.abs(Math.floor((x - Math.floor(x)) * 4));
}

export const palpites: Palpite[] = (() => {
  const out: Palpite[] = [];
  participantes.forEach((p, ui) => {
    partidas.forEach((m, mi) => {
      if (m.status === "scheduled" && ui > 5 && mi % 2 === 0) return;
      out.push({
        userId: p.id,
        matchId: m.id,
        home: r(ui * 31 + mi * 7),
        away: r(ui * 17 + mi * 13 + 1),
      });
    });
  });
  // Make "Você" have a known set
  return out;
})();

// Scoring: exact = 10, correct outcome = 5, wrong = 0
export function pointsFor(palpite: Palpite, match: Partida): number {
  if (match.status !== "finished" || match.homeScore == null || match.awayScore == null) return 0;
  if (palpite.home === match.homeScore && palpite.away === match.awayScore) return 10;
  const realDiff = Math.sign(match.homeScore - match.awayScore);
  const pDiff = Math.sign(palpite.home - palpite.away);
  if (realDiff === pDiff) return 5;
  return 0;
}

export function getSelecao(id: string): Selecao {
  return selecoes.find((s) => s.id === id)!;
}

export function computeRanking() {
  const finishedById = new Map(partidas.filter((p) => p.status === "finished").map((p) => [p.id, p]));
  return participantes
    .map((p) => {
      const userPalpites = palpites.filter((pp) => pp.userId === p.id);
      let pontos = 0;
      let acertos = 0;
      userPalpites.forEach((pp) => {
        const m = finishedById.get(pp.matchId);
        if (!m) return;
        const pts = pointsFor(pp, m);
        pontos += pts;
        if (pts > 0) acertos += 1;
      });
      return { participante: p, pontos, acertos };
    })
    .sort((a, b) => b.pontos - a.pontos);
}

export const CURRENT_USER_ID = "u1";
export const BOLAO_NAME = "Bolão dos Craques 2026";
export const BOLAO_CODE = "COPA-2026-XK7";
export const BOLAO_LINK = `https://boloes.app/j/${BOLAO_CODE}`;
