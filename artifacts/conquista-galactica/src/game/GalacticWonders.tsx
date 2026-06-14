// ============================================================================
// GALACTIC WONDERS PANEL — Build mega-structures and unique wonders
// ============================================================================
import React, { useState } from 'react';
import { X, Star, Zap, Clock, ChevronRight, Lock, CheckCircle, Hammer, Info } from 'lucide-react';
import { create } from 'zustand';
import { useGameStore } from './gameStore';
import { GALACTIC_WONDERS, WONDER_BY_ID, RARITY_WONDER_INFO, type GalacticWonder, type WonderStatus } from './data/wondersData';

// ============================================================================
// STORE
// ============================================================================
interface ActiveWonder {
  id: string;
  wonderId: string;
  planetName: string;
  progress: number;   // 0..1
  startedAt: number;
  paused: boolean;
}

interface WondersState {
  builtWonders: string[];           // wonderId[]
  activeBuilds: ActiveWonder[];
  showPanel: boolean;
  selectedWonder: string | null;

  openPanel: () => void;
  closePanel: () => void;
  selectWonder: (id: string | null) => void;
  startBuild: (wonderId: string, planetName: string) => boolean;
  cancelBuild: (buildId: string) => void;
  tick: (delta: number) => void;
  getStatus: (wonderId: string) => WonderStatus;
}

let wid = 0;
const nwid = () => `aw_${wid++}`;

export const useWondersStore = create<WondersState>((set, get) => ({
  builtWonders: [],
  activeBuilds: [],
  showPanel: false,
  selectedWonder: null,

  openPanel: () => set({ showPanel: true }),
  closePanel: () => set({ showPanel: false }),
  selectWonder: (id) => set({ selectedWonder: id }),

  startBuild: (wonderId, planetName) => {
    const g = useGameStore.getState();
    const wonder = WONDER_BY_ID[wonderId];
    if (!wonder) return false;

    const state = get();
    const built = state.builtWonders.filter(id => id === wonderId).length;
    if (built >= wonder.maxInstances) return false;
    if (state.activeBuilds.some(b => b.wonderId === wonderId)) return false;

    // check credits
    if (g.credits < wonder.creditCost) {
      g.addNotification({ type: 'warning', message: `Créditos insuficientes para ${wonder.name}` });
      return false;
    }

    if (!g.spendCredits(wonder.creditCost)) return false;

    set(s => ({
      activeBuilds: [...s.activeBuilds, {
        id: nwid(),
        wonderId,
        planetName,
        progress: 0,
        startedAt: g.gameTime,
        paused: false,
      }],
    }));
    g.addNotification({ type: 'info', message: `Iniciada construção: ${wonder.name}` });
    return true;
  },

  cancelBuild: (buildId) => {
    const build = get().activeBuilds.find(b => b.id === buildId);
    if (!build) return;
    const wonder = WONDER_BY_ID[build.wonderId];
    if (wonder) {
      // refund 50%
      useGameStore.getState().addCredits(Math.floor(wonder.creditCost * 0.5));
    }
    set(s => ({ activeBuilds: s.activeBuilds.filter(b => b.id !== buildId) }));
  },

  tick: (delta) => {
    const g = useGameStore.getState();
    if (g.paused) return;
    const speed = g.gameSpeed;
    const dt = delta * speed;

    const completed: string[] = [];
    const activeBuilds = get().activeBuilds.map(b => {
      if (b.paused) return b;
      const wonder = WONDER_BY_ID[b.wonderId];
      if (!wonder) return b;
      const newProgress = b.progress + dt / wonder.buildTime;
      if (newProgress >= 1) {
        completed.push(b.wonderId);
        return null;
      }
      return { ...b, progress: newProgress };
    }).filter(Boolean) as ActiveWonder[];

    if (completed.length > 0) {
      set(s => ({
        builtWonders: [...s.builtWonders, ...completed],
        activeBuilds,
      }));
      completed.forEach(wId => {
        const w = WONDER_BY_ID[wId];
        if (w) g.addNotification({ type: 'success', message: `🏗️ Maravilha concluída: ${w.name}!` });
      });
    } else {
      set({ activeBuilds });
    }
  },

  getStatus: (wonderId) => {
    const state = get();
    const wonder = WONDER_BY_ID[wonderId];
    if (!wonder) return 'locked';
    if (state.activeBuilds.some(b => b.wonderId === wonderId)) return 'building';
    const built = state.builtWonders.filter(id => id === wonderId).length;
    if (built >= wonder.maxInstances) return 'built';
    return 'available';
  },
}));

// ============================================================================
// UI COMPONENTS
// ============================================================================

const TIER_COLORS: Record<number, string> = {
  1: '#22d3ee', 2: '#34d399', 3: '#a855f7', 4: '#f59e0b', 5: '#ec4899',
};
const TIER_LABELS: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
};

const WonderCard: React.FC<{ wonder: GalacticWonder; isSelected: boolean; onSelect: () => void }> = ({ wonder, isSelected, onSelect }) => {
  const status = useWondersStore(s => s.getStatus(wonder.id));
  const rarInfo = RARITY_WONDER_INFO[wonder.rarity];
  const tierColor = TIER_COLORS[wonder.tier];

  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'border-current bg-white/5'
          : 'hover:border-white/20'
      } ${status === 'built' ? 'opacity-70' : ''}`}
      style={isSelected
        ? { borderColor: rarInfo.color, boxShadow: `0 0 20px ${rarInfo.glow}` }
        : { background: 'rgba(6,6,18,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{wonder.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm">{wonder.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ color: rarInfo.color, background: `${rarInfo.glow}`, border: `1px solid ${rarInfo.color}40` }}>
              {rarInfo.label}
            </span>
            <span className="text-xs px-1.5 rounded" style={{ color: tierColor, background: `${tierColor}20` }}>
              Tier {TIER_LABELS[wonder.tier]}
            </span>
          </div>
          <p className="text-gray-400 text-xs mt-1 line-clamp-2">{wonder.desc}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1">
          {status === 'built' && <CheckCircle size={16} className="text-green-400" />}
          {status === 'building' && <Hammer size={16} className="text-amber-400 animate-pulse" />}
          {status === 'locked' && <Lock size={16} className="text-gray-500" />}
          <ChevronRight size={14} className="text-gray-500" />
        </div>
      </div>
    </button>
  );
};

const WonderDetail: React.FC<{ wonder: GalacticWonder }> = ({ wonder }) => {
  const { startBuild, cancelBuild, activeBuilds, builtWonders, getStatus } = useWondersStore();
  const { credits, planets } = useGameStore();
  const status = getStatus(wonder.id);
  const rarInfo = RARITY_WONDER_INFO[wonder.rarity];
  const tierColor = TIER_COLORS[wonder.tier];
  const activeBuild = activeBuilds.find(b => b.wonderId === wonder.id);
  const builtCount = builtWonders.filter(id => id === wonder.id).length;

  const ownedPlanets = planets.filter(p => p.owned || p.colonies.length > 0);
  const [selectedPlanet, setSelectedPlanet] = useState(ownedPlanets[0]?.name || '');

  const canAfford = credits >= wonder.creditCost;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border" style={{ borderColor: `${rarInfo.color}40`, background: `${rarInfo.glow}` }}>
        <div className="text-5xl">{wonder.icon}</div>
        <div>
          <h3 className="font-bold text-white text-lg">{wonder.name}</h3>
          <div className="flex gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: rarInfo.color, border: `1px solid ${rarInfo.color}60`, background: `${rarInfo.color}15` }}>
              {rarInfo.label}
            </span>
            <span className="text-xs px-2 py-0.5 rounded" style={{ color: tierColor, background: `${tierColor}20` }}>
              Tier {TIER_LABELS[wonder.tier]}
            </span>
            <span className="text-xs px-2 py-0.5 rounded text-gray-300 capitalize"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
              {wonder.category.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Lore */}
      <div className="p-3 rounded-xl italic text-gray-300 text-xs"
           style={{ background: 'rgba(10,8,25,0.7)', border: '1px solid rgba(139,92,246,0.15)' }}>
        "{wonder.lore}"
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm">{wonder.desc}</p>

      {/* Effects */}
      <div>
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Efeitos</h4>
        <div className="space-y-1.5">
          {wonder.effects.map((eff, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <Star size={12} className="text-amber-400 flex-shrink-0" />
              <span className="text-white font-medium">{eff.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Unique Power */}
      <div className="p-3 rounded-xl"
           style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.2)' }}>
        <div className="text-[10px] font-bold text-purple-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wider">
          <Zap size={11} /> PODER ÚNICO
        </div>
        <p className="text-purple-100 text-xs leading-relaxed">{wonder.uniquePower}</p>
      </div>

      {/* Build info */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] text-gray-500 font-mono mb-0.5">Custo</div>
          <div className={`font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>{wonder.creditCost.toLocaleString()} cr</div>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] text-gray-500 font-mono mb-0.5">Tempo</div>
          <div className="text-cyan-300 font-bold flex items-center gap-1">
            <Clock size={10} /> {wonder.buildTime} ticks
          </div>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] text-gray-500 font-mono mb-0.5">Construídas</div>
          <div className="text-white font-bold">{builtCount}/{wonder.maxInstances}</div>
        </div>
        <div className="p-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="text-[10px] text-gray-500 font-mono mb-0.5">Raridade</div>
          <div className="font-bold" style={{ color: rarInfo.color }}>{rarInfo.label}</div>
        </div>
      </div>

      {/* Build controls */}
      {status === 'built' && (
        <div className="flex items-center gap-2 p-3 rounded-xl"
             style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)' }}>
          <CheckCircle size={15} className="text-green-400" />
          <span className="text-green-300 text-sm font-bold">Construída e ativa!</span>
        </div>
      )}

      {status === 'building' && activeBuild && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Em construção em {activeBuild.planetName}</span>
            <span>{(activeBuild.progress * 100).toFixed(1)}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${activeBuild.progress * 100}%`, background: `linear-gradient(90deg, ${tierColor}, ${rarInfo.color})` }}
            />
          </div>
          <button
            onClick={() => cancelBuild(activeBuild.id)}
            className="w-full text-xs py-1.5 rounded border border-red-500/40 text-red-400 hover:bg-red-900/20 transition-colors"
          >
            Cancelar Construção (reembolso 50%)
          </button>
        </div>
      )}

      {status === 'available' && (
        <div className="space-y-2">
          <select
            value={selectedPlanet}
            onChange={e => setSelectedPlanet(e.target.value)}
            className="w-full p-2 text-xs rounded text-white"
            style={{ background: 'rgba(10,15,25,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {ownedPlanets.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <button
            onClick={() => startBuild(wonder.id, selectedPlanet)}
            disabled={!canAfford || !selectedPlanet}
            className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
              canAfford && selectedPlanet
                ? 'text-white hover:brightness-110'
                : 'text-gray-500 cursor-not-allowed'
            }`}
            style={canAfford && selectedPlanet ? {
              background: `linear-gradient(135deg, ${tierColor}cc, ${rarInfo.color}cc)`,
              boxShadow: `0 4px 20px ${rarInfo.glow}`,
            } : {}}
          >
            {canAfford ? '🏗️ Iniciar Construção' : `❌ Sem créditos (faltam ${(wonder.creditCost - credits).toLocaleString()} cr)`}
          </button>
        </div>
      )}
    </div>
  );
};

export const GalacticWondersPanel: React.FC = () => {
  const { showPanel, closePanel, selectedWonder, selectWonder, activeBuilds, builtWonders } = useWondersStore();

  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  if (!showPanel) return null;

  const filtered = GALACTIC_WONDERS.filter(w => {
    if (filterTier && w.tier !== filterTier) return false;
    if (filterCategory && w.category !== filterCategory) return false;
    return true;
  });

  const selectedWonderData = selectedWonder ? WONDER_BY_ID[selectedWonder] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-6xl h-[88vh] flex flex-col rounded-2xl overflow-hidden"
           style={{
             background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(6,6,36,0.98))',
             border: '1px solid rgba(34,211,238,0.2)',
             boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.05)',
           }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
             style={{ borderColor: 'rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.04)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl text-2xl" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>🏛️</div>
            <div>
              <div className="text-[10px] font-mono text-gray-600">// MEGA-STRUCTURES</div>
              <h2 className="text-xl font-bold text-white tracking-wider">MARAVILHAS GALÁCTICAS</h2>
              <p className="text-[11px] font-mono" style={{ color: 'rgba(34,211,238,0.6)' }}>
                {builtWonders.length} construídas · {activeBuilds.length} em progresso
              </p>
            </div>
          </div>
          <button onClick={closePanel}
                  className="p-2 rounded-xl transition-all text-gray-500 hover:text-white"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 px-6 py-3 shrink-0"
             style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,10,0.3)' }}>
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">Tier:</span>
          {[null, 1, 2, 3, 4, 5].map(t => (
            <button
              key={String(t)}
              onClick={() => setFilterTier(t)}
              className="px-2.5 py-1 text-[11px] rounded-lg transition-all font-bold"
              style={filterTier === t
                ? { background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.5)', color: '#22d3ee' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
            >
              {t === null ? 'Todos' : `T${t}`}
            </button>
          ))}
          <span className="text-[10px] text-gray-600 font-mono uppercase tracking-wider ml-4">Cat:</span>
          {[null, 'mega_structure', 'military', 'scientific', 'economic', 'cultural'].map(c => (
            <button
              key={String(c)}
              onClick={() => setFilterCategory(c)}
              className="px-2.5 py-1 text-[11px] rounded-lg transition-all font-bold capitalize"
              style={filterCategory === c
                ? { background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.5)', color: '#c084fc' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
            >
              {c === null ? 'Todos' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Wonder list */}
          <div className="w-80 overflow-y-auto p-3 space-y-2 flex-shrink-0"
               style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            {filtered.map(w => (
              <WonderCard
                key={w.id}
                wonder={w}
                isSelected={selectedWonder === w.id}
                onSelect={() => selectWonder(w.id)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedWonderData ? (
              <WonderDetail wonder={selectedWonderData} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4 opacity-40">🏛️</div>
                <div className="text-[10px] font-mono text-gray-700 mb-2">// SELECT TO INSPECT</div>
                <p className="text-base font-bold text-gray-400 mb-1">Selecione uma Maravilha</p>
                <p className="text-xs text-gray-600 mb-8">Construa mega-estruturas para dominar a galáxia</p>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  {[
                    ['Esfera de Dyson', '⭐', '+500% energia'],
                    ['Mundo Anel', '💍', '+500% pop'],
                    ['Nexo da Mente', '🧠', '+60% pesquisa'],
                    ['Canhão de Nêutrons', '💫', 'Arma definitiva'],
                  ].map(([name, icon, effect]) => (
                    <div key={name} className="p-3 rounded-xl text-left"
                         style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="text-2xl mb-1">{icon}</div>
                      <div className="text-xs font-bold text-gray-300">{name}</div>
                      <div className="text-[10px] text-gray-600">{effect}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
