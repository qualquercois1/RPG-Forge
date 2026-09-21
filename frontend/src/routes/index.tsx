import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Swords,
  Shield,
  Dices,
  Hammer,
  ArrowRight,
  Scroll,
  Zap,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ParallaxHero } from "@/components/landing/ParallaxHero";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forja — Sistema de RPG Cyber-Fantasy" },
      {
        name: "description",
        content:
          "Gerenciador de fichas, campanhas, inventários e dados para RPG cyber-fantasy.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-x-hidden bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Luzes e Efeitos de Fundo Suaves */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          background:
            "radial-gradient(750px circle at 15% 15%, oklch(0.92 0.24 125 / 0.1), transparent 50%), " +
            "radial-gradient(650px circle at 85% 80%, oklch(0.4 0.15 260 / 0.25), transparent 50%)",
        }}
      />

      {/* Grid Tático Sutil de Fundo */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), " +
            "linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Cabeçalho / Navbar */}
      <header className="w-full border-b border-border/50 bg-background/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid place-items-center h-10 w-10 rounded-lg bg-primary/10 text-primary border border-primary/40 neon-border">
              <Swords className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl tracking-wider leading-none">
                FORJA<span className="text-primary">.</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                CYBER-FANTASY RPG
              </span>
            </div>
          </div>

          <Link to="/login">
            <Button
              variant="outline"
              size="sm"
              className="border-primary/40 text-primary hover:bg-primary/10 hover:text-primary neon-border font-semibold tracking-wide"
            >
              <span className="hidden sm:inline">Acessar Guilda</span>
              <span className="sm:hidden">Entrar</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* SESSÃO HERO COM BACKGROUND PARALLAX DE 3 CAMADAS */}
      <ParallaxHero />

      {/* SEÇÃO INFERIOR: APRESENTAÇÃO, ARSENAL, MECÂNICAS E CHAMADA FINAL */}
      <main
        id="apresentacao"
        className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full space-y-20 scroll-mt-20"
      >
        {/* Bloco de Apresentação & Entrada no Sistema (Acessível via Scroll) */}
        <section className="flex flex-col items-center text-center space-y-6 sm:space-y-8 max-w-3xl pt-4">
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium uppercase tracking-widest bg-card/60 backdrop-blur-md text-primary border border-primary/30 neon-border shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sistema Cyber-Fantasy • Gerenciador de RPG</span>
          </div>

          {/* Título Principal */}
          <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider uppercase leading-[1.05] text-foreground drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            Forje seus Heróis.
            <br />
            <span className="neon-text">Domine o Destino.</span>
          </h2>

          {/* Descrição Detalhada */}
          <p className="text-base sm:text-lg text-muted-foreground/95 max-w-2xl font-sans leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] bg-background/40 backdrop-blur-sm p-4 rounded-xl border border-white/5">
            Fichas interativas com atributos em tempo real, rolagem de dados integrada,
            forja de inventários lendários e controle absoluto de campanhas para Mestres e Jogadores.
          </p>

          {/* Botão de Chamada para Ação */}
          <div className="pt-2 flex flex-col items-center space-y-3">
            <Link to="/login">
              <Button
                size="lg"
                className="h-14 px-8 text-base sm:text-lg font-bold tracking-widest uppercase bg-primary text-primary-foreground hover:bg-primary/90 neon-border transition-all flex items-center gap-3 group shadow-[0_0_30px_oklch(0.92_0.24_125/0.45)]"
              >
                <Swords className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span>Entrar no Sistema</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>

            <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider drop-shadow-md">
              Acesse sua conta para visualizar mesas e personagens
            </span>
          </div>
        </section>

        {/* Grade de Pilares do RPG (Cards) */}
        <section className="w-full space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
              <Zap className="h-4 w-4" />
              <span>Arsenal & Mecânicas do Sistema</span>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline">
              [ PROTOCOLO: AVENTURA ]
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: Fichas */}
            <Card className="p-6 bg-card/75 backdrop-blur border-border/70 hover:border-primary/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/30 flex items-center justify-center neon-border">
                  <Swords className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wide">Fichas & Atributos</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Alocação dinâmica de 6 atributos fundamentais, cálculo automático de vida e radar de habilidades.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary/80">
                • FOR • DES • CON • INT • SAB • CAR
              </div>
            </Card>

            {/* Card 2: Dados */}
            <Card className="p-6 bg-card/75 backdrop-blur border-border/70 hover:border-primary/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/30 flex items-center justify-center neon-border">
                  <Dices className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wide">Rolagem em Tempo Real</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Rolador completo para D20, D12, D10, D8, D6, D4 e D100 com modificadores de atributo e histórico conjunto.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary/80">
                • Sucessos & Falhas Críticas
              </div>
            </Card>

            {/* Card 3: Forja de Itens */}
            <Card className="p-6 bg-card/75 backdrop-blur border-border/70 hover:border-primary/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/30 flex items-center justify-center neon-border">
                  <Hammer className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wide">Forja & Inventário</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Criação de armas, relíquias e itens consumíveis com 5 níveis de raridade e limites de capacidade de carga.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary/80">
                • Comum até Lendário
              </div>
            </Card>

            {/* Card 4: Painel do Mestre */}
            <Card className="p-6 bg-card/75 backdrop-blur border-border/70 hover:border-primary/50 transition-all hover:translate-y-[-2px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary border border-primary/30 flex items-center justify-center neon-border">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold tracking-wide">Mesas & Campanhas</h3>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    Criação de mesas, convites de jogadores, registro de sessões, diário de bordo e distribuição de tesouros.
                  </p>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-border/40 text-[11px] font-mono text-primary/80">
                • Diário de Bordo & Mestres
              </div>
            </Card>
          </div>
        </section>

        {/* Faixa / Chamada de Encerramento */}
        <section className="w-full">
          <Card className="p-8 sm:p-10 bg-card/85 backdrop-blur border-border neon-border flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-primary text-xs font-mono uppercase tracking-widest">
                <Scroll className="h-4 w-4" />
                <span>Sua Próxima Crônica Começa Agora</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-wide">
                Pronto para entrar na mesa de jogo?
              </h2>
              <p className="text-sm text-muted-foreground">
                Inicie sua sessão, configure sua ficha e prepare seus dados para a próxima batalha.
              </p>
            </div>

            <Link to="/login">
              <Button
                size="lg"
                className="h-12 px-6 font-bold tracking-wider uppercase bg-primary text-primary-foreground hover:bg-primary/90 neon-border shrink-0"
              >
                <span>Acessar Tela de Login</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </section>
      </main>

      {/* Rodapé Estilizado */}
      <footer className="w-full border-t border-border/40 py-6 bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary font-bold">FORJA.</span>
            <span>CYBER-FANTASY RPG MANAGER</span>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-primary transition-colors">
              [ Acessar Login ]
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
