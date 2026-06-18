import { Link, useRouterState } from "@tanstack/react-router";
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
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BOLAO_NAME } from "@/mocks/data";

const navItems = [
  { to: "/app/palpites", label: "Meus palpites", icon: ListChecks },
  { to: "/app/jogos", label: "Jogos", icon: CalendarDays },
  { to: "/app/ranking", label: "Ranking", icon: Trophy },
  { to: "/app/historico", label: "Histórico", icon: History },
  { to: "/app/participantes", label: "Participantes", icon: Users },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings },
] as const;

const mobileNav = navItems.slice(0, 4);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [drawer, setDrawer] = useState(false);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex items-center gap-2.5 px-5 py-6">
          <div className="grid h-9 w-9 place-items-center rounded-xl gold-gradient">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold leading-tight">Bolão Copa</div>
            <div className="text-[11px] text-muted-foreground">{BOLAO_NAME}</div>
          </div>
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
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <Link
            to="/admin/selecoes"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
          >
            <Wrench className="h-4.5 w-4.5" />
            Admin
          </Link>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setDrawer(true)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface"
          aria-label="Abrir menu"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg gold-gradient">
            <Trophy className="h-4 w-4 text-primary-foreground" />
          </div>
          <div className="min-w-0 text-right">
            <div className="font-display text-sm font-semibold leading-tight">Bolão Copa</div>
            <div className="truncate text-[10px] text-muted-foreground">{BOLAO_NAME}</div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-40 lg:hidden transition-all",
          drawer ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-300",
            drawer ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setDrawer(false)}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-72 bg-sidebar p-5 shadow-2xl transition-transform duration-300 ease-out",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-display font-semibold">Menu</span>
            <button onClick={() => setDrawer(false)} className="grid h-8 w-8 place-items-center rounded-lg bg-surface">
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
                    active ? "bg-primary/15 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/admin/selecoes"
              onClick={() => setDrawer(false)}
              className="mt-4 flex items-center gap-3 rounded-xl border border-border px-3 py-3 text-sm font-medium text-muted-foreground"
            >
              <Wrench className="h-4.5 w-4.5" /> Admin
            </Link>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">{children}</main>
      </div>

      {/* Mobile bottom nav */}
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
