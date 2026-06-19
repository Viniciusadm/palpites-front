import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  CalendarDays,
  ListChecks,
  Trophy,
  Users,
  Settings,
  History,
  Wrench,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { useMe } from "@/api/auth";
import { PoolSwitcher } from "@/components/pool-switcher";
import { NotificationBell, NotificationNavLink } from "@/components/notification-bell";
import { clearToken } from "@/api/session";
import { clearQueryCache } from "@/lib/query-persister";
import { useOnline } from "@/hooks/use-online";
import { useDrawerSwipe } from "@/hooks/use-drawer-swipe";
import { useAuthStore } from "@/store/auth-store";

const navItems = [
  { to: "/app/palpites", label: "Meus palpites", icon: ListChecks },
  { to: "/app/jogos", label: "Jogos", icon: CalendarDays },
  { to: "/app/ranking", label: "Ranking", icon: Trophy },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/participantes", label: "Participantes", icon: Users },
  { to: "/app/preferencias", label: "Preferências", icon: Bell },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

const mobileNav = navItems.slice(0, 4);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);
  const { dragging, progress } = useDrawerSwipe(drawer, setDrawer);
  const navigate = useNavigate();
  const online = useOnline();
  const queryClient = useQueryClient();
  const displayName = useAuthStore((s) => s.displayName);
  const clear = useAuthStore((s) => s.clear);
  const me = useMe();
  const isAdmin = me.data?.user.role === "admin";

  const logout = () => {
    clearToken();
    clear();
    queryClient.clear();
    clearQueryCache();
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed bottom-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex",
          online ? "top-0" : "top-8",
        )}
      >
        <div className="px-3 py-6">
          <PoolSwitcher variant="sidebar" />
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/15 text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
          <NotificationNavLink active={pathname === "/app/notificacoes"} />
        </nav>

        <div className="space-y-1 border-t border-sidebar-border p-3">
          {displayName && (
            <div className="px-3 py-1.5 text-[11px] text-muted-foreground">
              Olá, <span className="font-semibold text-foreground">{displayName}</span>
            </div>
          )}
          {isAdmin && (
            <Link
              to="/admin/selecoes"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
            >
              <Wrench className="h-4.5 w-4.5" />
              Admin
            </Link>
          )}
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sair
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header
        className={cn(
          "sticky z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden",
          online ? "top-0" : "top-8",
        )}
      >
        <button
          onClick={() => setDrawer(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface"
          aria-label="Abrir menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <div className="flex items-center gap-2">
          <PoolSwitcher variant="topbar" />
          <NotificationBell />
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all",
          drawer || dragging ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60",
            dragging ? "transition-none" : "transition-opacity duration-300",
            !dragging && (drawer ? "opacity-100" : "opacity-0"),
          )}
          style={dragging ? { opacity: progress } : undefined}
          onClick={() => setDrawer(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-72 bg-sidebar p-5 shadow-2xl ease-out",
            dragging ? "transition-none" : "transition-transform duration-300",
            !dragging && (drawer ? "translate-x-0" : "-translate-x-full"),
          )}
          style={dragging ? { transform: `translateX(${(progress - 1) * 288}px)` } : undefined}
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Menu</span>
            <button
              onClick={() => setDrawer(false)}
              className="grid h-8 w-8 place-items-center rounded-lg bg-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setDrawer(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium",
                    active
                      ? "bg-primary/15 text-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
            <NotificationNavLink
              active={pathname === "/app/notificacoes"}
              onNavigate={() => setDrawer(false)}
              className="py-3"
            />
            {isAdmin && (
              <Link
                to="/admin/selecoes"
                onClick={() => setDrawer(false)}
                className="mt-4 flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-sm font-medium text-muted-foreground"
              >
                <Wrench className="h-4.5 w-4.5" /> Admin
              </Link>
            )}
            <button
              onClick={() => {
                setDrawer(false);
                logout();
              }}
              className="mt-2 flex w-full items-center gap-3 rounded-xl border border-border px-3 py-3 text-sm font-medium text-muted-foreground"
            >
              <LogOut className="h-4.5 w-4.5" /> Sair
            </button>
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <main className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {mobileNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-3 text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {item.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
