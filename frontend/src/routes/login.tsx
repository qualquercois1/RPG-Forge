import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Swords } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — Forja" },
      { name: "description", content: "Acesse sua guilda de heróis." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ to: "/characters" });
  };

  return (
    <main className="min-h-screen grid place-items-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40"
           style={{
             background:
               "radial-gradient(600px circle at 20% 10%, oklch(0.92 0.24 125 / 0.12), transparent 40%), radial-gradient(500px circle at 80% 90%, oklch(0.4 0.15 260 / 0.25), transparent 45%)",
           }} />

      <Card className="w-full max-w-sm p-8 bg-card/80 backdrop-blur border-border neon-border">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="grid place-items-center h-14 w-14 rounded-xl bg-primary/10 text-primary border border-primary/40 neon-border">
            <Swords className="h-7 w-7" />
          </div>
          <h1 className="mt-4 font-display text-3xl tracking-wide">
            FORJA<span className="text-primary">.</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre na sua guilda de heróis.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="user" className="text-xs uppercase tracking-widest">Usuário</Label>
            <Input id="user" value={user} onChange={(e) => setUser(e.target.value)} placeholder="aventureiro" />
          </div>
          <div>
            <Label htmlFor="pass" className="text-xs uppercase tracking-widest">Senha</Label>
            <Input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full font-semibold">Entrar</Button>
          <div className="text-center text-xs text-muted-foreground">
            Novo por aqui?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Registrar
            </Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
