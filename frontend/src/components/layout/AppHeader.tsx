import { Link, useRouterState } from "@tanstack/react-router";
import { Users, Hammer, LogOut, Swords, Scroll } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCharacters } from "@/context/character-context";

export function AppHeader() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logoutUser, user } = useCharacters();

  const nav = [
    { to: "/characters", label: "Heróis", icon: Users },
    { to: "/tables", label: "Mesas", icon: Scroll },
    { to: "/forge", label: "Forja", icon: Hammer },
  ] as const;

  return (
    <header className="w-full border-b border-border bg-card/50 backdrop-blur sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/tables" className="flex items-center gap-2">
            <div className="grid place-items-center h-9 w-9 rounded-md bg-primary/10 text-primary border border-primary/30 neon-border">
              <Swords className="h-5 w-5" />
            </div>
            <span className="font-display text-xl tracking-wide font-semibold">
              FORJA<span className="text-primary">.</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors font-medium",
                    active
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 px-3 py-1 rounded bg-secondary/40 text-xs border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Membro:</span>
              <span className="font-semibold text-foreground font-mono">{user.username}</span>
            </div>
          )}

          <button
            onClick={logoutUser}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
