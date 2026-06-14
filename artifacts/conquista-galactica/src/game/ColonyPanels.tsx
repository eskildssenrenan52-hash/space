// ============================================================================
// COLONY PANELS — spectacular holographic city management, mining,
// component exchange, task center and notification toaster.
// ============================================================================
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Building2, Pickaxe, ArrowUpCircle, Trash2, Eye, Coins, TrendingUp,
  TrendingDown, ListTodo, Bell, Crown, AlertTriangle, CheckCircle2, Info,
  Zap, Bot, Shield, Leaf, Heart, DollarSign, ChevronDown, ChevronUp,
  Sparkles, Star, Lock, Filter, Search, Activity, Layers,
} from 'lucide-react';
import { useEmpireUI } from './empireUI';
import { useGameStore } from './gameStore';
import { useEmpireStore } from './empireStore';
import {
  useColonyStore, DISTRICTS, DIM_INFO, popCapOf, computeTasks, componentPriceOf,
  type Dimension, type City, type District, type DistrictCategory,
} from './colonyStore';
import { MAT_BY_ID } from './data/industryData';
import { CATALOG_BY_CATEGORY, CATEGORY_LABELS, type CatCategory } from './data/engineeringCatalog';

// ── Holographic Modal ────────────────────────────────────────────────────────
const Modal: React.FC<{ title: string; subtitle?: string; onClose: () => void; children: React.ReactNode; wide?: boolean; icon?: React.ReactNode }> = ({ title, subtitle, onClose, children, wide, icon }) => (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,10,0.75)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={`relative w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'} max-h-[90vh] flex flex-col rounded-2xl overflow-hidden`}
        style={{
          background: 'linear-gradient(135deg, rgba(4,4,24,0.98) 0%, rgba(8,8,35,0.98) 100%)',
          border: '1px solid rgba(34,211,238,0.3)',
          boxShadow: '0 0 60px rgba(34,211,238,0.12), 0 0 120px rgba(99,102,241,0.08), inset 0 1px 0 rgba(34,211,238,0.15)',
        }}
        initial={{ scale: 0.92, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 10, opacity: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
        {/* Corner accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-cyan-400/60 rounded-tl" />
        <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-cyan-400/60 rounded-tr" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-cyan-400/40 rounded-bl" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40 rounded-br" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/15" style={{ background: 'rgba(34,211,238,0.04)' }}>
          <div className="flex items-center gap-3">
            {icon && <div className="text-2xl">{icon}</div>}
            <div>
              <h2 className="text-lg font-bold text-cyan-300 tracking-wide">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent">
          {children}
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ── Dimension Bar ────────────────────────────────────────────────────────────
const DimBar: React.FC<{ dim: Dimension; value: number; compact?: boolean }> = ({ dim, value, compact }) => {
  const info = DIM_INFO[dim];
  const low = value < 30;
  const critical = value < 15;
  const color = critical ? '#ef4444' : low ? '#f97316' : info.color;

  return (
    <div className={compact ? '' : 'space-y-1'}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-400 flex items-center gap-1">
          <span>{info.icon}</span>
          {!compact && <span>{info.name}</span>}
        </span>
        <span className={`font-bold tabular-nums ${critical ? 'text-red-400 animate-pulse' : low ? 'text-orange-400' : 'text-gray-300'}`}>
          {Math.round(value)}
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={false}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

// ── District Card ────────────────────────────────────────────────────────────
const TIER_LABELS: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };
const TIER_COLORS: Record<number, string> = {
  1: 'text-slate-400 border-slate-600/40',
  2: 'text-sky-400 border-sky-500/40',
  3: 'text-fuchsia-400 border-fuchsia-500/40',
  4: 'text-amber-400 border-amber-500/40',
};
const CAT_COLORS: Record<DistrictCategory, string> = {
  civilian: 'text-emerald-300',
  industrial: 'text-orange-300',
  military: 'text-red-300',
  research: 'text-violet-300',
  special: 'text-amber-300',
};

const DistrictCard: React.FC<{
  district: District;
  can: boolean;
  canMats: boolean;
  canCred: boolean;
  onBuild: () => void;
  inventory: Record<string, number>;
  credits: number;
}> = ({ district: d, can, canMats, canCred, onBuild, inventory, credits }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      disabled={!can}
      onClick={onBuild}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      className={`relative text-left p-3 rounded-xl border transition-all overflow-hidden ${
        can
          ? 'hover:border-cyan-500/50 cursor-pointer'
          : 'cursor-not-allowed opacity-60'
      }`}
      style={{
        background: can && hovered
          ? `linear-gradient(135deg, rgba(4,4,24,0.95), ${d.color}18)`
          : 'rgba(4,6,18,0.85)',
        border: can ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
        boxShadow: can && hovered ? `0 0 20px ${d.color}20` : 'none',
      }}
      whileHover={can ? { scale: 1.01 } : {}}
      whileTap={can ? { scale: 0.98 } : {}}
    >
      {/* Tier badge */}
      <div className={`absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded border ${TIER_COLORS[d.tier]}`}
           style={{ background: 'rgba(0,0,0,0.6)' }}>
        T{TIER_LABELS[d.tier]}
      </div>

      {/* Color accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl" style={{ backgroundColor: d.color }} />

      <div className="pl-2">
        <div className="flex items-start gap-2 mb-1.5">
          <span className="text-lg leading-none">{d.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white text-xs leading-tight">{d.name}</div>
            <div className={`text-[10px] mt-0.5 ${CAT_COLORS[d.category]}`}>
              {d.category === 'civilian' ? 'Civil' : d.category === 'industrial' ? 'Industrial' : d.category === 'military' ? 'Militar' : d.category === 'research' ? 'Pesquisa' : 'Especial'}
            </div>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 mb-2 leading-snug">{d.desc}</p>

        {/* Stats row */}
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2">
          <span className="text-[10px]" style={{ color: DIM_INFO[d.dim].color }}>
            {DIM_INFO[d.dim].icon} +{d.support}
          </span>
          {d.popCap > 0 && <span className="text-[10px] text-purple-300">👥 +{d.popCap.toLocaleString()}</span>}
          {d.ecoPenalty && <span className="text-[10px] text-red-400">🌫️ -{d.ecoPenalty}</span>}
          {d.bonusIncome && <span className="text-[10px] text-yellow-300">💰 +{d.bonusIncome.toFixed(1)}/s</span>}
          {d.defenseBonus && <span className="text-[10px] text-orange-300">🛡️ +{d.defenseBonus}</span>}
          {d.scienceBonus && <span className="text-[10px] text-violet-300">🔬 +{d.scienceBonus}</span>}
        </div>

        {/* Cost row */}
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {d.materials.map(m => {
              const have = Math.floor(inventory[m.mat] || 0);
              const ok = have >= m.qty;
              return (
                <span key={m.mat} className={`text-[9px] px-1.5 py-0.5 rounded ${ok ? 'text-gray-400' : 'text-red-400'}`}
                      style={ok ? { background: 'rgba(255,255,255,0.07)' } : { background: 'rgba(239,68,68,0.12)' }}>
                  {m.qty}× {MAT_BY_ID[m.mat]?.namePt || m.mat}
                </span>
              );
            })}
          </div>
          <span className={`text-[11px] font-bold tabular-nums ${canCred ? 'text-amber-300' : 'text-red-400'}`}>
            {d.credits.toLocaleString()}c
          </span>
        </div>

        {/* Lock overlay for missing resources */}
        {!can && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: 'rgba(0,0,0,0.3)' }}>
            {!canMats && <Lock size={14} className="text-red-400/60" />}
          </div>
        )}
      </div>
    </motion.button>
  );
};

// ── City Card ────────────────────────────────────────────────────────────────
const CityCard: React.FC<{ city: City }> = ({ city }) => {
  const { invest, setViewingCity, setCapital, toggleAutoManage, quickFixCity } = useColonyStore();
  const autoOn = useColonyStore(s => !!s.autoManage[city.id]);
  const inventory = useEmpireStore(s => s.inventory);
  const credits = useGameStore(s => s.credits);
  const cap = popCapOf(city);
  const [open, setOpen] = useState(false);
  const [catFilter, setCatFilter] = useState<DistrictCategory | 'all'>('all');
  const [dimFilter, setDimFilter] = useState<Dimension | 'all'>('all');

  const popPct = Math.min(100, (city.population / cap) * 100);
  const xpPct = (city.xp / city.xpNext) * 100;
  const dims: Dimension[] = ['economy', 'energy', 'security', 'ecology', 'health'];
  const avgWellbeing = dims.reduce((s, d) => s + city[d], 0) / dims.length;

  const statusColor = avgWellbeing > 60 ? '#4ade80' : avgWellbeing > 35 ? '#fbbf24' : '#ef4444';

  const filteredDistricts = useMemo(() => DISTRICTS.filter(d =>
    (catFilter === 'all' || d.category === catFilter) &&
    (dimFilter === 'all' || d.dim === dimFilter)
  ), [catFilter, dimFilter]);

  return (
    <motion.div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(4,4,24,0.95) 0%, rgba(8,8,35,0.95) 100%)',
        border: `1px solid rgba(34,211,238,0.2)`,
        boxShadow: city.isCapital ? '0 0 30px rgba(251,191,36,0.12)' : '0 0 15px rgba(34,211,238,0.05)',
      }}
      layout
    >
      {/* City Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                 style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)' }}>
              🏙️
            </div>
            {city.isCapital && (
              <div className="absolute -top-1.5 -right-1.5 text-amber-400">
                <Crown size={12} />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{city.name}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-900/40 text-cyan-400 border border-cyan-700/30">
                Nível {city.level}
              </span>
              <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: statusColor }} />
            </div>
            <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
              <span>👥 {Math.floor(city.population).toLocaleString()} / {cap.toLocaleString()}</span>
              <span>🛡️ {Math.round(city.defenseRating)}</span>
              <span>🏗️ {city.buildings.length} distritos</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
            <span>EXP</span><span>{city.xp.toLocaleString()} / {city.xpNext.toLocaleString()}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full bg-gradient-to-r from-purple-600 to-violet-400 rounded-full"
              animate={{ width: `${xpPct}%` }} transition={{ duration: 1 }} />
          </div>
        </div>

        {/* Population bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-gray-600 mb-1">
            <span>👥 População</span><span>{popPct.toFixed(1)}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <motion.div className="h-full rounded-full"
              style={{ background: popPct > 90 ? '#ef4444' : popPct > 70 ? '#f97316' : '#a855f7' }}
              animate={{ width: `${popPct}%` }} transition={{ duration: 1 }} />
          </div>
        </div>

        {/* Dimension bars */}
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {dims.map(d => <DimBar key={d} dim={d} value={city[d]} />)}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setViewingCity(city.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-500/10"
            style={{ border: '1px solid rgba(34,211,238,0.25)' }}
          >
            <Eye size={13} /> Ver 3D
          </button>
          <button
            onClick={() => quickFixCity(city.id)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-300 transition-all hover:bg-amber-500/10"
            style={{ border: '1px solid rgba(251,191,36,0.25)' }}
          >
            <Zap size={13} /> Reforçar
          </button>
          <button
            onClick={() => toggleAutoManage(city.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              autoOn
                ? 'text-emerald-300 bg-emerald-500/10 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200'
            }`}
            style={autoOn ? {} : { border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <Bot size={13} /> {autoOn ? 'AUTO ON' : 'AUTO'}
          </button>
        </div>

        {!city.isCapital && (
          <button
            onClick={() => setCapital(city.id)}
            className="w-full mt-2 text-[11px] text-amber-400/70 hover:text-amber-300 transition-colors flex items-center justify-center gap-1"
          >
            <Crown size={11} /> Definir como Capital
          </button>
        )}

        {/* Expand button */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors py-1.5 rounded-lg hover:bg-cyan-500/5"
        >
          {open ? <><ChevronUp size={14} /> Recolher construções</> : <><ChevronDown size={14} /> Construir distritos ({filteredDistricts.length})</>}
        </button>
      </div>

      {/* District Builder */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-cyan-500/10"
          >
            <div className="p-4">
              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <button onClick={() => setCatFilter('all')}
                  className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                  style={catFilter === 'all'
                    ? { background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)', color: '#67e8f9' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                  Todos
                </button>
                {(['civilian', 'industrial', 'military', 'research', 'special'] as DistrictCategory[]).map(c => (
                  <button key={c} onClick={() => setCatFilter(catFilter === c ? 'all' : c)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                    style={catFilter === c
                      ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#e2e8f0' }
                      : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280' }}>
                    {c === 'civilian' ? 'Civil' : c === 'industrial' ? 'Ind.' : c === 'military' ? 'Milit.' : c === 'research' ? 'Pesq.' : 'Esp.'}
                  </button>
                ))}
                <div className="ml-auto flex gap-1">
                  {(['economy', 'energy', 'security', 'ecology', 'health'] as Dimension[]).map(d => (
                    <button key={d} onClick={() => setDimFilter(dimFilter === d ? 'all' : d)}
                      title={DIM_INFO[d].name}
                      className="px-1.5 py-1 rounded text-xs transition-all"
                      style={dimFilter === d
                        ? { background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)' }
                        : { background: 'transparent' }}>
                      {DIM_INFO[d].icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredDistricts.map(d => {
                  const canMats = d.materials.every(m => (inventory[m.mat] || 0) >= m.qty);
                  const canCred = credits >= d.credits;
                  return (
                    <DistrictCard
                      key={d.id}
                      district={d}
                      can={canMats && canCred}
                      canMats={canMats}
                      canCred={canCred}
                      onBuild={() => invest(city.id, d.id)}
                      inventory={inventory}
                      credits={credits}
                    />
                  );
                })}
              </div>

              {filteredDistricts.length === 0 && (
                <div className="text-xs text-gray-600 text-center py-6 rounded-xl"
                     style={{ background: 'rgba(10,15,25,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  Nenhum distrito para o filtro selecionado.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Mining Section ───────────────────────────────────────────────────────────
const MiningSection: React.FC = () => {
  const planets = useGameStore(s => s.planets);
  const { mines, buildMine, upgradeMine, removeMine } = useColonyStore();
  const ownedPlanets = planets.filter(p => p.owned || p.colonies.length > 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
        <div className="p-1.5 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <Pickaxe size={14} className="text-amber-400" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-gray-600">// RESOURCE EXTRACTION</div>
          <div className="text-sm font-bold text-amber-300">Operações de Mineração</div>
        </div>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
          {mines.length} ativas
        </span>
      </div>

      {ownedPlanets.length === 0 && (
        <div className="rounded-xl p-6 text-center text-xs text-gray-500"
             style={{ background: 'rgba(10,15,25,0.5)', border: '1px solid rgba(245,158,11,0.12)' }}>
          <Pickaxe size={28} className="mx-auto mb-3 text-amber-800/60" />
          <div className="font-bold text-gray-400 mb-1">Sem planetas colonizados</div>
          Colonize um planeta para abrir minas em seus depósitos.
        </div>
      )}

      {ownedPlanets.map(p => (
        <motion.div key={p.id} className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(8,8,28,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-3 py-2 border-b border-white/5 flex items-center gap-2">
            <span className="text-sm">🪐</span>
            <span className="text-sm font-semibold text-white">{p.name}</span>
            <span className="text-[10px] text-gray-600 ml-auto">{p.resources.length} depósitos</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 p-3">
            {p.resources.map((dep, i) => {
              const alreadyMined = mines.some(m => m.planetId === p.id && m.resource === dep.resource);
              return (
                <button key={i} onClick={() => buildMine(p.id, i)} disabled={alreadyMined}
                  className={`text-left p-2.5 rounded-lg transition-all ${
                    alreadyMined
                      ? 'text-gray-600 cursor-not-allowed border border-transparent'
                      : 'bg-amber-900/15 hover:bg-amber-900/30 text-gray-200 border border-amber-700/20 hover:border-amber-600/40'
                  }`}>
                  <div className="text-xs font-semibold capitalize flex items-center justify-between">
                    <span>{dep.resource}</span>
                    {alreadyMined ? <span className="text-[9px] text-gray-600">Em uso</span> : <span className="text-[10px] text-amber-400">800c</span>}
                  </div>
                  <div className="flex gap-2 mt-1 text-[9px] text-gray-500">
                    <span>Qual: {(dep.quality * 100).toFixed(0)}%</span>
                    <span>Acesso: {(dep.accessibility * 100).toFixed(0)}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Active mines */}
      {mines.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.1)' }}>
            <Activity size={12} className="text-amber-400" />
            <div className="text-xs font-bold text-amber-300">Minas em Operação</div>
          </div>
          {mines.map(m => {
            const pct = m.remaining > 0 ? Math.min(100, (m.remaining / 10000) * 100) : 0;
            const matInfo = MAT_BY_ID[m.matId];
            return (
              <motion.div key={m.id} className="rounded-xl p-3"
                style={{ background: 'rgba(8,8,28,0.8)', border: m.remaining <= 0 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.06)' }}
                layout>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{matInfo?.icon || '⛏️'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      {matInfo?.namePt || m.resource}
                      <span className="text-[10px] px-1.5 py-0.5 rounded text-gray-400" style={{ background: 'rgba(255,255,255,0.07)' }}>Nv {m.upgradeLevel + 1}</span>
                      {m.remaining <= 0 && <span className="text-[10px] text-red-400 animate-pulse">ESGOTADO</span>}
                    </div>
                    <div className="text-[10px] text-gray-600">{m.planetName} · {(m.quality * 100).toFixed(0)}% qualidade</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => upgradeMine(m.id)} title="Melhorar mina"
                      className="p-1.5 rounded-lg text-cyan-400 hover:bg-cyan-500/10 transition-colors">
                      <ArrowUpCircle size={15} />
                    </button>
                    <button onClick={() => removeMine(m.id)} title="Remover mina"
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {m.remaining > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                           style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[9px] text-gray-600 mt-1">{Math.floor(m.remaining).toLocaleString()} unidades restantes</div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Colony Panel (main modal) ────────────────────────────────────────────────
export const ColonyPanel: React.FC = () => {
  const setPanel = useEmpireUI(s => s.setPanel);
  const citiesMap = useColonyStore(s => s.cities);
  const cities = useMemo(() => Object.values(citiesMap), [citiesMap]);
  const lastIncome = useColonyStore(s => s.lastIncome);
  const [tab, setTab] = useState<'cities' | 'mining'>('cities');

  const totalPop = cities.reduce((s, c) => s + c.population, 0);
  const totalBuildings = cities.reduce((s, c) => s + c.buildings.length, 0);

  return (
    <Modal
      title="Colônias & Cidades"
      subtitle={`${cities.length} cidades · ${Math.floor(totalPop).toLocaleString()} habitantes · ${totalBuildings} distritos`}
      onClose={() => setPanel(null)}
      wide
      icon="🏙️"
    >
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Renda/tick', value: `${lastIncome >= 0 ? '+' : ''}${lastIncome.toFixed(2)}`, icon: '💰', color: '#4ade80', accentColor: 'rgba(74,222,128' },
          { label: 'Cidades', value: cities.length, icon: '🏙️', color: '#22d3ee', accentColor: 'rgba(34,211,238' },
          { label: 'Defesa total', value: cities.reduce((s, c) => s + c.defenseRating, 0), icon: '🛡️', color: '#f87171', accentColor: 'rgba(248,113,113' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3 flex items-center gap-3"
               style={{ background: `${stat.accentColor},0.04)`, border: `1px solid ${stat.accentColor},0.15)` }}>
            <div className="text-2xl p-1.5 rounded-xl" style={{ background: `${stat.accentColor},0.08)` }}>{stat.icon}</div>
            <div>
              <div className="text-[10px] text-gray-500 font-mono">{stat.label}</div>
              <div className="text-lg font-bold tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-5">
        {([['cities', '🏙️ Cidades'], ['mining', '⛏️ Mineração']] as const).map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={tab === id
              ? { background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.35)', color: '#67e8f9' }
              : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280' }}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'cities' && (
          <motion.div key="cities" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
            className="space-y-4">
            {cities.length === 0 && (
              <div className="rounded-2xl p-8 text-center"
                   style={{ background: 'linear-gradient(135deg, rgba(4,4,24,0.8), rgba(34,211,238,0.03))', border: '1px solid rgba(34,211,238,0.12)', boxShadow: '0 0 40px rgba(34,211,238,0.04)' }}>
                <div className="text-5xl mb-3 opacity-60">🌍</div>
                <div className="text-[10px] font-mono text-gray-600 mb-1">// NO COLONIES FOUND</div>
                <p className="text-sm text-gray-300 font-bold mb-2">Nenhuma colônia ainda</p>
                <p className="text-xs text-gray-600">Vá para a vista de Planeta, selecione um mundo habitável e clique em <span className="text-green-400 font-bold">PLANEJAR COLONIZAÇÃO</span>.</p>
              </div>
            )}
            {cities.map(c => <CityCard key={c.id} city={c} />)}
          </motion.div>
        )}
        {tab === 'mining' && (
          <motion.div key="mining" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <MiningSection />
          </motion.div>
        )}
      </AnimatePresence>
    </Modal>
  );
};

// ── Component Exchange ───────────────────────────────────────────────────────
export const ComponentExchange: React.FC = () => {
  const setPanel = useEmpireUI(s => s.setPanel);
  const demand = useColonyStore(s => s.componentDemand);
  const stock = useColonyStore(s => s.componentStock);
  const { buyComponent, sellComponent } = useColonyStore();
  const [cat, setCat] = useState<CatCategory>('weapon');

  const items = (CATALOG_BY_CATEGORY[cat] || []).slice(0, 24);
  const cats = Object.keys(CATEGORY_LABELS).filter(c => c !== 'behavior') as CatCategory[];

  return (
    <Modal title="Bolsa de Componentes" subtitle="Compre na baixa, venda na alta para lucrar" onClose={() => setPanel(null)} wide icon="📈">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {cats.map(c => {
          const d = demand[c] ?? 1;
          const trend = d > 1.3 ? '🔺' : d < 0.7 ? '🔻' : '➡️';
          return (
            <button key={c} onClick={() => setCat(c)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              style={cat === c
                ? { background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.4)', color: '#67e8f9' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
              {CATEGORY_LABELS[c]}
              <span className={d > 1.2 ? 'text-green-400' : d < 0.8 ? 'text-red-400' : 'text-gray-500'}>
                {trend} {(d).toFixed(2)}x
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map(item => {
          const price = componentPriceOf(item, demand);
          const owned = stock[item.id] || 0;
          const d = demand[item.category] ?? 1;
          const demandColor = d > 1.3 ? '#4ade80' : d < 0.7 ? '#ef4444' : '#94a3b8';
          return (
            <div key={item.id} className="flex items-center gap-3 rounded-xl p-3 transition-all"
                 style={{ background: 'rgba(8,8,28,0.8)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white">{item.name}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-600">Tier {item.tier}</span>
                  {owned > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-900/40 text-purple-300">{owned} no estoque</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm font-bold text-amber-300 tabular-nums">{price}c</div>
                  <div className="text-[9px]" style={{ color: demandColor }}>{(d * 100).toFixed(0)}% dem.</div>
                </div>
                <button onClick={() => buyComponent(item.id)}
                  className="w-7 h-7 rounded-lg text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center justify-center border border-emerald-700/30">+</button>
                <button onClick={() => sellComponent(item.id)} disabled={owned <= 0}
                  className="w-7 h-7 rounded-lg text-xs font-bold text-red-300 hover:bg-red-500/20 transition-all flex items-center justify-center border border-red-700/30 disabled:opacity-30 disabled:cursor-not-allowed">−</button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

// ── Task Center ──────────────────────────────────────────────────────────────
export const TaskCenter: React.FC = () => {
  const setPanel = useEmpireUI(s => s.setPanel);
  const [, force] = useState(0);
  useEffect(() => { const i = setInterval(() => force(x => x + 1), 1500); return () => clearInterval(i); }, []);
  const tasks = computeTasks();
  const notifications = useGameStore(s => s.notifications).slice(-15).reverse();

  const PRIORITY_CFG = {
    high: { icon: <AlertTriangle size={13} />, color: 'text-red-400', bg: 'bg-red-900/20', border: 'border-red-700/30', label: '🔴 URGENTE' },
    med:  { icon: <Info size={13} />, color: 'text-amber-400', bg: 'bg-amber-900/20', border: 'border-amber-700/30', label: '🟡 MÉDIO' },
    low:  { icon: <CheckCircle2 size={13} />, color: 'text-gray-500', bg: '', border: '', label: '🟢 BAIXO', style: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' } },
  };

  return (
    <Modal title="Central de Comando" subtitle="Tarefas pendentes e histórico de notificações" onClose={() => setPanel(null)} icon="🗒️">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
            <div className="p-1 rounded-lg" style={{ background: 'rgba(34,211,238,0.12)' }}>
              <ListTodo size={13} className="text-cyan-400" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-gray-600">// PENDING TASKS</div>
              <div className="text-xs font-bold text-cyan-300">O que fazer agora</div>
            </div>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>{tasks.length}</span>
          </div>
          {tasks.length === 0 && (
            <div className="rounded-xl p-4 text-center"
                 style={{ border: '1px solid rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.05)' }}>
              <div className="text-2xl mb-1">🎉</div>
              <p className="text-xs text-green-400 font-semibold">Tudo em ordem, Comandante!</p>
              <p className="text-[11px] text-gray-600 mt-1">Continue expandindo seu império.</p>
            </div>
          )}
          <div className="space-y-2">
            {tasks.map(t => {
              const cfg = PRIORITY_CFG[t.priority];
              return (
                <motion.button key={t.id} onClick={() => t.panel && setPanel(t.panel as never)}
                  className={`w-full text-left flex items-start gap-2.5 rounded-xl p-3 transition-all border hover:brightness-125 ${cfg.bg} ${cfg.border}`}
                  whileHover={{ x: 2 }}
                >
                  <span className={cfg.color + ' mt-0.5 shrink-0'}>{cfg.icon}</span>
                  <div className="flex-1">
                    <div className="text-[11px] text-gray-200 leading-snug">{t.label}</div>
                    <div className={`text-[9px] mt-0.5 ${cfg.color}`}>{cfg.label}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
            <div className="p-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.12)' }}>
              <Bell size={13} className="text-purple-400" />
            </div>
            <div>
              <div className="text-[9px] font-mono text-gray-600">// EVENT LOG</div>
              <div className="text-xs font-bold text-purple-300">Histórico de Eventos</div>
            </div>
          </div>
          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {notifications.map(n => {
              const cfgMap: Record<string, string> = {
                danger:  'bg-red-950/60 text-red-200 border-red-800/30',
                warning: 'bg-amber-950/60 text-amber-200 border-amber-800/30',
                success: 'bg-emerald-950/60 text-emerald-200 border-emerald-800/30',
              };
              const cls = cfgMap[n.type] || 'text-gray-300';
              return (
                <div key={n.id} className={`text-[11px] px-3 py-2 rounded-lg border leading-snug ${cls}`}>
                  {n.message}
                </div>
              );
            })}
            {notifications.length === 0 && (
              <div className="text-center py-6 rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-2xl mb-1.5 opacity-30">🔔</div>
                <div className="text-[10px] font-mono text-gray-700 mb-1">// NOTIFICATION LOG EMPTY</div>
                <p className="text-xs text-gray-600">Sem notificações ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ── Notification Toaster ─────────────────────────────────────────────────────
export const NotificationToaster: React.FC = () => {
  const notifications = useGameStore(s => s.notifications);
  const [visible, setVisible] = useState<{ id: string; type: string; message: string }[]>([]);
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    const fresh = notifications.filter(n => !seen.current.has(n.id));
    if (fresh.length === 0) return;
    fresh.forEach(n => seen.current.add(n.id));
    setVisible(v => [...v, ...fresh.map(n => ({ id: n.id, type: n.type, message: n.message }))].slice(-4));
    const timers = fresh.map(n => setTimeout(() => {
      setVisible(v => v.filter(x => x.id !== n.id));
    }, 5500));
    return () => timers.forEach(clearTimeout);
  }, [notifications]);

  const cfg = (t: string) => {
    if (t === 'danger')  return { bar: 'from-red-500 to-rose-600',    tone: 'bg-red-950/95 border-red-500/30 text-red-100',    icon: '🚨', glow: 'rgba(248,113,113,0.2)' };
    if (t === 'warning') return { bar: 'from-amber-400 to-orange-500', tone: 'bg-amber-950/95 border-amber-500/30 text-amber-100', icon: '⚠️', glow: 'rgba(251,191,36,0.2)' };
    if (t === 'success') return { bar: 'from-emerald-400 to-green-500', tone: 'bg-emerald-950/95 border-emerald-500/30 text-emerald-100', icon: '✅', glow: 'rgba(52,211,153,0.2)' };
    return                      { bar: 'from-cyan-400 to-sky-500',    tone: 'border-cyan-500/30 text-cyan-50',   icon: 'ℹ️', glow: 'rgba(34,211,238,0.15)', bg: 'rgba(4,8,25,0.95)' };
  };

  return (
    <div className="fixed top-16 right-4 z-[55] space-y-2 w-80 pointer-events-none">
      <AnimatePresence>
        {visible.map(n => {
          const c = cfg(n.type);
          return (
            <motion.div key={n.id}
              className={`pointer-events-auto relative rounded-xl pl-3 pr-4 py-3 text-xs border backdrop-blur-md overflow-hidden ${c.tone}`}
              style={{ boxShadow: `0 8px 32px ${c.glow}, 0 0 0 1px rgba(255,255,255,0.05)` }}
              initial={{ x: 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 80, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${c.bar}`} />
              <div className="flex items-start gap-2.5 pl-2">
                <span className="text-sm leading-none mt-0.5 shrink-0">{c.icon}</span>
                <span className="leading-snug">{n.message}</span>
              </div>
              <div className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r ${c.bar}`}
                   style={{ width: '100%', animation: 'shrinkBar 5.5s linear forwards' }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
      <style>{`@keyframes shrinkBar { from { width: 100%; } to { width: 0%; } }`}</style>
    </div>
  );
};
