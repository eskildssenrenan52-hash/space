// ============================================================================
// COLONIZATION PANEL — plan and monitor colonization missions. Lets the
// player pick a target planet, review hazards, configure premium options and
// watch missions unfold in real time with event logs.
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Rocket, AlertTriangle, ShieldCheck, Sparkles, Users, Coins,
  Globe, Flame, Snowflake, Wind as WindIcon, Skull, Activity, Clock,
  Trash2, ChevronRight, Search, Zap, Heart, Star, TrendingUp,
} from 'lucide-react';
import { useGameStore, type Planet } from './gameStore';
import { useEmpireUI } from './empireUI';
import {
  useColonizationStore, planMission, deriveHazards, distanceFromOrigin,
  PHASE_LABEL, PHASE_ICON, type ColonizationMission, type PlanOptions,
} from './colonizationStore';

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
       style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(8px)' }}
       onClick={onClose}>
    <div
      className="w-full max-w-7xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden"
      onClick={(e) => e.stopPropagation()}
      style={{
        background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(6,6,36,0.98))',
        border: '1px solid rgba(34,211,238,0.2)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b"
           style={{ borderColor: 'rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.04)' }}>
        <div>
          <div className="text-[10px] text-gray-500 font-mono mb-0.5">// COLONIZATION CENTER</div>
          <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
            <Rocket size={16}/> {title}
          </h2>
        </div>
        <button onClick={onClose}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
          <X size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden p-5">{children}</div>
    </div>
  </div>
);

const Bar: React.FC<{ value: number; color?: string; label?: string }> = ({ value, color = '#22d3ee', label }) => (
  <div className="w-full">
    {label && <div className="flex justify-between text-[10px] text-gray-400 mb-0.5"><span>{label}</span><span>{Math.round(value * 100)}%</span></div>}
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.max(0, Math.min(100, value * 100))}%`, backgroundColor: color }} />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
const MissionCard: React.FC<{ m: ColonizationMission }> = ({ m }) => {
  const abort = useColonizationStore(s => s.abort);
  const failing = m.phase === 'failed';
  const done = m.phase === 'complete';
  const moralColor = m.morale > 0.6 ? '#22c55e' : m.morale > 0.3 ? '#f59e0b' : '#ef4444';

  const borderColor = done ? 'rgba(34,197,94,0.35)' : failing ? 'rgba(239,68,68,0.35)' : 'rgba(34,211,238,0.2)';
  const bgColor = done ? 'rgba(34,197,94,0.05)' : failing ? 'rgba(239,68,68,0.05)' : 'rgba(34,211,238,0.04)';

  return (
    <div className="rounded-xl p-3 border transition-all"
         style={{ background: bgColor, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xl">{PHASE_ICON[m.phase]}</span>
        <div className="flex-1">
          <div className="font-bold text-white text-sm flex items-center gap-1.5">
            {m.planetName}
            {m.terraformBoost && <Sparkles size={11} className="text-purple-400" />}
            {m.escortFleet && <ShieldCheck size={11} className="text-blue-400" />}
          </div>
          <div className="text-[10px] text-gray-500">{PHASE_LABEL[m.phase]} · {m.supplies.colonists.toLocaleString()} colonos</div>
        </div>
        {!done && !failing && (
          <button onClick={() => abort(m.id)} className="text-red-400 hover:text-red-300 p-1 rounded-lg hover:bg-red-900/20 transition-all" title="Abortar missão">
            <Trash2 size={13}/>
          </button>
        )}
      </div>

      <div className="space-y-1.5 mb-2.5">
        <Bar value={m.totalProgress} color={done ? '#22c55e' : failing ? '#ef4444' : '#22d3ee'} label="Progresso geral" />
        <Bar value={m.phaseProgress} color="#8b5cf6" label={PHASE_LABEL[m.phase]} />
        <Bar value={m.morale} color={moralColor} label="Moral" />
      </div>

      <div className="grid grid-cols-3 gap-1 text-[10px] mb-2">
        <Supply label="🍞 Comida" v={m.supplies.food} max={m.startSupplies.food} />
        <Supply label="💧 Água" v={m.supplies.water} max={m.startSupplies.water} />
        <Supply label="💊 Med." v={m.supplies.medicine} max={m.startSupplies.medicine} />
        <Supply label="🔩 Ligas" v={m.supplies.alloys} max={m.startSupplies.alloys} />
        <Supply label="⛽ Comb." v={m.supplies.fuel} max={m.startSupplies.fuel} />
        <Supply label="👥 Colonos" v={m.supplies.colonists} max={m.startSupplies.colonists} />
      </div>

      {m.hazards.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {m.hazards.map(h => (
            <span key={h.id} className="text-[10px] bg-red-900/40 text-red-200 px-1.5 py-0.5 rounded border border-red-500/30">
              {h.icon} {h.label}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl p-2.5 max-h-24 overflow-y-auto text-[10px] space-y-0.5 font-mono"
           style={{ background: 'rgba(0,5,15,0.7)', border: '1px solid rgba(34,211,238,0.1)' }}>
        {m.events.slice(-6).reverse().map((e, i) => (
          <div key={i} className={
            e.kind === 'danger' ? 'text-red-300'
            : e.kind === 'warn' ? 'text-amber-300'
            : e.kind === 'good' ? 'text-emerald-300' : 'text-gray-500'
          }>▸ {e.text}</div>
        ))}
      </div>
    </div>
  );
};

const Supply: React.FC<{ label: string; v: number; max: number }> = ({ label, v, max }) => {
  const pct = max > 0 ? v / max : 0;
  const low = pct < 0.25;
  return (
    <div className="rounded-lg px-1.5 py-1 border"
         style={{
           background: low ? 'rgba(239,68,68,0.08)' : 'rgba(10,15,25,0.6)',
           border: `1px solid ${low ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
           color: low ? '#fca5a5' : '#d1d5db',
         }}>
      <div className="text-[9px] opacity-70 truncate">{label}</div>
      <div className="font-bold tabular-nums text-[11px]">{Math.round(v).toLocaleString()}</div>
    </div>
  );
};

// ---------------------------------------------------------------------------
const HazardBadge: React.FC<{ icon: string; label: string; severity: number; tip: string }> = ({ icon, label, severity, tip }) => {
  const sevColor = severity > 0.66 ? '#ef4444' : severity > 0.33 ? '#f59e0b' : '#22c55e';
  return (
    <div title={tip} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 border"
         style={{ background: `${sevColor}08`, border: `1px solid ${sevColor}25` }}>
      <span className="text-sm">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold truncate" style={{ color: sevColor }}>{label}</div>
        <div className="h-1 rounded-full overflow-hidden mt-0.5" style={{ background: `${sevColor}15` }}>
          <div className="h-full rounded-full" style={{ width: `${severity * 100}%`, backgroundColor: sevColor }} />
        </div>
      </div>
    </div>
  );
};

// Visual planet "card" — color-coded by planet type
const PLANET_TYPE_COLOR: Record<string, string> = {
  terrestrial: '#22c55e', ocean: '#0ea5e9', desert: '#f59e0b', ice: '#7dd3fc',
  lava: '#ef4444', gas: '#a78bfa', toxic: '#84cc16', living: '#10b981',
  rocky: '#94a3b8', barren: '#71717a',
};

const PlanetCard: React.FC<{
  p: Planet;
  plan: ReturnType<typeof planMission>;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}> = ({ p, plan, selected, recommended, onSelect }) => {
  const color = PLANET_TYPE_COLOR[p.type] || '#94a3b8';
  const diffColor = plan.difficulty > 0.66 ? '#ef4444' : plan.difficulty > 0.33 ? '#f59e0b' : '#22c55e';
  return (
    <button
      onClick={onSelect}
      className={`group w-full text-left rounded-xl border transition-all relative overflow-hidden
        ${selected
          ? 'border-cyan-300 bg-cyan-500/15 shadow-[0_0_24px_rgba(34,211,238,0.4)]'
          : 'border-cyan-500/15 hover:border-cyan-400/50'}`}
      style={selected ? {} : { background: 'rgba(4,8,20,0.7)' }}
    >
      {recommended && (
        <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
          <Star size={8} fill="currentColor" /> RECOMENDADO
        </div>
      )}
      <div className="flex items-stretch">
        {/* mini planet visual */}
        <div className="w-14 flex items-center justify-center" style={{
          background: `radial-gradient(circle at 30% 30%, ${color}40 0%, transparent 70%)`,
        }}>
          <div className="w-9 h-9 rounded-full shadow-[inset_-4px_-4px_8px_rgba(0,0,0,0.5)]" style={{
            background: `radial-gradient(circle at 35% 35%, ${color}, ${color}80 60%, #000 100%)`,
            boxShadow: selected ? `0 0 16px ${color}` : `0 0 8px ${color}80`,
          }} />
        </div>
        <div className="flex-1 p-2 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-white truncate flex-1">{p.name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: diffColor, background: `${diffColor}20` }}>
              {(plan.difficulty * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-[10px] text-gray-400 capitalize flex items-center gap-1.5 mt-0.5">
            <span style={{ color }}>{p.type}</span>
            <span>·</span>
            <span>{distanceFromOrigin(p).toFixed(0)} LY</span>
            <span>·</span>
            <span>hab {(p.habitability * 100).toFixed(0)}%</span>
          </div>
          <div className="text-[10px] text-amber-300 mt-0.5 flex items-center gap-2">
            <Coins size={10} /> {plan.totalCost.toLocaleString()}c
            <span className="text-gray-500">·</span>
            <Users size={10} className="text-cyan-300" /> {plan.supplies.colonists}
          </div>
        </div>
      </div>
    </button>
  );
};

// ---------------------------------------------------------------------------
// MISSION PRESETS — one-click configuration
// ---------------------------------------------------------------------------
interface Preset {
  id: 'cauteloso' | 'equilibrado' | 'rapido';
  label: string;
  icon: React.ReactNode;
  desc: string;
  color: string;
  opts: (planet: Planet) => PlanOptions;
}

const PRESETS: Preset[] = [
  {
    id: 'cauteloso',
    label: 'Cauteloso',
    icon: <ShieldCheck size={16} />,
    desc: 'Mais colonos, escolta e equipamento premium. Caro mas seguro.',
    color: '#22c55e',
    opts: (p) => ({ colonists: Math.max(600, Math.round(700 + p.habitability * 700)), terraformBoost: false, escortFleet: true, premiumGear: true }),
  },
  {
    id: 'equilibrado',
    label: 'Equilibrado',
    icon: <Heart size={16} />,
    desc: 'Balanço entre custo e segurança. Escolta apenas para rotas longas.',
    color: '#22d3ee',
    opts: (p) => ({
      colonists: Math.max(400, Math.round(500 + p.habitability * 500)),
      terraformBoost: p.habitability < 0.35,
      escortFleet: distanceFromOrigin(p) > 60,
      premiumGear: deriveHazards(p).some(h => h.severity > 0.5),
    }),
  },
  {
    id: 'rapido',
    label: 'Rápido & Barato',
    icon: <Zap size={16} />,
    desc: 'Poucos colonos, sem extras. Risco maior, retorno mais cedo.',
    color: '#fbbf24',
    opts: () => ({ colonists: 300, terraformBoost: false, escortFleet: false, premiumGear: false }),
  },
];

// Big 3D-ish planet preview using CSS gradients
const PlanetVisual: React.FC<{ planet: Planet }> = ({ planet }) => {
  const color = PLANET_TYPE_COLOR[planet.type] || '#94a3b8';
  return (
    <div className="relative w-full aspect-square max-w-[280px] mx-auto">
      {/* atmosphere glow */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `radial-gradient(circle, ${color}30 0%, ${color}10 60%, transparent 80%)`,
        filter: 'blur(8px)',
      }} />
      {/* planet body */}
      <div className="absolute inset-[12%] rounded-full overflow-hidden" style={{
        background: `radial-gradient(circle at 32% 30%, color-mix(in oklab, ${color} 80%, white) 0%, ${color} 35%, color-mix(in oklab, ${color} 60%, black) 75%, #000 100%)`,
        boxShadow: `inset -20px -30px 60px rgba(0,0,0,0.7), 0 0 60px ${color}40`,
      }}>
        {/* surface noise via radial dots */}
        <div className="absolute inset-0 opacity-30" style={{
          background: `radial-gradient(2px 2px at 30% 40%, rgba(255,255,255,0.4), transparent),
                       radial-gradient(2px 2px at 60% 70%, rgba(0,0,0,0.3), transparent),
                       radial-gradient(3px 3px at 70% 30%, rgba(255,255,255,0.2), transparent)`,
          backgroundSize: '120px 120px',
        }} />
      </div>
      {/* orbiting ring (subtle) */}
      <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '40s' }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
export const ColonizationPanel: React.FC = () => {
  const { showPanel, selectedPlanetId, openPanelFor, closePanel, launch, missions } = useColonizationStore();
  const setEmpirePanel = useEmpireUI(s => s.setPanel);
  const planets = useGameStore(s => s.planets);
  const credits = useGameStore(s => s.credits);

  const [presetId, setPresetId] = useState<Preset['id']>('equilibrado');
  const [customMode, setCustomMode] = useState(false);
  const [terraformBoost, setTerraform] = useState(false);
  const [escortFleet, setEscort] = useState(false);
  const [premiumGear, setPremium] = useState(false);
  const [colonists, setColonists] = useState(500);
  const [search, setSearch] = useState('');

  if (!showPanel) return null;
  const planet = selectedPlanetId ? planets.find(p => p.id === selectedPlanetId) ?? null : null;

  const preset = PRESETS.find(p => p.id === presetId)!;
  const presetOpts = planet ? preset.opts(planet) : { colonists: 500 };
  const opts: PlanOptions = customMode
    ? { terraformBoost, escortFleet, premiumGear, colonists }
    : presetOpts;
  const plan = planet ? planMission(planet, opts) : null;
  const hazards = planet ? deriveHazards(planet) : [];

  const onClose = () => { closePanel(); setEmpirePanel(null); };

  const activeMissions = missions.filter(m => m.phase !== 'complete' && m.phase !== 'failed');

  return (
    <Modal title="Centro de Colonização" onClose={onClose}>
      <ColonizationWizard
        planet={planet}
        plan={plan}
        hazards={hazards}
        credits={credits}
        search={search} setSearch={setSearch}
        planets={planets}
        selectedPlanetId={selectedPlanetId}
        onSelectPlanet={openPanelFor}
        presetId={presetId} setPresetId={setPresetId}
        customMode={customMode} setCustomMode={setCustomMode}
        terraformBoost={terraformBoost} setTerraform={setTerraform}
        escortFleet={escortFleet} setEscort={setEscort}
        premiumGear={premiumGear} setPremium={setPremium}
        colonists={colonists} setColonists={setColonists}
        onLaunch={() => planet && launch(planet, opts)}
        activeMissions={activeMissions}
      />
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// WIZARD LAYOUT — 3-column: planet list | hero briefing | active missions
// ---------------------------------------------------------------------------
interface WizardProps {
  planet: Planet | null;
  plan: ReturnType<typeof planMission> | null;
  hazards: ReturnType<typeof deriveHazards>;
  credits: number;
  search: string; setSearch: (v: string) => void;
  planets: Planet[];
  selectedPlanetId: string | null;
  onSelectPlanet: (id: string | null) => void;
  presetId: Preset['id']; setPresetId: (v: Preset['id']) => void;
  customMode: boolean; setCustomMode: (v: boolean) => void;
  terraformBoost: boolean; setTerraform: (v: boolean) => void;
  escortFleet: boolean; setEscort: (v: boolean) => void;
  premiumGear: boolean; setPremium: (v: boolean) => void;
  colonists: number; setColonists: (v: number) => void;
  onLaunch: () => void;
  activeMissions: ColonizationMission[];
}

const ColonizationWizard: React.FC<WizardProps> = (p) => {
  const candidates = useMemo(
    () => p.planets
      .filter(pl => pl.colonies.length === 0 && pl.habitability >= 0.1)
      .filter(pl => !p.search || pl.name.toLowerCase().includes(p.search.toLowerCase()))
      .map(pl => ({ p: pl, plan: planMission(pl) }))
      .sort((a, b) => a.plan.difficulty - b.plan.difficulty)
      .slice(0, 40),
    [p.planets, p.search]
  );
  const recommended = candidates[0]?.p.id;

  // Auto-select recommended on open if nothing selected
  useEffect(() => {
    if (!p.selectedPlanetId && recommended) p.onSelectPlanet(recommended);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommended]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-3 h-[80vh]">
      {/* LEFT — planet picker */}
      <div className="flex flex-col gap-2 min-h-0">
        <div className="flex-shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-cyan-300/70 mb-1.5">Mundos disponíveis ({candidates.length})</div>
          <div className="relative">
            <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
            <input
              value={p.search}
              onChange={e => p.setSearch(e.target.value)}
              placeholder="Buscar mundo..."
              className="w-full pl-7 pr-2 py-1.5 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
          {candidates.length === 0 && (
            <div className="text-xs text-gray-500 rounded-xl p-4 text-center border"
                 style={{ background: 'rgba(10,15,25,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              Nenhum mundo livre disponível. Explore mais sistemas.
            </div>
          )}
          {candidates.map(({ p: pl, plan }) => (
            <PlanetCard
              key={pl.id}
              p={pl} plan={plan}
              selected={p.selectedPlanetId === pl.id}
              recommended={pl.id === recommended}
              onSelect={() => p.onSelectPlanet(pl.id)}
            />
          ))}
        </div>
      </div>

      {/* CENTER — hero briefing */}
      <div className="flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
        {!p.planet && (
          <div className="rounded-xl p-6 text-sm text-gray-500 flex items-center gap-3 m-auto border"
               style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
            Selecione um mundo na lista à esquerda.
          </div>
        )}

        {p.planet && p.plan && (
          <>
            {/* Hero: planet visual + key stats */}
            <div className="rounded-2xl p-4 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4 items-center border"
                 style={{
                   background: 'linear-gradient(145deg, rgba(4,8,28,0.95), rgba(8,4,32,0.95))',
                   border: '1px solid rgba(34,211,238,0.18)',
                   boxShadow: '0 0 60px rgba(34,211,238,0.04)',
                 }}>
              <PlanetVisual planet={p.planet} />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] font-mono text-gray-600 mb-0.5">// TARGET WORLD</div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <Globe size={16} className="text-cyan-400" />{p.planet.name}
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-xl"
                        style={{
                          background: p.plan.difficulty > 0.66 ? 'rgba(239,68,68,0.15)' : p.plan.difficulty > 0.33 ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                          border: `1px solid ${p.plan.difficulty > 0.66 ? 'rgba(239,68,68,0.4)' : p.plan.difficulty > 0.33 ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}`,
                          color: p.plan.difficulty > 0.66 ? '#fca5a5' : p.plan.difficulty > 0.33 ? '#fcd34d' : '#86efac',
                        }}>
                    DIFICULDADE {(p.plan.difficulty * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                  <Stat icon={<Activity size={11}/>} label="Habitab." v={`${(p.planet.habitability * 100).toFixed(0)}%`} />
                  <Stat icon={<Flame size={11}/>} label="Temp." v={`${p.planet.temperature.toFixed(0)}°C`} />
                  <Stat icon={<WindIcon size={11}/>} label="Atmo" v={p.planet.atmosphereType ?? 'nenhuma'} />
                  <Stat icon={<Globe size={11}/>} label="Distância" v={`${distanceFromOrigin(p.planet).toFixed(0)} LY`} />
                </div>
                {/* Hazards inline */}
                {p.hazards.length === 0 ? (
                  <div className="text-xs text-emerald-300 rounded-xl px-3 py-2 flex items-center gap-2 border"
                       style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <ShieldCheck size={13} /> Mundo notavelmente hospitaleiro — nenhum risco.
                  </div>
                ) : (
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1 font-bold">
                      <AlertTriangle size={10} /> {p.hazards.length} risco(s) detectado(s)
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {p.hazards.slice(0, 6).map(h => <HazardBadge key={h.id} icon={h.icon} label={h.label} severity={h.severity} tip={h.mitigation} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PRESETS — big 3-button row */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-widest text-cyan-300/70">Estratégia da missão</span>
                <button
                  onClick={() => p.setCustomMode(!p.customMode)}
                  className="text-[10px] text-gray-400 hover:text-cyan-300 underline"
                >{p.customMode ? '↑ Voltar aos presets' : '⚙ Configuração avançada'}</button>
              </div>
              {!p.customMode ? (
                <div className="grid grid-cols-3 gap-2">
                  {PRESETS.map(pr => {
                    const sel = p.presetId === pr.id;
                    return (
                      <button
                        key={pr.id}
                        onClick={() => p.setPresetId(pr.id)}
                        className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden
                          ${sel
                            ? 'border-cyan-300 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            : 'border-cyan-500/15 hover:border-cyan-400/50'}`}
                      style={sel ? {} : { background: 'rgba(4,8,20,0.7)' }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: pr.color, boxShadow: `0 0 12px ${pr.color}` }} />
                        <div className="flex items-center gap-2 font-bold text-sm" style={{ color: sel ? pr.color : '#fff' }}>
                          {pr.icon} {pr.label}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-1 leading-tight">{pr.desc}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <OptionToggle icon={<Sparkles size={14}/>} title="Terraformação" cost={6000}
                    desc="+25% velocidade nas fases finais; moral recupera."
                    on={p.terraformBoost} onChange={p.setTerraform} />
                  <OptionToggle icon={<ShieldCheck size={14}/>} title="Escolta militar" cost={2500}
                    desc="Reduz drasticamente perdas a piratas."
                    on={p.escortFleet} onChange={p.setEscort} />
                  <OptionToggle icon={<Skull size={14}/>} title="Equipamento premium" cost={3500}
                    desc="-40% risco ambiental. Trajes selados, escudos."
                    on={p.premiumGear} onChange={p.setPremium} />
                  <div className="rounded-xl p-2.5 text-xs" style={{ background: 'rgba(4,8,20,0.7)', border: '1px solid rgba(34,211,238,0.1)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="flex items-center gap-1 text-cyan-300"><Users size={12}/> Colonos</span>
                      <span className="text-white font-bold">{p.colonists}</span>
                    </div>
                    <input type="range" min={200} max={1500} step={50}
                      value={p.colonists}
                      onChange={e => p.setColonists(parseInt(e.target.value))}
                      className="w-full accent-cyan-400" />
                  </div>
                </div>
              )}
            </div>

            {/* COST SUMMARY + LAUNCH */}
            <div className="rounded-2xl p-4 border"
                 style={{ background: 'rgba(4,6,24,0.9)', border: '1px solid rgba(34,211,238,0.2)', boxShadow: '0 0 40px rgba(34,211,238,0.05)' }}>
              {/* Key stats row */}
              <div className="grid grid-cols-4 gap-2 mb-3">
                <Stat icon={<Coins size={11}/>} label="Custo total" v={`${p.plan.totalCost.toLocaleString()}c`} />
                <Stat icon={<Clock size={11}/>} label="Duração" v={`~${Math.round(p.plan.durationTicks / 60)} min`} />
                <Stat icon={<Users size={11}/>} label="Colonos" v={p.plan.supplies.colonists.toLocaleString()} />
                <Stat icon={<TrendingUp size={11}/>} label="Recompensa" v={`${Math.round(800 + p.plan.difficulty * 2400).toLocaleString()}c`} />
              </div>

              {/* Supplies row */}
              <div className="grid grid-cols-5 gap-1.5 mb-3">
                {[
                  { ic: '🍞', v: p.plan.supplies.food, lab: 'Comida', color: '#f59e0b' },
                  { ic: '💧', v: p.plan.supplies.water, lab: 'Água', color: '#38bdf8' },
                  { ic: '💊', v: p.plan.supplies.medicine, lab: 'Medicina', color: '#f472b6' },
                  { ic: '🔩', v: p.plan.supplies.alloys, lab: 'Ligas', color: '#94a3b8' },
                  { ic: '⛽', v: p.plan.supplies.fuel, lab: 'Comb.', color: '#fb923c' },
                ].map(({ ic, v, lab, color }) => (
                  <div key={lab} className="rounded-xl p-2 text-center border"
                       style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                    <div className="text-lg leading-tight">{ic}</div>
                    <div className="font-bold text-white text-xs tabular-nums">{v.toLocaleString()}</div>
                    <div className="text-[9px] mt-0.5" style={{ color }}>{lab}</div>
                  </div>
                ))}
              </div>

              {/* Launch button */}
              <button
                disabled={!p.plan.canColonize || !p.plan.canAfford}
                onClick={p.onLaunch}
                className="w-full py-4 rounded-xl font-black text-base flex items-center justify-center gap-3 transition-all"
                style={p.plan.canColonize && p.plan.canAfford
                  ? {
                      background: 'linear-gradient(135deg, rgba(34,211,238,0.8) 0%, rgba(168,85,247,0.8) 100%)',
                      border: '1px solid rgba(34,211,238,0.5)',
                      boxShadow: '0 4px 32px rgba(34,211,238,0.25)',
                      color: '#fff',
                    }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#374151', cursor: 'not-allowed' }}
              >
                <Rocket size={18}/> LANÇAR EXPEDIÇÃO
                <span className="text-xs opacity-70">({p.plan.totalCost.toLocaleString()}c)</span>
              </button>

              {p.plan.reason && (
                <p className="text-[11px] text-red-300 mt-2 text-center flex items-center justify-center gap-1">
                  <AlertTriangle size={11} /> {p.plan.reason}
                </p>
              )}
              <p className="text-[10px] text-gray-500 text-center mt-1.5 font-mono">
                Saldo: <span className={p.credits >= p.plan.totalCost ? 'text-amber-300' : 'text-red-400'}>{Math.floor(p.credits).toLocaleString()}c</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* RIGHT — active missions */}
      <div className="flex flex-col gap-2 min-h-0">
        <div className="text-[10px] uppercase tracking-widest text-cyan-400 flex items-center gap-1.5 flex-shrink-0 font-bold font-mono">
          // <Activity size={10}/> Missões ativas ({p.activeMissions.length})
        </div>
        {/* 1-click colonize recommended */}
        {p.planet && p.plan && p.plan.canColonize && p.plan.canAfford && (
          <button
            onClick={p.onLaunch}
            className="flex-shrink-0 w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.6), rgba(6,182,212,0.6))',
              border: '1px solid rgba(34,197,94,0.4)',
              boxShadow: '0 4px 20px rgba(34,197,94,0.15)',
              color: '#fff',
            }}
            title="Lança imediatamente a missão para o mundo recomendado com o preset atual."
          >
            <Zap size={12}/> COLONIZAR JÁ ({p.plan.totalCost.toLocaleString()}c)
          </button>
        )}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
          {p.activeMissions.length === 0 && (
            <div className="text-xs text-gray-500 rounded-xl p-4 text-center border"
                 style={{ background: 'rgba(10,15,25,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
              Nenhuma missão em curso. Selecione um mundo e clique em LANÇAR.
            </div>
          )}
          {p.activeMissions.slice().reverse().map(m => <MissionCard key={m.id} m={m} />)}
        </div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ icon: React.ReactNode; label: string; v: string }> = ({ icon, label, v }) => (
  <div className="rounded-xl p-2 border"
       style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="text-gray-500 flex items-center gap-1 text-[10px] mb-0.5">{icon} {label}</div>
    <div className="text-white font-bold capitalize text-sm">{v}</div>
  </div>
);

const OptionToggle: React.FC<{ icon: React.ReactNode; title: string; cost: number; desc: string; on: boolean; onChange: (b: boolean) => void }> = ({ icon, title, cost, desc, on, onChange }) => (
  <button onClick={() => onChange(!on)}
          className="text-left p-2.5 rounded-xl border text-xs transition-all"
          style={on
            ? { background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.4)', boxShadow: '0 0 16px rgba(34,211,238,0.08)' }
            : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
    <div className="flex items-center justify-between mb-1">
      <span className="font-bold flex items-center gap-1.5" style={{ color: on ? '#67e8f9' : '#fff' }}>{icon} {title}</span>
      <span className="text-amber-300 font-bold text-[10px]">+{cost.toLocaleString()}c</span>
    </div>
    <div className="text-[10px] text-gray-500">{desc}</div>
    {on && <div className="text-[10px] text-cyan-400 font-bold mt-0.5">✓ Ativado</div>}
  </button>
);

// Toaster-style mini status when missions are in progress (always-on overlay)
export const ColonizationStatusChip: React.FC = () => {
  const missions = useColonizationStore(s => s.missions);
  const openPanelFor = useColonizationStore(s => s.openPanelFor);
  const setEmpirePanel = useEmpireUI(s => s.setPanel);
  const active = missions.filter(m => m.phase !== 'complete' && m.phase !== 'failed');
  if (active.length === 0) return null;
  return (
    <button
      onClick={() => { setEmpirePanel('colonization'); openPanelFor(active[0].planetId); }}
      className="fixed right-4 top-[110px] z-30 rounded-xl px-3 py-2.5 text-xs transition-all"
      style={{
        background: 'rgba(4,6,24,0.95)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(34,211,238,0.35)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(34,211,238,0.06)',
        color: '#e0f7ff',
        minWidth: '200px',
      }}
      title="Abrir centro de colonização"
    >
      <div className="flex items-center gap-2 font-bold mb-1.5">
        <Rocket size={11} className="text-cyan-300 animate-pulse" />
        <span className="text-cyan-200">{active.length} missão(ões) em curso</span>
      </div>
      {active.slice(0, 3).map(m => (
        <div key={m.id} className="mt-1">
          <div className="flex justify-between text-[10px] mb-0.5">
            <span className="text-gray-400">{PHASE_ICON[m.phase]} {m.planetName}</span>
            <span className="text-cyan-300 font-bold tabular-nums">{Math.round(m.totalProgress * 100)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(34,211,238,0.1)' }}>
            <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all"
                 style={{ width: `${m.totalProgress * 100}%` }} />
          </div>
        </div>
      ))}
    </button>
  );
};
