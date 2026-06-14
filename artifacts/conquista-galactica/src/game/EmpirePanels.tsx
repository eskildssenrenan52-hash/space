import React, { useState } from 'react';
import {
  Factory, ShoppingCart, Hammer, Swords, Target, Cpu, Languages, GraduationCap,
  X, Power, Trash2, Zap, ChevronRight, Star, Eye, Rocket, Play, Plus, Minus, Coins,
  Building2, ListTodo, LineChart,
} from 'lucide-react';
import { useEmpireUI, type PanelId } from './empireUI';
import { useEmpireStore } from './empireStore';
import { useGameStore } from './gameStore';
import { useI18n, useT } from './i18n';
import {
  MACHINES, MACHINE_BY_ID, RECIPES_BY_MACHINE, MAT_BY_ID, MATERIALS, LOGISTICS,
} from './data/industryData';
import {
  BUILDABLES_BY_CATEGORY, BUILD_CATEGORY_LABELS, type BuildCategory, BUILDABLES,
} from './data/buildablesData';
import {
  CATALOG_BY_CATEGORY, CATEGORY_LABELS, CATALOG_PART_COUNT, type CatCategory,
} from './data/engineeringCatalog';
import { ROBOT_BEHAVIORS } from './robotBehaviors';
import {
  RECON_TOOLS, HEROES, ASSAULT_UNITS, computeUnitPower, computeArmyPower, UNIT_BY_ID,
  RARITY_INFO, ROLE_INFO, DAMAGE_INFO, ARMOR_INFO,
} from './data/warData';
import { BATTLE_LAYERS, LAYER_INFO, type BattleLayer } from './data/warData';
import { Troop3DPreview } from './Troop3DPreview';
import { ColonyPanel, ComponentExchange, TaskCenter } from './ColonyPanels';
import { computeTasks } from './colonyStore';
import { ColonizationPanel } from './ColonizationPanel';

// ============================================================================
// Toolbar (bottom-center)
// ============================================================================
export const EmpireToolbar: React.FC = () => {
  const t = useT();
  const { panel, setPanel } = useEmpireUI();
  const { toggleLang, lang } = useI18n();
  const openTutorial = useEmpireStore(s => s.openTutorial);
  const credits = useGameStore(s => s.credits);

  type BtnDef = { id: PanelId; icon: string; label: string; accent: string };
  const btns: BtnDef[] = [
    { id: 'colonies',      icon: '🏙️', label: t('toolbar.colonies'),   accent: '#10b981' },
    { id: 'colonization',  icon: '🚀', label: 'Colonizar',             accent: '#22d3ee' },
    { id: 'industry',      icon: '🏭', label: t('toolbar.industry'),   accent: '#f59e0b' },
    { id: 'market',        icon: '🛒', label: t('toolbar.market'),     accent: '#4ade80' },
    { id: 'components',    icon: '📈', label: t('toolbar.components'), accent: '#2dd4bf' },
    { id: 'build',         icon: '🔨', label: t('toolbar.build'),      accent: '#60a5fa' },
    { id: 'war',           icon: '⚔️', label: t('toolbar.war'),        accent: '#f43f5e' },
    { id: 'missions',      icon: '🎯', label: t('toolbar.missions'),   accent: '#a78bfa' },
    { id: 'engineering',   icon: '🤖', label: t('toolbar.engineering'),accent: '#34d399' },
  ];

  const taskCount = computeTasks().filter(x => x.priority === 'high').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-center pointer-events-none">
      <div
        className="mb-3 flex items-center gap-1 pointer-events-auto"
        style={{
          background: 'linear-gradient(135deg, rgba(4,4,20,0.98) 0%, rgba(8,8,32,0.97) 100%)',
          border: '1px solid rgba(34,211,238,0.18)',
          borderRadius: '16px',
          padding: '6px 10px',
          boxShadow: '0 -4px 40px rgba(0,0,0,0.6), 0 0 60px rgba(34,211,238,0.05)',
        }}
      >
        {btns.map(b => {
          const active = panel === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setPanel(active ? null : b.id)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
              style={{
                background: active ? `${b.accent}22` : 'transparent',
                color: active ? b.accent : 'rgba(156,163,175,1)',
                border: active ? `1px solid ${b.accent}44` : '1px solid transparent',
                boxShadow: active ? `0 0 12px ${b.accent}22` : 'none',
              }}
            >
              <span className="text-base leading-none">{b.icon}</span>
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          );
        })}

        <div className="w-px h-5 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />

        <button onClick={() => setPanel(panel === 'tasks' ? null : 'tasks')}
          className="relative p-1.5 rounded-xl transition-all"
          style={{ color: panel === 'tasks' ? '#fbbf24' : '#6b7280' }}
          title={t('toolbar.tasks')}
        >
          <ListTodo size={16} />
          {taskCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold animate-pulse">
              {taskCount}
            </span>
          )}
        </button>
        <button onClick={openTutorial}
          className="p-1.5 rounded-xl transition-all text-indigo-400 hover:text-indigo-200"
          title={t('toolbar.tutorial')}
        >
          <GraduationCap size={16} />
        </button>
        <button onClick={toggleLang}
          className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-bold transition-all text-gray-500 hover:text-gray-200"
          title={t('toolbar.lang')}
        >
          <Languages size={13} /> {lang.toUpperCase()}
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// Generic modal shell
// ============================================================================
const Modal: React.FC<{ title: string; subtitle?: string; icon?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, subtitle, icon, onClose, children, wide }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(8px)' }}
    onClick={onClose}
  >
    <div
      className={`w-full ${wide ? 'max-w-6xl' : 'max-w-4xl'} max-h-[88vh] flex flex-col overflow-hidden rounded-2xl`}
      style={{
        background: 'linear-gradient(145deg, rgba(4,4,28,0.99) 0%, rgba(6,6,36,0.98) 100%)',
        border: '1px solid rgba(34,211,238,0.2)',
        boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{
          borderBottom: '1px solid rgba(34,211,238,0.1)',
          background: 'rgba(34,211,238,0.04)',
        }}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-1.5 rounded-xl text-xl shrink-0"
                 style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
              {icon}
            </div>
          )}
          <div>
            {subtitle && <div className="text-[9px] font-mono text-gray-600">{subtitle}</div>}
            <h2 className="text-base font-bold text-cyan-300 tracking-wide">{title}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-gray-500 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <X size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">{children}</div>
    </div>
  </div>
);

const matName = (id: string) => MAT_BY_ID[id]?.namePt || id;
const matIcon = (id: string) => MAT_BY_ID[id]?.icon || '📦';

// ============================================================================
// INDUSTRY PANEL
// ============================================================================
const IndustryPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const { factories, inventory, power, buildFactory, setFactoryRecipe, toggleFactory, removeFactory } = useEmpireStore();
  const [tab, setTab] = useState<'chains' | 'factories' | 'logistics'>('factories');
  const [zoom, setZoom] = useState<string | null>(null);

  return (
    <Modal title={t('industry.title')} subtitle="// PRODUCTION SYSTEMS" icon="🏭" onClose={() => setPanel(null)} wide>
      {/* power bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl"
           style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)' }}>
            <Zap size={13} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-mono">// ENERGIA</div>
            <div className="text-xs font-bold text-emerald-300">⚡ {Math.round(power.generation)} GW gerados</div>
          </div>
        </div>
        <div className={`text-xs font-bold ${power.demand > power.generation ? 'text-red-400' : 'text-gray-400'}`}>
          Demanda: <span className="tabular-nums">{Math.round(power.demand)} GW</span>
          {power.demand > power.generation && <span className="ml-1.5 text-red-300 text-[10px]">⚠ déficit</span>}
        </div>
        <div className="ml-auto flex gap-1.5">
          {(['factories', 'chains', 'logistics'] as const).map(x => (
            <button key={x} onClick={() => setTab(x)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={tab === x
                      ? { background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)', color: '#67e8f9' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
              {x === 'factories' ? t('industry.factories') : x === 'chains' ? t('industry.chains') : t('industry.logistics')}
            </button>
          ))}
        </div>
      </div>

      {tab === 'factories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* build menu */}
          <div>
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.12)' }}>
              <div className="p-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Factory size={11} className="text-amber-400" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400 font-mono">{t('industry.machines')}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
              {MACHINES.map(m => (
                <button key={m.id} onClick={() => buildFactory(m.id, 'Terra')}
                        className="text-left p-2.5 rounded-xl border transition-all hover:scale-[1.02]"
                        style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xl mb-1">{m.icon}</div>
                  <div className="text-xs font-bold text-white leading-tight">{m.namePt}</div>
                  <div className="text-[10px] text-gray-500 leading-tight mt-0.5">{m.descPt}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-yellow-300 text-[10px] font-bold">{m.buildCredits.toLocaleString()} cr</span>
                    <span className={`text-[10px] font-bold ${m.powerDraw < 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                      {m.powerDraw < 0 ? `+${-m.powerDraw}⚡` : `${m.powerDraw}⚡`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* active factories */}
          <div>
            <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
              <div className="p-1 rounded-lg" style={{ background: 'rgba(34,211,238,0.12)', border: '1px solid rgba(34,211,238,0.2)' }}>
                <Cpu size={11} className="text-cyan-400" />
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 font-mono">{t('industry.factories')}</div>
              <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>{factories.length}</span>
            </div>
            {factories.length === 0 && (
              <div className="text-xs text-gray-500 py-8 text-center rounded-xl"
                   style={{ background: 'rgba(10,15,25,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {t('industry.empty')}
              </div>
            )}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {factories.map(f => {
                const machine = MACHINE_BY_ID[f.machineId];
                const recipes = RECIPES_BY_MACHINE[f.machineId] || [];
                const effColor = f.efficiency > 0.9 ? '#22c55e' : f.efficiency > 0.5 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={f.id} className="p-3 rounded-xl border"
                       style={{
                         background: f.active ? 'rgba(15,25,15,0.6)' : 'rgba(15,15,15,0.6)',
                         border: `1px solid ${f.active ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.06)'}`,
                       }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{machine.icon}</span>
                      <span className="text-xs font-bold text-white flex-1 truncate">{machine.namePt}</span>
                      <button onClick={() => setZoom(zoom === f.id ? null : f.id)}
                              className="p-1 rounded-lg transition-all"
                              style={{ color: '#67e8f9', background: 'rgba(34,211,238,0.08)' }}
                              title={t('industry.zoom')}>
                        <Eye size={12} />
                      </button>
                      <button onClick={() => toggleFactory(f.id)}
                              className="p-1 rounded-lg transition-all"
                              style={{ color: f.active ? '#22c55e' : '#4b5563', background: f.active ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)' }}>
                        <Power size={12} />
                      </button>
                      <button onClick={() => removeFactory(f.id)}
                              className="p-1 rounded-lg transition-all"
                              style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <select value={f.recipeId || ''} onChange={(e) => setFactoryRecipe(f.id, e.target.value)}
                            className="w-full mb-2 text-xs text-gray-200 rounded-lg px-2 py-1.5 border"
                            style={{ background: 'rgba(0,0,0,0.5)', borderColor: 'rgba(255,255,255,0.1)' }}>
                      <option value="">— escolher receita —</option>
                      {recipes.map(r => <option key={r.id} value={r.id}>{r.namePt}</option>)}
                    </select>
                    {f.recipeId && (
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-gray-500">Ciclos: {f.cyclesDone}</span>
                          <span className="font-bold" style={{ color: effColor }}>
                            {t('industry.efficiency')}: {Math.round(f.efficiency * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${f.progress * 100}%`, background: 'linear-gradient(90deg, #22d3ee, #6366f1)' }} />
                        </div>
                      </div>
                    )}
                    {zoom === f.id && (
                      <div className="mt-2 p-2 rounded-lg text-[10px] animate-pulse"
                           style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.15)', color: '#a5f3fc' }}>
                        🔧 {machine.namePt} operando… robôs transportando, recursos sendo processados.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === 'chains' && (
        <div>
          <p className="text-xs text-gray-500 mb-3 font-mono">// Cada item possui peso, volume, qualidade e pureza — de minério bruto a megaestruturas.</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MATERIALS.map(m => {
              const stock = Math.floor(inventory[m.id] || 0);
              const tierColor = m.tier === 1 ? '#6b7280' : m.tier === 2 ? '#22d3ee' : m.tier === 3 ? '#a78bfa' : '#f59e0b';
              return (
                <div key={m.id} className="p-2.5 rounded-xl border"
                     style={{ background: 'rgba(10,15,25,0.7)', border: `1px solid ${tierColor}18` }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-base">{m.icon}</span>
                    <span className="text-xs font-bold text-white flex-1 truncate">{m.namePt}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30` }}>
                      T{m.tier}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-2 mt-1 text-[10px] text-gray-500">
                    <span>{t('industry.weight')}: <span className="text-gray-400">{m.weight}kg</span></span>
                    <span>{t('industry.volume')}: <span className="text-gray-400">{m.volume}m³</span></span>
                    <span>{t('industry.quality')}: <span className="text-gray-400">{Math.round(m.baseQuality * 100)}%</span></span>
                    <span>{t('industry.purity')}: <span className="text-gray-400">{Math.round(m.basePurity * 100)}%</span></span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-gray-600">Estoque</span>
                    <span className={`text-[10px] font-bold ${stock > 0 ? 'text-amber-300' : 'text-gray-600'}`}>
                      {stock > 0 ? stock.toLocaleString() : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab === 'logistics' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {LOGISTICS.map(l => (
            <div key={l.id} className="p-3 rounded-xl border transition-all hover:scale-[1.01]"
                 style={{
                   background: 'linear-gradient(135deg, rgba(10,20,35,0.85), rgba(6,12,25,0.9))',
                   border: '1px solid rgba(34,211,238,0.15)',
                   boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(34,211,238,0.06)',
                 }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg text-base" style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
                  {l.icon}
                </div>
                <span className="text-xs font-bold text-white leading-tight">{l.namePt}</span>
              </div>
              <div className="text-[10px] text-gray-500 leading-relaxed mb-2">{l.descPt}</div>
              <div className="flex items-center justify-between pt-1.5 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[10px] text-cyan-300 font-bold font-mono">{l.throughput} un/s · {l.range}</span>
                <span className="text-[10px] text-yellow-300 font-bold">⊕ {l.costCredits.toLocaleString()} cr</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// MARKET PANEL
// ============================================================================
const MarketPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const { npcListings, buyListing, inventory, sellMaterial, refreshMarket } = useEmpireStore();
  const robots = useGameStore(s => s.robots);
  const listRobotOnMarket = useGameStore(s => s.listRobotOnMarket);
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [sellQty, setSellQty] = useState<Record<string, number>>({});

  return (
    <Modal title={t('market.title')} subtitle="// TRADE & COMMERCE" icon="🛒" onClose={() => setPanel(null)} wide>
      <div className="flex gap-1.5 mb-4 items-center">
        {(['buy', 'sell'] as const).map(x => (
          <button key={x} onClick={() => setTab(x)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={tab === x
                    ? { background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.5)', color: '#67e8f9' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
            {x === 'buy' ? t('market.buy_tab') : t('market.sell_tab')}
          </button>
        ))}
        <button onClick={refreshMarket}
                className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af' }}>
          ↻ Atualizar
        </button>
      </div>

      {tab === 'buy' && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
          {npcListings.map(l => {
            const kindColor = l.kind === 'robot' ? '#67e8f9' : l.kind === 'resource' ? '#86efac' : '#c084fc';
            const kindIcon = l.kind === 'robot' ? '🤖' : l.kind === 'resource' ? '📦' : '📐';
            return (
              <div key={l.id} className="p-3 rounded-xl border transition-all hover:scale-[1.01]"
                   style={{ background: 'rgba(15,20,30,0.8)', border: `1px solid ${kindColor}25`, boxShadow: `inset 0 1px 0 ${kindColor}10` }}>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                        style={{ background: `${kindColor}15`, color: kindColor, border: `1px solid ${kindColor}30` }}>
                    {kindIcon} {l.kind === 'robot' ? t('market.robots') : l.kind === 'resource' ? t('market.resources') : t('market.blueprints')}
                  </span>
                </div>
                <div className="text-sm font-bold text-white">{l.name}</div>
                {l.stats && <div className="text-[10px] text-gray-400 mt-1 leading-tight">{l.stats}</div>}
                <div className="text-[10px] text-gray-500 mt-0.5 italic">{t('market.seller')}: {l.seller}</div>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-yellow-300 text-sm font-bold">⊕ {l.price.toLocaleString()}</span>
                    <span className="text-gray-500 text-[10px] ml-1">cr{l.qty > 1 ? ` · ${l.qty}x` : ''}</span>
                  </div>
                  <button onClick={() => buyListing(l.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}>
                    {t('common.buy')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'sell' && (
        <div className="space-y-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-gray-600 mb-2 font-bold font-mono">// {t('market.resources')}</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {MATERIALS.filter(m => (inventory[m.id] || 0) > 0).map(m => (
                <div key={m.id} className="p-3 rounded-xl border transition-all hover:scale-[1.01]"
                     style={{ background: 'rgba(10,15,25,0.8)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="text-xs font-bold text-white mb-0.5">{m.icon} {m.namePt}</div>
                  <div className="text-[10px] text-gray-500 mb-2">Estoque: <span className="text-amber-300 font-bold">{Math.floor(inventory[m.id] || 0)}</span></div>
                  <div className="flex items-center gap-1">
                    <input type="number" min={1} max={Math.floor(inventory[m.id] || 0)} value={sellQty[m.id] || 1}
                      onChange={(e) => setSellQty(s => ({ ...s, [m.id]: Math.max(1, +e.target.value) }))}
                      className="w-16 rounded-lg px-2 py-1 text-xs text-white border"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }} />
                    <button onClick={() => sellMaterial(m.id, Math.min(sellQty[m.id] || 1, Math.floor(inventory[m.id] || 0)))}
                            className="flex-1 py-1 rounded-lg text-xs font-bold transition-all"
                            style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#fcd34d' }}>
                      {t('common.sell')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 font-mono">// {t('market.robots')} ({robots.length})</div>
            {robots.length === 0 && <p className="text-xs text-gray-500">Projete robôs na Engenharia para vendê-los aqui.</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {robots.map(r => (
                <div key={r.id} className="p-3 rounded-xl border transition-all hover:scale-[1.01]"
                     style={{ background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.15)' }}>
                  <div className="text-xs font-bold text-white mb-0.5">🤖 {r.name}</div>
                  <div className="text-[10px] text-gray-500 mb-2">{r.chassis} · {r.program.length} comportamentos</div>
                  {r.forSale
                    ? <div className="text-[10px] text-emerald-400 font-bold px-2 py-1 rounded-lg text-center"
                           style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                        ✓ À venda · {r.price} cr
                      </div>
                    : <button onClick={() => listRobotOnMarket(r.id, 1000 + r.program.length * 100 + r.armor * 20)}
                              className="w-full py-1.5 rounded-lg text-xs font-bold transition-all"
                              style={{ background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.4)', color: '#86efac' }}>
                        {t('market.list')}
                      </button>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// BUILD PANEL (planetary construction)
// ============================================================================
const BuildPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const { queueBuild, buildQueue, builtUnits, inventory } = useEmpireStore();
  const [cat, setCat] = useState<BuildCategory>('satellite');
  const cats = Object.keys(BUILD_CATEGORY_LABELS) as BuildCategory[];

  return (
    <Modal title={t('build.title')} subtitle="// CONSTRUCTION YARD" icon="🔨" onClose={() => setPanel(null)} wide>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={cat === c
                    ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', color: '#93c5fd' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
            {BUILD_CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {buildQueue.length > 0 && (
        <div className="mb-4 p-3 rounded-xl border"
             style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)' }}>
          <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2 font-mono">// CONSTRUCTION QUEUE</div>
          {buildQueue.map(j => {
            const b = BUILDABLES.find(x => x.id === j.buildableId);
            return (
              <div key={j.id} className="flex items-center gap-2 text-[10px] text-gray-400 mb-2 last:mb-0">
                <span className="w-40 truncate text-white font-bold">{b?.icon} {b?.name}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(59,130,246,0.1)' }}>
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all"
                       style={{ width: `${j.progress * 100}%` }} />
                </div>
                <span className="text-blue-300 font-bold tabular-nums">{Math.round(j.progress * 100)}%</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
        {BUILDABLES_BY_CATEGORY[cat].map(b => {
          const owned = builtUnits[b.id] || 0;
          const hasMats = b.materials.every(m => (inventory[m.mat] || 0) >= m.qty);
          return (
            <div key={b.id} className="p-3 rounded-xl border transition-all"
                 style={{
                   background: owned > 0 ? 'rgba(59,130,246,0.06)' : 'rgba(15,20,30,0.7)',
                   border: `1px solid ${owned > 0 ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.07)'}`,
                 }}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{b.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white truncate">{b.name}</div>
                  {owned > 0 && (
                    <div className="text-[10px] font-bold" style={{ color: '#60a5fa' }}>✓ Possui: {owned}</div>
                  )}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 leading-relaxed mb-2">{b.desc}</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {b.materials.map(m => {
                  const has = (inventory[m.mat] || 0) >= m.qty;
                  return (
                    <span key={m.mat} className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: has ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: has ? '#86efac' : '#fca5a5', border: `1px solid ${has ? '#22c55e' : '#ef4444'}25` }}>
                      {matIcon(m.mat)}{m.qty}
                    </span>
                  );
                })}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-300 text-xs font-bold">⊕ {b.credits.toLocaleString()} cr</span>
                <button disabled={!hasMats} onClick={() => queueBuild(b.id, 'Terra')}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={hasMats
                          ? { background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.5)', color: '#93c5fd' }
                          : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#374151', cursor: 'not-allowed' }}>
                  {t('common.build')}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

// ============================================================================
// ENGINEERING CATALOG PANEL (1000+ components)
// ============================================================================
const EngineeringCatalogPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const [cat, setCat] = useState<CatCategory>('chassis');
  const [q, setQ] = useState('');
  const cats = Object.keys(CATEGORY_LABELS) as CatCategory[];
  const totalOptions = CATALOG_PART_COUNT + ROBOT_BEHAVIORS.length;

  const items = cat === 'behavior'
    ? ROBOT_BEHAVIORS.filter(b => b.label.toLowerCase().includes(q.toLowerCase())).map(b => ({
        id: b.id, name: b.label, category: 'behavior' as CatCategory, tier: 1, cost: 0,
        stats: { power: b.energyCost } as Record<string, number>, desc: `Categoria: ${b.category}`,
      }))
    : (CATALOG_BY_CATEGORY[cat] || []).filter(i => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Modal title={`${t('eng.catalog')} — ${totalOptions}+ opções`} subtitle="// ENGINEERING CATALOG" icon="🧠" onClose={() => setPanel(null)} wide>
      <div className="mb-3 p-3 rounded-xl text-xs font-mono"
           style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)', color: '#94a3b8' }}>
        // Combine chassis · locomoção · energia · sensores · armas · defesa · manipuladores · IA · blindagem + {ROBOT_BEHAVIORS.length} comportamentos
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                  style={cat === c
                    ? { background: 'rgba(34,211,238,0.2)', border: '1px solid rgba(34,211,238,0.5)', color: '#67e8f9' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')}
        className="w-full mb-3 rounded-xl px-3 py-1.5 text-xs text-gray-200 font-mono outline-none"
        style={{ background: 'rgba(10,15,30,0.7)', border: '1px solid rgba(34,211,238,0.18)', color: '#e2e8f0' }} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[55vh] overflow-y-auto pr-1">
        {items.slice(0, 300).map(i => (
          <div key={i.id} className="p-2.5 rounded-xl border transition-all hover:scale-[1.01]"
               style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xs font-bold text-white leading-tight mb-0.5">{i.name}</div>
            <div className="text-[10px] text-gray-500 mb-1 leading-tight">{i.desc}</div>
            <div className="flex flex-wrap gap-1">
              {Object.entries(i.stats).map(([k, v]) => (
                <span key={k} className="text-[9px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: 'rgba(34,211,238,0.1)', color: '#67e8f9', border: '1px solid rgba(34,211,238,0.2)' }}>
                  {k}: {v}
                </span>
              ))}
            </div>
            {i.cost > 0 && (
              <div className="text-[10px] text-yellow-300 font-bold mt-1.5 flex items-center justify-between">
                <span>⊕ {i.cost.toLocaleString()} cr</span>
                <span className="text-gray-600">T{i.tier}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-600 mt-2 font-mono">// {Math.min(300, items.length)} de {items.length} componentes nesta categoria</p>
    </Modal>
  );
};

// ============================================================================
// MISSIONS PANEL
// ============================================================================
const MissionsPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const { missions, claimMission } = useEmpireStore();
  const active = missions.filter(m => !m.claimed);
  const done = missions.filter(m => m.claimed);

  return (
    <Modal title={t('missions.title')} subtitle="// ACTIVE OPERATIONS" icon="🎯" onClose={() => setPanel(null)}>
      <div className="flex items-center gap-2 mb-3 p-2.5 rounded-xl" style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}>
        <div className="p-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.12)' }}>
          <Target size={13} className="text-purple-400" />
        </div>
        <div>
          <div className="text-[9px] font-mono text-gray-600">// MISSION LOG</div>
          <div className="text-xs font-bold text-purple-300">{t('missions.active')} ({active.length})</div>
        </div>
      </div>
      <div className="space-y-2.5">
        {active.map(m => {
          const allDone = m.objectives.every(o => o.done);
          const doneCount = m.objectives.filter(o => o.done).length;
          const pct = m.objectives.length > 0 ? doneCount / m.objectives.length : 0;
          return (
            <div key={m.id} className="p-4 rounded-xl border transition-all"
                 style={{
                   background: allDone ? 'rgba(34,197,94,0.08)' : 'rgba(168,85,247,0.05)',
                   border: `1px solid ${allDone ? 'rgba(34,197,94,0.4)' : 'rgba(168,85,247,0.3)'}`,
                 }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="font-bold text-white text-sm leading-tight">{m.title}</div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-yellow-300 text-xs font-bold">⊕ +{m.rewardCredits.toLocaleString()}</div>
                  <div className="text-gray-500 text-[10px]">créditos</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-2 leading-relaxed">{m.desc}</p>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="text-gray-500">{doneCount}/{m.objectives.length} objetivos</span>
                  <span style={{ color: allDone ? '#22c55e' : '#a78bfa' }}>{Math.round(pct * 100)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all"
                       style={{ width: `${pct * 100}%`, background: allDone ? '#22c55e' : 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                </div>
              </div>

              <div className="space-y-1 mb-3">
                {m.objectives.map((o, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs ${o.done ? 'text-green-400' : 'text-gray-400'}`}>
                    <span className="flex-shrink-0">{o.done ? '✅' : '⬜'}</span>
                    <span className={o.done ? 'line-through opacity-60' : ''}>{o.label}</span>
                  </div>
                ))}
              </div>
              <button disabled={!allDone} onClick={() => claimMission(m.id)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all w-full"
                      style={allDone
                        ? { background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#4b5563', cursor: 'not-allowed' }
                      }>
                {allDone ? '🎁 Resgatar Recompensa' : t('missions.claim')}
              </button>
            </div>
          );
        })}
      </div>
      {done.length > 0 && (
        <>
          <div className="text-[10px] font-bold uppercase tracking-widest mt-6 mb-2 text-gray-700 font-mono flex items-center gap-2">
            // ✅ {t('missions.done')} ({done.length})
          </div>
          <div className="space-y-1">
            {done.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600 py-1.5 px-2 rounded-lg"
                   style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span className="text-emerald-700">✓</span>
                <span className="line-through flex-1">{m.title}</span>
                <span className="text-amber-800 font-mono text-[10px]">+{m.rewardCredits} cr</span>
              </div>
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

// ============================================================================
// WAR PANEL
// ============================================================================
const WarPanel: React.FC = () => {
  const t = useT();
  const { setPanel } = useEmpireUI();
  const s = useEmpireStore();
  const [tab, setTab] = useState<'targets' | 'barracks' | 'plan' | 'replays' | 'alliance'>('targets');
  const target = s.targets.find(x => x.id === s.selectedTargetId);

  const TAB_LABELS: Record<typeof tab, string> = {
    targets: t('war.targets'),
    barracks: '🏛️ Quartel',
    plan: t('war.plan'),
    replays: t('war.replays'),
    alliance: t('war.alliance'),
  };

  return (
    <Modal title={t('war.title')} subtitle="// TACTICAL COMMAND" icon="⚔️" onClose={() => setPanel(null)} wide>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {(['targets', 'barracks', 'plan', 'replays', 'alliance'] as const).map(x => (
          <button key={x} onClick={() => setTab(x)} disabled={x === 'plan' && !target}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
            style={tab === x
              ? { background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }
            }>
            {TAB_LABELS[x]}
          </button>
        ))}
      </div>

      {tab === 'barracks' && <BarracksTab />}


      {tab === 'targets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {s.targets.map(tg => {
            const isSelected = s.selectedTargetId === tg.id;
            const diffColor = tg.difficulty >= 8 ? '#ef4444' : tg.difficulty >= 5 ? '#f97316' : '#22c55e';
            return (
              <div key={tg.id} className="rounded-xl border overflow-hidden transition-all"
                   style={{
                     background: isSelected ? 'rgba(239,68,68,0.08)' : 'rgba(15,5,5,0.7)',
                     border: `1px solid ${isSelected ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.07)'}`,
                     boxShadow: isSelected ? '0 0 30px rgba(239,68,68,0.15)' : 'none',
                   }}>
                {/* Target header strip */}
                <div className="px-4 py-2.5 flex items-center justify-between"
                     style={{ background: isSelected ? 'rgba(239,68,68,0.1)' : 'rgba(0,0,0,0.3)' }}>
                  <div className="font-bold text-white text-sm">{tg.name}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3].map(i => (
                        <Star key={i} size={13} className={i <= tg.starsEarned ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 space-y-2.5">
                  {/* Stats row */}
                  <div className="flex gap-2">
                    {[
                      { label: 'Dificuldade', value: `${tg.difficulty}/10`, color: diffColor },
                      { label: 'Intel', value: `${tg.intel}%`, color: '#67e8f9' },
                      { label: 'Saque', value: `${tg.loot}cr`, color: '#fde68a' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex-1 text-center rounded-lg py-1.5"
                           style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                        <div className="text-[10px] text-gray-500">{label}</div>
                        <div className="text-xs font-bold" style={{ color }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Recon tools */}
                  <div>
                    <div className="text-[10px] text-gray-600 uppercase tracking-wider mb-1">{t('war.recon')}:</div>
                    <div className="flex flex-wrap gap-1">
                      {RECON_TOOLS.map(rt => (
                        <button key={rt.id} onClick={() => { s.selectTarget(tg.id); s.runRecon(rt.id); }}
                                title={`${rt.desc} (${rt.cost} cr)`}
                                className="text-[10px] px-2 py-1 rounded-lg transition-all"
                                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc' }}>
                          {rt.icon} {rt.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Intel map */}
                  {tg.intel > 0 && (
                    <div className="relative h-28 rounded-lg overflow-hidden"
                         style={{ background: 'rgba(0,5,15,0.8)', border: '1px solid rgba(34,211,238,0.15)' }}>
                      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(34,211,238,0.04), transparent 70%)' }} />
                      {tg.layout.map(d => {
                        const revealed = (d.id.charCodeAt(d.id.length - 1) % 100) < tg.intel;
                        return (
                          <div key={d.id} title={revealed ? `${d.name} — ${d.effect}` : 'Desconhecido'}
                               className={`absolute -translate-x-1/2 -translate-y-1/2 text-xs ${d.destroyed ? 'opacity-20 grayscale' : ''}`}
                               style={{ left: `${d.x}%`, top: `${d.y}%` }}>
                            {revealed ? d.icon : '❓'}
                          </div>
                        );
                      })}
                      <div className="absolute bottom-1 right-2 text-[9px] text-cyan-500 font-mono">{tg.intel}% revelado</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={() => { s.selectTarget(tg.id); setTab('plan'); }}
                            className="flex-1 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.45)', color: '#fca5a5' }}>
                      ⚔️ {t('war.plan')} <ChevronRight size={11} />
                    </button>
                    <button onClick={() => s.startBlockade(tg.name)} title="Bloqueio econômico (1500 cr)"
                            className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
                            style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#fcd34d' }}>
                      {t('war.blockade')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'plan' && target && <WarPlan target={target} />}

      {tab === 'replays' && (
        <div className="space-y-2">
          {s.replays.length === 0 && (
            <div className="text-center py-14 rounded-2xl"
                 style={{ background: 'rgba(10,5,5,0.4)', border: '1px solid rgba(239,68,68,0.08)' }}>
              <div className="text-4xl mb-3 opacity-40">📺</div>
              <div className="text-[10px] font-mono text-gray-700 mb-2">// NO BATTLE RECORDS</div>
              <p className="text-sm font-bold text-gray-500">Nenhum replay ainda</p>
              <p className="text-xs text-gray-600 mt-1">Lance uma invasão para registrar batalhas.</p>
            </div>
          )}
          {s.replays.map(r => (
            <button key={r.id} onClick={() => useEmpireStore.setState({ currentReplay: r })}
                    className="w-full text-left p-3.5 rounded-xl border transition-all hover:scale-[1.01]"
                    style={{ background: 'rgba(10,8,25,0.7)', border: '1px solid rgba(239,68,68,0.15)', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold text-white">{r.targetName}</span>
                <div className="flex gap-0.5">{[1, 2, 3].map(i => <Star key={i} size={13} className={i <= r.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />)}</div>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-gray-400">{r.outcome}</span>
                <span className="text-yellow-300 font-bold">⊕ {r.lootGained.toLocaleString()} cr</span>
                <span className="text-gray-600">{r.frames.length} eventos</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {tab === 'alliance' && (
        <div className="space-y-3">
          <div className="p-3 rounded-xl text-xs font-mono"
               style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#6b7280' }}>
            // Coordene invasões em larga escala contra sistemas estelares. Logística e produção tornam-se tão vitais quanto as batalhas.
          </div>
          <button onClick={s.toggleAllianceWar}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={s.allianceWarActive
                    ? { background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.5)', color: '#86efac', boxShadow: '0 0 24px rgba(34,197,94,0.15)' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#9ca3af' }}>
            {s.allianceWarActive ? '🟢 Guerra de Alianças ATIVA' : '⚔ Iniciar Guerra de Alianças'}
          </button>
          {s.allianceWarActive && (
            <div className="p-4 rounded-xl border"
                 style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <div className="text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wider">Frente Coordenada</div>
              {[
                { icon: '👥', text: '142 jogadores aliados mobilizados' },
                { icon: '🌐', text: '6 sistemas estelares sob cerco' },
                { icon: '🚀', text: 'Reforços e cargueiros em trânsito' },
              ].map(({ icon, text }) => (
                <div key={text} className="text-xs text-gray-400 flex items-center gap-2 py-0.5">
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          )}
          {s.blockades.length > 0 && (
            <div>
              <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mt-2 mb-2 font-mono">// ACTIVE BLOCKADES</div>
              <div className="space-y-1">
                {s.blockades.map(b => (
                  <div key={b.id} className="text-xs text-amber-300 flex items-center gap-2 p-2 rounded-lg"
                       style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                    🚫 <span className="font-bold">{b.targetName}</span>
                    <span className="text-gray-500 ml-auto">{b.turnsLeft} turnos restantes</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

// ============================================================================
// BARRACKS TAB — recruit, view stockpile, 3D previews, power comparison
// ============================================================================
const RARITY_GRADIENT: Record<string, string> = {
  common:    'from-slate-700/40 to-slate-900/80',
  rare:      'from-sky-600/40 to-slate-900/80',
  epic:      'from-fuchsia-600/40 to-slate-900/80',
  legendary: 'from-amber-500/50 to-orange-900/80',
  mythic:    'from-violet-600/60 to-violet-950/80',
};

const BarracksTab: React.FC = () => {
  const s = useEmpireStore();
  const credits = useGameStore(s2 => s2.credits);
  const [filter, setFilter] = useState<'all' | BattleLayer>('all');
  const [selected, setSelected] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const units = ASSAULT_UNITS.filter(u => filter === 'all' || u.layer === filter);
  const selectedUnit = selected ? UNIT_BY_ID[selected] : units[0];

  const totalArmyPower = Object.entries(s.barracks.troops).reduce(
    (sum, [uid, c]) => sum + (UNIT_BY_ID[uid] ? computeUnitPower(UNIT_BY_ID[uid]) * c : 0), 0,
  );
  const totalUnits = Object.values(s.barracks.troops).reduce((a, b) => a + b, 0);
  const upgradeCost = 2500 * s.barracks.level;

  return (
    <div className="space-y-4">
      {/* Barracks summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <SummaryStat label="Nível Quartel" value={`Nv ${s.barracks.level}/5`} accent="text-cyan-300" />
        <SummaryStat label="Poder Militar" value={totalArmyPower.toLocaleString()} accent="text-amber-300" />
        <SummaryStat label="Tropas Estocadas" value={totalUnits.toString()} accent="text-emerald-300" />
        <button onClick={s.upgradeBarracks} disabled={s.barracks.level >= 5}
          className="rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 px-3 py-2 text-xs font-bold text-white">
          ⬆ Upgrade ({upgradeCost.toLocaleString()}cr)
        </button>
      </div>

      {/* Training queue */}
      {s.barracks.queue.length > 0 && (
        <div className="rounded-xl p-3 border"
             style={{ background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.2)' }}>
          <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-2">⏳ Em treinamento</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {s.barracks.queue.map(j => {
              const u = UNIT_BY_ID[j.unitId];
              if (!u) return null;
              return (
                <div key={j.id} className="flex items-center gap-2 text-xs rounded-xl px-2.5 py-2 border"
                     style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(6,182,212,0.12)' }}>
                  <span className="text-sm">{u.icon}</span>
                  <span className="flex-1 text-gray-200 font-bold truncate">{j.remaining}× {u.name}</span>
                  <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(6,182,212,0.1)' }}>
                    <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all"
                         style={{ width: `${j.progress * 100}%` }} />
                  </div>
                  <button onClick={() => s.cancelTraining(j.id)}
                          className="text-[10px] text-red-400 hover:text-red-300 transition-colors">✕</button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Filter + roster (2 cols) */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex gap-1.5 flex-wrap">
            <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>Todas</FilterBtn>
            {BATTLE_LAYERS.map(l => (
              <FilterBtn key={l} active={filter === l} onClick={() => setFilter(l)}>
                {LAYER_INFO[l].icon} {LAYER_INFO[l].name}
              </FilterBtn>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[480px] overflow-y-auto pr-1">
            {units.map(u => {
              const power = computeUnitPower(u);
              const owned = s.barracks.troops[u.id] || 0;
              const isSelected = selectedUnit?.id === u.id;
              const rarity = RARITY_INFO[u.rarity];
              return (
                <button key={u.id} onClick={() => setSelected(u.id)}
                  className={`text-left rounded-xl border bg-gradient-to-br ${RARITY_GRADIENT[u.rarity]} p-0 overflow-hidden transition
                    ${isSelected ? `border-cyan-400 ring-2 ${rarity.ring} shadow-lg ${rarity.glow}` : 'border-transparent hover:border-white/20'}`}>
                  <div className="h-28 relative">
                    <Troop3DPreview unit={u} compact />
                    <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide ${rarity.color}`}
                         style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}>
                      T{u.tier} · {rarity.label}
                    </div>
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/90 text-amber-950">
                      ⚡{power}
                    </div>
                    {owned > 0 && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/90 text-emerald-950">
                        ×{owned}
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <div className="text-[12px] font-bold text-white truncate">{u.icon} {u.name}</div>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                      <span>{ROLE_INFO[u.role].icon} {ROLE_INFO[u.role].label}</span>
                      <span className="text-gray-600">·</span>
                      <span>{LAYER_INFO[u.layer].icon}</span>
                      <span className="ml-auto text-amber-300 font-semibold">{u.cost}cr</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detail panel + recruit */}
        <div className="rounded-xl p-3 border"
             style={{ background: 'rgba(6,6,24,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {selectedUnit ? (
            <>
              <div className="h-44 rounded-xl overflow-hidden mb-3 border"
                   style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Troop3DPreview unit={selectedUnit} interactive />
              </div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${RARITY_INFO[selectedUnit.rarity].color}`}>
                    {RARITY_INFO[selectedUnit.rarity].label} · T{selectedUnit.tier} · {ROLE_INFO[selectedUnit.role].label}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5">{selectedUnit.icon} {selectedUnit.name}</div>
                </div>
                <div className="text-right p-2 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <div className="text-[10px] text-gray-500">Poder</div>
                  <div className="text-lg font-black text-amber-300">⚡{computeUnitPower(selectedUnit)}</div>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug mb-3">{selectedUnit.desc}</p>

              {/* stat bars */}
              <div className="space-y-1 mb-3">
                <StatBar label="Ataque" value={selectedUnit.attack} max={400} color="bg-red-500" />
                <StatBar label="HP" value={selectedUnit.hp} max={2500} color="bg-emerald-500" />
                <StatBar label="Velocidade" value={selectedUnit.speed} max={20} color="bg-sky-500" />
                <StatBar label="Alcance" value={selectedUnit.range} max={12} color="bg-violet-500" />
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3 text-[10px]">
                <Pill label="Dano" value={DAMAGE_INFO[selectedUnit.damageType].label} color={DAMAGE_INFO[selectedUnit.damageType].color} />
                <Pill label="Armadura" value={ARMOR_INFO[selectedUnit.armor].label} color={ARMOR_INFO[selectedUnit.armor].color} />
              </div>

              {selectedUnit.abilities.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5">Habilidades</div>
                  {selectedUnit.abilities.map(a => (
                    <div key={a.id} className="text-[10px] text-gray-300 rounded-lg px-2 py-1.5 mb-1 border"
                         style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.12)' }}>
                      <span className="font-bold text-cyan-300">{a.name}:</span> {a.desc}
                    </div>
                  ))}
                </div>
              )}

              {/* recruit controls */}
              <div className="border-t pt-3 mt-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-1 mb-2">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Minus size={11} />
                  </button>
                  <input type="number" value={qty} min={1} onChange={(e) => setQty(Math.max(1, +e.target.value || 1))}
                         className="flex-1 rounded-lg px-2 py-1 text-sm text-center text-white border"
                         style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                  <button onClick={() => setQty(qty + 1)}
                          className="p-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <Plus size={11} />
                  </button>
                  {[5, 10, 25].map(n => (
                    <button key={n} onClick={() => setQty(n)}
                            className="px-1.5 py-1 text-[10px] rounded-lg font-bold transition-all"
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex items-center justify-between text-[11px] mb-2 font-mono">
                  <span className="text-gray-500">⊕ <span className="text-amber-300 font-bold">{(selectedUnit.cost * qty).toLocaleString()}cr</span></span>
                  <span className="text-gray-500">⏱ <span className="text-cyan-300 font-bold">{Math.ceil((selectedUnit.trainTime * qty) / (1 + (s.barracks.level - 1) * 0.4))}s</span></span>
                </div>
                <button onClick={() => s.trainTroop(selectedUnit.id, qty)}
                        disabled={credits < selectedUnit.cost * qty}
                        className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                        style={credits >= selectedUnit.cost * qty
                          ? { background: 'linear-gradient(135deg, rgba(34,197,94,0.7), rgba(6,182,212,0.7))', border: '1px solid rgba(34,197,94,0.4)', color: '#fff', boxShadow: '0 4px 20px rgba(34,197,94,0.15)' }
                          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#374151', cursor: 'not-allowed' }}>
                  <Plus size={13} /> Treinar {qty}x
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-10 rounded-xl"
                 style={{ background: 'rgba(10,15,25,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="text-4xl mb-2 opacity-30">🪖</div>
              <div className="text-[10px] font-mono text-gray-700 mb-1">// NO UNIT SELECTED</div>
              <div className="text-xs text-gray-600">Selecione uma unidade.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SummaryStat: React.FC<{ label: string; value: string; accent: string }> = ({ label, value, accent }) => (
  <div className="rounded-xl px-3 py-2.5"
       style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
    <div className="text-[9px] font-mono text-gray-600 uppercase tracking-wider mb-0.5">{label}</div>
    <div className={`text-sm font-bold tabular-nums ${accent}`}>{value}</div>
  </div>
);

const FilterBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button onClick={onClick}
          className="px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all"
          style={active
            ? { background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)', color: '#67e8f9' }
            : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
    {children}
  </button>
);

const StatBar: React.FC<{ label: string; value: number; max: number; color: string }> = ({ label, value, max, color }) => (
  <div>
    <div className="flex justify-between text-[10px] text-gray-400 mb-0.5">
      <span>{label}</span>
      <span className="tabular-nums font-semibold text-gray-200">{value.toLocaleString()}</span>
    </div>
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  </div>
);

const Pill: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className="flex items-center gap-1.5 rounded px-1.5 py-1" style={{ background: 'rgba(10,15,25,0.7)' }}>
    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
    <span className="text-gray-500">{label}:</span>
    <span className="text-gray-200 font-semibold">{value}</span>
  </div>
);

// ============================================================================
// WAR PLAN — uses barracks stockpile, shows power score per wave
// ============================================================================
const WarPlan: React.FC<{ target: ReturnType<typeof useEmpireStore.getState>['targets'][0] }> = ({ target }) => {
  const t = useT();
  const s = useEmpireStore();
  const plan = s.plan;
  const entryPoints: AttackEntry[] = ['orbital', 'north', 'south', 'east', 'west'];

  const totalArmyPower = computeArmyPower(plan.waves.flatMap(w => w.units));
  const enemyPower = target.layout.filter(d => !d.destroyed).reduce((sum, d) => sum + d.maxHp * 0.6, 0);
  const ratio = enemyPower > 0 ? totalArmyPower / enemyPower : 999;
  const verdict =
    ratio >= 1.8 ? { label: 'Vitória provável', color: 'text-emerald-300', bg: 'from-emerald-600 to-emerald-700' }
    : ratio >= 1.0 ? { label: 'Batalha equilibrada', color: 'text-amber-300', bg: 'from-amber-600 to-orange-700' }
    : { label: 'Risco alto', color: 'text-red-300', bg: 'from-red-700 to-red-900' };

  return (
    <div className="space-y-3">
      {/* Power-vs-power forecast bar */}
      <div className="rounded-xl p-4 border"
           style={{ background: 'rgba(10,8,25,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">⚖️ Previsão de Batalha</div>
          <span className={`text-xs font-black px-3 py-1 rounded-full ${verdict.color}`}
                style={{
                  background: ratio >= 1.8 ? 'rgba(34,197,94,0.15)' : ratio >= 1.0 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                  border: ratio >= 1.8 ? '1px solid rgba(34,197,94,0.4)' : ratio >= 1.0 ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(239,68,68,0.4)',
                }}>
            {verdict.label}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="p-2.5 rounded-xl" style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <div className="text-[10px] text-cyan-400 uppercase font-bold tracking-wider mb-1">Sua Força</div>
            <div className="text-2xl font-black text-cyan-300 tabular-nums">⚡{totalArmyPower.toLocaleString()}</div>
          </div>
          <div className="p-2.5 rounded-xl text-right" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="text-[10px] text-red-400 uppercase font-bold tracking-wider mb-1">Defesa do Alvo</div>
            <div className="text-2xl font-black text-red-300 tabular-nums">🛡️{Math.round(enemyPower).toLocaleString()}</div>
          </div>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(239,68,68,0.15)' }}>
          <div className={`h-full rounded-full bg-gradient-to-r ${verdict.bg} transition-all`} style={{ width: `${Math.min(100, ratio * 50)}%` }} />
        </div>
        <div className="text-[10px] text-gray-600 mt-1 font-mono text-right">ratio: {ratio.toFixed(2)}x</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          {/* heroes */}
          <div className="flex items-center gap-2 mb-2 p-2 rounded-lg" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.12)' }}>
            <span className="text-sm">⭐</span>
            <div className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 font-mono">{t('war.heroes')}</div>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-4">
            {HEROES.map(h => {
              const isSelected = plan.heroId === h.id;
              return (
                <button key={h.id} onClick={() => s.setHero(isSelected ? null : h.id)}
                        className="text-left p-2.5 rounded-xl border transition-all"
                        style={isSelected
                          ? { background: 'rgba(234,179,8,0.12)', border: '1px solid rgba(234,179,8,0.45)', boxShadow: '0 0 20px rgba(234,179,8,0.1)' }
                          : { background: 'rgba(10,10,20,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="text-xs font-bold text-white">{h.icon} {h.name}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{h.title}</div>
                  <div className="text-[10px] mt-1" style={{ color: '#67e8f9' }}>{h.ability}</div>
                  <div className="text-[10px] text-yellow-300 font-bold mt-1">⊕ {h.cost.toLocaleString()} cr</div>
                </button>
              );
            })}
          </div>

          {/* entry point */}
          <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2 font-mono">// 📍 ENTRY POINT</div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {entryPoints.map(ep => (
              <button key={ep} onClick={() => s.setEntryPoint(ep)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all"
                      style={plan.entryPoint === ep
                        ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.5)', color: '#a5b4fc' }
                        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                {ep}
              </button>
            ))}
          </div>
        </div>

        <div>
          {/* waves */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 font-mono">// 🌊 {t('war.waves')}</div>
            <div className="flex gap-1">
              {BATTLE_LAYERS.map(l => (
                <button key={l} onClick={() => s.addWave(l)} title={LAYER_INFO[l].desc}
                        className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                  {LAYER_INFO[l].icon}+
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {plan.waves.length === 0 && (
              <div className="text-xs text-gray-600 py-5 text-center rounded-xl"
                   style={{ background: 'rgba(10,5,5,0.4)', border: '1px solid rgba(239,68,68,0.08)' }}>
                Adicione ondas por camada. Tropas vêm do Quartel.
              </div>
            )}
            {plan.waves.map((w, idx) => {
              const wavePower = computeArmyPower(w.units);
              return (
                <div key={w.id} className="p-2.5 rounded-xl border"
                     style={{ background: 'rgba(20,5,5,0.7)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">
                      Onda {idx + 1} — {LAYER_INFO[w.layer].icon} {LAYER_INFO[w.layer].name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-300 font-bold">⚡{wavePower.toLocaleString()}</span>
                      <button onClick={() => s.removeWave(w.id)}
                              className="p-0.5 rounded text-red-400 hover:text-red-300">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {ASSAULT_UNITS.filter(u => u.layer === w.layer).map(u => {
                      const cur = w.units.find(x => x.unitId === u.id)?.count || 0;
                      const stock = s.barracks.troops[u.id] || 0;
                      const power = computeUnitPower(u);
                      return (
                        <div key={u.id} className={`flex items-center gap-1.5 text-[11px] ${stock === 0 ? 'opacity-30' : 'text-gray-300'}`}>
                          <span className="flex-1 truncate">
                            {u.icon} {u.name}
                            <span className="text-amber-400/70 ml-1 text-[10px]">⚡{power}</span>
                            <span className="text-emerald-400/70 ml-1 text-[10px]">[{stock}]</span>
                          </span>
                          <button onClick={() => s.setWaveUnit(w.id, u.id, Math.max(0, cur - 1))}
                                  className="p-0.5 rounded-md transition-all"
                                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Minus size={10} />
                          </button>
                          <span className="w-5 text-center tabular-nums font-bold text-white">{cur}</span>
                          <button onClick={() => s.setWaveUnit(w.id, u.id, Math.min(stock, cur + 1))}
                                  disabled={cur >= stock}
                                  className="p-0.5 rounded-md transition-all disabled:opacity-30"
                                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <Plus size={10} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={s.launchInvasion}
                  className="w-full mt-3 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(220,38,38,0.8) 0%, rgba(234,88,12,0.8) 100%)',
                    border: '1px solid rgba(239,68,68,0.5)',
                    boxShadow: '0 4px 24px rgba(239,68,68,0.3)',
                    color: '#fff',
                  }}>
            <Rocket size={16} /> {t('war.launch')} — {target.name}
          </button>
        </div>
      </div>
    </div>
  );
};

type AttackEntry = 'orbital' | 'north' | 'south' | 'east' | 'west';


// ============================================================================
// REPLAY OVERLAY
// ============================================================================
const ReplayOverlay: React.FC = () => {
  const replay = useEmpireStore(s => s.currentReplay);
  const clearReplay = useEmpireStore(s => s.clearReplay);
  const [idx, setIdx] = useState(0);
  const [speed, setSpeed] = useState(1);

  React.useEffect(() => { setIdx(0); }, [replay?.id]);
  React.useEffect(() => {
    if (!replay) return;
    if (idx >= replay.frames.length - 1) return;
    const id = setTimeout(() => setIdx(i => Math.min(replay.frames.length - 1, i + 1)), 1200 / speed);
    return () => clearTimeout(id);
  }, [replay, idx, speed]);

  if (!replay) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,10,0.85)', backdropFilter: 'blur(8px)' }}
         onClick={clearReplay}>
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden"
           style={{
             background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(6,6,36,0.98))',
             border: '1px solid rgba(34,211,238,0.25)',
             boxShadow: '0 30px 100px rgba(0,0,0,0.7), 0 0 60px rgba(34,211,238,0.06)',
           }}
           onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b"
             style={{ borderColor: 'rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.04)' }}>
          <div>
            <div className="text-[10px] text-gray-500 font-mono">// BATTLE REPLAY</div>
            <h2 className="text-base font-bold text-cyan-300">📺 {replay.targetName}</h2>
          </div>
          <div className="flex items-center gap-1.5">
            {[0.5, 1, 2, 4].map(sp => (
              <button key={sp} onClick={() => setSpeed(sp)}
                      className="px-2 py-1 rounded-lg text-[10px] font-bold transition-all"
                      style={speed === sp
                        ? { background: 'rgba(6,182,212,0.25)', border: '1px solid rgba(6,182,212,0.5)', color: '#67e8f9' }
                        : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}>
                {sp}x
              </button>
            ))}
            <button onClick={clearReplay}
                    className="p-1.5 rounded-lg ml-1 text-gray-500 hover:text-white hover:bg-white/5 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Stars + outcome */}
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl"
               style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => (
                <Star key={i} size={18} className={i <= replay.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'} />
              ))}
            </div>
            <span className="text-xs text-gray-300 font-bold">{replay.outcome}</span>
            <span className="text-xs text-yellow-300 ml-auto font-bold">⊕ {replay.lootGained.toLocaleString()} cr saqueados</span>
          </div>

          {/* Log */}
          <div className="h-56 overflow-y-auto rounded-xl p-3 space-y-1 font-mono text-xs mb-4"
               style={{ background: 'rgba(0,5,15,0.8)', border: '1px solid rgba(34,211,238,0.1)' }}>
            {replay.frames.slice(0, idx + 1).map((f, i) => (
              <div key={i} className={`transition-colors ${i === idx ? 'text-cyan-300' : 'text-gray-600'}`}>
                [{LAYER_INFO[f.layer].icon}] {f.text}
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => setIdx(0)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <Play size={11} /> Reiniciar
            </button>
            <input type="range" min={0} max={replay.frames.length - 1} value={idx}
                   onChange={(e) => setIdx(+e.target.value)} className="flex-1 accent-cyan-400" />
            <span className="text-[10px] text-gray-500 tabular-nums">{idx + 1}/{replay.frames.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// TUTORIAL OVERLAY
// ============================================================================
const TUTORIAL_STEPS = [
  { title: 'Bem-vindo, Comandante!', body: 'Você comanda um império espalhado por várias galáxias. Não administra apenas o espaço — precisa equilibrar 5 frentes: Economia, Energia, Segurança, Ecologia e Saúde das suas cidades. Este tutorial guia você por TODOS os sistemas. Troque o idioma no botão da barra inferior quando quiser.', hint: 'Clique em "Próximo" para começar.' },
  { title: '1 · Navegue pelo universo', body: 'Use a barra lateral à esquerda para alternar entre Galáxia, Sistema, Planeta e Frota. Na vista da galáxia, clique numa estrela para entrar no sistema; clique num planeta para vê-lo de perto.', hint: '➡️ Passe o mouse na barra esquerda e clique em "Galaxy Map".' },
  { title: '2 · Encontre um mundo habitável', body: 'Entre num sistema e clique nos planetas. No painel à direita veja a Habitabilidade. Planetas com 25%+ podem ser colonizados. Quanto maior a habitabilidade, melhor a cidade cresce.', hint: '➡️ Selecione um planeta verde/azul com boa habitabilidade.' },
  { title: '3 · Estabeleça sua primeira colônia', body: 'No painel do planeta clique em "ESTABLISH COLONY". Isso funda uma cidade e marca o planeta como seu. Cada planeta colonizado abre minas e cidades para administrar.', hint: '➡️ Clique no botão verde ESTABLISH COLONY.' },
  { title: '4 · Abra Mineração', body: 'Abra o painel "Colônias" na barra inferior. Na coluna de Mineração, escolha um depósito do seu planeta e construa uma Mina (800c). As minas extraem matéria-prima automaticamente para o seu estoque — a base de toda a economia.', hint: '➡️ Barra inferior → 🏙️ Colônias → construir Mina.' },
  { title: '5 · Faça crescer suas cidades', body: 'Ainda em Colônias, abra "Investir e expandir cidade". Cada distrito custa créditos + materiais e melhora UMA das 5 dimensões e/ou a capacidade populacional. Cidades sobem de nível conforme você investe — e ficam maiores no mapa 3D!', hint: '➡️ Clique em "Ver 3D" para visualizar a cidade crescer.' },
  { title: '6 · Equilíbrio é tudo (dificuldade)', body: 'As 5 dimensões CAEM com o tempo e com a superlotação. Energia baixa causa blecaute; Segurança ou Saúde baixas causam revolta e travam a renda; Ecologia baixa reduz o crescimento. Industrializar dá renda mas polui. Você precisa investir continuamente.', hint: '⚠️ Fique de olho nas barras vermelhas.' },
  { title: '7 · Indústria e cadeia produtiva', body: 'Abra Indústria. Construa máquinas (Forno, Fundição, Montadora...) e dê uma receita a cada uma. A cadeia vai de minério → metal refinado → ligas → componentes → módulos → edifícios avançados. Esses materiais alimentam cidades, construções e guerra.', hint: '➡️ Barra inferior → 🏭 Indústria.' },
  { title: '8 · Mercado e logística', body: 'No Mercado, venda excedentes e compre o que falta. Cuidado com energia: reatores geram, fábricas consomem. Use logística para mover recursos entre planetas.', hint: '➡️ Barra inferior → 🛒 Mercado.' },
  { title: '9 · Bolsa de Componentes', body: 'Abra "Componentes". Os preços de peças de engenharia flutuam com a demanda do mercado. Compre na baixa e venda na alta para lucrar — uma economia viva de preço e demanda.', hint: '➡️ Barra inferior → 📈 Componentes.' },
  { title: '10 · Engenharia de robôs', body: 'Abra Engenharia: 1000+ peças e comportamentos programáveis. Combine chassis, locomoção, sensores, armas, IA e blocos de comportamento para criar robôs reais, visualizá-los em 3D e vendê-los.', hint: '➡️ Barra inferior → 🧠 Engenharia.' },
  { title: '11 · Construção (Estaleiro)', body: 'No Estaleiro construa satélites, drones, veículos, estações, frotas, naves capitais e megaestruturas. Satélites podem ser lançados sobre seus planetas. Cada item exige materiais específicos da sua indústria.', hint: '➡️ Barra inferior → 🔨 Construir.' },
  { title: '12 · Guerra galáctica', body: 'Faça reconhecimento (sondas, espiões, hackers) para revelar a base inimiga. Planeje ondas por camada: Órbita → Atmosfera → Desembarque → Combate Urbano. Escolha heróis e o ponto de entrada.', hint: '➡️ Barra inferior → ⚔️ Guerra.' },
  { title: '13 · Estrelas, missões e tarefas', body: 'Ganhe até 3 estrelas destruindo o Centro Administrativo, capturando infraestrutura e parando a produção. Cumpra Missões por recompensas. E use a 🗒️ Central de Tarefas (botão na barra) que sempre mostra o que precisa ser feito agora.', hint: '➡️ Abra a Central de Tarefas a qualquer momento.' },
  { title: 'Pronto para reinar!', body: 'Você já conhece todos os sistemas. Comece minerando e fundando cidades, equilibre as 5 dimensões, expanda a indústria e parta para a conquista. Boa sorte, Comandante!', hint: '🚀 Clique em "Começar a jogar!"' },
];

const TutorialOverlay: React.FC = () => {
  const { tutorialOpen, tutorialStep, setTutorialStep, finishTutorial, closeTutorial } = useEmpireStore();
  if (!tutorialOpen) return null;
  const step = TUTORIAL_STEPS[tutorialStep];
  const last = tutorialStep === TUTORIAL_STEPS.length - 1;
  const progress = (tutorialStep + 1) / TUTORIAL_STEPS.length;
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 pb-28 pointer-events-none"
         style={{ background: 'rgba(0,0,10,0.5)', backdropFilter: 'blur(2px)' }}>
      <div className="w-full max-w-lg rounded-2xl pointer-events-auto overflow-hidden"
           style={{
             background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(8,5,40,0.98))',
             border: '1px solid rgba(99,102,241,0.3)',
             boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 60px rgba(99,102,241,0.08)',
           }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b"
             style={{ borderColor: 'rgba(99,102,241,0.15)', background: 'rgba(99,102,241,0.06)' }}>
          <GraduationCap className="text-indigo-400" size={18} />
          <div className="flex-1">
            <div className="text-[10px] font-mono text-gray-600">// COMMANDER BRIEFING</div>
            <div className="text-[10px] text-indigo-400 font-bold">Passo {tutorialStep + 1} de {TUTORIAL_STEPS.length}</div>
          </div>
          <button onClick={closeTutorial}
                  className="p-1 rounded-lg text-gray-600 hover:text-gray-300 hover:bg-white/5 transition-all">
            <X size={15} />
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-0.5" style={{ background: 'rgba(99,102,241,0.1)' }}>
          <div className="h-full transition-all" style={{ width: `${progress * 100}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
        </div>
        <div className="p-5">
          <h2 className="text-lg font-bold text-white mb-2">{step.title}</h2>
          <p className="text-sm text-gray-300 leading-relaxed">{step.body}</p>
          {step.hint && (
            <p className="mt-3 text-xs text-indigo-300 rounded-xl px-3 py-2.5 font-mono"
               style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              {step.hint}
            </p>
          )}
          <div className="flex items-center justify-between mt-5">
            <button disabled={tutorialStep === 0} onClick={() => setTutorialStep(tutorialStep - 1)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              Anterior
            </button>
            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i}
                     className="rounded-full transition-all cursor-pointer"
                     style={{
                       width: i === tutorialStep ? '18px' : '6px',
                       height: '6px',
                       background: i === tutorialStep ? '#6366f1' : i < tutorialStep ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)',
                     }}
                     onClick={() => setTutorialStep(i)} />
              ))}
            </div>
            {last ? (
              <button onClick={finishTutorial}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                Começar a jogar! 🚀
              </button>
            ) : (
              <button onClick={() => setTutorialStep(tutorialStep + 1)}
                      className="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                Próximo →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Root overlay manager
// ============================================================================
export const EmpireOverlays: React.FC = () => {
  const panel = useEmpireUI(s => s.panel);
  return (
    <>
      {panel === 'colonies' && <ColonyPanel />}
      {panel === 'colonization' && <ColonizationPanel />}
      {panel === 'industry' && <IndustryPanel />}
      {panel === 'market' && <MarketPanel />}
      {panel === 'components' && <ComponentExchange />}
      {panel === 'build' && <BuildPanel />}
      {panel === 'war' && <WarPanel />}
      {panel === 'missions' && <MissionsPanel />}
      {panel === 'engineering' && <EngineeringCatalogPanel />}
      {panel === 'tasks' && <TaskCenter />}
      <TutorialOverlay />
    </>
  );
};
