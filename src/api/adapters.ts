import type { Match, MatchResponse, Team, TeamResponse } from "@/api/types";

export function toTeam(team: TeamResponse): Team {
  return {
    id: team.id,
    name: team.name,
    flag: team.flag_emoji ?? "🏳️",
    group: "",
  };
}

export function toMatch(match: MatchResponse, stageLabel: string): Match {
  return {
    id: match.id,
    homeId: match.home_team_id ?? "",
    awayId: match.away_team_id ?? "",
    date: match.kickoff_at,
    status: match.status,
    homeScore: match.home_score,
    awayScore: match.away_score,
    stage: stageLabel,
  };
}
