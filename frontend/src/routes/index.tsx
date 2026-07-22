import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCharacters } from "@/context/character-context";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const navigate = useNavigate();
  const { user, loading } = useCharacters();

  useEffect(() => {
    if (!loading) {
      if (user) {
        navigate({ to: "/tables" });
      } else {
        navigate({ to: "/login" });
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen w-full grid place-items-center text-muted-foreground font-mono">
      Carregando guilda...
    </div>
  );
}
