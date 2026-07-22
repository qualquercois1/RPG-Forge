import { useState, useEffect, useRef } from "react";
import { Dices, Sparkles, Trash2, ShieldAlert, ShieldCheck, Skull } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type DieType = "d2" | "d4" | "d6" | "d8" | "d10" | "d12" | "d16" | "d20" | "d100";

interface RollResult {
  id: string;
  charName: string;
  dieType: DieType;
  baseValue: number;
  modifier: number;
  total: number;
  timestamp: string;
  isCriticalSuccess: boolean;
  isCriticalFailure: boolean;
}

interface Character {
  id: number;
  name: string;
  classe: string;
}

interface DiceRollerProps {
  tableId: number;
  tableCharacters: Character[];
  isGM: boolean;
}

export function DiceRoller({ tableId, tableCharacters, isGM }: DiceRollerProps) {
  const [selectedDie, setSelectedDie] = useState<DieType>("d20");
  const [characterName, setCharacterName] = useState<string>("");
  const [modifier, setModifier] = useState<number>(0);
  const [rolling, setRolling] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string | number>("?");
  const [history, setHistory] = useState<RollResult[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string }[]>([]);
  
  const rollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`rpg-forge-rolls-table-${tableId}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Error loading roll history:", e);
      }
    }
  }, [tableId]);

  // Set default character name based on characters or GM role
  useEffect(() => {
    if (tableCharacters.length > 0) {
      setCharacterName(tableCharacters[0].name);
    } else if (isGM) {
      setCharacterName("Mestre");
    } else {
      setCharacterName("Jogador");
    }
  }, [tableCharacters, isGM]);

  const saveHistory = (newHistory: RollResult[]) => {
    setHistory(newHistory);
    localStorage.setItem(`rpg-forge-rolls-table-${tableId}`, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    saveHistory([]);
  };

  const getDieSides = (die: DieType): number => {
    const sides: Record<DieType, number> = {
      d2: 2,
      d4: 4,
      d6: 6,
      d8: 8,
      d10: 10,
      d12: 12,
      d16: 16,
      d20: 20,
      d100: 100,
    };
    return sides[die];
  };

  const generateParticles = () => {
    const colors = ["#bbff00", "#00ffff", "#ff00ff", "#ffaa00", "#ff0055"];
    const newParticles = Array.from({ length: 24 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 160,
      y: (Math.random() - 0.5) * 160,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 800);
  };

  const handleRoll = () => {
    if (rolling) return;

    setRolling(true);
    const sides = getDieSides(selectedDie);
    
    // Sound effect trigger (simple synthetic beep using web audio context for maximum polish)
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(300, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      osc.start();
      
      // Pitch bend to simulate roll
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.6);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
      
      setTimeout(() => {
        osc.stop();
        audioCtx.close();
      }, 700);
    } catch (e) {
      // Audio context might fail on user gesture policies or not supported, ignore
    }

    // Rapidly change values for simulation
    let duration = 800; // ms
    let intervalTime = 50; // ms
    let elapsed = 0;

    rollIntervalRef.current = setInterval(() => {
      const tempVal = Math.floor(Math.random() * sides) + 1;
      setCurrentValue(tempVal);
      elapsed += intervalTime;

      if (elapsed >= duration) {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        
        // Final Roll
        const finalBase = Math.floor(Math.random() * sides) + 1;
        const finalTotal = finalBase + modifier;
        
        // Critical conditions (specifically for D20 or generic max/min)
        const isCriticalSuccess = selectedDie === "d20" && finalBase === 20;
        const isCriticalFailure = selectedDie === "d20" && finalBase === 1;

        setCurrentValue(finalBase);
        setRolling(false);
        generateParticles();

        // Add play sound on finish
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          
          if (isCriticalSuccess) {
            osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
            osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
            gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
          } else if (isCriticalFailure) {
            osc.frequency.setValueAtTime(150, audioCtx.currentTime); 
            osc.frequency.setValueAtTime(110, audioCtx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
          } else {
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
          }
          osc.start();
          setTimeout(() => {
            osc.stop();
            audioCtx.close();
          }, 600);
        } catch (e) {}

        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        const newResult: RollResult = {
          id: Math.random().toString(36).substring(2, 9),
          charName: characterName || (isGM ? "Mestre" : "Jogador"),
          dieType: selectedDie,
          baseValue: finalBase,
          modifier,
          total: finalTotal,
          timestamp: timeStr,
          isCriticalSuccess,
          isCriticalFailure,
        };

        saveHistory([newResult, ...history]);
      }
    }, intervalTime);
  };

  // Render SVG representation for each die type
  const renderDieSVG = (die: DieType, isSmall = false) => {
    const strokeWidth = isSmall ? 5 : 3;
    const baseClass = isSmall ? "w-8 h-8" : "w-44 h-44 drop-shadow-[0_0_20px_rgba(187,255,0,0.25)] transition-all duration-300";
    
    switch (die) {
      case "d2":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
            <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth={strokeWidth/2} strokeDasharray="5,5" />
            <path d="M 35 50 Q 50 35 65 50 Q 50 65 35 50" fill="none" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
      case "d4":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,8 92,85 8,85" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <line x1="50" y1="8" x2="50" y2="85" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="8" y1="85" x2="50" y2="58" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="92" y1="85" x2="50" y2="58" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
      case "d6":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <rect x="12" y="12" width="76" height="76" rx="8" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
            <path d="M 12 12 L 32 32 M 88 12 L 68 32 M 12 88 L 32 68 M 88 88 L 68 68 M 32 32 L 68 32 L 68 68 L 32 68 Z" fill="none" stroke="currentColor" strokeWidth={strokeWidth/3} strokeDasharray="3,3" />
          </svg>
        );
      case "d8":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,7 93,50 50,93 7,50" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <line x1="7" y1="50" x2="93" y2="50" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="50" y1="7" x2="50" y2="93" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
      case "d10":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,7 91,37 50,93 9,37" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <line x1="9" y1="37" x2="50" y2="47" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="91" y1="37" x2="50" y2="47" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="50" y1="7" x2="50" y2="47" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="50" y1="93" x2="50" y2="47" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
      case "d12":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,7 91,37 75,87 25,87 9,37" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <polygon points="50,29 70,44 62,69 38,69 30,44" fill="none" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="50" y1="7" x2="50" y2="29" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="91" y1="37" x2="70" y2="44" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="75" y1="87" x2="62" y2="69" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="25" y1="87" x2="38" y2="69" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="9" y1="37" x2="30" y2="44" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
      case "d16":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,7 76,14 93,35 93,65 76,86 50,93 24,86 7,65 7,35 24,14" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="currentColor" strokeWidth={strokeWidth/3} strokeDasharray="4,4" />
          </svg>
        );
      case "d20":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <polygon points="50,6 92,30 92,70 50,94 8,70 8,30" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round" />
            <polygon points="50,26 78,59 22,59" fill="none" stroke="currentColor" strokeWidth={strokeWidth/1.5} />
            <line x1="50" y1="6" x2="50" y2="26" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="92" y1="30" x2="78" y2="26" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="92" y1="30" x2="78" y2="59" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="92" y1="70" x2="78" y2="59" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="50" y1="94" x2="78" y2="59" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="50" y1="94" x2="50" y2="59" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="50" y1="94" x2="22" y2="59" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="8" y1="70" x2="22" y2="59" stroke="currentColor" strokeWidth={strokeWidth/3} />
            <line x1="8" y1="30" x2="22" y2="59" stroke="currentColor" strokeWidth={strokeWidth/2} />
            <line x1="8" y1="30" x2="22" y2="26" stroke="currentColor" strokeWidth={strokeWidth/3} />
          </svg>
        );
      case "d100":
        return (
          <svg viewBox="0 0 100 100" className={baseClass}>
            <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
            <path d="M 50 7 A 43 43 0 0 1 50 93" fill="none" stroke="currentColor" strokeWidth={strokeWidth/3} strokeDasharray="3,3" />
            <line x1="7" y1="50" x2="93" y2="50" stroke="currentColor" strokeWidth={strokeWidth/2} />
          </svg>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      {/* CSS Animations style block for awesome rolling effects */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dice-shake {
          0% { transform: translate(0, 0) rotate(0deg); }
          12% { transform: translate(-5px, -3px) rotate(-6deg); }
          25% { transform: translate(4px, 2px) rotate(6deg); }
          37% { transform: translate(-4px, 4px) rotate(-9deg); }
          50% { transform: translate(3px, -3px) rotate(9deg); }
          62% { transform: translate(-2px, 2px) rotate(-5deg); }
          75% { transform: translate(4px, 4px) rotate(7deg); }
          87% { transform: translate(-4px, -2px) rotate(-7deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        @keyframes dice-spin-3d {
          0% { transform: scale(1) rotate(0deg); filter: brightness(1); }
          20% { transform: scale(1.15) rotate(144deg); filter: brightness(1.3); }
          40% { transform: scale(0.9) rotate(288deg); filter: brightness(0.85); }
          60% { transform: scale(1.2) rotate(432deg); filter: brightness(1.4); }
          80% { transform: scale(1.05) rotate(576deg); filter: brightness(1.1); }
          100% { transform: scale(1) rotate(720deg); filter: brightness(1); }
        }

        .animate-dice-shake {
          animation: dice-shake 0.5s ease-in-out infinite;
        }

        .animate-dice-roll {
          animation: dice-spin-3d 0.8s cubic-bezier(0.25, 1.4, 0.5, 1.1) forwards;
        }

        @keyframes particle-fade {
          0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
          100% { transform: translate(var(--tw-part-x), var(--tw-part-y)) scale(0); opacity: 0; }
        }
        
        .spark-particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          animation: particle-fade 0.8s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
      `}} />

      {/* Roller Panel */}
      <Card className="p-6 bg-card/60 backdrop-blur border-border flex flex-col items-center relative overflow-hidden">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        <h2 className="font-display text-2xl self-start mb-6 flex items-center gap-2">
          <Dices className="h-5 w-5 text-primary" /> Dado Ativo
        </h2>

        {/* Dice Selection Ribbon */}
        <div className="w-full flex justify-between gap-1 md:gap-2 mb-8 bg-black/20 p-2 rounded-lg border border-border overflow-x-auto select-none no-scrollbar">
          {(["d2", "d4", "d6", "d8", "d10", "d12", "d16", "d20", "d100"] as DieType[]).map((die) => (
            <button
              key={die}
              onClick={() => !rolling && setSelectedDie(die)}
              disabled={rolling}
              className={cn(
                "flex flex-col items-center gap-1.5 p-2 rounded-md transition-all shrink-0 min-w-[46px] border",
                selectedDie === die
                  ? "bg-primary/10 text-primary border-primary/40 shadow-[0_0_12px_rgba(187,255,0,0.15)]"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/40"
              )}
            >
              {renderSmallDieIcon(die)}
              <span className="font-mono text-xs font-semibold uppercase">{die}</span>
            </button>
          ))}
        </div>

        {/* The Animated Die Display */}
        <div 
          onClick={handleRoll}
          className={cn(
            "relative cursor-pointer my-4 flex items-center justify-center select-none active:scale-95 transition-transform",
            rolling ? "pointer-events-none" : ""
          )}
        >
          {/* Particles when die finishes rolling */}
          {particles.map((p) => (
            <span
              key={p.id}
              className="spark-particle"
              style={{
                backgroundColor: p.color,
                boxShadow: `0 0 8px ${p.color}`,
                left: "50%",
                top: "50%",
                marginTop: "-3px",
                marginLeft: "-3px",
                "--tw-part-x": `${p.x}px`,
                "--tw-part-y": `${p.y}px`,
              } as any}
            />
          ))}

          {/* Glowing Aura Ring */}
          <div className={cn(
            "absolute inset-0 rounded-full bg-primary/5 blur-3xl transition-opacity duration-500",
            rolling ? "opacity-30" : "opacity-100"
          )} />

          {/* SVG Die Body */}
          <div className={cn(
            "text-primary",
            rolling ? "animate-dice-roll" : "hover:scale-105 hover:text-primary/90 transition-transform duration-300"
          )}>
            {renderDieSVG(selectedDie)}
          </div>

          {/* Value Display */}
          <div 
            className={cn(
              "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-4xl md:text-5xl font-bold tracking-normal text-foreground drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
              rolling ? "scale-90 opacity-70" : "animate-bounce-short"
            )}
          >
            {currentValue}
          </div>
        </div>

        {/* Controls: Modifiers & Roles */}
        {(() => {
          const selectedChar = tableCharacters.find((c) => c.name === characterName);
          const isSelectedCharDead = selectedChar ? selectedChar.alive === 0 : false;

          return (
            <>
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-border">
                {/* Character selection */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Quem está rolando?</Label>
                  <select
                    value={characterName}
                    onChange={(e) => setCharacterName(e.target.value)}
                    disabled={rolling}
                    className="w-full rounded-md bg-input/40 border border-border px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground"
                  >
                    {isGM && <option value="Mestre" className="bg-card text-foreground">Mestre (GM)</option>}
                    {tableCharacters.map((c) => (
                      <option key={c.id} value={c.name} className="bg-card text-foreground">
                        {c.name} ({c.classe}){c.alive === 0 ? " — 💀 MORTO" : ""}
                      </option>
                    ))}
                    {tableCharacters.length === 0 && !isGM && (
                      <option value="Jogador" className="bg-card text-foreground">Jogador (Sem herói vinculado)</option>
                    )}
                  </select>
                </div>

                {/* Modifier Input */}
                <div className="space-y-1.5">
                  <Label className="text-xs uppercase tracking-widest text-muted-foreground">Modificador</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={rolling || isSelectedCharDead}
                      onClick={() => setModifier((prev) => prev - 1)}
                      className="h-9 w-9 border-border bg-input/20"
                    >
                      -
                    </Button>
                    <div className="flex-1 bg-input/35 border border-border rounded-md flex items-center justify-center font-mono font-bold text-sm">
                      {modifier >= 0 ? `+${modifier}` : modifier}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={rolling || isSelectedCharDead}
                      onClick={() => setModifier((prev) => prev + 1)}
                      className="h-9 w-9 border-border bg-input/20"
                    >
                      +
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={rolling || modifier === 0 || isSelectedCharDead}
                      onClick={() => setModifier(0)}
                      className="text-xs font-mono"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              </div>

              {isSelectedCharDead && (
                <div className="w-full mt-4 p-3 bg-destructive/15 border border-destructive/40 rounded-lg text-destructive text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in duration-200">
                  <Skull className="h-4 w-4" />
                  Personagem Morto — Rolagens de Dados Bloqueadas
                </div>
              )}

              {/* Big Roll Button */}
              <Button
                onClick={handleRoll}
                disabled={rolling || isSelectedCharDead}
                className={cn(
                  "w-full mt-6 py-6 font-display text-xl tracking-wider uppercase font-bold neon-border hover:bg-primary hover:text-black transition-all",
                  isSelectedCharDead && "opacity-50 cursor-not-allowed bg-muted text-muted-foreground border-destructive/40 hover:bg-muted hover:text-muted-foreground"
                )}
              >
                <Sparkles className="mr-2 h-5 w-5" /> {isSelectedCharDead ? "PERSONAGEM MORTO" : "ROLAR DADO"}
              </Button>
            </>
          );
        })()}
      </Card>

      {/* History Log */}
      <Card className="p-5 bg-card/45 backdrop-blur border-border flex flex-col h-[520px] lg:h-auto">
        <header className="flex justify-between items-center mb-4 border-b border-border pb-3">
          <h3 className="font-display text-xl flex items-center gap-2">
            <Dices className="h-4.5 w-4.5 text-primary" /> Histórico de Rolagens
          </h3>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearHistory}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Limpar Histórico"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </header>

        {/* Scrollable history log */}
        <ScrollArea className="flex-1 pr-1">
          {history.length === 0 ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-4">
              <Dices className="h-10 w-10 text-muted-foreground/40 mb-2 stroke-[1.5]" />
              <p className="text-sm text-muted-foreground">Nenhum dado rolado ainda.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Escolha o dado ao lado e clique em rolar!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((roll) => {
                const isCritS = roll.isCriticalSuccess;
                const isCritF = roll.isCriticalFailure;
                
                return (
                  <div
                    key={roll.id}
                    className={cn(
                      "p-3 rounded-lg border text-sm transition-all relative overflow-hidden",
                      isCritS
                        ? "bg-primary/5 border-primary/40 shadow-[0_0_8px_rgba(187,255,0,0.1)]"
                        : isCritF
                        ? "bg-destructive/5 border-destructive/35"
                        : "bg-black/10 border-border"
                    )}
                  >
                    {/* Tiny visual bar indicator on left side */}
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      isCritS ? "bg-primary" : isCritF ? "bg-destructive" : "bg-muted"
                    )} />

                    <div className="flex justify-between items-start pl-2">
                      <div>
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <span>{roll.charName}</span>
                          <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.25 rounded bg-secondary text-muted-foreground">
                            {roll.dieType}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                          Resultado: {roll.baseValue}
                          {roll.modifier !== 0 && (
                            <> {roll.modifier > 0 ? "+" : ""}{roll.modifier}</>
                          )}
                        </div>
                      </div>

                      {/* Total Box */}
                      <div className="text-right flex flex-col items-end">
                        <div className={cn(
                          "font-display text-2xl font-bold leading-none",
                          isCritS ? "text-primary neon-text" : isCritF ? "text-destructive" : "text-foreground"
                        )}>
                          {roll.total}
                        </div>
                        <span className="text-[9px] text-muted-foreground font-mono mt-1">
                          {roll.timestamp}
                        </span>
                      </div>
                    </div>

                    {/* Critical Badges */}
                    {(isCritS || isCritF) && (
                      <div className="mt-2 pl-2 flex items-center gap-1 text-[10px] font-bold tracking-wider font-mono">
                        {isCritS ? (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                            <span className="text-primary uppercase">Crítico! Sucesso Absoluto</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="h-3.5 w-3.5 text-destructive" />
                            <span className="text-destructive uppercase">Desastre! Falha Crítica</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}

// Render small icons for die selector using custom micro-SVG representations
function renderSmallDieIcon(die: DieType) {
  const strokeWidth = 3;
  const baseClass = "w-5 h-5 opacity-80 hover:opacity-100 transition-opacity";

  switch (die) {
    case "d2":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d4":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,10 90,85 10,85" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d6":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <rect x="15" y="15" width="70" height="70" rx="6" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d8":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d10":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,10 88,40 50,90 12,40" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d12":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,10 90,38 75,85 25,85 10,38" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d16":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,8 75,15 92,35 92,65 75,85 50,92 25,85 8,65 8,35 25,15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d20":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <polygon points="50,8 90,30 90,70 50,92 10,70 10,30" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
        </svg>
      );
    case "d100":
      return (
        <svg viewBox="0 0 100 100" className={baseClass}>
          <circle cx="50" cy="50" r="43" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
          <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth={strokeWidth/2} />
        </svg>
      );
  }
}
