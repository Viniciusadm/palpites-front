import { Link } from "@tanstack/react-router";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/api/notifications";

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
      {count > 99 ? "99+" : count}
    </span>
  );
}

/** Icon button used in the mobile top bar. */
export function NotificationBell({ className }: { className?: string }) {
  const { count } = useUnreadCount();
  return (
    <Link
      to="/app/notificacoes"
      aria-label={count > 0 ? `Notificações (${count} não lidas)` : "Notificações"}
      className={cn(
        "relative grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:text-foreground",
        className,
      )}
    >
      <Bell className="h-4.5 w-4.5" />
      <CountBadge count={count} />
    </Link>
  );
}

/** Sidebar nav row with an inline unread badge. */
export function NotificationNavLink({
  active,
  onNavigate,
  className,
}: {
  active: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const { count } = useUnreadCount();
  return (
    <Link
      to="/app/notificacoes"
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary/15 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
        className,
      )}
    >
      <Bell className="h-4.5 w-4.5" strokeWidth={active ? 2.5 : 2} />
      <span className="flex-1">Notificações</span>
      {count > 0 && (
        <span className="grid h-5 min-w-[1.25rem] place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
