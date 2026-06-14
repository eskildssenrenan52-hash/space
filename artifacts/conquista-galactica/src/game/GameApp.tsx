import React, { useEffect, useState } from 'react';
import { GameCanvas3D as GameScene3D } from './Scene3D';
import ShipInterior3DView from './ShipInterior3D';
import { GameHUD } from './GamePanels';
import { useGameStore } from './gameStore';
import { TimelinePanel } from './TimelinePanel';
import { EngineeringPanel } from './EngineeringPanel';
import { EmpireToolbar, EmpireOverlays } from './EmpirePanels';
import { NotificationToaster } from './ColonyPanels';
import { CityScene } from './CityScene';
import { useEmpireTick } from './useEmpireTick';
import { useT } from './i18n';
import { PilotHUD } from './PilotMode';
import { ColonizationStatusChip } from './ColonizationPanel';
import { CinematicLayer } from './CinematicLayer';
import { CommandPalette } from './CommandPalette';
import { BattleArena3D } from './BattleArena3D';
import { GalacticWondersPanel, useWondersStore } from './GalacticWonders';
import { AIEmpiresPanel, EmpireEventPopup, useAIEmpiresStore } from './AIEmpiresPanel';
import { GalacticEventsPanel, GalacticEventPopup, useGalacticEventsStore } from './GalacticEventsPanel';
import { TradeRoutesPanel, useTradeRoutesStore } from './TradeRoutesPanel';
import { HeroesPanel, useHeroesStore } from './HeroesPanel';
import { useEmpireStore } from './empireStore';

// ============================================================================
// GAME TICK — master tick that drives all new subsystems
// ============================================================================
function useExpandedTick() {
  const wondersStore = useWondersStore.getState;
  const aiStore = useAIEmpiresStore.getState;
  const eventsStore = useGalacticEventsStore.getState;
  const tradeStore = useTradeRoutesStore.getState;
  const heroesStore = useHeroesStore.getState;

  useEffect(() => {
    let last = performance.now();
    let raf: number;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      wondersStore().tick(dt);
      aiStore().tick(dt);
      eventsStore().tick(dt);
      tradeStore().tick(dt);
      heroesStore().tick(dt);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}

// ============================================================================
// EXPANDED TOOLBAR — new systems
// ============================================================================
const ExpandedSystemsBar: React.FC = () => {
  const openWonders = useWondersStore(s => s.openPanel);
  const openEmpires = useAIEmpiresStore(s => s.openPanel);
  const openEvents = useGalacticEventsStore(s => s.openPanel);
  const openTrade = useTradeRoutesStore(s => s.openPanel);
  const openHeroes = useHeroesStore(s => s.openPanel);
  const heroCount = useHeroesStore(s => s.heroes.length);
  const showNotif = useGalacticEventsStore(s => s.showNotificationBadge);
  const empires = useAIEmpiresStore(s => s.empires);
  const atWar = empires.filter(e => e.diplomaticStatus === 'war').length;
  const routes = useTradeRoutesStore(s => s.routes);
  const activeRoutes = routes.filter(r => r.status === 'active').length;
  const builtWonders = useWondersStore(s => s.builtWonders);
  const activeBuilds = useWondersStore(s => s.activeBuilds);

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-3 py-2 rounded-2xl border border-cyan-500/20 backdrop-blur-md"
         style={{ background: 'rgba(5,5,20,0.85)' }}>

      {/* Galactic Wonders */}
      <button
        onClick={openWonders}
        className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-900/10 transition-all group"
        title="Maravilhas Galácticas"
      >
        <span className="text-xl">🏛️</span>
        <span className="text-[10px] text-amber-300/70 font-mono-hud group-hover:text-amber-300">Maravilhas</span>
        {(builtWonders.length > 0 || activeBuilds.length > 0) && (
          <span className="absolute -top-1 -right-1 bg-amber-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {builtWonders.length + activeBuilds.length}
          </span>
        )}
      </button>

      {/* AI Empires */}
      <button
        onClick={openEmpires}
        className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-900/10 transition-all group"
        title="Impérios Rivais"
      >
        <span className="text-xl">🌍</span>
        <span className="text-[10px] text-orange-300/70 font-mono-hud group-hover:text-orange-300">Impérios</span>
        {atWar > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            ⚔
          </span>
        )}
      </button>

      {/* Trade Routes */}
      <button
        onClick={openTrade}
        className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-green-500/20 hover:border-green-500/50 hover:bg-green-900/10 transition-all group"
        title="Rotas Comerciais"
      >
        <span className="text-xl">🚢</span>
        <span className="text-[10px] text-green-300/70 font-mono-hud group-hover:text-green-300">Comércio</span>
        {activeRoutes > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {activeRoutes}
          </span>
        )}
      </button>

      {/* Galactic Events */}
      <button
        onClick={openEvents}
        className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-purple-500/20 hover:border-purple-500/50 hover:bg-purple-900/10 transition-all group"
        title="Eventos Galácticos"
      >
        <span className="text-xl">⚡</span>
        <span className="text-[10px] text-purple-300/70 font-mono-hud group-hover:text-purple-300">Eventos</span>
        {showNotif && (
          <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
            !
          </span>
        )}
      </button>

      {/* Heroes */}
      <button
        onClick={openHeroes}
        className="relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl border border-yellow-500/20 hover:border-yellow-500/50 hover:bg-yellow-900/10 transition-all group"
        title="Heróis Lendários"
      >
        <span className="text-xl">⭐</span>
        <span className="text-[10px] text-yellow-300/70 font-mono-hud group-hover:text-yellow-300">Heróis</span>
        {heroCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
            {heroCount}
          </span>
        )}
      </button>
    </div>
  );
};

// ============================================================================
// LOADING SCREEN
// ============================================================================
const LoadingScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('Inicializando...');

  useEffect(() => {
    const messages = [
      'Gerando galáxias...',
      'Criando sistemas estelares...',
      'Construindo planetas e biomas...',
      'Inicializando naves...',
      'Carregando modelos 3D...',
      'Estabelecendo mundo de origem...',
      'Ativando impérios rivais...',
      'Preparando maravilhas galácticas...',
      'Calibrando rotas comerciais...',
      'Pronto para conquista!',
    ];

    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setProgress(Math.min(100, p));
      setText(messages[Math.floor(p / 10)] || messages[messages.length - 1]);

      if (p >= 100) {
        clearInterval(interval);
        setTimeout(onComplete, 400);
      }
    }, 180);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-50 overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at center, oklch(0.12 0.05 265) 0%, oklch(0.04 0.02 270) 70%, #000 100%)' }}>
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 220 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white animate-holo-flicker"
               style={{ width: Math.random() * 2 + 0.4, height: Math.random() * 2 + 0.4,
                        left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                        opacity: Math.random() * 0.6 + 0.2, animationDelay: `${Math.random() * 3}s`,
                        boxShadow: '0 0 4px white' }} />
        ))}
      </div>
      {/* Holo grid floor */}
      <div className="holo-grid-bg absolute inset-x-0 bottom-0 h-1/2 opacity-30"
           style={{ maskImage: 'linear-gradient(to top, black, transparent)', WebkitMaskImage: 'linear-gradient(to top, black, transparent)' }} />

      {/* Rotating rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="animate-holo-rotate w-[520px] h-[520px] rounded-full border border-[color:var(--color-holo-cyan)]/20" />
        <div className="animate-holo-rotate w-[360px] h-[360px] absolute rounded-full border border-[color:var(--color-holo-violet)]/30" style={{ animationDirection: 'reverse', animationDuration: '14s' }} />
        <div className="animate-holo-rotate w-[240px] h-[240px] absolute rounded-full border border-dashed border-[color:var(--color-holo-cyan)]/40" style={{ animationDuration: '8s' }} />
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="holo-label mb-3 animate-holo-pulse text-[color:var(--color-holo-cyan)]">// system boot · stardate 3287.4</div>
        <h1 className="font-display text-6xl md:text-7xl font-black holo-text mb-3 tracking-widest animate-holo-flicker">
          CONQUISTA GALÁCTICA
        </h1>
        <p className="text-[color:var(--color-holo-cyan)]/70 font-mono-hud text-sm tracking-[0.4em] uppercase mb-10">3D · Space · Strategy · Empire</p>

        <div className="relative w-96 max-w-full mx-auto">
          <div className="holo-corners holo-panel rounded-md p-1">
            <div className="h-2.5 rounded-sm overflow-hidden bg-black/40">
              <div className="h-full transition-all duration-200"
                   style={{ width: `${progress}%`, background: 'var(--holo-gradient-primary)', boxShadow: 'var(--holo-glow-cyan)' }} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between font-mono-hud text-xs">
            <span className="text-[color:var(--color-holo-cyan)]">{text}</span>
            <span className="text-[color:var(--color-holo-violet)]">{progress.toFixed(0)}%</span>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-2 max-w-2xl mx-auto">
          {[
            ['holo-cyan', '50+ Galáxias 3D'],
            ['holo-violet', 'Naves interativas'],
            ['holo-blue', 'Interior 3D'],
            ['holo-emerald', 'Árvore de pesquisa'],
            ['holo-amber', 'Maravilhas galácticas'],
            ['holo-magenta', 'Impérios rivais'],
            ['holo-emerald', 'Rotas comerciais'],
            ['holo-cyan', 'Eventos galácticos'],
          ].map(([c, label]) => (
            <div key={label} className="holo-chip animate-holo-pulse" style={{ borderColor: `color-mix(in oklab, var(--color-${c}) 50%, transparent)`, color: `color-mix(in oklab, var(--color-${c}) 90%, white)`, animationDelay: `${Math.random()}s` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: `var(--color-${c})`, boxShadow: `0 0 8px var(--color-${c})` }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN MENU
// ============================================================================
const MainMenu: React.FC<{ onStart: () => void }> = ({ onStart }) => {
  const t = useT();
  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 overflow-hidden"
         style={{ background: 'radial-gradient(ellipse at 50% 40%, oklch(0.14 0.07 270) 0%, oklch(0.05 0.03 270) 65%, #000 100%)' }}>
      {/* Star field */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 300 }).map((_, i) => {
          const colors = ['#ffffff', '#ff9999', '#99ccff', '#ffff99'];
          return (
            <div key={i} className="absolute rounded-full animate-holo-flicker"
                 style={{ width: Math.random() * 2 + 0.5, height: Math.random() * 2 + 0.5,
                          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                          backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                          opacity: Math.random() * 0.7 + 0.2, animationDelay: `${Math.random() * 4}s`,
                          boxShadow: `0 0 6px ${colors[Math.floor(Math.random() * colors.length)]}` }} />
          );
        })}
      </div>

      {/* Galaxy spiral glow */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
        <div className="w-[640px] h-[640px] rounded-full animate-holo-rotate"
             style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(100,180,255,0.35) 60deg, rgba(170,80,220,0.3) 180deg, transparent 300deg)',
                      transform: 'rotateX(60deg)', filter: 'blur(40px)', animationDuration: '40s' }} />
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="holo-label mb-3 text-[color:var(--color-holo-cyan)] animate-holo-pulse">// command bridge · ready</div>
        <h1 className="font-display text-6xl md:text-8xl font-black holo-text mb-2 tracking-[0.06em] animate-holo-flicker">
          {t('app.title')}
        </h1>
        <p className="font-mono-hud text-[color:var(--color-holo-cyan)]/70 text-sm tracking-[0.5em] uppercase mb-12">{t('app.subtitle')}</p>

        <div className="flex flex-col items-center gap-3">
          <button onClick={onStart} className="holo-btn holo-corners w-72 text-base">
            ▶ {t('menu.new')}
          </button>
          <button className="holo-btn-ghost w-72">{t('menu.load')}</button>
        </div>

        <div className="mt-14 max-w-4xl mx-auto">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {[
              ['50+', 'Galáxias',      'holo-cyan'],
              ['3D',  'Interiores',    'holo-violet'],
              ['9',   'Maravilhas',    'holo-amber'],
              ['8+',  'Impérios IA',   'holo-magenta'],
              ['100+','Tecnologias',   'holo-emerald'],
              ['\u221E','Partidas',    'holo-blue'],
            ].map(([val, label, c]) => (
              <div key={label as string} className="holo-panel holo-corners rounded-lg p-3 holo-scanlines">
                <div className="holo-stat-value text-2xl" style={{ color: `var(--color-${c})`, textShadow: `0 0 14px var(--color-${c})` }}>{val}</div>
                <div className="holo-label mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-6 max-w-2xl mx-auto grid grid-cols-2 gap-2 text-left">
          {[
            ['🏛️', 'Maravilhas Galácticas', 'Esfera de Dyson, Mundo Anel, Nexo da Mente'],
            ['🌍', 'Impérios Rivais IA', 'Diplomacia, guerra e diplomacia com 8 impérios'],
            ['🚢', 'Rotas Comerciais', 'Renda passiva de comércio interestelar'],
            ['⚡', 'Eventos Galácticos', 'Supernovas, buracos de minhoca e pandemias'],
            ['⭐', 'Heróis Lendários', 'Almirantes, cientistas, oráculos e guerreiros míticos'],
            ['🪐', '32 Biomas Planetários', 'Cristalino, Fungal, Quantum, Void, Ascendido e mais'],
          ].map(([icon, title, desc]) => (
            <div key={title as string} className="holo-panel rounded-lg p-3 text-left">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{icon}</span>
                <span className="text-white text-xs font-bold">{title}</span>
              </div>
              <p className="text-gray-400 text-[10px]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// GAME INITIALIZATION HOOK
// ============================================================================
function useGameInit() {
  const initGame = useGameStore(s => s.initializeGame);
  const initEmpire = useEmpireStore(s => s.initEmpire);
  const initAIEmpires = useAIEmpiresStore(s => s.initEmpires);

  useEffect(() => {
    initGame();
    initEmpire();
    initAIEmpires();
  }, []);
}

// ============================================================================
// MAIN GAME VIEW
// ============================================================================
const GameView: React.FC = () => {
  const { showShipInterior } = useGameStore();
  useEmpireTick();
  useExpandedTick();
  useGameInit();

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-950">
      {/* 3D Scene */}
      <GameScene3D />

      {/* Cinematic ambient layer */}
      {!showShipInterior && <CinematicLayer />}

      {/* HUD overlay */}
      <GameHUD />

      {/* 3D Ship Interior */}
      {showShipInterior && <ShipInterior3DView />}

      {/* Linha do Tempo + Engenharia */}
      <TimelinePanel />
      <EngineeringPanel />

      {/* Império + Guerra + Mercado */}
      <EmpireToolbar />
      <EmpireOverlays />

      {/* Notificações + Cidade 3D */}
      <NotificationToaster />
      <CityScene />

      {/* Modo Piloto */}
      <PilotHUD />

      {/* Colonização */}
      <ColonizationStatusChip />

      {/* Command Palette */}
      <CommandPalette />

      {/* Battle Arena 3D */}
      <BattleArena3D />

      {/* ===== NEW SYSTEMS ===== */}

      {/* Expanded systems toolbar */}
      {!showShipInterior && <ExpandedSystemsBar />}

      {/* Galactic Wonders */}
      <GalacticWondersPanel />

      {/* AI Empires */}
      <AIEmpiresPanel />
      <EmpireEventPopup />

      {/* Galactic Events */}
      <GalacticEventsPanel />
      <GalacticEventPopup />

      {/* Trade Routes */}
      <TradeRoutesPanel />

      {/* Legendary Heroes */}
      <HeroesPanel />
    </div>
  );
};

// ============================================================================
// ROOT APP
// ============================================================================
function App() {
  const [state, setState] = useState<'menu' | 'loading' | 'playing'>('menu');

  if (state === 'menu') {
    return <MainMenu onStart={() => setState('loading')} />;
  }

  if (state === 'loading') {
    return <LoadingScreen onComplete={() => setState('playing')} />;
  }

  return <GameView />;
}

export default App;
