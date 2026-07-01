import { Link, useRouterState } from "@tanstack/react-router";
import { Users, Hammer, LogOut, Swords } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/characters", label: "Heróis", icon: Users },
  { to: "/forge", label: "Forja", icon: Hammer },
] as const;

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
        <div className="grid place-items-center h-9 w-9 rounded-md bg-primary/10 text-primary neon-border">
          <Swords className="h-5 w-5" />
        </div>
        <div className="font-display text-xl tracking-wide">
          FORJA<span className="text-primary">.</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-primary/10 text-primary neon-border"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <Link
          to="/login"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Link>
      </div>
    </aside>
  );
}
