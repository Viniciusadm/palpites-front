import type { MatchResponse, Partida, Selecao, TeamResponse } from "@/api/types";

export function teamToSelecao(team: TeamResponse): Selecao {
  return {
    id: team.id,
    nome: team.name,
    flag: team.flag_emoji ?? "🏳️",
    grupo: "",
  };
}

export function matchToPartida(match: MatchResponse, faseLabel: string): Partida {
  return {
    id: match.id,
    homeId: match.home_team_id ?? "",
    awayId: match.away_team_id ?? "",
    date: match.kickoff_at,
    status: match.status,
    homeScore: match.home_score,
    awayScore: match.away_score,
    fase: faseLabel,
  };
}
