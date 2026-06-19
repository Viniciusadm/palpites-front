export type MatchStatus = "scheduled" | "live" | "finished";

export interface Selecao {
  id: string;
  nome: string;
  flag: string;
  grupo: string;
}

export interface Partida {
  id: string;
  homeId: string;
  awayId: string;
  date: string;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  fase: string;
}

export interface CreateTeamRequest {
  name: string;
  code: string;
  flag_emoji: string | null;
}

export type UpdateTeamRequest = CreateTeamRequest;

export interface CreateMatchRequest {
  stage_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  kickoff_at: string;
}

export interface UpdateMatchRequest extends CreateMatchRequest {
  status: string;
}

export interface EnterResultRequest {
  home_score: number;
  away_score: number;
}

export interface TeamResponse {
  id: string;
  name: string;
  code: string;
  flag_emoji: string | null;
  flag_file_id: string | null;
}

export interface TeamsListResponse {
  teams: TeamResponse[];
}

export interface MatchResponse {
  id: string;
  tournament_id: string;
  stage_id: string;
  home_team_id: string | null;
  away_team_id: string | null;
  kickoff_at: string;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  finished_at: string | null;
}

export interface MatchesListResponse {
  matches: MatchResponse[];
}

export interface StageResponse {
  id: string;
  tournament_id: string;
  name: string;
  kind: string;
  ordering: number;
}

export interface GroupResponse {
  id: string;
  tournament_id: string;
  label: string;
}

export interface TournamentDetailResponse {
  id: string;
  name: string;
  slug: string;
  season_year: number;
  starts_on: string | null;
  ends_on: string | null;
  status: string;
  stages: StageResponse[];
  groups: GroupResponse[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  display_name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  display_name: string;
}

export interface MeResponse {
  user: {
    id: string;
    display_name: string;
    email: string;
    role: string;
  };
}

export interface PoolResponse {
  id: string;
  tournament_id: string;
  owner_user_id: string;
  name: string;
  invite_code: string;
  visibility: string;
  ranking_public: boolean;
  prediction_lock_offset_minutes: number;
  status: string;
}

export interface PoolsListResponse {
  pools: PoolResponse[];
}

export interface PoolMemberResponse {
  id: string;
  pool_id: string;
  user_id: string;
  display_name: string;
  role: string;
  status: string;
  joined_at: string;
  left_at: string | null;
}

export interface PoolMembersListResponse {
  members: PoolMemberResponse[];
}

export interface CreatePoolRequest {
  name: string;
  tournament_id: string;
}

export interface UpdatePoolRequest {
  name: string;
  visibility: string;
  ranking_public: boolean;
  prediction_lock_offset_minutes: number;
  status: string;
}

export type ScoringRuleKey = "exact_score" | "correct_outcome" | "correct_goal_difference";

export interface ScoringRuleResponse {
  id: string;
  pool_id: string;
  rule_key: string;
  points: number;
}

export interface ScoringRulesListResponse {
  rules: ScoringRuleResponse[];
}

export interface ScoringRuleInput {
  rule_key: string;
  points: number;
}

export interface NotificationPreference {
  id: string;
  pool_id: string | null;
  type: string;
  channel: string;
  enabled: boolean;
}

export interface NotificationPreferencesListResponse {
  preferences: NotificationPreference[];
}

export interface PreferenceItem {
  type: string;
  channel: string;
  enabled: boolean;
}

export interface JoinPoolResponse {
  pool: PoolResponse;
  member: PoolMemberResponse;
  already_member: boolean;
}

export interface RankingEntry {
  pool_member_id: string;
  display_name: string;
  total_points: number;
  exact_count: number;
  outcome_count: number;
  hits_count: number;
  position: number;
}

export interface RankingResponse {
  standings: RankingEntry[];
}

export interface MemberPrediction {
  match_id: string;
  match_status: MatchStatus;
  kickoff_at: string;
  prediction_home: number;
  prediction_away: number;
  result_home: number | null;
  result_away: number | null;
  points_awarded: number | null;
}

export interface MemberPredictionsResponse {
  predictions: MemberPrediction[];
}

export interface PredictionResponse {
  id: string;
  match_id: string;
  home_score: number;
  away_score: number;
  points_awarded: number | null;
  scored_at: string | null;
}

export interface PredictionsListResponse {
  predictions: PredictionResponse[];
}

export interface UpsertPredictionRequest {
  home_score: number;
  away_score: number;
}

export interface HistoryEntry {
  match_id: string;
  match_status: MatchStatus;
  kickoff_at: string;
  prediction_home: number;
  prediction_away: number;
  result_home: number | null;
  result_away: number | null;
  points_awarded: number | null;
  hit_kind: string | null;
}

export interface HistoryResponse {
  pool_member_id: string;
  total_points: number;
  exact_count: number;
  outcome_count: number;
  hits_count: number;
  errors_count: number;
  pending_count: number;
  entries: HistoryEntry[];
}
