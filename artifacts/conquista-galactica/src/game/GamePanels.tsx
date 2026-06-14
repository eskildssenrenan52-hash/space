import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from './gameStore';
import { useEmpireUI } from './empireUI';
import { useColonizationStore } from './colonizationStore';
import { useColonyStore } from './colonyStore';
import {
  Play, Pause, Globe, Star, Rocket, Bell, Zap, Droplets, Package,
  HeartPulse, Shield, Globe2, Flag, MapPin, Thermometer, Wind,
  BookOpen, Wrench, ChevronRight, ChevronLeft, Activity, Layers, Save, Upload,
} from 'lucide-react';

// ── Animated Credit Counter ──────────────────────────────────────────────────
const CreditDisplay: React.FC<{ value: number }> = ({ value }) => {
  const prev = useRef(value);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);

  useEffect(() => {
    if (value === prev.current) return;
    setFlash(value > prev.current ? 'up' : 'down');
    prev.current = value;
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <motion.span
      className={`font-bold tabular-nums text-sm transition-colors ${
        flash === 'up' ? 'text-green-300' : flash === 'down' ? 'text-red-300' : 'text-amber-300'
      }`}
      key={Math.round(value / 10)}
      animate={{ scale: flash ? [1, 1.1, 1] : 1 }}
      transition={{ duration: 0.3 }}
    >
      {Math.floor(value).toLocaleString()}
    </motion.span>
  );
};

// ── Top Bar ──────────────────────────────────────────────────────────────────
export const TopBar: React.FC = () => {
  const {
    gameTime, gameSpeed, paused, setGameSpeed, togglePause,
    notifications, saveGame, loadGame, originWorld, credits, resources,
  } = useGameStore();
  const lastIncome = useColonyStore(s => s.lastIncome);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const unread = notifications.filter(n => !n.read).length;
  const years = Math.floor(gameTime / 365);
  const days = Math.floor(gameTime % 365);

  // Top 4 resources to show inline
  const topRes = resources.slice(0, 4);
  const RES_ICON: Record<string, string> = {
    energy: '⚡', food: '🌾', water: '💧', iron: '⚙️', fuel: '🔋',
    electronics: '💡', medicine: '💊', titanium: '🪨', crystals: '💎',
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-13 z-40 flex items-center px-3 gap-2"
      style={{
        height: '52px',
        background: 'linear-gradient(180deg, rgba(3,3,20,0.98) 0%, rgba(5,5,28,0.95) 100%)',
        borderBottom: '1px solid rgba(34,211,238,0.2)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 60px rgba(34,211,238,0.04)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 mr-2 shrink-0">
        <Globe2 className="text-cyan-400" size={18} />
        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400 text-sm tracking-wider">
          CONQUISTA
        </span>
      </div>

      {/* Origin world */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
           style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)' }}>
        <Flag className="text-cyan-500" size={11} />
        <span className="text-cyan-400 text-[11px] font-semibold">{originWorld?.name || 'Terra'}</span>
      </div>

      {/* Credits */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
           style={{ background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
        <span className="text-[12px]">💰</span>
        <CreditDisplay value={credits} />
        <span className={`text-[10px] tabular-nums ${lastIncome >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {lastIncome >= 0 ? '+' : ''}{lastIncome.toFixed(1)}/t
        </span>
      </div>

      {/* Resources quick bar */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-hidden">
        {topRes.map(res => {
          const pct = Math.min(100, (res.amount / res.maxStorage) * 100);
          const low = pct < 20;
          return (
            <div key={res.resource} className="flex items-center gap-1 px-2 py-1 rounded-lg shrink-0"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span className="text-[11px]">{RES_ICON[res.resource] || '📦'}</span>
              <div className="flex flex-col gap-0.5 min-w-[28px]">
                <span className={`text-[10px] font-bold tabular-nums ${low ? 'text-red-400' : 'text-gray-300'}`}>
                  {Math.floor(res.amount)}
                </span>
                <div className="h-0.5 rounded-full overflow-hidden w-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${pct}%`, backgroundColor: low ? '#ef4444' : pct > 70 ? '#4ade80' : '#fbbf24' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Time display */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
           style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <span className="text-[10px] text-indigo-300 font-mono">⏱</span>
        <span className="text-indigo-300 text-[11px] font-mono">A{years} D{days}</span>
      </div>

      {/* Speed controls */}
      <div className="flex items-center rounded-lg overflow-hidden shrink-0"
           style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
        <button
          onClick={togglePause}
          className={`px-2 py-1.5 transition-colors ${paused ? 'bg-green-600 hover:bg-green-500' : 'hover:bg-white/8'}`}
          style={paused ? {} : { background: 'rgba(255,255,255,0.07)' }}
        >
          {paused ? <Play size={14} className="text-white" /> : <Pause size={14} className="text-white" />}
        </button>
        {[1, 2, 5, 10, 20].map(s => (
          <button
            key={s}
            onClick={() => setGameSpeed(s)}
            className={`px-2 py-1.5 text-[11px] font-bold transition-colors ${
              gameSpeed === s ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {s}×
          </button>
        ))}
      </div>

      {/* Notifications */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowNotifPanel(v => !v)}
          className="relative p-2 rounded-lg transition-colors hover:bg-white/5"
        >
          <Bell size={15} className={unread > 0 ? 'text-amber-300' : 'text-gray-500'} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        <AnimatePresence>
          {showNotifPanel && (
            <motion.div
              className="absolute top-10 right-0 w-80 rounded-xl overflow-hidden z-50"
              style={{
                background: 'rgba(4,4,24,0.98)',
                border: '1px solid rgba(34,211,238,0.2)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
            >
              <div className="px-4 py-3 border-b border-white/5 text-xs font-bold text-cyan-300">
                Notificações Recentes
              </div>
              <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                {notifications.slice(-10).reverse().map(n => {
                  const clsMap: Record<string, string> = {
                    danger:  'bg-red-950/60 text-red-200 border-red-800/30',
                    warning: 'bg-amber-950/60 text-amber-200 border-amber-800/30',
                    success: 'bg-emerald-950/60 text-emerald-200 border-emerald-800/30',
                  };
                  return (
                    <div key={n.id} className={`text-[11px] px-3 py-2 rounded-lg border leading-snug ${clsMap[n.type] || 'text-gray-300'}`}
                         style={!clsMap[n.type] ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' } : {}}>
                      {n.message}
                    </div>
                  );
                })}
                {notifications.length === 0 && <p className="text-xs text-gray-600 text-center py-3">Nenhuma notificação.</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Save / Load */}
      <div className="flex gap-1 shrink-0">
        <button
          onClick={saveGame}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          title="Salvar jogo"
        >
          <Save size={13} /> Salvar
        </button>
        <button
          onClick={loadGame}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          title="Carregar jogo"
        >
          <Upload size={13} /> Carregar
        </button>
      </div>

      <TopBarExtra />
    </div>
  );
};

const TopBarExtra: React.FC = () => {
  const { toggleTimeline, toggleEngineering, timeline, robots } = useGameStore();
  return (
    <div className="flex gap-1 shrink-0">
      <button
        onClick={toggleTimeline}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-indigo-300/70 hover:text-indigo-200 hover:bg-indigo-500/10 transition-all"
        style={{ border: '1px solid rgba(99,102,241,0.15)' }}
        title="Linha do Tempo"
      >
        <BookOpen size={13} />
        <span className="hidden lg:inline">Linha do Tempo</span>
        {timeline.length > 0 && <span className="text-[9px] px-1 rounded-full bg-indigo-900/60">{timeline.length}</span>}
      </button>
      <button
        onClick={toggleEngineering}
        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] text-emerald-300/70 hover:text-emerald-200 hover:bg-emerald-500/10 transition-all"
        style={{ border: '1px solid rgba(52,211,153,0.15)' }}
        title="Engenharia"
      >
        <Wrench size={13} />
        <span className="hidden lg:inline">Engenharia</span>
        {robots.length > 0 && <span className="text-[9px] px-1 rounded-full bg-emerald-900/60">{robots.length}</span>}
      </button>
    </div>
  );
};

// ── Sidebar ──────────────────────────────────────────────────────────────────
export const SideBar: React.FC = () => {
  const {
    currentView, setCurrentView, toggleShipInterior, showShipInterior,
    playerShips, galaxies, selectedStar, selectedPlanet,
  } = useGameStore();
  const [expanded, setExpanded] = useState(false);

  const totalColonies = galaxies.reduce((sum, g) =>
    sum + g.stars.reduce((s, star) =>
      s + star.planets.reduce((ps, p) => ps + p.colonies.length, 0), 0), 0);

  const navItems = [
    { id: 'galaxy',     icon: Globe2,   label: 'Mapa Galáctico',    emoji: '🌌', disabled: false, action: undefined as (() => void) | undefined, active: undefined as boolean | undefined },
    { id: 'system',     icon: Star,     label: 'Sistema Estelar',   emoji: '⭐', disabled: !selectedStar },
    { id: 'planet',     icon: Globe,    label: 'Vista do Planeta',  emoji: '🪐', disabled: !selectedPlanet },
    { id: 'ship',       icon: Rocket,   label: `Frota (${playerShips.length})`, emoji: '🚀', action: toggleShipInterior, active: showShipInterior },
  ];

  const stats = [
    { label: 'Galáxias', value: galaxies.length, icon: '🌌' },
    { label: 'Colônias', value: totalColonies, icon: '🏙️' },
    { label: 'Frotas', value: playerShips.length, icon: '🚀' },
  ];

  return (
    <motion.div
      className="fixed left-0 top-[52px] bottom-0 z-30 flex flex-col"
      style={{
        background: 'linear-gradient(90deg, rgba(3,3,18,0.98) 0%, rgba(5,5,25,0.95) 100%)',
        borderRight: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
      }}
      animate={{ width: expanded ? 192 : 56 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
    >
      {/* Toggle button */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center z-10 text-cyan-500 hover:text-cyan-300 transition-colors"
        style={{ background: 'rgba(4,4,24,0.95)', border: '1px solid rgba(34,211,238,0.25)' }}
      >
        {expanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Nav items */}
      <div className="py-3 space-y-1 overflow-hidden">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = item.active || (currentView === item.id && !item.action);
          return (
            <button
              key={item.id}
              onClick={() => item.action ? item.action() : setCurrentView(item.id as 'galaxy' | 'system' | 'planet' | 'ship')}
              disabled={item.disabled}
              className={`w-full flex items-center gap-3 px-4 py-2.5 transition-all text-left relative ${
                isActive
                  ? 'text-cyan-300'
                  : item.disabled
                  ? 'text-gray-700 cursor-not-allowed'
                  : 'text-gray-500 hover:text-gray-200'
              }`}
              style={isActive ? { background: 'rgba(34,211,238,0.08)', borderLeft: '2px solid rgba(34,211,238,0.7)' } : {}}
            >
              <span className="text-base leading-none shrink-0">{item.emoji}</span>
              <AnimatePresence>
                {expanded && (
                  <motion.span
                    className="text-xs font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}

        {/* Divider */}
        <div className="mx-3 my-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} />

        {/* Stats (only when expanded) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="px-4 space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-[10px] text-gray-600 font-bold uppercase tracking-wider mb-2">Estatísticas</div>
              {stats.map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 flex items-center gap-1">
                    <span>{s.icon}</span> {s.label}
                  </span>
                  <span className="text-[11px] font-bold text-gray-300">{s.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Resource Panel (right side) ──────────────────────────────────────────────
export const ResourcePanel: React.FC = () => {
  const { resources } = useGameStore();

  const RES_META: Record<string, { emoji: string; color: string; name: string }> = {
    energy:      { emoji: '⚡', color: '#fbbf24', name: 'Energia' },
    food:        { emoji: '🌾', color: '#4ade80', name: 'Comida' },
    water:       { emoji: '💧', color: '#38bdf8', name: 'Água' },
    iron:        { emoji: '⚙️', color: '#94a3b8', name: 'Ferro' },
    fuel:        { emoji: '🔋', color: '#a78bfa', name: 'Combustível' },
    electronics: { emoji: '💡', color: '#22d3ee', name: 'Eletrônicos' },
    medicine:    { emoji: '💊', color: '#f472b6', name: 'Medicina' },
    titanium:    { emoji: '🪨', color: '#cbd5e1', name: 'Titânio' },
    crystals:    { emoji: '💎', color: '#c084fc', name: 'Cristais' },
    copper:      { emoji: '🟤', color: '#fb923c', name: 'Cobre' },
  };

  return (
    <div
      className="fixed right-3 top-[60px] w-52 rounded-xl overflow-hidden z-30"
      style={{
        background: 'linear-gradient(135deg, rgba(4,4,24,0.97) 0%, rgba(8,8,35,0.96) 100%)',
        border: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="px-3 py-2 flex items-center gap-2 border-b"
           style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(34,211,238,0.04)' }}>
        <Activity size={13} className="text-cyan-500" />
        <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Recursos</span>
      </div>

      <div className="p-2.5 space-y-2">
        {resources.slice(0, 8).map(res => {
          const meta = RES_META[res.resource] || { emoji: '📦', color: '#94a3b8', name: res.resource };
          const pct = Math.min(100, (res.amount / res.maxStorage) * 100);
          const net = res.production - res.consumption;
          const low = pct < 15;

          return (
            <div key={res.resource}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>{meta.emoji}</span>
                  <span className="text-gray-400">{meta.name}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={net > 0 ? 'text-green-400' : net < 0 ? 'text-red-400' : 'text-gray-600'}>
                    {net > 0 ? '+' : ''}{net.toFixed(1)}
                  </span>
                  <span className={`font-bold tabular-nums ${low ? 'text-red-300' : 'text-gray-200'}`}>
                    {Math.floor(res.amount)}
                  </span>
                </div>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: low ? '#ef4444' : pct > 80 ? '#4ade80' : meta.color }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Planet Info Panel ────────────────────────────────────────────────────────
export const PlanetInfoPanel: React.FC = () => {
  const { selectedPlanet, originWorld, currentView, showShipInterior } = useGameStore();
  const setEmpirePanel = useEmpireUI(s => s.setPanel);
  const openColonization = useColonizationStore(s => s.openPanelFor);
  const missions = useColonizationStore(s => s.missions);

  if (!selectedPlanet || showShipInterior || currentView !== 'planet') return null;

  const dist = Math.sqrt(
    (selectedPlanet.position.x - originWorld.position.x) ** 2 +
    (selectedPlanet.position.y - originWorld.position.y) ** 2 +
    (selectedPlanet.position.z - originWorld.position.z) ** 2,
  );

  const canCol = selectedPlanet.habitability >= 0.25 && selectedPlanet.colonies.length === 0;
  const inProgress = missions.find(m => m.planetId === selectedPlanet.id && m.phase !== 'complete' && m.phase !== 'failed');

  const habColor = selectedPlanet.habitability > 0.6 ? '#4ade80' : selectedPlanet.habitability > 0.3 ? '#fbbf24' : '#ef4444';
  const tempOk = Math.abs(selectedPlanet.temperature - 20) < 30;

  return (
    <motion.div
      className="fixed right-3 w-60 rounded-xl overflow-hidden z-30"
      style={{
        top: '278px',
        background: 'linear-gradient(135deg, rgba(4,4,24,0.97) 0%, rgba(8,8,35,0.96) 100%)',
        border: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 flex items-center gap-2 border-b"
           style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(34,211,238,0.04)' }}>
        <span className="text-base">🪐</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-white truncate">{selectedPlanet.name}</div>
          <div className="text-[10px] text-gray-500 capitalize">{selectedPlanet.type.replace('_', ' ')}</div>
        </div>
      </div>

      <div className="p-3 space-y-2.5 text-[11px]">
        {/* Habitability bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400">Habitabilidade</span>
            <span className="font-bold" style={{ color: habColor }}>{(selectedPlanet.habitability * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="h-full rounded-full transition-all"
                 style={{ width: `${selectedPlanet.habitability * 100}%`, backgroundColor: habColor }} />
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Temperatura', value: `${selectedPlanet.temperature.toFixed(0)}°C`, ok: tempOk },
            { label: 'Gravidade', value: `${selectedPlanet.gravity.toFixed(2)}g`, ok: selectedPlanet.gravity < 1.5 },
            { label: 'Distância', value: `${dist.toFixed(1)} AL`, ok: dist < 50 },
            { label: 'Atmosfera', value: selectedPlanet.atmosphereType || 'Nenhuma', ok: selectedPlanet.atmosphereType === 'breathable' },
          ].map(stat => (
            <div key={stat.label} className="rounded-lg p-1.5"
                 style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-gray-600 text-[10px]">{stat.label}</div>
              <div className={`font-semibold ${stat.ok ? 'text-green-300' : 'text-orange-300'}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Population */}
        {selectedPlanet.population != null && selectedPlanet.population > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-400">👥 População</span>
            <span className="text-white font-bold">{selectedPlanet.population.toLocaleString()}</span>
          </div>
        )}

        {/* Colonies */}
        {selectedPlanet.colonies.length > 0 && (
          <div className="space-y-1 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="text-gray-500 text-[10px] font-bold uppercase">Colônias</div>
            {selectedPlanet.colonies.map(c => (
              <div key={c.id} className="rounded-lg p-2"
                   style={{ background: 'rgba(34,211,238,0.04)', border: '1px solid rgba(34,211,238,0.1)' }}>
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-gray-500 text-[10px]">{c.population.toLocaleString()} hab</div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {!selectedPlanet.owned && canCol && !inProgress && (
          <button
            onClick={() => { openColonization(selectedPlanet.id); setEmpirePanel('colonization'); }}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl text-xs transition-all hover:brightness-110"
            style={{
              background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
              boxShadow: '0 4px 20px rgba(34,211,238,0.25)',
            }}
          >
            <Flag size={13} />
            PLANEJAR COLONIZAÇÃO
          </button>
        )}
        {inProgress && (
          <motion.button
            onClick={() => { openColonization(selectedPlanet.id); setEmpirePanel('colonization'); }}
            className="w-full flex items-center justify-center gap-2 text-white font-bold py-2.5 rounded-xl text-xs transition-all"
            style={{ background: 'linear-gradient(135deg, #d97706, #ea580c)', boxShadow: '0 4px 20px rgba(251,146,60,0.3)' }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Flag size={13} />
            MISSÃO EM CURSO — STATUS
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ── Fleet Mini Panel ─────────────────────────────────────────────────────────
export const FleetMiniPanel: React.FC = () => {
  const { playerShips, selectShip, toggleShipInterior, showShipInterior, currentView } = useGameStore();

  if (playerShips.length === 0 || showShipInterior || currentView === 'galaxy') return null;

  return (
    <motion.div
      className="fixed left-16 bottom-20 rounded-2xl overflow-hidden z-30"
      style={{
        background: 'rgba(4,4,24,0.95)',
        border: '1px solid rgba(34,211,238,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-0.5 p-1.5">
        {playerShips.map(ship => (
          <button
            key={ship.id}
            onClick={() => { selectShip(ship); toggleShipInterior(); }}
            className="flex flex-col items-center p-2.5 rounded-xl transition-all hover:bg-white/5"
            title={ship.name}
          >
            <Rocket size={18} className={ship.inTransit ? 'text-cyan-400' : 'text-gray-400'} />
            <span className="text-[10px] text-gray-500 mt-1 max-w-[48px] truncate">{ship.name.split(' ').slice(-1)[0]}</span>
            <div className="flex gap-0.5 mt-1">
              {[...Array(3)].map((_, i) => (
                <div key={i} className={`w-1 h-1 rounded-full ${
                  i < Math.ceil(ship.overallEfficiency / 34)
                    ? ship.overallEfficiency > 66 ? 'bg-green-400' : ship.overallEfficiency > 33 ? 'bg-yellow-400' : 'bg-red-400'
                    : 'bg-white/15'
                }`} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// ── View Indicator ───────────────────────────────────────────────────────────
export const ViewIndicator: React.FC = () => {
  const { currentView, showShipInterior } = useGameStore();

  if (showShipInterior) return null;

  const viewMeta: Record<string, { name: string; emoji: string; color: string }> = {
    galaxy: { name: 'Vista Galáctica',  emoji: '🌌', color: '#6366f1' },
    system: { name: 'Vista do Sistema', emoji: '⭐', color: '#f59e0b' },
    planet: { name: 'Vista do Planeta', emoji: '🪐', color: '#22d3ee' },
    ship:   { name: 'Interior da Nave', emoji: '🚀', color: '#4ade80' },
  };
  const meta = viewMeta[currentView] || { name: 'Desconhecido', emoji: '🔭', color: '#94a3b8' };

  return (
    <div
      className="fixed bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-xl z-30 text-[11px]"
      style={{ background: 'rgba(4,4,24,0.9)', border: `1px solid ${meta.color}30` }}
    >
      <span>{meta.emoji}</span>
      <span style={{ color: meta.color }}>{meta.name}</span>
    </div>
  );
};

// ── Main HUD ─────────────────────────────────────────────────────────────────
export const GameHUD: React.FC = () => {
  const { showShipInterior } = useGameStore();

  if (showShipInterior) return null;

  return (
    <>
      <TopBar />
      <SideBar />
      <ResourcePanel />
      <PlanetInfoPanel />
      <FleetMiniPanel />
      <ViewIndicator />
    </>
  );
};
