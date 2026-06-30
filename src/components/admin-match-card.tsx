import { useState } from "react";
import { Lock, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MatchCardShell, PenaltyPicker, ScoreInputs } from "@/components/match-card-shell";
import { toast } from "sonner";
import { isResultWindowOpen } from "@/lib/datetime";
import type { MatchResponse, PenaltySide } from "@/api/types";

export function AdminMatchCard({
  match,
  home,
  away,
  stage,
  onEnterResult,
  savingResult = false,
  onEdit,
  onRemove,
  removing = false,
}: {
  match: MatchResponse;
  home: { flag: string; name: string };
  away: { flag: string; name: string };
  stage: string;
  onEnterResult: (home: number, away: number, penaltiesWinner: PenaltySide | null) => void;
  savingResult?: boolean;
  onEdit: () => void;
  onRemove: () => void;
  removing?: boolean;
}) {
  const [h, setH] = useState<string>(match.home_score?.toString() ?? "");
  const [a, setA] = useState<string>(match.away_score?.toString() ?? "");
  const [penaltiesWinner, setPenaltiesWinner] = useState<PenaltySide | null>(
    match.penalties_winner,
  );

  const noTeams = !match.home_team_id || !match.away_team_id;
  const hasResult = match.home_score !== null && match.away_score !== null;
  const resultLocked = !isResultWindowOpen(match.kickoff_at);

  const hn = parseInt(h, 10);
  const an = parseInt(a, 10);
  const isDraw = !isNaN(hn) && !isNaN(an) && hn === an;
  const showPenalties = match.can_go_to_penalties && isDraw;

  const save = () => {
    if (resultLocked) {
      toast.error("O resultado só pode ser lançado após o jogo terminar.");
      return;
    }
    if (isNaN(hn) || isNaN(an) || hn < 0 || an < 0) {
      toast.error("Informe um placar válido");
      return;
    }
    if (showPenalties && !penaltiesWinner) {
      toast.error("Informe quem venceu nos pênaltis");
      return;
    }
    onEnterResult(hn, an, showPenalties ? penaltiesWinner : null);
  };

  return (
    <MatchCardShell
      stage={stage}
      dateISO={match.kickoff_at}
      status={match.status}
      home={home}
      away={away}
      score={
        <ScoreInputs
          home={h}
          away={a}
          onHome={setH}
          onAway={setA}
          disabled={noTeams || resultLocked}
          maxLength={2}
        />
      }
    >
      {noTeams ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />
          Defina as duas seleções antes de lançar o resultado
        </div>
      ) : resultLocked ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5" />O resultado pode ser lançado após o apito final
        </div>
      ) : (
        <>
          {showPenalties && (
            <PenaltyPicker
              value={penaltiesWinner}
              onChange={setPenaltiesWinner}
              homeLabel={home.name}
              awayLabel={away.name}
              prompt="Quem venceu nos pênaltis?"
            />
          )}
          <Button
            onClick={save}
            size="sm"
            disabled={savingResult}
            className="mt-4 w-full gold-gradient font-semibold text-primary-foreground hover:opacity-90"
          >
            {savingResult ? "Salvando..." : hasResult ? "Atualizar resultado" : "Salvar resultado"}
          </Button>
        </>
      )}

      <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
        <Button size="icon" variant="ghost" onClick={onEdit}>
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={onRemove}
          disabled={removing}
          className="text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </MatchCardShell>
  );
}
