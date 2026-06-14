// ============================================================================
// GALACTIC EVENTS PANEL — Random events that shape the galaxy
// ============================================================================
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Clock, CheckCircle, Zap } from 'lucide-react';
import { create } from 'zustand';
import { useGameStore } from './gameStore';
import {
  GALACTIC_EVENTS, EVENT_BY_ID, SEVERITY_INFO, type GalacticEvent, type EventSeverity,
} from './data/galacticEventsData';

// ============================================================================
// STORE
// ============================================================================
export interface ActiveGalacticEvent {
  id: string;
  eventId: string;
  firedAt: number;
  resolved: boolean;
  chosenOption?: string;
  expiredAt?: number;
}

interface GalacticEventsState {
  activeEvents: ActiveGalacticEvent[];
  eventHistory: ActiveGalacticEvent[];
  pendingEvent: ActiveGalacticEvent | null;
  showPanel: boolean;
  showNotificationBadge: boolean;
  lastEventCheckedAt: number;

  openPanel: () => void;
  closePanel: () => void;
  tick: (delta: number) => void;
  resolveEvent: (eventId: string, choiceId: string) => void;
  dismissPendingEvent: () => void;
}

let evCounter = 0;
const newEvId = () => `gev_${evCounter++}`;

export const useGalacticEventsStore = create<GalacticEventsState>((set, get) => ({
  activeEvents: [],
  eventHistory: [],
  pendingEvent: null,
  showPanel: false,
  showNotificationBadge: false,
  lastEventCheckedAt: 0,

  openPanel: () => set({ showPanel: true, showNotificationBadge: false }),
  closePanel: () => set({ showPanel: false }),

  tick: (delta) => {
    const g = useGameStore.getState();
    if (g.paused || g.gameTime < 500) return;
    const dt = delta * g.gameSpeed;

    const state = get();
    if (state.pendingEvent) return; // already showing event

    // Check for new events
    const timeSinceLast = g.gameTime - state.lastEventCheckedAt;
    if (timeSinceLast < 200) return;

    for (const ev of GALACTIC_EVENTS) {
      if (ev.prereqTurns && g.gameTime < ev.prereqTurns) continue;

      const wasRecentlyUsed = state.eventHistory.some(h => {
        if (h.eventId !== ev.id) return false;
        return (g.gameTime - h.firedAt) < ev.cooldown;
      });
      if (wasRecentlyUsed) continue;

      const maxTimes = ev.repeatableMax;
      if (maxTimes !== undefined) {
        const usedTimes = state.eventHistory.filter(h => h.eventId === ev.id).length;
        if (usedTimes >= maxTimes) continue;
      }

      // Roll for event
      if (Math.random() < ev.probability * dt) {
        const newActive: ActiveGalacticEvent = {
          id: newEvId(),
          eventId: ev.id,
          firedAt: g.gameTime,
          resolved: false,
        };
        set({
          pendingEvent: newActive,
          lastEventCheckedAt: g.gameTime,
          showNotificationBadge: true,
        });
        return;
      }
    }

    set({ lastEventCheckedAt: g.gameTime });
  },

  resolveEvent: (activeEventId, choiceId) => {
    const { pendingEvent } = get();
    if (!pendingEvent || pendingEvent.id !== activeEventId) return;

    const g = useGameStore.getState();
    const ev = EVENT_BY_ID[pendingEvent.eventId];
    if (!ev) return;

    const choice = ev.choices.find(c => c.id === choiceId);
    if (!choice) return;

    // Apply outcomes
    const out = choice.outcome;
    if (out.credits) g.addCredits(out.credits);
    if (out.resources) {
      // Can't directly set resources on gameStore easily, notify instead
      g.addNotification({ type: 'success', message: `Recursos recebidos: ${Object.entries(out.resources).map(([k, v]) => `${v > 0 ? '+' : ''}${v} ${k}`).join(', ')}` });
    }
    if (choice.creditCost) {
      g.spendCredits(choice.creditCost);
    }
    if (out.specialEffect) {
      g.addNotification({ type: 'info', message: `✨ Efeito especial ativo: ${out.specialEffect.replace(/_/g, ' ')}` });
    }

    const resolved = { ...pendingEvent, resolved: true, chosenOption: choiceId };
    set(s => ({
      pendingEvent: null,
      eventHistory: [resolved, ...s.eventHistory].slice(0, 50),
      activeEvents: s.activeEvents.filter(e => e.id !== activeEventId),
    }));
  },

  dismissPendingEvent: () => {
    const { pendingEvent } = get();
    if (!pendingEvent) return;
    set(s => ({
      pendingEvent: null,
      eventHistory: [{ ...pendingEvent, resolved: true }, ...s.eventHistory].slice(0, 50),
    }));
  },
}));

// ============================================================================
// EVENT POPUP (shown during gameplay) — cinematic framer-motion edition
// ============================================================================
export const GalacticEventPopup: React.FC = () => {
  const { pendingEvent, resolveEvent, dismissPendingEvent } = useGalacticEventsStore();

  const ev = pendingEvent ? EVENT_BY_ID[pendingEvent.eventId] : null;
  const sevInfo = ev ? SEVERITY_INFO[ev.severity] : null;

  return (
    <AnimatePresence>
      {pendingEvent && ev && sevInfo && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,10,0.82)', backdropFilter: 'blur(8px)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-2xl overflow-hidden relative"
            style={{
              background: 'linear-gradient(145deg, rgba(4,4,26,0.99) 0%, rgba(8,6,36,0.99) 100%)',
              border: `1px solid ${sevInfo.color}45`,
              boxShadow: `0 0 80px ${sevInfo.color}18, 0 40px 100px rgba(0,0,0,0.8)`,
            }}
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow top bar */}
            <motion.div
              className="h-1 w-full"
              style={{ background: `linear-gradient(90deg, transparent 0%, ${sevInfo.color} 40%, ${sevInfo.color} 60%, transparent 100%)` }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            />

            {/* Background icon glow */}
            <div
              className="absolute top-6 right-6 text-[120px] opacity-[0.04] pointer-events-none select-none"
              style={{ filter: 'blur(4px)' }}
            >
              {ev.icon}
            </div>

            <div className="p-6 space-y-4 relative">
              {/* Header */}
              <motion.div
                className="flex items-start gap-4"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15, duration: 0.4 }}
              >
                <div
                  className="text-5xl shrink-0 p-3 rounded-2xl"
                  style={{ background: `${sevInfo.color}12`, border: `1px solid ${sevInfo.color}30` }}
                >
                  {ev.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-widest"
                      style={{ color: sevInfo.color, background: `${sevInfo.color}18`, border: `1px solid ${sevInfo.color}40` }}
                    >
                      {sevInfo.label}
                    </span>
                    <span className="text-[10px] text-gray-600 uppercase tracking-wider">{ev.category}</span>
                  </div>
                  <h3 className="font-bold text-white text-lg leading-snug">{ev.title}</h3>
                </div>
              </motion.div>

              {/* Description */}
              <motion.p
                className="text-gray-300 text-sm leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {ev.description}
              </motion.p>

              {/* Flavor */}
              <motion.div
                className="p-3 rounded-xl text-gray-500 text-xs italic leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                "{ev.flavorText}"
              </motion.div>

              {/* Choices */}
              <div className="space-y-2">
                <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-3">— Sua Decisão —</div>
                {ev.choices.map((choice, i) => (
                  <motion.button
                    key={choice.id}
                    onClick={() => resolveEvent(pendingEvent.id, choice.id)}
                    className="w-full text-left p-3.5 rounded-xl transition-all group"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.35 + i * 0.07 }}
                    whileHover={{
                      background: `${sevInfo.color}10`,
                      borderColor: `${sevInfo.color}45`,
                      x: 3,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="font-bold text-white text-sm group-hover:text-cyan-200 transition-colors">{choice.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{choice.desc}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0 text-[11px]">
                        {choice.creditCost && (
                          <span className="text-red-400 font-semibold">−{choice.creditCost.toLocaleString()} cr</span>
                        )}
                        {choice.outcome.credits != null && choice.outcome.credits > 0 && (
                          <span className="text-green-400 font-semibold">+{choice.outcome.credits.toLocaleString()} cr</span>
                        )}
                        {choice.outcome.researchBoost && (
                          <span className="text-purple-400 font-semibold">+{choice.outcome.researchBoost} 🔬</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={dismissPendingEvent}
                className="w-full py-2 rounded-xl text-[11px] text-gray-600 hover:text-gray-400 transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.05)' }}
              >
                Ignorar este evento
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN PANEL — History of all events
// ============================================================================
export const GalacticEventsPanel: React.FC = () => {
  const { showPanel, closePanel, eventHistory } = useGalacticEventsStore();
  const [filter, setFilter] = useState<EventSeverity | null>(null);

  if (!showPanel) return null;

  const filtered = eventHistory.filter(e => {
    const ev = EVENT_BY_ID[e.eventId];
    if (!ev) return false;
    if (filter && ev.severity !== filter) return false;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-2xl h-[85vh] flex flex-col rounded-2xl overflow-hidden"
           style={{
             background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(6,6,36,0.98))',
             border: '1px solid rgba(168,85,247,0.25)',
             boxShadow: '0 30px 100px rgba(0,0,0,0.7), 0 0 60px rgba(168,85,247,0.06)',
           }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{ borderColor: 'rgba(168,85,247,0.12)', background: 'rgba(168,85,247,0.05)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl" style={{ background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }}>
              <AlertTriangle size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-gray-600 mb-0.5">// GALACTIC THREAT MONITOR</div>
              <h2 className="text-lg font-bold text-white tracking-wider">EVENTOS GALÁCTICOS</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-gray-600 font-mono">{eventHistory.length} eventos</span>
            <button onClick={closePanel}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 px-5 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {([null, 'minor', 'moderate', 'major', 'catastrophic'] as (EventSeverity | null)[]).map(sev => {
            const info = sev ? SEVERITY_INFO[sev] : null;
            return (
              <button
                key={String(sev)}
                onClick={() => setFilter(sev)}
                className="px-3 py-1 text-xs rounded-lg transition-all font-bold"
                style={filter === sev
                  ? { background: info ? `${info.color}20` : 'rgba(107,114,128,0.15)', border: `1px solid ${info?.color || '#6b7280'}45`, color: info?.color || '#9ca3af' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }
                }
              >
                {sev === null ? 'Todos' : (info?.label || sev)}
              </button>
            );
          })}
        </div>

        {/* Event list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <Zap size={36} className="mx-auto mb-4 text-gray-700" />
              <p className="text-sm font-bold text-gray-500">Nenhum evento ainda</p>
              <p className="text-xs text-gray-600 mt-2">Eventos galácticos surgirão à medida que seu império crescer.</p>
            </div>
          ) : filtered.map(ae => {
            const ev = EVENT_BY_ID[ae.eventId];
            if (!ev) return null;
            const sevInfo = SEVERITY_INFO[ev.severity];
            return (
              <div key={ae.id} className="p-4 rounded-xl border transition-all"
                   style={{
                     background: `linear-gradient(135deg, rgba(10,8,25,0.8), ${sevInfo.color}04)`,
                     border: `1px solid ${sevInfo.color}22`,
                     boxShadow: `0 2px 16px ${sevInfo.color}06`,
                   }}>
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0 p-2 rounded-xl"
                       style={{ background: `${sevInfo.color}10`, border: `1px solid ${sevInfo.color}25` }}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h4 className="font-bold text-white text-sm">{ev.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                            style={{ color: sevInfo.color, background: `${sevInfo.color}15`, border: `1px solid ${sevInfo.color}35` }}>
                        {sevInfo.label}
                      </span>
                      {ae.resolved && (
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle size={9} /> Resolvido
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs leading-relaxed">{ev.description}</p>
                    {ae.chosenOption && (
                      <div className="mt-1.5 text-xs text-cyan-400 font-bold font-mono">
                        ▸ {ev.choices.find(c => c.id === ae.chosenOption)?.label || ae.chosenOption}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
