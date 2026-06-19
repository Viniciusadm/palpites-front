// Utilitário central de data/hora.
//
// O backend devolve instantes em UTC com sufixo `Z` (ex.: "2026-06-18T19:00:00.000Z").
// Aqui sempre exibimos e lemos no horário de Brasília, independentemente do fuso do
// dispositivo do usuário. America/Sao_Paulo cobre o UTC-3 atual sem manutenção.
export const BRASILIA_TZ = "America/Sao_Paulo";

/** Minutos (em ms) após o kickoff a partir dos quais o resultado pode ser lançado. */
export const RESULT_READY_MS = 110 * 60 * 1000;

/**
 * true quando já se passaram >= 110 min do kickoff, ou seja, o jogo já aconteceu
 * e o resultado pode ser lançado. Recebe a string ISO do kickoff (`match.date`
 * na visão pública ou `match.kickoff_at` no admin).
 */
export function isResultWindowOpen(kickoffISO: string): boolean {
  return Date.now() - new Date(kickoffISO).getTime() >= RESULT_READY_MS;
}

/** Data curta para o card: "qua., 18 de jun." */
export function formatMatchDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: BRASILIA_TZ,
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

/** Hora do card em Brasília: "16:00" */
export function formatMatchTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    timeZone: BRASILIA_TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Chave/título de agrupamento por dia: "quarta-feira, 18 de junho" */
export function formatGroupDate(iso: string): string {
  return formatDateBR(iso, { weekday: "long", day: "2-digit", month: "long" });
}

/** Formatação de data livre em pt-BR, sempre no fuso de Brasília. */
export function formatDateBR(iso: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: BRASILIA_TZ, ...options });
}

/** Diferença (ms) entre a parede de `timeZone` e o UTC no instante `date`. */
function tzOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  let hour = Number(map.hour);
  if (hour === 24) hour = 0; // alguns runtimes emitem "24" para meia-noite
  const wallAsUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    hour,
    Number(map.minute),
    Number(map.second),
  );
  return wallAsUtc - date.getTime();
}

/**
 * UTC ISO (com `Z`) -> valor para `<input type="datetime-local">` na parede de
 * Brasília ("YYYY-MM-DDTHH:mm").
 */
export function isoToBrasiliaInput(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BRASILIA_TZ,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(d);
  const map: Record<string, string> = {};
  for (const p of parts) map[p.type] = p.value;
  const hour = map.hour === "24" ? "00" : map.hour;
  return `${map.year}-${map.month}-${map.day}T${hour}:${map.minute}`;
}

/**
 * Valor de `<input type="datetime-local">` interpretado como parede de Brasília
 * ("YYYY-MM-DDTHH:mm") -> UTC ISO (com `Z`) para enviar à API.
 */
export function brasiliaInputToIso(local: string): string {
  // Trata os números como se fossem UTC para obter um instante de referência...
  const wallAsUtc = new Date(`${local.length === 16 ? `${local}:00` : local}Z`);
  // ...e desconta o offset de Brasília naquele instante.
  const offset = tzOffsetMs(wallAsUtc, BRASILIA_TZ);
  return new Date(wallAsUtc.getTime() - offset).toISOString();
}
