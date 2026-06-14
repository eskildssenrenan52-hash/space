// ============================================================================
// LEGENDARY HEROES DATA — Classes, abilities, and recruitment pool
// ============================================================================

export type HeroClass =
  | 'admiral'     // fleet commander — combat bonuses
  | 'scientist'   // research & exploration bonuses
  | 'diplomat'    // trade & diplomacy bonuses
  | 'engineer'    // construction & production bonuses
  | 'spy'         // intelligence & sabotage bonuses
  | 'colonist'    // colony growth & habitability bonuses
  | 'warlord'     // ground assault & invasion bonuses
  | 'oracle';     // galactic events prediction & manipulation

export type HeroRarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

export type AbilityType =
  | 'passive_combat'   | 'passive_economy'  | 'passive_research'
  | 'active_combat'    | 'active_economy'   | 'active_diplomacy'
  | 'aura_fleet'       | 'aura_colony'      | 'ultimate';

export interface HeroAbility {
  id: string;
  name: string;
  description: string;
  type: AbilityType;
  unlockLevel: number;   // 1, 5, 10, 15, 20
  cooldown?: number;     // seconds (for active abilities)
  value: number;         // percentage or flat bonus
}

export interface HeroTemplate {
  id: string;
  name: string;
  title: string;
  class: HeroClass;
  rarity: HeroRarity;
  icon: string;
  portrait: string;      // emoji for now
  backstory: string;
  abilities: HeroAbility[];
  baseStats: {
    combat: number;      // 1-10
    leadership: number;
    intelligence: number;
    charisma: number;
    endurance: number;
  };
  specialization: string;   // short label
  recruitCost: number;
  rarityColor: string;
}

export const RARITY_COLORS: Record<HeroRarity, string> = {
  common: '#9CA3AF',
  rare: '#3B82F6',
  epic: '#8B5CF6',
  legendary: '#F59E0B',
  mythic: '#EF4444',
};

export const CLASS_ICONS: Record<HeroClass, string> = {
  admiral:    '⚓',
  scientist:  '🔬',
  diplomat:   '🤝',
  engineer:   '⚙️',
  spy:        '🕵️',
  colonist:   '🌱',
  warlord:    '⚔️',
  oracle:     '🔮',
};

export const CLASS_COLORS: Record<HeroClass, string> = {
  admiral:    '#3B82F6',
  scientist:  '#10B981',
  diplomat:   '#F59E0B',
  engineer:   '#6B7280',
  spy:        '#6D28D9',
  colonist:   '#22C55E',
  warlord:    '#EF4444',
  oracle:     '#EC4899',
};

export const HERO_TEMPLATES: HeroTemplate[] = [
  // ── ADMIRALS ──────────────────────────────────────────────────────────────
  {
    id: 'admiral_nova',
    name: 'Kassia Nova',
    title: 'The Iron Admiral',
    class: 'admiral',
    rarity: 'legendary',
    icon: '⚓',
    portrait: '👩‍✈️',
    backstory: 'Former pirate turned fleet commander. Won the Battle of Sigma Seven with 12 ships against 200.',
    specialization: 'Fleet Combat',
    recruitCost: 5000,
    rarityColor: RARITY_COLORS.legendary,
    baseStats: { combat: 10, leadership: 9, intelligence: 7, charisma: 8, endurance: 8 },
    abilities: [
      { id: 'iron_formation', name: 'Iron Formation', description: '+25% fleet defense when outnumbered', type: 'passive_combat', unlockLevel: 1, value: 25 },
      { id: 'last_stand', name: 'Last Stand', description: '+50% attack when fleet below 30% HP', type: 'passive_combat', unlockLevel: 5, value: 50 },
      { id: 'fleet_surge', name: 'Fleet Surge', description: 'All ships +40% speed for 30s', type: 'active_combat', unlockLevel: 10, cooldown: 120, value: 40 },
      { id: 'broadside', name: 'Broadside Volley', description: 'AoE attack hits all enemies simultaneously', type: 'active_combat', unlockLevel: 15, cooldown: 180, value: 60 },
      { id: 'unbreakable', name: 'Unbreakable', description: 'Fleet cannot be destroyed below 10% HP (once per battle)', type: 'ultimate', unlockLevel: 20, value: 100 },
    ],
  },
  {
    id: 'admiral_storm',
    name: 'Orion Stormbreaker',
    title: 'Conqueror of the Void',
    class: 'admiral',
    rarity: 'epic',
    icon: '⚓',
    portrait: '👨‍✈️',
    backstory: 'Fought in 40 battles without a single defeat. Known for aggressive hit-and-run tactics.',
    specialization: 'Offensive Tactics',
    recruitCost: 3000,
    rarityColor: RARITY_COLORS.epic,
    baseStats: { combat: 9, leadership: 7, intelligence: 8, charisma: 6, endurance: 7 },
    abilities: [
      { id: 'first_strike', name: 'First Strike', description: '+30% damage on first attack wave', type: 'passive_combat', unlockLevel: 1, value: 30 },
      { id: 'vanguard', name: 'Vanguard Charge', description: 'Lead ship takes -40% damage during charge', type: 'passive_combat', unlockLevel: 5, value: 40 },
      { id: 'hit_run', name: 'Hit and Run', description: 'Teleport fleet behind enemy line', type: 'active_combat', unlockLevel: 10, cooldown: 90, value: 0 },
      { id: 'storm_barrage', name: 'Storm Barrage', description: 'Triple fire rate for 15 seconds', type: 'active_combat', unlockLevel: 15, cooldown: 150, value: 200 },
      { id: 'conqueror', name: 'Conqueror\'s Will', description: '+100% attack on enemy flagship', type: 'ultimate', unlockLevel: 20, value: 100 },
    ],
  },

  // ── SCIENTISTS ────────────────────────────────────────────────────────────
  {
    id: 'scientist_lyra',
    name: 'Lyra Axiom',
    title: 'Grand Theorist',
    class: 'scientist',
    rarity: 'legendary',
    icon: '🔬',
    portrait: '👩‍🔬',
    backstory: 'Discovered three new laws of quantum mechanics before age 25. Vanished for a decade, returned with knowledge of alien science.',
    specialization: 'Research Speed',
    recruitCost: 4500,
    rarityColor: RARITY_COLORS.legendary,
    baseStats: { combat: 3, leadership: 6, intelligence: 10, charisma: 7, endurance: 6 },
    abilities: [
      { id: 'eureka', name: 'Eureka Protocol', description: '+35% research speed globally', type: 'passive_research', unlockLevel: 1, value: 35 },
      { id: 'sensor_net', name: 'Sensor Network', description: 'Reveals hidden biomes on unexplored planets', type: 'passive_research', unlockLevel: 5, value: 0 },
      { id: 'rapid_scan', name: 'Rapid Scan', description: 'Instantly explore a planet', type: 'active_economy', unlockLevel: 10, cooldown: 60, value: 0 },
      { id: 'alien_tech', name: 'Alien Tech Decryption', description: '+50% bonus from ruins & ancient sites', type: 'passive_research', unlockLevel: 15, value: 50 },
      { id: 'singularity', name: 'Technological Singularity', description: 'Unlock a random Tier 5 technology', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },
  {
    id: 'scientist_vex',
    name: 'Dr. Vex Nullion',
    title: 'The Void Scholar',
    class: 'scientist',
    rarity: 'rare',
    icon: '🔬',
    portrait: '🧑‍🔬',
    backstory: 'Specializes in void and quantum-state research. Controversial — believes the universe is a simulation.',
    specialization: 'Exotic Matter',
    recruitCost: 1800,
    rarityColor: RARITY_COLORS.rare,
    baseStats: { combat: 2, leadership: 4, intelligence: 9, charisma: 5, endurance: 5 },
    abilities: [
      { id: 'exotic_harvest', name: 'Exotic Harvest', description: '+50% rare element extraction', type: 'passive_economy', unlockLevel: 1, value: 50 },
      { id: 'void_analysis', name: 'Void Analysis', description: 'Void and quantum planets yield +100% resources', type: 'passive_research', unlockLevel: 5, value: 100 },
      { id: 'stabilize', name: 'Quantum Stabilizer', description: 'Prevent quantum planet collapse for 60s', type: 'active_economy', unlockLevel: 10, cooldown: 180, value: 0 },
      { id: 'dark_energy', name: 'Dark Energy Tap', description: '+25% ship speed by tapping dark energy', type: 'passive_combat', unlockLevel: 15, value: 25 },
      { id: 'null_field', name: 'Null Field', description: 'Create a field that nullifies enemy shields', type: 'ultimate', unlockLevel: 20, value: 100 },
    ],
  },

  // ── DIPLOMATS ─────────────────────────────────────────────────────────────
  {
    id: 'diplomat_zara',
    name: 'Zara Solenne',
    title: 'Silver Tongue',
    class: 'diplomat',
    rarity: 'epic',
    icon: '🤝',
    portrait: '👩‍💼',
    backstory: 'Ended three interstellar wars through negotiation alone. Rumored to have psychic empathy abilities.',
    specialization: 'Alliance Building',
    recruitCost: 3200,
    rarityColor: RARITY_COLORS.epic,
    baseStats: { combat: 2, leadership: 8, intelligence: 8, charisma: 10, endurance: 5 },
    abilities: [
      { id: 'charm_offensive', name: 'Charm Offensive', description: '+2 diplomacy with all empires per turn', type: 'passive_economy', unlockLevel: 1, value: 2 },
      { id: 'trade_mastery', name: 'Trade Mastery', description: '+30% income from trade routes', type: 'passive_economy', unlockLevel: 5, value: 30 },
      { id: 'emergency_talks', name: 'Emergency Talks', description: 'Instantly end a war with one empire', type: 'active_diplomacy', unlockLevel: 10, cooldown: 600, value: 0 },
      { id: 'propaganda', name: 'Propaganda Network', description: 'Reduce enemy empire power by 20% for 3 turns', type: 'active_diplomacy', unlockLevel: 15, cooldown: 300, value: 20 },
      { id: 'galactic_accord', name: 'Galactic Accord', description: 'Form a mega-alliance with 3+ empires simultaneously', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },

  // ── ENGINEERS ─────────────────────────────────────────────────────────────
  {
    id: 'engineer_kael',
    name: 'Kael Ironforge',
    title: 'Master Builder',
    class: 'engineer',
    rarity: 'rare',
    icon: '⚙️',
    portrait: '👷',
    backstory: 'Built the first Dyson sphere prototype in 40 years. Can hear machines speak to him, he claims.',
    specialization: 'Mega-Structures',
    recruitCost: 2000,
    rarityColor: RARITY_COLORS.rare,
    baseStats: { combat: 4, leadership: 6, intelligence: 8, charisma: 5, endurance: 9 },
    abilities: [
      { id: 'swift_build', name: 'Swift Construction', description: '-30% build time for all structures', type: 'passive_economy', unlockLevel: 1, value: 30 },
      { id: 'cost_reduction', name: 'Material Efficiency', description: '-20% resource cost for wonders', type: 'passive_economy', unlockLevel: 5, value: 20 },
      { id: 'emergency_repair', name: 'Emergency Repair', description: 'Instantly repair a damaged ship or structure', type: 'active_economy', unlockLevel: 10, cooldown: 120, value: 100 },
      { id: 'overclock', name: 'Overclock', description: '+50% production on a colony for 2 turns', type: 'active_economy', unlockLevel: 15, cooldown: 240, value: 50 },
      { id: 'wonder_mastery', name: 'Wonder Mastery', description: 'Build any wonder at half cost and time', type: 'ultimate', unlockLevel: 20, value: 50 },
    ],
  },

  // ── SPIES ─────────────────────────────────────────────────────────────────
  {
    id: 'spy_shade',
    name: 'Agent Shade',
    title: 'Ghost of the Galaxy',
    class: 'spy',
    rarity: 'epic',
    icon: '🕵️',
    portrait: '🥷',
    backstory: 'Real name unknown. Works for whoever pays most, currently employed by your empire. Has infiltrated every known empire.',
    specialization: 'Intelligence & Sabotage',
    recruitCost: 3500,
    rarityColor: RARITY_COLORS.epic,
    baseStats: { combat: 7, leadership: 4, intelligence: 10, charisma: 6, endurance: 8 },
    abilities: [
      { id: 'deep_cover', name: 'Deep Cover', description: '+40% intel on all enemy empires', type: 'passive_economy', unlockLevel: 1, value: 40 },
      { id: 'sabotage', name: 'Sabotage', description: 'Disable an enemy structure for 3 turns', type: 'active_diplomacy', unlockLevel: 5, cooldown: 300, value: 0 },
      { id: 'steal_tech', name: 'Tech Theft', description: 'Steal one tech from an enemy empire', type: 'active_diplomacy', unlockLevel: 10, cooldown: 600, value: 0 },
      { id: 'assassinate', name: 'Assassination', description: 'Remove an enemy hero from play for 5 turns', type: 'active_diplomacy', unlockLevel: 15, cooldown: 900, value: 0 },
      { id: 'ghost_protocol', name: 'Ghost Protocol', description: 'Make your empire invisible on enemy maps for 5 turns', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },

  // ── COLONISTS ─────────────────────────────────────────────────────────────
  {
    id: 'colonist_terra',
    name: 'Terra Bloom',
    title: 'World Shaper',
    class: 'colonist',
    rarity: 'rare',
    icon: '🌱',
    portrait: '🧑‍🌾',
    backstory: 'Has successfully colonized 47 worlds including a lava planet and a storm world. Pioneer of terraforming technology.',
    specialization: 'Terraforming',
    recruitCost: 1500,
    rarityColor: RARITY_COLORS.rare,
    baseStats: { combat: 3, leadership: 7, intelligence: 7, charisma: 8, endurance: 10 },
    abilities: [
      { id: 'rapid_colony', name: 'Rapid Settlement', description: '-40% time to establish new colonies', type: 'passive_economy', unlockLevel: 1, value: 40 },
      { id: 'terraforming', name: 'Terraforming', description: '+30% habitability on any planet type', type: 'aura_colony', unlockLevel: 5, value: 30 },
      { id: 'population_boom', name: 'Population Boom', description: 'Double colony growth rate for 2 turns', type: 'active_economy', unlockLevel: 10, cooldown: 180, value: 100 },
      { id: 'hostile_worlds', name: 'Hostile World Pioneer', description: 'Can colonize void, plasma, and pulsed planets', type: 'passive_economy', unlockLevel: 15, value: 0 },
      { id: 'world_creation', name: 'World Creation', description: 'Terraform a barren planet into paradise class', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },

  // ── WARLORDS ──────────────────────────────────────────────────────────────
  {
    id: 'warlord_kron',
    name: 'Kron the Undefeated',
    title: 'Blood Sovereign',
    class: 'warlord',
    rarity: 'mythic',
    icon: '⚔️',
    portrait: '🦾',
    backstory: 'An ancient warrior who has fought for 400 years using life-extension tech. Has never lost a ground battle.',
    specialization: 'Invasion & Conquest',
    recruitCost: 8000,
    rarityColor: RARITY_COLORS.mythic,
    baseStats: { combat: 10, leadership: 10, intelligence: 6, charisma: 7, endurance: 10 },
    abilities: [
      { id: 'shock_troops', name: 'Shock Troops', description: '+50% ground assault damage', type: 'passive_combat', unlockLevel: 1, value: 50 },
      { id: 'war_economy', name: 'War Economy', description: '+20% resource plunder from conquered planets', type: 'passive_economy', unlockLevel: 5, value: 20 },
      { id: 'orbital_drop', name: 'Orbital Drop Strike', description: 'Land troops instantly bypassing orbital defense', type: 'active_combat', unlockLevel: 10, cooldown: 240, value: 0 },
      { id: 'berserker', name: 'Berserker Mode', description: '+200% combat power, -50% defense for 20s', type: 'active_combat', unlockLevel: 15, cooldown: 300, value: 200 },
      { id: 'endless_war', name: 'Endless War', description: 'Troops never retreat, gain +100% HP when cornered', type: 'ultimate', unlockLevel: 20, value: 100 },
    ],
  },

  // ── ORACLES ───────────────────────────────────────────────────────────────
  {
    id: 'oracle_seraph',
    name: 'Seraphina Void',
    title: 'The Eternal Seer',
    class: 'oracle',
    rarity: 'mythic',
    icon: '🔮',
    portrait: '🧿',
    backstory: 'Claims to be from the future. Her predictions have never been wrong. Her very presence alters probability fields.',
    specialization: 'Galactic Events',
    recruitCost: 10000,
    rarityColor: RARITY_COLORS.mythic,
    baseStats: { combat: 5, leadership: 8, intelligence: 10, charisma: 9, endurance: 7 },
    abilities: [
      { id: 'foresight', name: 'Foresight', description: 'Preview all galactic events 5 turns before they occur', type: 'passive_economy', unlockLevel: 1, value: 0 },
      { id: 'fate_weaving', name: 'Fate Weaving', description: '+25% chance of positive outcomes on all events', type: 'passive_economy', unlockLevel: 5, value: 25 },
      { id: 'timeline_shift', name: 'Timeline Shift', description: 'Reroll any galactic event outcome', type: 'active_economy', unlockLevel: 10, cooldown: 600, value: 0 },
      { id: 'probability_storm', name: 'Probability Storm', description: 'Cause confusion in enemy empire for 3 turns', type: 'active_diplomacy', unlockLevel: 15, cooldown: 480, value: 0 },
      { id: 'nexus', name: 'Nexus of Fate', description: 'Control any galactic event outcome completely', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },

  // ── BONUS HEROES (common/rare) ────────────────────────────────────────────
  {
    id: 'engineer_bolt',
    name: 'Bolt Rachen',
    title: 'The Mechanic',
    class: 'engineer',
    rarity: 'common',
    icon: '⚙️',
    portrait: '🔧',
    backstory: 'A no-nonsense mechanic from the Outer Rim. Keeps fleets running at peak efficiency.',
    specialization: 'Fleet Maintenance',
    recruitCost: 500,
    rarityColor: RARITY_COLORS.common,
    baseStats: { combat: 3, leadership: 4, intelligence: 6, charisma: 3, endurance: 8 },
    abilities: [
      { id: 'maintenance', name: 'Fast Maintenance', description: '-25% repair time for ships', type: 'passive_economy', unlockLevel: 1, value: 25 },
      { id: 'fuel_eff', name: 'Fuel Efficiency', description: '+15% ship range', type: 'passive_combat', unlockLevel: 5, value: 15 },
      { id: 'quick_fix', name: 'Quick Fix', description: 'Restore 30% HP to any ship', type: 'active_economy', unlockLevel: 10, cooldown: 90, value: 30 },
      { id: 'overhaul', name: 'Full Overhaul', description: 'Restore a damaged ship to 100%', type: 'active_economy', unlockLevel: 15, cooldown: 300, value: 100 },
      { id: 'fleet_forge', name: 'Fleet Forge', description: 'Build a new ship instantly', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },
  {
    id: 'colonist_river',
    name: 'River Dusk',
    title: 'The Wanderer',
    class: 'colonist',
    rarity: 'common',
    icon: '🌱',
    portrait: '🧑‍🚀',
    backstory: 'Left the core worlds to settle the frontier. Survived on 9 hostile worlds before joining your cause.',
    specialization: 'Survival & Adaptation',
    recruitCost: 400,
    rarityColor: RARITY_COLORS.common,
    baseStats: { combat: 4, leadership: 5, intelligence: 5, charisma: 6, endurance: 9 },
    abilities: [
      { id: 'adapt', name: 'Adaptation', description: '+20% habitability on any planet', type: 'aura_colony', unlockLevel: 1, value: 20 },
      { id: 'scavenge', name: 'Scavenging', description: '+25% resource from unexplored planets', type: 'passive_economy', unlockLevel: 5, value: 25 },
      { id: 'emergency_settlement', name: 'Emergency Settlement', description: 'Establish a colony instantly on any planet', type: 'active_economy', unlockLevel: 10, cooldown: 240, value: 0 },
      { id: 'local_knowledge', name: 'Local Knowledge', description: 'Reveal all resources on current planet', type: 'active_economy', unlockLevel: 15, cooldown: 60, value: 0 },
      { id: 'chosen_world', name: 'Chosen World', description: 'Transform any planet into a capital-tier colony', type: 'ultimate', unlockLevel: 20, value: 0 },
    ],
  },
];

export const HERO_BY_ID: Record<string, HeroTemplate> = Object.fromEntries(
  HERO_TEMPLATES.map(h => [h.id, h])
);

export const XP_FOR_LEVEL = (level: number): number =>
  Math.floor(100 * Math.pow(1.5, level - 1));

export const TOTAL_XP_FOR_LEVEL = (level: number): number => {
  let total = 0;
  for (let l = 1; l < level; l++) total += XP_FOR_LEVEL(l);
  return total;
};
