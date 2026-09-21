import { useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

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
      className="relative w-full h-[calc(100vh-4rem)] min-h-[620px] max-h-[960px] overflow-hidden flex flex-col justify-between items-center text-center select-none"
    >
      {/* CENÁRIO PARALLAX (DESLOCADO PARA BAIXO PARA CRIAR O ESPAÇO SUPERIOR) */}
      <div className="absolute inset-x-0 bottom-0 top-14 sm:top-20 md:top-24 pointer-events-none">
        {/* CAMADA 1: FUNDO (Montanhas e Lua Neon) */}
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

        {/* CAMADA 2: MEIO (Castelo Rúnico e Dragão) - Sem corte superior e com a base elevada */}
        <div
          ref={layer2Ref}
          className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none will-change-transform z-[1]"
        >
          <img
            src={bgDragon2}
            alt="Cenário do Meio - Castelo e Dragão"
            className="w-full h-full object-cover sm:object-contain object-bottom scale-[0.92] sm:scale-[0.86] origin-bottom -translate-y-[2%] sm:-translate-y-[3%]"
            loading="eager"
          />
        </div>

        {/* CAMADA 3: FRENTE (Árvores e Penhasco com Runas) */}
        <div
          ref={layer3Ref}
          className="absolute inset-[-6%] w-[112%] h-[112%] pointer-events-none will-change-transform z-[2]"
        >
          <img
            src={bgDragon3}
            alt="Primeiro Plano - Floresta e Runas"
            className="w-full h-full object-cover object-bottom scale-[1.18] sm:scale-[1.25] origin-bottom translate-y-[14%] sm:translate-y-[16%]"
            loading="eager"
          />
        </div>
      </div>

      {/* GRADIENTES DE TRANSIÇÃO E ATMOSFERA */}
      <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-background/90 via-background/40 to-transparent pointer-events-none z-[3]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/75 to-transparent pointer-events-none z-[3]" />

      {/* SUTIL LUZ AMBIENTE NEON LIME NO CENTRO */}
      <div
        className="pointer-events-none absolute inset-0 z-[3] opacity-30"
        style={{
          background:
            "radial-gradient(600px circle at 50% 55%, oklch(0.92 0.24 125 / 0.12), transparent 60%)",
        }}
      />

      {/* TÍTULO NO ESPAÇO SUPERIOR (VERDE LIMA COM NEON GLOW) */}
      <div className="relative z-10 pt-5 sm:pt-7 md:pt-9 flex flex-col items-center select-none pointer-events-none">
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl tracking-[0.25em] sm:tracking-[0.3em] uppercase text-primary neon-text drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
          FORGE
        </h1>
      </div>

      {/* INDICADOR INFERIOR DE SCROLL */}
      <a
        href="#apresentacao"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("apresentacao")?.scrollIntoView({ behavior: "smooth" });
        }}
        className="relative z-10 mb-4 sm:mb-6 flex flex-col items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground uppercase tracking-widest animate-pulse transition-colors pointer-events-auto cursor-pointer"
      >
        <span>Role para explorar</span>
        <ChevronDown className="h-4 w-4 text-primary" />
      </a>
    </section>
  );
}
