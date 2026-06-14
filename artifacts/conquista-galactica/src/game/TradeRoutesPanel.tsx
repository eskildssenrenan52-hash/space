// ============================================================================
// TRADE ROUTES — Inter-stellar trade system with income and route management
// ============================================================================
import React, { useState } from 'react';
import { X, TrendingUp, Package, Zap, Globe, ArrowRight, ShoppingCart, AlertTriangle } from 'lucide-react';
import { create } from 'zustand';
import { useGameStore } from './gameStore';

// ============================================================================
// TYPES
// ============================================================================
export type TradeRouteStatus = 'active' | 'disrupted' | 'blockaded' | 'negotiating';
export type TradeGood = 'food' | 'fuel' | 'electronics' | 'medicine' | 'alloys' | 'crystals' | 'rare_elements' | 'antimatter';

export interface TradeRoute {
  id: string;
  fromName: string;    // colony or empire name
  toName: string;
  fromType: 'colony' | 'empire';
  toType: 'colony' | 'empire';
  good: TradeGood;
  volume: number;      // units per tick
  profitPerTick: number;
  status: TradeRouteStatus;
  establishedAt: number;
  lastEarningAt: number;
  totalEarned: number;
  distance: number;    // light years
  risk: number;        // 0-1 piracy/disruption risk
  upgrades: RouteUpgrade[];
}

export interface RouteUpgrade {
  id: string;
  name: string;
  desc: string;
  profitBonus: number;
  riskReduction: number;
  cost: number;
  applied: boolean;
}

const ROUTE_UPGRADES: RouteUpgrade[] = [
  { id: 'escort', name: 'Escolta Armada', desc: '-30% risco de pirataria', profitBonus: 0, riskReduction: 0.3, cost: 2000, applied: false },
  { id: 'freight', name: 'Cargueiro Premium', desc: '+20% volume de carga', profitBonus: 0.2, riskReduction: 0, cost: 1500, applied: false },
  { id: 'insurance', name: 'Seguro Interestelar', desc: 'Garante renda mínima mesmo se interrompida', profitBonus: 0.05, riskReduction: 0.15, cost: 800, applied: false },
  { id: 'beacon', name: 'Baliza de Salto', desc: '-40% tempo de trânsito, +15% lucro', profitBonus: 0.15, riskReduction: 0.05, cost: 3000, applied: false },
];

const GOOD_INFO: Record<TradeGood, { label: string; icon: string; basePrice: number; color: string }> = {
  food:          { label: 'Alimentos',     icon: '🌾', basePrice: 8,   color: '#86efac' },
  fuel:          { label: 'Combustível',   icon: '⛽', basePrice: 12,  color: '#fde68a' },
  electronics:   { label: 'Eletrônicos',  icon: '💻', basePrice: 25,  color: '#7dd3fc' },
  medicine:      { label: 'Medicina',      icon: '💊', basePrice: 20,  color: '#f9a8d4' },
  alloys:        { label: 'Ligas',         icon: '⚙️', basePrice: 15,  color: '#94a3b8' },
  crystals:      { label: 'Cristais',      icon: '💎', basePrice: 40,  color: '#c084fc' },
  rare_elements: { label: 'Raros',         icon: '⚗️', basePrice: 80,  color: '#fb923c' },
  antimatter:    { label: 'Antimatéria',   icon: '⚛️', basePrice: 200, color: '#f472b6' },
};

const STATUS_INFO: Record<TradeRouteStatus, { label: string; color: string; icon: string }> = {
  active:       { label: 'Ativa',        color: '#22c55e', icon: '✅' },
  disrupted:    { label: 'Interrompida', color: '#f97316', icon: '⚠️' },
  blockaded:    { label: 'Bloqueada',    color: '#ef4444', icon: '🚫' },
  negotiating:  { label: 'Negociando',   color: '#f59e0b', icon: '🤝' },
};

// ============================================================================
// STORE
// ============================================================================
interface TradeRoutesState {
  routes: TradeRoute[];
  totalEarned: number;
  showPanel: boolean;
  selectedRouteId: string | null;
  lastTickAt: number;

  openPanel: () => void;
  closePanel: () => void;
  selectRoute: (id: string | null) => void;
  createRoute: (fromName: string, toName: string, fromType: 'colony' | 'empire', toType: 'colony' | 'empire', good: TradeGood) => void;
  removeRoute: (id: string) => void;
  upgradeRoute: (routeId: string, upgradeId: string) => void;
  tick: (delta: number) => void;
}

let rid = 0;
const newRid = () => `rt_${rid++}`;

function calcProfit(good: TradeGood, distance: number, volume: number, upgrades: RouteUpgrade[]): number {
  const base = GOOD_INFO[good].basePrice * volume;
  const distanceMult = 1 + distance * 0.05;
  const upBonus = upgrades.filter(u => u.applied).reduce((sum, u) => sum + u.profitBonus, 0);
  return Math.round(base * distanceMult * (1 + upBonus));
}

const EMPIRE_NAMES = [
  'Hegemonia Drakon', 'Síntese Unitária', 'Convênio das Maravilhas',
  'Federação de Korrigan', 'Corsários do Vazio', 'Harmonia Verde',
];

function genDefaultRoutes(): TradeRoute[] {
  return [
    {
      id: newRid(),
      fromName: 'Terra Prime', toName: 'Federação de Korrigan',
      fromType: 'colony', toType: 'empire',
      good: 'food', volume: 50, profitPerTick: 120,
      status: 'active', establishedAt: 0, lastEarningAt: 0, totalEarned: 0,
      distance: 3.2, risk: 0.05,
      upgrades: ROUTE_UPGRADES.map(u => ({ ...u, applied: false })),
    },
    {
      id: newRid(),
      fromName: 'Minério Alpha', toName: 'Terra Prime',
      fromType: 'colony', toType: 'colony',
      good: 'alloys', volume: 30, profitPerTick: 95,
      status: 'active', establishedAt: 0, lastEarningAt: 0, totalEarned: 0,
      distance: 1.8, risk: 0.08,
      upgrades: ROUTE_UPGRADES.map(u => ({ ...u, applied: false })),
    },
  ];
}

export const useTradeRoutesStore = create<TradeRoutesState>((set, get) => ({
  routes: genDefaultRoutes(),
  totalEarned: 0,
  showPanel: false,
  selectedRouteId: null,
  lastTickAt: 0,

  openPanel: () => set({ showPanel: true }),
  closePanel: () => set({ showPanel: false }),
  selectRoute: (id) => set({ selectedRouteId: id }),

  createRoute: (fromName, toName, fromType, toType, good) => {
    const g = useGameStore.getState();
    const costToEstablish = 2000;
    if (!g.spendCredits(costToEstablish)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para estabelecer rota.' });
      return;
    }
    const distance = 1.5 + Math.random() * 8;
    const volume = 20 + Math.floor(Math.random() * 60);
    const upgrades = ROUTE_UPGRADES.map(u => ({ ...u, applied: false }));
    const profit = calcProfit(good, distance, volume, upgrades);

    const route: TradeRoute = {
      id: newRid(),
      fromName, toName, fromType, toType, good,
      volume, profitPerTick: profit,
      status: 'active', establishedAt: g.gameTime, lastEarningAt: g.gameTime,
      totalEarned: 0, distance, risk: 0.05 + Math.random() * 0.15,
      upgrades,
    };

    set(s => ({ routes: [...s.routes, route] }));
    g.addNotification({ type: 'success', message: `🚢 Rota comercial estabelecida: ${fromName} → ${toName}` });
  },

  removeRoute: (id) => {
    set(s => ({ routes: s.routes.filter(r => r.id !== id) }));
  },

  upgradeRoute: (routeId, upgradeId) => {
    const g = useGameStore.getState();
    const route = get().routes.find(r => r.id === routeId);
    if (!route) return;
    const upgrade = route.upgrades.find(u => u.id === upgradeId);
    if (!upgrade || upgrade.applied) return;
    if (!g.spendCredits(upgrade.cost)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para upgrade.' });
      return;
    }
    set(s => ({
      routes: s.routes.map(r => {
        if (r.id !== routeId) return r;
        const newUpgrades = r.upgrades.map(u => u.id === upgradeId ? { ...u, applied: true } : u);
        const newProfit = calcProfit(r.good, r.distance, r.volume, newUpgrades);
        const newRisk = Math.max(0, r.risk - upgrade.riskReduction);
        return { ...r, upgrades: newUpgrades, profitPerTick: newProfit, risk: newRisk };
      }),
    }));
  },

  tick: (delta) => {
    const g = useGameStore.getState();
    if (g.paused) return;
    const dt = delta * g.gameSpeed;

    const TICK_INTERVAL = 10; // earn income every 10 ticks
    const timeSinceLast = g.gameTime - get().lastTickAt;
    if (timeSinceLast < TICK_INTERVAL) return;

    let totalIncome = 0;
    const routes = get().routes.map(route => {
      if (route.status !== 'active') return route;

      // Random disruption
      let status: TradeRouteStatus = 'active';
      if (Math.random() < route.risk * 0.001 * dt) {
        status = Math.random() < 0.5 ? 'disrupted' : 'blockaded';
        g.addNotification({ type: 'warning', message: `⚠️ Rota ${route.fromName} → ${route.toName} foi interrompida!` });
        return { ...route, status };
      }

      const income = route.profitPerTick;
      totalIncome += income;
      return { ...route, totalEarned: route.totalEarned + income, lastEarningAt: g.gameTime };
    });

    if (totalIncome > 0) {
      g.addCredits(totalIncome);
    }

    set(s => ({ routes, totalEarned: s.totalEarned + totalIncome, lastTickAt: g.gameTime }));
  },
}));

// ============================================================================
// UI COMPONENTS
// ============================================================================
const RouteCard: React.FC<{ route: TradeRoute; isSelected: boolean; onSelect: () => void }> = ({ route, isSelected, onSelect }) => {
  const goodInfo = GOOD_INFO[route.good];
  const statInfo = STATUS_INFO[route.status];

  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 rounded-xl border transition-all"
      style={isSelected
        ? { background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.5)', boxShadow: '0 0 16px rgba(6,182,212,0.1)' }
        : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start gap-2">
        <span className="text-2xl flex-shrink-0">{goodInfo.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-xs text-gray-300 font-medium truncate">
            <span className="truncate">{route.fromName}</span>
            <ArrowRight size={10} className="flex-shrink-0 text-gray-500" />
            <span className="truncate">{route.toName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-bold text-green-400">+{route.profitPerTick.toLocaleString()} cr/tick</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{ color: statInfo.color, background: `${statInfo.color}20` }}>
              {statInfo.icon} {statInfo.label}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

const RouteDetail: React.FC<{ route: TradeRoute }> = ({ route }) => {
  const { removeRoute, upgradeRoute } = useTradeRoutesStore();
  const { credits } = useGameStore();
  const goodInfo = GOOD_INFO[route.good];
  const statInfo = STATUS_INFO[route.status];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-900/5">
        <span className="text-5xl">{goodInfo.icon}</span>
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className="font-bold text-white">{route.fromName}</span>
            <ArrowRight size={14} className="text-gray-500" />
            <span className="font-bold text-white">{route.toName}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-1.5 py-0.5 rounded"
                  style={{ color: statInfo.color, background: `${statInfo.color}20` }}>
              {statInfo.icon} {statInfo.label}
            </span>
            <span className="text-xs text-gray-400 capitalize">{goodInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Lucro/Tick', value: `+${route.profitPerTick.toLocaleString()} cr`, color: '#22c55e' },
          { label: 'Volume', value: `${route.volume} un/tick`, color: '#7dd3fc' },
          { label: 'Distância', value: `${route.distance.toFixed(1)} AL`, color: '#f59e0b' },
          { label: 'Risco', value: `${(route.risk * 100).toFixed(1)}%`, color: route.risk > 0.2 ? '#ef4444' : '#22c55e' },
          { label: 'Total Ganho', value: `${route.totalEarned.toLocaleString()} cr`, color: '#a855f7' },
          { label: 'Carga', value: goodInfo.label, color: goodInfo.color },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-2 rounded-xl" style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs text-gray-500">{label}</div>
            <div className="font-bold text-sm mt-0.5" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Risk bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Risco de Pirataria</span>
          <span className={route.risk > 0.2 ? 'text-red-400' : 'text-green-400'}>{(route.risk * 100).toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${route.risk * 100}%`, background: route.risk > 0.2 ? '#ef4444' : '#22c55e' }} />
        </div>
      </div>

      {/* Upgrades */}
      <div>
        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Melhorias da Rota</h4>
        <div className="space-y-2">
          {route.upgrades.map(upg => (
            <div key={upg.id} className="p-3 rounded-xl border transition-all"
                 style={upg.applied
                   ? { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)' }
                   : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold">{upg.name}</span>
                    {upg.applied && <span className="text-xs text-green-400">✓ Ativa</span>}
                  </div>
                  <div className="text-xs text-gray-400">{upg.desc}</div>
                </div>
                {!upg.applied && (
                  <button
                    onClick={() => upgradeRoute(route.id, upg.id)}
                    disabled={credits < upg.cost}
                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                      credits >= upg.cost
                        ? 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/40'
                        : ''
                    }`}
                    style={credits < upg.cost ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: '#4b5563', cursor: 'not-allowed' } : {}}
                  >
                    {upg.cost.toLocaleString()} cr
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => removeRoute(route.id)}
        className="w-full py-2 rounded-lg border border-red-500/30 text-red-400 text-xs hover:bg-red-900/10 transition-colors"
      >
        Encerrar Rota Comercial
      </button>
    </div>
  );
};

// New Route Form
const NewRouteForm: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { createRoute } = useTradeRoutesStore();
  const { planets } = useGameStore();
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [fromType, setFromType] = useState<'colony' | 'empire'>('colony');
  const [toType, setToType] = useState<'colony' | 'empire'>('empire');
  const [good, setGood] = useState<TradeGood>('food');

  const colonies = planets.filter(p => p.colonies.length > 0).map(p => p.name);

  const submit = () => {
    if (!fromName || !toName) return;
    createRoute(fromName, toName, fromType, toType, good);
    onCancel();
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-cyan-500/20 bg-cyan-900/5">
      <h3 className="font-bold text-cyan-300 text-sm">Nova Rota Comercial</h3>
      <div className="grid grid-cols-2 gap-3">
        {/* From */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Origem</label>
          <select className="w-full p-2 text-xs rounded text-white"
                  style={{ background: 'rgba(10,15,25,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                  value={fromName} onChange={e => setFromName(e.target.value)}>
            <option value="">Selecionar...</option>
            {colonies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {/* To */}
        <div>
          <label className="text-xs text-gray-400 block mb-1">Destino</label>
          <select className="w-full p-2 text-xs rounded text-white"
                  style={{ background: 'rgba(10,15,25,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}
                  value={toName} onChange={e => { setToName(e.target.value); setToType('empire'); }}>
            <option value="">Selecionar...</option>
            {colonies.map(c => <option key={c} value={c}>{c}</option>)}
            {EMPIRE_NAMES.map(n => <option key={n} value={n}>{n} (Império)</option>)}
          </select>
        </div>
      </div>

      {/* Good */}
      <div>
        <label className="text-xs text-gray-400 block mb-1">Produto Comercializado</label>
        <div className="grid grid-cols-4 gap-1.5">
          {(Object.keys(GOOD_INFO) as TradeGood[]).map(g => {
            const info = GOOD_INFO[g];
            return (
              <button
                key={g}
                onClick={() => setGood(g)}
                className="p-2 rounded-lg text-xs text-center border transition-all"
                style={good === g
                  ? { background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.5)', boxShadow: '0 0 12px rgba(6,182,212,0.1)' }
                  : { background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-lg">{info.icon}</div>
                <div className="text-gray-300">{info.label}</div>
                <div className="text-green-400 font-bold">{info.basePrice}cr</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={submit} disabled={!fromName || !toName}
                className="flex-1 py-2 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 text-sm font-bold hover:bg-cyan-600/40 disabled:opacity-50 transition-colors">
          Estabelecer Rota (2.000 cr)
        </button>
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-400 text-sm transition-all hover:text-white"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN PANEL
// ============================================================================
export const TradeRoutesPanel: React.FC = () => {
  const { showPanel, closePanel, routes, selectedRouteId, selectRoute, totalEarned } = useTradeRoutesStore();
  const [showNewRoute, setShowNewRoute] = useState(false);

  if (!showPanel) return null;

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const totalIncome = routes.filter(r => r.status === 'active').reduce((sum, r) => sum + r.profitPerTick, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,10,0.82)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-5xl h-[85vh] flex flex-col rounded-2xl border border-green-500/30 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, rgba(3,12,6,0.99), rgba(2,8,4,0.99))', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(34,197,94,0.05)' }}>

        {/* Holographic Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-green-500/20 shrink-0"
             style={{ background: 'linear-gradient(90deg, rgba(34,197,94,0.08) 0%, rgba(6,182,212,0.05) 60%, transparent 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', boxShadow: '0 0 20px rgba(34,197,94,0.2)' }}>
              <Package size={20} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-wider"
                  style={{ background: 'linear-gradient(90deg, #86efac, #67e8f9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ROTAS COMERCIAIS
              </h2>
              <p className="text-xs text-gray-500 font-mono">// {routes.length} rotas · +{totalIncome.toLocaleString()} cr/tick</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewRoute(v => !v)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{
                background: showNewRoute ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#86efac',
              }}
            >
              <Globe size={14} /> {showNewRoute ? 'Cancelar' : '+ Nova Rota'}
            </button>
            <button onClick={closePanel}
                    className="p-1.5 rounded-xl text-gray-500 hover:text-white transition-all"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Holographic Summary bar */}
        <div className="flex items-center gap-4 px-6 py-3"
             style={{ borderBottom: '1px solid rgba(34,197,94,0.08)', background: 'rgba(0,0,0,0.3)' }}>
          {[
            { icon: <TrendingUp size={13} />, label: 'Renda ativa', value: `+${totalIncome.toLocaleString()} cr/tick`, color: '#22c55e' },
            { icon: <AlertTriangle size={13} />, label: 'Interrompidas', value: `${routes.filter(r => r.status !== 'active').length}`, color: '#f97316' },
            { icon: <Zap size={13} />, label: 'Total histórico', value: `${totalEarned.toLocaleString()} cr`, color: '#a855f7' },
            { icon: <ShoppingCart size={13} />, label: 'Rotas ativas', value: `${routes.filter(r => r.status === 'active').length}/${routes.length}`, color: '#67e8f9' },
          ].map(({ icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                 style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
              <span style={{ color }}>{icon}</span>
              <span className="text-xs text-gray-400">{label}:</span>
              <span className="text-sm font-bold" style={{ color }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Route list */}
          <div className="w-72 overflow-y-auto flex-shrink-0" style={{ borderRight: '1px solid rgba(34,197,94,0.1)' }}>
            <div className="p-3 space-y-2">
              {showNewRoute && <NewRouteForm onCancel={() => setShowNewRoute(false)} />}
              {routes.length === 0 && !showNewRoute ? (
                <div className="text-center py-10 rounded-2xl" style={{ border: '1px solid rgba(34,197,94,0.08)' }}>
                  <Package size={28} className="mx-auto mb-3 text-green-800/60" />
                  <div className="text-[10px] font-mono text-gray-700 mb-2">// NO TRADE ROUTES</div>
                  <p className="text-xs text-gray-500 mb-3">Nenhuma rota ativa.</p>
                  <button onClick={() => setShowNewRoute(true)} className="px-3 py-1.5 text-xs rounded-lg font-bold transition-all"
                          style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}>
                    Criar primeira rota
                  </button>
                </div>
              ) : routes.map(r => (
                <RouteCard key={r.id} route={r} isSelected={selectedRouteId === r.id} onSelect={() => selectRoute(r.id)} />
              ))}
            </div>
          </div>

          {/* Detail */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedRoute ? (
              <RouteDetail route={selectedRoute} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                <Package size={48} className="mb-4 text-gray-600" />
                <p className="text-lg font-bold text-gray-400">Selecione uma Rota</p>
                <p className="text-sm mt-2 max-w-xs">Gerencie as rotas comerciais entre colônias e impérios para gerar renda passiva</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
