// ============================================================================
// AI EMPIRES PANEL — Rival empires, diplomacy, events, and intelligence
// ============================================================================
import React, { useState, useEffect } from 'react';
import { X, Globe, Swords, ShoppingBag, Shield, ChevronRight, AlertTriangle, Radio } from 'lucide-react';
import { create } from 'zustand';
import { useGameStore } from './gameStore';
import {
  EMPIRE_TEMPLATES, EMPIRE_EVENTS, type EmpireTemplate, type DiplomaticStatus,
  type AIEmpireEvent,
} from './data/aiEmpiresData';

// ============================================================================
// STORE
// ============================================================================
export interface AIEmpire {
  id: string;
  templateId: string;
  name: string;
  icon: string;
  color: string;
  personality: string;
  power: number;
  territory: number;
  colonies: number;
  credits: number;
  militaryStrength: number;
  techLevel: number;
  diplomaticStatus: DiplomaticStatus;
  aggressionLevel: number;
  knownWonders: string[];
  recentEvents: ActiveEmpireEvent[];
  lastEventAt: number;
  threatLevel: number;
}

export interface ActiveEmpireEvent {
  id: string;
  empireId: string;
  event: AIEmpireEvent;
  firedAt: number;
  resolved: boolean;
  playerChoice?: string;
}

interface AIEmpiresState {
  empires: AIEmpire[];
  showPanel: boolean;
  selectedEmpireId: string | null;
  pendingEvent: ActiveEmpireEvent | null;
  eventLog: ActiveEmpireEvent[];
  initialized: boolean;

  openPanel: () => void;
  closePanel: () => void;
  selectEmpire: (id: string | null) => void;
  initEmpires: () => void;
  tick: (delta: number) => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  dismissEvent: () => void;
  changeDiplomacy: (empireId: string, delta: number) => void;
  declareWar: (empireId: string) => void;
  offerTrade: (empireId: string) => void;
}

let eid = 0;
const newId = (p = 'emp') => `${p}_${eid++}`;

const STATUS_ORDER: DiplomaticStatus[] = ['war', 'hostile', 'neutral', 'friendly', 'allied'];

function statusFromLevel(level: number): DiplomaticStatus {
  if (level < -60) return 'war';
  if (level < -20) return 'hostile';
  if (level < 20)  return 'neutral';
  if (level < 60)  return 'friendly';
  return 'allied';
}

function initEmpire(template: EmpireTemplate, idx: number): AIEmpire {
  return {
    id: newId(),
    templateId: template.id,
    name: template.name,
    icon: template.icon,
    color: template.color,
    personality: template.personality,
    power: template.startingPower + idx * 5,
    territory: 2 + Math.floor(Math.random() * 8),
    colonies: 3 + Math.floor(Math.random() * 10),
    credits: 5000 + Math.floor(Math.random() * 20000),
    militaryStrength: Math.floor(template.militaryModifier * 50 + Math.random() * 30),
    techLevel: Math.floor(template.techModifier * 3 + 1),
    diplomaticStatus: template.aggressionBase > 0.7 ? 'hostile' : 'neutral',
    aggressionLevel: template.aggressionBase,
    knownWonders: [],
    recentEvents: [],
    lastEventAt: 0,
    threatLevel: template.aggressionBase,
  };
}

export const useAIEmpiresStore = create<AIEmpiresState>((set, get) => ({
  empires: [],
  showPanel: false,
  selectedEmpireId: null,
  pendingEvent: null,
  eventLog: [],
  initialized: false,

  openPanel: () => set({ showPanel: true }),
  closePanel: () => set({ showPanel: false }),
  selectEmpire: (id) => set({ selectedEmpireId: id }),

  initEmpires: () => {
    if (get().initialized) return;
    const count = 4 + Math.floor(Math.random() * 4); // 4-7 empires
    const shuffled = [...EMPIRE_TEMPLATES].sort(() => Math.random() - 0.5);
    const empires = shuffled.slice(0, count).map((t, i) => initEmpire(t, i));
    set({ empires, initialized: true });
  },

  tick: (delta) => {
    const g = useGameStore.getState();
    if (g.paused || !get().initialized) return;
    const speed = g.gameSpeed;
    const dt = delta * speed;

    set(s => {
      const empires = s.empires.map(empire => {
        // grow empire over time
        const growth = dt * 0.001 * empire.aggressionLevel;
        const newTerritory = empire.territory + (Math.random() < growth * 0.1 ? 1 : 0);
        const newColonies = empire.colonies + (Math.random() < growth * 0.05 ? 1 : 0);
        const newPower = Math.min(100, empire.power + dt * 0.002);

        // fire events
        const timeSinceEvent = g.gameTime - empire.lastEventAt;
        const eventInterval = 500 + Math.random() * 1000;

        if (timeSinceEvent > eventInterval && !s.pendingEvent && Math.random() < empire.aggressionLevel * 0.3) {
          const possible = EMPIRE_EVENTS.filter(ev => {
            if (empire.personality === 'hive_mind' && ev.diplomaticEffect > 0) return false;
            if (empire.personality === 'isolationist' && ev.type === 'trade_deal') return false;
            if (empire.personality === 'trader' && ev.type === 'border_skirmish') return Math.random() > 0.8;
            return true;
          });
          if (possible.length > 0) {
            const ev = possible[Math.floor(Math.random() * possible.length)];
            const newEvent: ActiveEmpireEvent = {
              id: newId('ev'),
              empireId: empire.id,
              event: ev,
              firedAt: g.gameTime,
              resolved: false,
            };
            // apply credit effects immediately for auto-events
            if (ev.creditEffect !== 0 && Math.abs(ev.diplomaticEffect) < 0.2) {
              g.addCredits(ev.creditEffect);
            }

            const updatedEmpire = {
              ...empire,
              territory: newTerritory,
              colonies: newColonies,
              power: newPower,
              lastEventAt: g.gameTime,
              recentEvents: [newEvent, ...empire.recentEvents].slice(0, 5),
            };

            // Only show popup for significant events
            if (Math.abs(ev.diplomaticEffect) >= 0.2 || ev.creditEffect < -500 || ev.threatLevel > 0.5) {
              setTimeout(() => {
                set({ pendingEvent: newEvent });
              }, 100);
            } else {
              g.addNotification({ type: ev.threatLevel > 0.4 ? 'warning' : 'info', message: `${empire.icon} ${empire.name}: ${ev.label}` });
            }

            return updatedEmpire;
          }
        }

        return { ...empire, territory: newTerritory, colonies: newColonies, power: newPower };
      });

      return { empires };
    });
  },

  resolveEvent: (eventId, choiceId) => {
    const { pendingEvent } = get();
    if (!pendingEvent || pendingEvent.id !== eventId) return;

    const g = useGameStore.getState();
    const event = pendingEvent.event;

    // Apply diplomatic effect
    const empire = get().empires.find(e => e.id === pendingEvent.empireId);
    if (empire) {
      if (choiceId === 'ignore' || choiceId === 'refuse' || choiceId === 'shutdown' || choiceId === 'destroy') {
        // Defensive/negative response
        get().changeDiplomacy(empire.id, event.diplomaticEffect * 30);
      } else {
        // Cooperative response
        get().changeDiplomacy(empire.id, Math.abs(event.diplomaticEffect) * 30);
        if (event.creditEffect !== 0) g.addCredits(event.creditEffect);
      }
    }

    set(s => ({
      pendingEvent: null,
      eventLog: [{ ...pendingEvent, resolved: true, playerChoice: choiceId }, ...s.eventLog].slice(0, 30),
    }));
  },

  dismissEvent: () => {
    const pending = get().pendingEvent;
    if (!pending) return;
    set(s => ({
      pendingEvent: null,
      eventLog: [{ ...pending, resolved: true }, ...s.eventLog].slice(0, 30),
    }));
  },

  changeDiplomacy: (empireId, delta) => {
    set(s => ({
      empires: s.empires.map(e => {
        if (e.id !== empireId) return e;
        const currentVal = STATUS_ORDER.indexOf(e.diplomaticStatus) * 40 - 80;
        const newVal = Math.max(-100, Math.min(100, currentVal + delta));
        return { ...e, diplomaticStatus: statusFromLevel(newVal) };
      }),
    }));
  },

  declareWar: (empireId) => {
    set(s => ({
      empires: s.empires.map(e => e.id === empireId ? { ...e, diplomaticStatus: 'war', aggressionLevel: Math.min(1, e.aggressionLevel + 0.2) } : e),
    }));
    useGameStore.getState().addNotification({ type: 'danger', message: '⚔️ Guerra declarada!' });
  },

  offerTrade: (empireId) => {
    const empire = get().empires.find(e => e.id === empireId);
    if (!empire) return;
    const accepted = empire.personality === 'trader' || empire.personality === 'technological' || Math.random() > 0.4;
    get().changeDiplomacy(empireId, accepted ? 15 : -5);
    useGameStore.getState().addNotification({
      type: accepted ? 'success' : 'info',
      message: accepted ? `${empire.icon} ${empire.name} aceitou a oferta comercial!` : `${empire.icon} ${empire.name} recusou a oferta.`,
    });
  },
}));

// ============================================================================
// COMPONENTS
// ============================================================================

const STATUS_INFO: Record<DiplomaticStatus, { label: string; color: string; icon: string }> = {
  war:      { label: 'GUERRA',     color: '#ef4444', icon: '⚔️' },
  hostile:  { label: 'HOSTIL',     color: '#f97316', icon: '😠' },
  neutral:  { label: 'NEUTRO',     color: '#6b7280', icon: '😐' },
  friendly: { label: 'AMIGÁVEL',   color: '#22c55e', icon: '🤝' },
  allied:   { label: 'ALIADO',     color: '#22d3ee', icon: '🛡️' },
  vassal:   { label: 'VASSALO',    color: '#a855f7', icon: '🙇' },
};

const PERSONALITY_INFO: Record<string, { label: string; icon: string }> = {
  expansionist:  { label: 'Expansionista', icon: '🗺️' },
  militarist:    { label: 'Militarista',   icon: '⚔️' },
  trader:        { label: 'Comerciante',   icon: '💰' },
  isolationist:  { label: 'Isolacionista', icon: '🔒' },
  technological: { label: 'Tecnológico',   icon: '🔬' },
  hive_mind:     { label: 'Mente Coletiva',icon: '🧠' },
  ancient:       { label: 'Antigo',        icon: '⚰️' },
  desperate:     { label: 'Desesperado',   icon: '⚡' },
};

const EmpireCard: React.FC<{ empire: AIEmpire; isSelected: boolean; onSelect: () => void }> = ({ empire, isSelected, onSelect }) => {
  const stat = STATUS_INFO[empire.diplomaticStatus];
  const pers = PERSONALITY_INFO[empire.personality];
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 rounded-xl border transition-all"
      style={isSelected
        ? { borderColor: empire.color, background: `${empire.color}0d`, boxShadow: `0 0 20px ${empire.color}30` }
        : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{empire.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm truncate">{empire.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0"
                  style={{ color: stat.color, background: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
              {stat.icon} {stat.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
            <span>{pers.icon} {pers.label}</span>
            <span>⚡ {empire.power.toFixed(0)}</span>
            <span>🌍 {empire.colonies} colônias</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="text-right">
            <div className="text-xs text-gray-500">Ameaça</div>
            <div className={`text-sm font-bold ${empire.threatLevel > 0.6 ? 'text-red-400' : empire.threatLevel > 0.3 ? 'text-amber-400' : 'text-green-400'}`}>
              {(empire.threatLevel * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

const EmpireDetail: React.FC<{ empire: AIEmpire }> = ({ empire }) => {
  const { declareWar, offerTrade, changeDiplomacy } = useAIEmpiresStore();
  const stat = STATUS_INFO[empire.diplomaticStatus];
  const pers = PERSONALITY_INFO[empire.personality];
  const tmpl = EMPIRE_TEMPLATES.find(t => t.id === empire.templateId);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border"
           style={{ borderColor: `${empire.color}40`, background: `${empire.color}10` }}>
        <div className="text-6xl">{empire.icon}</div>
        <div className="flex-1">
          <h3 className="font-bold text-white text-xl">{empire.name}</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2 py-1 rounded font-bold" style={{ color: stat.color, background: `${stat.color}20`, border: `1px solid ${stat.color}40` }}>
              {stat.icon} {stat.label}
            </span>
            <span className="text-xs px-2 py-1 rounded-lg font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}>
              {pers.icon} {pers.label}
            </span>
          </div>
        </div>
      </div>

      {/* Lore */}
      {tmpl && (
        <div className="p-3 rounded-xl text-gray-400 text-xs italic font-mono"
             style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
          "{tmpl.flavorText}"
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Poder', value: empire.power.toFixed(0), icon: '⚡', color: empire.color },
          { label: 'Território', value: `${empire.territory} sys`, icon: '🗺️', color: '#67e8f9' },
          { label: 'Colônias', value: empire.colonies, icon: '🌍', color: '#86efac' },
          { label: 'Força Militar', value: empire.militaryStrength, icon: '⚔️', color: '#f87171' },
          { label: 'Nível Tech', value: `T${empire.techLevel}`, icon: '🔬', color: '#c084fc' },
          { label: 'Ameaça', value: `${(empire.threatLevel * 100).toFixed(0)}%`, icon: '⚠️', color: empire.threatLevel > 0.6 ? '#ef4444' : empire.threatLevel > 0.3 ? '#f97316' : '#22c55e' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="p-3 rounded-xl text-center"
               style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
            <div className="text-xl mb-1">{icon}</div>
            <div className="font-bold text-sm" style={{ color }}>{value}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Bar charts */}
      {[
        { label: 'Agressão', value: empire.aggressionLevel, color: '#ef4444' },
        { label: 'Poder Total', value: Math.min(1, empire.power / 100), color: empire.color },
        { label: 'Força Militar', value: Math.min(1, empire.militaryStrength / 100), color: '#f97316' },
      ].map(({ label, value, color }) => (
        <div key={label}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-gray-400">{label}</span>
            <span className="font-mono font-bold" style={{ color }}>{(value * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all"
                 style={{ width: `${Math.min(100, value * 100)}%`, background: `linear-gradient(90deg, ${color}aa, ${color})` }} />
          </div>
        </div>
      ))}

      {/* Diplomatic actions */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2"
            style={{ color: '#fdba74' }}>
          <Radio size={12} /> AÇÕES DIPLOMÁTICAS
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {[
            {
              onClick: () => changeDiplomacy(empire.id, 15),
              disabled: empire.diplomaticStatus === 'allied',
              icon: '🕊️', label: 'Enviar Embaixador',
              hint: '+15 relação',
              color: '#22c55e',
            },
            {
              onClick: () => offerTrade(empire.id),
              disabled: empire.diplomaticStatus === 'war',
              icon: '💰', label: 'Oferecer Comércio',
              hint: 'rota lucrativa',
              color: '#67e8f9',
            },
            {
              onClick: () => changeDiplomacy(empire.id, 25),
              disabled: empire.diplomaticStatus === 'allied' || empire.diplomaticStatus === 'war',
              icon: '🛡️', label: 'Propor Aliança',
              hint: '+25 relação',
              color: '#818cf8',
            },
            {
              onClick: () => declareWar(empire.id),
              disabled: empire.diplomaticStatus === 'war',
              icon: '⚔️', label: 'Declarar Guerra',
              hint: 'casus belli',
              color: '#f87171',
            },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              disabled={btn.disabled}
              className="flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all disabled:opacity-30"
              style={{
                background: `${btn.color}10`,
                border: `1px solid ${btn.color}35`,
                color: btn.color,
              }}
            >
              <span className="text-base">{btn.icon}</span>
              <div className="text-left">
                <div>{btn.label}</div>
                <div className="text-[10px] opacity-60">{btn.hint}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent events */}
      {empire.recentEvents.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Eventos Recentes</h4>
          <div className="space-y-1.5">
            {empire.recentEvents.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <span>{ev.event.icon}</span>
                <span className="text-gray-300">{ev.event.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// EVENT POPUP
// ============================================================================
export const EmpireEventPopup: React.FC = () => {
  const { pendingEvent, resolveEvent, dismissEvent } = useAIEmpiresStore();
  const { empires } = useAIEmpiresStore();

  if (!pendingEvent) return null;

  const empire = empires.find(e => e.id === pendingEvent.empireId);
  if (!empire) return null;

  const ev = pendingEvent.event;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
           style={{
             background: 'linear-gradient(135deg, rgba(15,8,2,0.99), rgba(20,10,5,0.99))',
             border: `1px solid ${empire.color}60`,
             boxShadow: `0 0 60px ${empire.color}25, 0 25px 80px rgba(0,0,0,0.8)`,
           }}>
        {/* Empire header strip */}
        <div className="px-6 py-3 flex items-center gap-3"
             style={{ background: `${empire.color}15`, borderBottom: `1px solid ${empire.color}30` }}>
          <span className="text-3xl">{empire.icon}</span>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest" style={{ color: empire.color }}>
              EVENTO DIPLOMÁTICO
            </div>
            <div className="text-sm font-bold text-white">{empire.name}</div>
          </div>
          <div className="ml-auto">
            <span className="text-xs px-2 py-1 rounded-full font-bold"
                  style={{ background: `${empire.color}20`, color: empire.color, border: `1px solid ${empire.color}40` }}>
              {STATUS_INFO[empire.diplomaticStatus].icon} {STATUS_INFO[empire.diplomaticStatus].label}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl flex-shrink-0 filter drop-shadow-lg">{ev.icon}</div>
            <div>
              <h3 className="font-bold text-white text-lg leading-tight">{ev.label}</h3>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">{ev.description(empire.name)}</p>
            </div>
          </div>

          {ev.creditEffect !== 0 && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${ev.creditEffect > 0 ? 'text-green-300' : 'text-red-300'}`}
                 style={{ background: ev.creditEffect > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${ev.creditEffect > 0 ? '#22c55e' : '#ef4444'}30` }}>
              <span className="text-xl">{ev.creditEffect > 0 ? '💰' : '💸'}</span>
              {ev.creditEffect > 0 ? `+${ev.creditEffect.toLocaleString()}` : ev.creditEffect.toLocaleString()} créditos
            </div>
          )}

          <div className="space-y-2 pt-2">
            {pendingEvent.event.diplomaticEffect !== 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => resolveEvent(pendingEvent.id, 'accept')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}
                >
                  ✅ Aceitar
                </button>
                <button
                  onClick={() => resolveEvent(pendingEvent.id, 'ignore')}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5' }}
                >
                  ❌ Recusar
                </button>
              </div>
            )}
            <button
              onClick={dismissEvent}
              className="w-full py-2.5 rounded-xl text-gray-400 text-sm transition-all hover:text-white"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Notar e Continuar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================
export const AIEmpiresPanel: React.FC = () => {
  const { showPanel, closePanel, empires, selectedEmpireId, selectEmpire, eventLog } = useAIEmpiresStore();
  const [tab, setTab] = useState<'empires' | 'log'>('empires');

  if (!showPanel) return null;

  const selectedEmpire = empires.find(e => e.id === selectedEmpireId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,10,0.82)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-6xl h-[88vh] flex flex-col rounded-2xl border border-orange-500/30 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, rgba(12,6,3,0.99), rgba(6,4,2,0.99))', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(251,146,60,0.05)' }}>

        {/* Holographic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-500/20 shrink-0"
             style={{ background: 'linear-gradient(90deg, rgba(251,146,60,0.08) 0%, rgba(239,68,68,0.05) 60%, transparent 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.4)', boxShadow: '0 0 20px rgba(251,146,60,0.2)' }}>
              <Globe size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wider"
                  style={{ background: 'linear-gradient(90deg, #fdba74, #f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                IMPÉRIOS RIVAIS
              </h2>
              <p className="text-xs text-gray-500 font-mono">
                // {empires.length} impérios · {empires.filter(e => e.diplomaticStatus === 'war').length} em guerra · {empires.filter(e => e.diplomaticStatus === 'allied').length} aliados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['empires', 'log'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                      className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                      style={tab === t
                        ? { background: 'rgba(251,146,60,0.2)', border: '1px solid rgba(251,146,60,0.5)', color: '#fdba74' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }
                      }>
                {t === 'empires' ? `🌐 Impérios` : `📋 Log (${eventLog.length})`}
              </button>
            ))}
            <button onClick={closePanel}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {tab === 'empires' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* List */}
            <div className="w-72 overflow-y-auto p-3 space-y-2 flex-shrink-0" style={{ borderRight: '1px solid rgba(251,146,60,0.1)' }}>
              {empires.map(emp => (
                <EmpireCard
                  key={emp.id}
                  empire={emp}
                  isSelected={selectedEmpireId === emp.id}
                  onSelect={() => selectEmpire(emp.id)}
                />
              ))}
            </div>

            {/* Detail */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedEmpire ? (
                <EmpireDetail empire={selectedEmpire} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                  <Globe size={48} className="mb-4 text-gray-600" />
                  <p className="text-lg font-bold text-gray-400">Selecione um Império</p>
                  <p className="text-sm mt-2">Gerencie diplomacia, comércio e conflitos</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {eventLog.length === 0 ? (
                <div className="text-center py-12 rounded-2xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-3xl mb-2 opacity-30">📋</div>
                  <div className="text-[10px] font-mono text-gray-700 mb-1">// NO EVENTS LOGGED</div>
                  <p className="text-xs text-gray-500">Nenhum evento registrado ainda.</p>
                </div>
              ) : eventLog.map(ev => {
                const emp = empires.find(e => e.id === ev.empireId);
                return (
                  <div key={ev.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-xl">{ev.event.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{ev.event.label}</span>
                        <span className="text-xs text-gray-500">{emp?.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{ev.event.description(emp?.name || '?')}</p>
                      {ev.playerChoice && (
                        <span className="text-xs text-cyan-400 mt-1 block">Escolha: {ev.playerChoice}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
