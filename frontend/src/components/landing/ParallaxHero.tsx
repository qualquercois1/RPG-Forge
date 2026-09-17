import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Swords, ArrowRight, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

import bgDragon1 from "@/assets/BackgroundDragon1.jfif";
import bgDragon2 from "@/assets/BackgroundDragon2.png";
import bgDragon3 from "@/assets/BackgroundDragon3.png";

export function ParallaxHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const layer1Ref = useRef<HTMLDivElement>(null);
  const layer2Ref = useRef<HTMLDivElement>(null);
  const layer3Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let rafId: number;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    let targetScrollY = 0;
    let currentScrollY = 0;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      targetMouseX = (e.clientX - cx) / cx;
      targetMouseY = (e.clientY - cy) / cy;
    };

    const onMouseLeave = () => {
      targetMouseX = 0;
      targetMouseY = 0;
    };

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      targetScrollY = -rect.top;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const animate = () => {
      // Interpolação suave (lerp) para movimento leve e fluido
      currentMouseX += (targetMouseX - currentMouseX) * 0.05;
      currentMouseY += (targetMouseY - currentMouseY) * 0.05;
      currentScrollY += (targetScrollY - currentScrollY) * 0.08;

      // Camada 1: Fundo (Lua neon e montanhas distantes) - movimento mais sutil
      if (layer1Ref.current) {
        const x = currentMouseX * 12;
        const y = currentMouseY * 8 + currentScrollY * 0.12;
        layer1Ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.08)`;
      }

      // Camada 2: Meio (Castelo e Dragão) - profundidade intermediária
      if (layer2Ref.current) {
        const x = currentMouseX * 24;
        const y = currentMouseY * 16 + currentScrollY * 0.28;
        layer2Ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.08)`;
      }

      // Camada 3: Frente (Árvores e penhascos rúnicos em primeiro plano) - movimento mais perceptível
      if (layer3Ref.current) {
        const x = currentMouseX * 40;
        const y = currentMouseY * 26 + currentScrollY * 0.45;
        layer3Ref.current.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(1.08)`;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-[88vh] min-h-[640px] max-h-[960px] overflow-hidden flex flex-col justify-between items-center text-center select-none"
    >
      {/* CAMADA 1: FUNDO (Montanhas e Lua Neon) - Centralizada para exibir a lua e as montanhas */}
      <div
        ref={layer1Ref}
        className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none will-change-transform z-0"
      >
        <img
          src={bgDragon1}
          alt="Cenário de Fundo - Céu e Montanhas"
          className="w-full h-full object-cover object-[center_35%]"
          loading="eager"
        />
      </div>

      {/* CAMADA 2: MEIO (Castelo Rúnico e Dragão) - Redimensionado para não cobrir a lua */}
      <div
        ref={layer2Ref}
        className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none will-change-transform z-[1]"
      >
        <img
          src={bgDragon2}
          alt="Cenário do Meio - Castelo e Dragão"
          className="w-full h-full object-cover object-bottom scale-[0.66] sm:scale-[0.62] origin-bottom translate-y-[2%]"
          loading="eager"
        />
      </div>

      {/* CAMADA 3: FRENTE (Árvores e Penhasco com Runas) - Expandido para as bordas para abrir o centro */}
      <div
        ref={layer3Ref}
        className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none will-change-transform z-[2]"
      >
        <img
          src={bgDragon3}
          alt="Primeiro Plano - Floresta e Runas"
          className="w-full h-full object-cover object-bottom scale-[1.18] sm:scale-[1.25] origin-bottom translate-y-[8%]"
          loading="eager"
        />
      </div>

      {/* GRADIENTES DE TRANSIÇÃO E ATMOSFERA */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/90 via-background/40 to-transparent pointer-events-none z-[3]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/75 to-transparent pointer-events-none z-[3]" />

      {/* SUTIL LUZ AMBIENTE NEON LIME NO CENTRO */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-30"
        style={{
          background:
            "radial-gradient(600px circle at 50% 55%, oklch(0.92 0.24 125 / 0.12), transparent 60%)",
        }}
      />

      {/* CONTEÚDO PRINCIPAL (HERO FLUTUANTE SOBRE AS CAMADAS) */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 my-auto flex flex-col items-center space-y-6 pt-10">
        {/* Badge de Destaque */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-medium uppercase tracking-widest bg-card/60 backdrop-blur-md text-primary border border-primary/30 neon-border shadow-lg">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Sistema Cyber-Fantasy • Gerenciador de RPG</span>
        </div>

        {/* Título com Sombra de Profundidade */}
        <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold tracking-wider uppercase leading-[1.05] text-foreground drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          Forje seus Heróis.
          <br />
          <span className="neon-text">Domine o Destino.</span>
        </h1>

        {/* Descrição */}
        <p className="text-base sm:text-lg text-muted-foreground/95 max-w-2xl font-sans leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] bg-background/40 backdrop-blur-sm p-3 rounded-xl border border-white/5">
          Fichas interativas com atributos em tempo real, rolagem de dados integrada,
          forja de inventários lendários e controle absoluto de campanhas para Mestres e Jogadores.
        </p>

        {/* Botão de Chamada para Ação (Leva Somente para Login) */}
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
      </div>

      {/* INDICADOR INFERIOR DE SCROLL */}
      <div className="relative z-10 mb-4 flex flex-col items-center gap-1 text-[11px] font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
        <span>Role para explorar as mecânicas</span>
        <ChevronDown className="h-4 w-4 text-primary" />
      </div>
    </section>
  );
}
