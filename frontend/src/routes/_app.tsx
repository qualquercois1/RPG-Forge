import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { useCharacters } from "@/context/character-context";
import { useEffect } from "react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useCharacters();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
        Carregando guilda...
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <AppHeader />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
