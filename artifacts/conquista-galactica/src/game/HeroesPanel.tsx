// ============================================================================
// HEROES PANEL — Legendary heroes system with leveling, abilities & assignment
// ============================================================================
import React, { useState } from 'react';
import { X, Star, ChevronRight, Shield, Zap, Award, Users, Lock, TrendingUp, Plus } from 'lucide-react';
import { create } from 'zustand';
import { useGameStore } from './gameStore';
import {
  HERO_TEMPLATES, HERO_BY_ID, XP_FOR_LEVEL, TOTAL_XP_FOR_LEVEL,
  CLASS_ICONS, CLASS_COLORS, RARITY_COLORS,
  type HeroTemplate, type HeroClass, type HeroRarity, type HeroAbility,
} from './data/heroesData';

// ============================================================================
// STORE
// ============================================================================
export interface ActiveHero {
  id: string;
  templateId: string;
  level: number;
  xp: number;
  assignedTo: string | null;   // ship id or colony id
  assignedType: 'fleet' | 'colony' | null;
  unlockedAbilities: string[]; // ability ids
  isOnMission: boolean;
  missionEndsAt: number;
  kills: number;
  battlesWon: number;
  planetsSettled: number;
  tradeProfits: number;
}

interface HeroesState {
  heroes: ActiveHero[];
  availableForRecruit: HeroTemplate[];
  showPanel: boolean;
  selectedHeroId: string | null;
  showRecruitModal: boolean;

  openPanel: () => void;
  closePanel: () => void;
  selectHero: (id: string | null) => void;
  openRecruit: () => void;
  closeRecruit: () => void;
  recruitHero: (templateId: string) => boolean;
  dismissHero: (heroId: string) => void;
  assignHero: (heroId: string, targetId: string, type: 'fleet' | 'colony') => void;
  unassignHero: (heroId: string) => void;
  addXp: (heroId: string, xp: number) => void;
  tick: (delta: number) => void;
  refreshRecruitPool: () => void;
}

let heroIdCtr = 0;
const newHeroId = () => `hero_${heroIdCtr++}`;

function makeInitialRecruit(): HeroTemplate[] {
  const pool = [...HERO_TEMPLATES];
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function levelFromXp(xp: number): number {
  let level = 1;
  while (level < 20 && xp >= TOTAL_XP_FOR_LEVEL(level + 1)) level++;
  return level;
}

function getUnlockedAbilities(templateId: string, level: number): string[] {
  const t = HERO_BY_ID[templateId];
  if (!t) return [];
  return t.abilities.filter(a => a.unlockLevel <= level).map(a => a.id);
}

export const useHeroesStore = create<HeroesState>((set, get) => ({
  heroes: [],
  availableForRecruit: makeInitialRecruit(),
  showPanel: false,
  selectedHeroId: null,
  showRecruitModal: false,

  openPanel: () => set({ showPanel: true }),
  closePanel: () => set({ showPanel: false }),
  selectHero: (id) => set({ selectedHeroId: id }),
  openRecruit: () => set({ showRecruitModal: true }),
  closeRecruit: () => set({ showRecruitModal: false }),

  recruitHero: (templateId) => {
    const t = HERO_BY_ID[templateId];
    if (!t) return false;
    const g = useGameStore.getState();
    if (g.credits < t.recruitCost) return false;
    g.addCredits(-t.recruitCost);

    const hero: ActiveHero = {
      id: newHeroId(),
      templateId,
      level: 1,
      xp: 0,
      assignedTo: null,
      assignedType: null,
      unlockedAbilities: getUnlockedAbilities(templateId, 1),
      isOnMission: false,
      missionEndsAt: 0,
      kills: 0,
      battlesWon: 0,
      planetsSettled: 0,
      tradeProfits: 0,
    };

    set(state => ({
      heroes: [...state.heroes, hero],
      availableForRecruit: state.availableForRecruit.filter(h => h.id !== templateId),
    }));
    return true;
  },

  dismissHero: (heroId) => {
    set(state => ({
      heroes: state.heroes.filter(h => h.id !== heroId),
      selectedHeroId: state.selectedHeroId === heroId ? null : state.selectedHeroId,
    }));
  },

  assignHero: (heroId, targetId, type) => {
    set(state => ({
      heroes: state.heroes.map(h =>
        h.id === heroId ? { ...h, assignedTo: targetId, assignedType: type } : h
      ),
    }));
  },

  unassignHero: (heroId) => {
    set(state => ({
      heroes: state.heroes.map(h =>
        h.id === heroId ? { ...h, assignedTo: null, assignedType: null } : h
      ),
    }));
  },

  addXp: (heroId, xp) => {
    set(state => ({
      heroes: state.heroes.map(h => {
        if (h.id !== heroId) return h;
        const newXp = h.xp + xp;
        const newLevel = Math.min(20, levelFromXp(newXp));
        const leveled = newLevel > h.level;
        return {
          ...h,
          xp: newXp,
          level: newLevel,
          unlockedAbilities: leveled ? getUnlockedAbilities(h.templateId, newLevel) : h.unlockedAbilities,
        };
      }),
    }));
  },

  refreshRecruitPool: () => {
    const current = get().heroes.map(h => h.templateId);
    const pool = HERO_TEMPLATES.filter(t => !current.includes(t.id));
    const shuffled = pool.sort(() => Math.random() - 0.5);
    set({ availableForRecruit: shuffled.slice(0, 4) });
  },

  tick: (delta: number) => {
    const now = Date.now();
    const state = get();
    // Passive XP for assigned heroes
    const updatedHeroes = state.heroes.map(h => {
      if (!h.assignedTo) return h;
      const passiveXp = delta * 0.5; // 0.5 XP/s while assigned
      const newXp = h.xp + passiveXp;
      const newLevel = Math.min(20, levelFromXp(newXp));
      return {
        ...h,
        xp: newXp,
        level: newLevel,
        unlockedAbilities: newLevel > h.level ? getUnlockedAbilities(h.templateId, newLevel) : h.unlockedAbilities,
        isOnMission: h.isOnMission && now < h.missionEndsAt,
      };
    });
    set({ heroes: updatedHeroes });
  },
}));

// ============================================================================
// HELPERS
// ============================================================================
const rarityLabel: Record<HeroRarity, string> = {
  common: 'Comum', rare: 'Raro', epic: 'Épico', legendary: 'Lendário', mythic: 'Mítico',
};
const classLabel: Record<HeroClass, string> = {
  admiral: 'Almirante', scientist: 'Cientista', diplomat: 'Diplomata',
  engineer: 'Engenheiro', spy: 'Espião', colonist: 'Colonizador',
  warlord: 'Guerreiro', oracle: 'Oráculo',
};
const STAT_LABELS = ['combat', 'leadership', 'intelligence', 'charisma', 'endurance'] as const;
const STAT_PT: Record<string, string> = {
  combat: 'Combate', leadership: 'Liderança', intelligence: 'Inteligência',
  charisma: 'Carisma', endurance: 'Resistência',
};

function XpBar({ hero }: { hero: ActiveHero }) {
  const nextLevelXp = TOTAL_XP_FOR_LEVEL(hero.level + 1);
  const currLevelXp = TOTAL_XP_FOR_LEVEL(hero.level);
  const pct = hero.level >= 20 ? 100 : ((hero.xp - currLevelXp) / (nextLevelXp - currLevelXp)) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400">Nv.{hero.level}</span>
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="bg-yellow-400 h-1.5 rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      {hero.level < 20 && <span className="text-slate-500">{Math.floor(hero.xp)}/{nextLevelXp} XP</span>}
      {hero.level >= 20 && <span className="text-yellow-400 font-bold">MAX</span>}
    </div>
  );
}

function StatBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500 w-20 shrink-0">{label}</span>
      <div className="flex-1 rounded-full h-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-1.5 rounded-full transition-all" style={{ width: `${value * 10}%`, backgroundColor: color }} />
      </div>
      <span className="text-gray-300 w-4 text-right">{value}</span>
    </div>
  );
}

function AbilityCard({ ability, locked }: { ability: HeroAbility; locked: boolean }) {
  const typeColors: Record<string, string> = {
    passive_combat: '#EF4444', passive_economy: '#10B981', passive_research: '#3B82F6',
    active_combat: '#F97316', active_economy: '#14B8A6', active_diplomacy: '#A855F7',
    aura_fleet: '#6366F1', aura_colony: '#22C55E', ultimate: '#F59E0B',
  };
  return (
    <div className="p-2 rounded-lg border transition-all" style={locked ? { borderColor: 'rgba(255,255,255,0.06)', opacity: 0.4 } : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-start gap-2">
        {locked ? <Lock size={12} className="text-slate-500 mt-0.5 shrink-0" /> : <Zap size={12} className="mt-0.5 shrink-0" style={{ color: typeColors[ability.type] }} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className={`text-xs font-semibold ${locked ? 'text-slate-500' : 'text-white'}`}>{ability.name}</span>
            {locked && <span className="text-xs text-slate-600">Nv.{ability.unlockLevel}</span>}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 leading-tight">{ability.description}</p>
          {ability.cooldown && !locked && (
            <span className="text-xs text-slate-500">Cooldown: {ability.cooldown}s</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HERO CARD (small, for list)
// ============================================================================
function HeroCard({ heroId, onSelect, selected }: { heroId: string; onSelect: () => void; selected: boolean }) {
  const hero = useHeroesStore(s => s.heroes.find(h => h.id === heroId));
  if (!hero) return null;
  const t = HERO_BY_ID[hero.templateId];
  if (!t) return null;
  const classColor = CLASS_COLORS[t.class];
  return (
    <button
      onClick={onSelect}
      className="w-full text-left p-3 rounded-xl border transition-all"
      style={selected
        ? { background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.45)', boxShadow: '0 0 20px rgba(234,179,8,0.08)' }
        : { background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shrink-0"
          style={{ background: `${classColor}22`, border: `1px solid ${classColor}44` }}>
          {t.portrait}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white truncate">{t.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-semibold shrink-0"
              style={{ background: `${t.rarityColor}22`, color: t.rarityColor, border: `1px solid ${t.rarityColor}44` }}>
              {rarityLabel[t.rarity]}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs" style={{ color: classColor }}>{CLASS_ICONS[t.class]} {classLabel[t.class]}</span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{t.title}</span>
          </div>
          <XpBar hero={hero} />
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          {hero.assignedTo
            ? <span className="text-xs text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">Destacado</span>
            : <span className="text-xs px-1.5 py-0.5 rounded" style={{ color: '#6b7280', background: 'rgba(255,255,255,0.05)' }}>Disponível</span>
          }
          <ChevronRight size={14} className="text-slate-500" />
        </div>
      </div>
    </button>
  );
}

// ============================================================================
// RECRUIT CARD (template)
// ============================================================================
function RecruitCard({ template, onRecruit }: { template: HeroTemplate; onRecruit: () => void }) {
  const credits = useGameStore(s => s.credits);
  const canAfford = credits >= template.recruitCost;
  const classColor = CLASS_COLORS[template.class];
  return (
    <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: 'rgba(10,15,25,0.7)', border: '1px solid rgba(255,255,255,0.09)' }}>
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0"
          style={{ background: `${classColor}22`, border: `2px solid ${classColor}66` }}>
          {template.portrait}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white">{template.name}</span>
            <span className="text-xs px-1.5 py-0.5 rounded font-semibold"
              style={{ background: `${template.rarityColor}22`, color: template.rarityColor, border: `1px solid ${template.rarityColor}44` }}>
              {rarityLabel[template.rarity]}
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: classColor }}>{CLASS_ICONS[template.class]} {classLabel[template.class]} · {template.title}</div>
          <div className="text-xs text-slate-400 mt-1 leading-relaxed">{template.backstory}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400">
        <span className="text-yellow-400 font-semibold">{template.specialization}</span>
        <span>·</span>
        <span>{template.abilities.length} habilidades</span>
      </div>
      <button
        onClick={onRecruit}
        disabled={!canAfford}
        className="w-full py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
        style={canAfford
          ? { background: 'linear-gradient(135deg, rgba(234,179,8,0.8), rgba(245,158,11,0.8))', color: '#1c1a00', boxShadow: '0 4px 16px rgba(234,179,8,0.2)' }
          : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#4b5563', cursor: 'not-allowed' }}
      >
        <Award size={14} />
        Recrutar — {template.recruitCost.toLocaleString()} créditos
      </button>
    </div>
  );
}

// ============================================================================
// HERO DETAIL VIEW
// ============================================================================
function HeroDetail({ heroId }: { heroId: string }) {
  const hero = useHeroesStore(s => s.heroes.find(h => h.id === heroId));
  const dismissHero = useHeroesStore(s => s.dismissHero);
  const unassignHero = useHeroesStore(s => s.unassignHero);
  if (!hero) return null;
  const t = HERO_BY_ID[hero.templateId];
  if (!t) return null;
  const classColor = CLASS_COLORS[t.class];

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
          style={{ background: `${classColor}22`, border: `2px solid ${classColor}66` }}>
          {t.portrait}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-white">{t.name}</h3>
            <span className="text-sm px-2 py-0.5 rounded font-semibold"
              style={{ background: `${t.rarityColor}22`, color: t.rarityColor, border: `1px solid ${t.rarityColor}44` }}>
              {rarityLabel[t.rarity]}
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: classColor }}>{CLASS_ICONS[t.class]} {classLabel[t.class]} · {t.title}</div>
          <XpBar hero={hero} />
        </div>
      </div>

      {/* Backstory */}
      <p className="text-xs text-gray-500 italic leading-relaxed pl-3" style={{ borderLeft: '2px solid rgba(255,255,255,0.12)' }}>{t.backstory}</p>

      {/* Stats */}
      <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1"><TrendingUp size={12} /> Atributos</div>
        {STAT_LABELS.map(stat => (
          <StatBar key={stat} value={t.baseStats[stat]} label={STAT_PT[stat]} color={classColor} />
        ))}
      </div>

      {/* Combat Stats */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        {[
          { label: 'Batalhas', value: hero.battlesWon, color: '#e2e8f0' },
          { label: 'Abates', value: hero.kills, color: '#f87171' },
          { label: 'Colônias', value: hero.planetsSettled, color: '#4ade80' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-2 text-center" style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-gray-500">{label}</div>
            <div className="font-bold" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Assignment */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(10,15,25,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1"><Users size={12} /> Destacamento</div>
        {hero.assignedTo ? (
          <div className="flex items-center justify-between">
            <span className="text-xs text-green-400">Destacado em: {hero.assignedType === 'fleet' ? '🚀 Frota' : '🏙️ Colônia'} #{hero.assignedTo.slice(-4)}</span>
            <button
              onClick={() => unassignHero(hero.id)}
              className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 px-2 py-1 rounded transition-all"
            >
              Retirar
            </button>
          </div>
        ) : (
          <div className="text-xs text-gray-600">Herói disponível — nenhum destacamento</div>
        )}
      </div>

      {/* Abilities */}
      <div>
        <div className="text-xs font-semibold text-gray-300 mb-2 flex items-center gap-1"><Zap size={12} /> Habilidades</div>
        <div className="space-y-2">
          {t.abilities.map(ability => (
            <AbilityCard
              key={ability.id}
              ability={ability}
              locked={!hero.unlockedAbilities.includes(ability.id)}
            />
          ))}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => dismissHero(hero.id)}
        className="w-full py-2 rounded-lg text-xs text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all mt-auto"
      >
        Dispensar Herói
      </button>
    </div>
  );
}

// ============================================================================
// MAIN PANEL
// ============================================================================
export function HeroesPanel() {
  const { showPanel, closePanel, heroes, selectedHeroId, selectHero,
    showRecruitModal, openRecruit, closeRecruit, availableForRecruit,
    recruitHero, refreshRecruitPool } = useHeroesStore();
  const credits = useGameStore(s => s.credits);

  if (!showPanel) return null;

  return (
    <>
      {/* MAIN PANEL */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
           style={{ background: 'rgba(0,0,10,0.82)', backdropFilter: 'blur(8px)' }}>
        <div className="w-[900px] max-w-[98vw] h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
               style={{ background: 'linear-gradient(145deg, rgba(10,6,22,0.99), rgba(16,8,32,0.99))', border: '1px solid rgba(234,179,8,0.3)', boxShadow: '0 40px 120px rgba(0,0,0,0.8), 0 0 60px rgba(234,179,8,0.05)' }}>
          {/* Holographic Title Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20 shrink-0"
               style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.08) 0%, rgba(168,85,247,0.05) 60%, transparent 100%)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                   style={{ background: 'rgba(234,179,8,0.15)', border: '1px solid rgba(234,179,8,0.4)', boxShadow: '0 0 20px rgba(234,179,8,0.2)' }}>
                <Star size={20} className="text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-wider"
                    style={{ background: 'linear-gradient(90deg, #fde68a, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  HERÓIS LENDÁRIOS
                </h2>
                <p className="text-xs text-gray-600 font-mono">// recrutamento · desenvolvimento · destacamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg border border-yellow-500/30 font-mono text-yellow-300 text-xs"
                   style={{ background: 'rgba(234,179,8,0.08)' }}>
                ⊕ {Math.floor(credits).toLocaleString()} cr
              </div>
              <button
                onClick={openRecruit}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.15))', border: '1px solid rgba(234,179,8,0.4)', color: '#fde68a' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(234,179,8,0.35), rgba(168,85,247,0.25))')}
                onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(234,179,8,0.2), rgba(168,85,247,0.15))')}
              >
                <Plus size={14} /> Recrutar Herói
              </button>
              <button onClick={closePanel}
                      className="p-1.5 rounded-xl text-gray-500 hover:text-white transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Hero List */}
            <div className="w-80 shrink-0 flex flex-col" style={{ borderRight: '1px solid rgba(234,179,8,0.1)' }}>
              <div className="p-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(234,179,8,0.07)' }}>
                <span className="text-xs text-gray-500">{heroes.length} heróis recrutados</span>
                <div className="flex gap-1">
                  {(['admiral', 'scientist', 'diplomat', 'engineer', 'spy', 'colonist', 'warlord', 'oracle'] as HeroClass[]).map(cls => (
                    <span key={cls} className="text-xs" style={{ color: CLASS_COLORS[cls] }}>{CLASS_ICONS[cls]}</span>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {heroes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8 rounded-2xl mx-2 my-4"
                       style={{ border: '1px solid rgba(234,179,8,0.08)' }}>
                    <Star size={28} className="opacity-20 text-yellow-400" />
                    <div className="text-[10px] font-mono text-gray-700">// NO HEROES RECRUITED</div>
                    <p className="text-xs text-gray-500">Nenhum herói recrutado</p>
                    <button onClick={openRecruit} className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors font-bold"
                            style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '4px 12px', borderRadius: '8px' }}>
                      Recrutar primeiro herói
                    </button>
                  </div>
                ) : (
                  heroes.map(h => (
                    <HeroCard
                      key={h.id}
                      heroId={h.id}
                      selected={selectedHeroId === h.id}
                      onSelect={() => selectHero(selectedHeroId === h.id ? null : h.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Right: Detail or Empty State */}
            <div className="flex-1 p-5 overflow-hidden">
              {selectedHeroId ? (
                <HeroDetail heroId={selectedHeroId} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4">
                  <Award size={40} className="opacity-10 text-yellow-400" />
                  <div>
                    <div className="text-[10px] font-mono text-gray-700 mb-1">// SELECT HERO</div>
                    <p className="text-gray-400 font-semibold text-sm">Selecione um herói</p>
                    <p className="text-xs text-gray-600 mt-1">para ver habilidades, atributos e destacamento</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-left mt-2 max-w-sm w-full">
                    {[
                      { icon: '⚓', label: 'Almirante', desc: 'Combate naval e táticas de frota' },
                      { icon: '🔬', label: 'Cientista', desc: 'Pesquisa e exploração de planetas' },
                      { icon: '🤝', label: 'Diplomata', desc: 'Rotas comerciais e alianças' },
                      { icon: '⚙️', label: 'Engenheiro', desc: 'Construção e maravilhas' },
                      { icon: '🕵️', label: 'Espião', desc: 'Sabotagem e inteligência' },
                      { icon: '🌱', label: 'Colonizador', desc: 'Terraformação e crescimento' },
                      { icon: '⚔️', label: 'Guerreiro', desc: 'Invasão e conquista' },
                      { icon: '🔮', label: 'Oráculo', desc: 'Manipulação de eventos galácticos' },
                    ].map(c => (
                      <div key={c.label} className="p-2 rounded-xl" style={{ background: 'rgba(10,15,25,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="font-semibold text-gray-300">{c.icon} {c.label}</div>
                        <div className="text-gray-600 text-xs mt-0.5">{c.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* RECRUIT MODAL */}
      {showRecruitModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60 p-4"
             style={{ background: 'rgba(0,0,10,0.88)', backdropFilter: 'blur(10px)' }}>
          <div className="w-[700px] max-w-[98vw] max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
               style={{ background: 'linear-gradient(135deg, rgba(10,8,25,0.99) 0%, rgba(20,10,40,0.99) 100%)', border: '1px solid rgba(234,179,8,0.35)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-yellow-500/20 shrink-0"
                 style={{ background: 'linear-gradient(90deg, rgba(234,179,8,0.1) 0%, rgba(168,85,247,0.06) 60%, transparent 100%)' }}>
              <div>
                <h3 className="text-base font-bold tracking-wider"
                    style={{ background: 'linear-gradient(90deg, #fde68a, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  RECRUTAR HERÓI
                </h3>
                <p className="text-xs text-gray-600 font-mono">// mercado galáctico de talentos</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={refreshRecruitPool}
                  className="text-xs px-3 py-1.5 rounded-lg border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 transition-all font-bold"
                >
                  🔄 Atualizar
                </button>
                <button onClick={closeRecruit}
                        className="p-1.5 rounded-xl text-gray-500 hover:text-white transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <X size={15} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-3">
              {availableForRecruit.length === 0 ? (
                <div className="text-center py-10 rounded-2xl" style={{ border: '1px solid rgba(234,179,8,0.08)' }}>
                  <div className="text-3xl mb-2 opacity-20">⭐</div>
                  <div className="text-[10px] font-mono text-gray-700 mb-2">// POOL EMPTY</div>
                  <p className="text-xs text-gray-500">Todos os heróis disponíveis foram recrutados.</p>
                  <button onClick={refreshRecruitPool} className="mt-3 text-xs text-yellow-400 font-bold px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}>
                    Atualizar lista
                  </button>
                </div>
              ) : (
                availableForRecruit.map(t => (
                  <RecruitCard
                    key={t.id}
                    template={t}
                    onRecruit={() => {
                      const ok = recruitHero(t.id);
                      if (ok && availableForRecruit.length <= 1) closeRecruit();
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
