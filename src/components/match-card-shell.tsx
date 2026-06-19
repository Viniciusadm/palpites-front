import { type ReactNode } from "react";
import { Check, Clock, CircleDot } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatMatchDate, formatMatchTime } from "@/lib/datetime";
import { type MatchStatus } from "@/api/types";

export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <Badge className="border-0 bg-destructive/20 text-destructive">
        <CircleDot className="mr-1 h-3 w-3 animate-pulse" />
        AO VIVO
      </Badge>
    );
  }
  if (status === "finished") {
    return (
      <Badge variant="secondary" className="border-0 bg-muted text-muted-foreground">
        <Check className="mr-1 h-3 w-3" />
        Encerrado
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="border-0 bg-primary/15 text-primary">
      <Clock className="mr-1 h-3 w-3" />
      Em breve
    </Badge>
  );
}

export function TeamSide({
  flag,
  name,
  align,
}: {
  flag: string;
  name: string;
  align: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 items-center gap-2.5",
        align === "right" && "flex-row-reverse text-right",
      )}
    >
      <span className="text-2xl leading-none sm:text-3xl">{flag}</span>
      <span className="min-w-0 break-words text-sm font-semibold leading-tight sm:text-base">
        {name}
      </span>
    </div>
  );
}

export function ScoreInputs({
  home,
  away,
  onHome,
  onAway,
  disabled = false,
  maxLength = 1,
}: {
  home: string;
  away: string;
  onHome: (value: string) => void;
  onAway: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1 px-0.5">
      <NumericInput
        maxLength={maxLength}
        value={home}
        onChange={onHome}
        disabled={disabled}
        className="h-11 w-9 text-center text-lg font-bold tabular-nums sm:w-10"
        placeholder="-"
      />
      <span className="text-sm text-muted-foreground">×</span>
      <NumericInput
        maxLength={maxLength}
        value={away}
        onChange={onAway}
        disabled={disabled}
        className="h-11 w-9 text-center text-lg font-bold tabular-nums sm:w-10"
        placeholder="-"
      />
    </div>
  );
}

export function MatchCardShell({
  stage,
  dateISO,
  status,
  home,
  away,
  dimmed = false,
  score,
  children,
}: {
  stage: string;
  dateISO: string;
  status: MatchStatus;
  home: { flag: string; name: string };
  away: { flag: string; name: string };
  dimmed?: boolean;
  score: ReactNode;
  children?: ReactNode;
}) {
  const dateStr = formatMatchDate(dateISO);
  const timeStr = formatMatchTime(dateISO);

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40",
        dimmed && "opacity-60",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-border/60 bg-surface/60 px-4 py-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground/80">{stage || "-"}</span>
        <span className="hidden sm:inline">•</span>
        <span className="order-last w-full sm:order-none sm:w-auto">
          {dateStr} • {timeStr}
        </span>
        <span className="ml-auto">
          <StatusBadge status={status} />
        </span>
      </header>

      <div className="px-4 py-5">
        <div className="flex items-center gap-2">
          <TeamSide flag={home.flag} name={home.name} align="left" />
          {score}
          <TeamSide flag={away.flag} name={away.name} align="right" />
        </div>
        {children}
      </div>
    </article>
  );
}
