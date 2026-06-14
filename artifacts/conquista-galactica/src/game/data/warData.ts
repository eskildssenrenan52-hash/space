// ============================================================================
// WAR DATA — Expanded roster with 5 tiers, power score, traits, damage/armor
// types, rarity, abilities, loot tables, and recruitment economy.
// ============================================================================

export interface ReconTool {
  id: string;
  name: string;
  icon: string;
  cost: number;
  intelGain: number;
  stealth: number;
  desc: string;
}

export const RECON_TOOLS: ReconTool[] = [
  { id: 'probe',        name: 'Sonda Orbital',      icon: '🛰️',  cost: 300,  intelGain: 15, stealth: 0.50, desc: 'Revela estruturas básicas e recursos.' },
  { id: 'spy_sat',      name: 'Satélite Espião',    icon: '📡',  cost: 800,  intelGain: 25, stealth: 0.60, desc: 'Mapeia rotas logísticas e depósitos.' },
  { id: 'stealth_drone',name: 'Drone Furtivo',      icon: '🦇',  cost: 1200, intelGain: 30, stealth: 0.85, desc: 'Penetra defesas e revela hangares.' },
  { id: 'agent',        name: 'Agente Infiltrado',  icon: '🕵️', cost: 2000, intelGain: 40, stealth: 0.70, desc: 'Revela centros de comando e gargalos.' },
  { id: 'hacker',       name: 'Hacker Quântico',   icon: '💻',  cost: 2600, intelGain: 50, stealth: 0.65, desc: 'Acessa redes e expõe baterias de defesa.' },
  { id: 'war_ai',       name: 'IA de Guerra',       icon: '🧠',  cost: 4000, intelGain: 70, stealth: 0.90, desc: 'Análise total da infraestrutura inimiga.' },
  { id: 'ghost_net',    name: 'Rede Fantasma',      icon: '🕸️', cost: 6000, intelGain: 90, stealth: 0.95, desc: 'Infiltração silenciosa total. Revela tudo.' },
  { id: 'quantum_eye',  name: 'Olho Quântico',      icon: '👁️', cost: 9500, intelGain: 100, stealth: 0.98, desc: 'Visão multidimensional. Nenhum segredo resiste.' },
];

export interface Hero {
  id: string;
  name: string;
  title: string;
  icon: string;
  ability: string;
  bonus: { type: 'logistics' | 'bombard' | 'ground' | 'repair' | 'space' | 'stealth' | 'air' | 'morale' | 'quantum'; value: number };
  cost: number;
  rarity: 'rare' | 'epic' | 'legendary';
  backstory: string;
}

export const HEROES: Hero[] = [
  { id: 'h_vega',    name: 'Almirante Vega',     title: 'A Tempestade Orbital',   icon: '⭐', ability: '+25% dano orbital',             bonus: { type: 'space',    value: 0.25 }, cost: 5000,  rarity: 'legendary', backstory: 'Veterana de 40 batalhas espaciais. Nunca perdeu uma frota.' },
  { id: 'h_kael',    name: 'General Kael',       title: 'Punho de Ferro',         icon: '🎖️', ability: '+30% força terrestre',          bonus: { type: 'ground',   value: 0.30 }, cost: 4500,  rarity: 'epic',      backstory: 'Conquistou 12 planetas com tropas de menor número.' },
  { id: 'h_mira',    name: 'Cientista Mira',     title: 'A Engenheira',           icon: '🔧', ability: 'Reparos acelerados (-40% perdas)', bonus: { type: 'repair', value: 0.40 }, cost: 4000,  rarity: 'rare',      backstory: 'Inventou o escudo regenerativo que salvou a frota de Proxima.' },
  { id: 'h_tor',     name: 'Comandante Tor',     title: 'O Logístico',            icon: '📦', ability: '+35% saque de recursos',        bonus: { type: 'logistics', value: 0.35 }, cost: 3800, rarity: 'rare',      backstory: 'Mestro do abastecimento. Seus comboios nunca falham.' },
  { id: 'h_nyx',     name: 'Espectro Nyx',       title: 'A Sombra',               icon: '🌑', ability: '+50% eficiência furtiva',       bonus: { type: 'stealth',  value: 0.50 }, cost: 4200,  rarity: 'epic',      backstory: 'Ninguém sabe seu rosto. Só seus resultados.' },
  { id: 'h_drak',    name: 'Lorde Drak',         title: 'Devastador',             icon: '☄️', ability: '+45% dano de área orbital',     bonus: { type: 'bombard',  value: 0.45 }, cost: 6000,  rarity: 'legendary', backstory: 'Orbitou 7 planetas em cinzas. Chamado de "o Julgamento".' },
  { id: 'h_sera',    name: 'Capitã Sera',        title: 'A Asa Quebrada',         icon: '🦅', ability: '+35% supremacia aérea',         bonus: { type: 'air',      value: 0.35 }, cost: 4600,  rarity: 'epic',      backstory: 'Sobreviveu ao colapso do 3° Esquadrão. Voltou mais forte.' },
  { id: 'h_atlas',   name: 'Colossus Atlas',     title: 'O Inabalável',           icon: '🏔️', ability: '+40% moral das tropas em campo', bonus: { type: 'morale',  value: 0.40 }, cost: 5500,  rarity: 'legendary', backstory: 'Sua presença em campo duplica a resistência de qualquer unidade.' },
  { id: 'h_zera',    name: 'Dra. Zera',          title: 'A Mente Quântica',       icon: '🌀', ability: '+60% poder de computação quântica de guerra', bonus: { type: 'quantum', value: 0.60 }, cost: 8000, rarity: 'legendary', backstory: 'Ex-cientista do Projeto Singularidade. Calcula batalhas antes delas acontecerem.' },
];

export type DefenseStructureType =
  | 'command_center' | 'reactor' | 'shield_generator' | 'orbital_battery'
  | 'logistics_hub' | 'refinery' | 'ammo_depot' | 'comms_array'
  | 'research_center' | 'hangar' | 'flak_battery' | 'storage'
  | 'quantum_turret' | 'void_gate' | 'psi_amplifier';

export interface DefenseStructure {
  id: string;
  type: DefenseStructureType;
  name: string;
  icon: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
  effect: string;
}

export const DEFENSE_TYPE_INFO: Record<DefenseStructureType, { name: string; icon: string; effect: string; priority: number; armor: ArmorType }> = {
  command_center:   { name: 'Centro Administrativo Planetário', icon: '🏛️', effect: 'Comando inimigo colapsa',             priority: 5, armor: 'fortified' },
  reactor:          { name: 'Reator',                          icon: '☢️', effect: 'Causa apagão geral',                  priority: 4, armor: 'heavy' },
  shield_generator: { name: 'Gerador de Escudo',               icon: '🛡️', effect: 'Derruba o escudo planetário',         priority: 4, armor: 'shielded' },
  orbital_battery:  { name: 'Bateria Orbital',                 icon: '💥', effect: 'Facilita o desembarque',              priority: 5, armor: 'heavy' },
  logistics_hub:    { name: 'Centro Logístico',                icon: '📦', effect: 'Interrompe abastecimento',            priority: 3, armor: 'light' },
  refinery:         { name: 'Refinaria',                       icon: '⚗️', effect: 'Reduz produção inimiga',             priority: 3, armor: 'medium' },
  ammo_depot:       { name: 'Depósito de Munição',             icon: '💣', effect: 'Explosões secundárias devastadoras',  priority: 3, armor: 'light' },
  comms_array:      { name: 'Centro de Comunicações',          icon: '📡', effect: 'Reduz coordenação defensiva',         priority: 2, armor: 'light' },
  research_center:  { name: 'Centro de Pesquisa',              icon: '🔬', effect: 'Atrasa avanço tecnológico',           priority: 2, armor: 'medium' },
  hangar:           { name: 'Hangar',                          icon: '🛩️', effect: 'Elimina reforços aéreos',            priority: 2, armor: 'medium' },
  flak_battery:     { name: 'Bateria Antiaérea',               icon: '🎯', effect: 'Abre o céu para drones',             priority: 2, armor: 'medium' },
  storage:          { name: 'Depósito de Recursos',            icon: '🏦', effect: 'Permite saque de recursos',          priority: 1, armor: 'light' },
  quantum_turret:   { name: 'Torre Quântica',                  icon: '⚛️', effect: 'Distorce espaço — desativa 30% das tropas', priority: 5, armor: 'shielded' },
  void_gate:        { name: 'Portão do Vazio',                 icon: '🌀', effect: 'Teletransporta reforços instantaneamente', priority: 4, armor: 'heavy' },
  psi_amplifier:    { name: 'Amplificador Psiônico',           icon: '🔮', effect: 'Causa pânico — deserção em massa', priority: 3, armor: 'light' },
};

export type BattleLayer = 'space' | 'atmosphere' | 'landing' | 'urban';
export const BATTLE_LAYERS: BattleLayer[] = ['space', 'atmosphere', 'landing', 'urban'];

export const LAYER_INFO: Record<BattleLayer, { name: string; icon: string; desc: string; color: string }> = {
  space:      { name: 'Combate Orbital',     icon: '🌌', desc: 'Destrua satélites e baterias orbitais.',  color: '#4f7cff' },
  atmosphere: { name: 'Combate Atmosférico', icon: '☁️',  desc: 'Domine os céus contra caças e flak.',    color: '#82b6ff' },
  landing:    { name: 'Desembarque',         icon: '🪂',  desc: 'Pouse tropas com naves de transporte.',   color: '#ff9560' },
  urban:      { name: 'Combate Urbano',      icon: '🏙️', desc: 'Capture estruturas e objetivos no solo.',  color: '#ff5060' },
};

export interface WarObjective { id: string; label: string; stars: number; }
export const STAR_OBJECTIVES: WarObjective[] = [
  { id: 'destroy_command',    label: 'Destruir o Centro Administrativo Planetário', stars: 1 },
  { id: 'capture_infra',      label: 'Capturar 50% da infraestrutura',              stars: 1 },
  { id: 'cripple_production', label: 'Interromper a produção industrial',           stars: 1 },
];

// ============================================================================
// LOOT TABLES — resources gained from successful battles
// ============================================================================
export interface LootTable {
  credits: [number, number];   // [min, max]
  resources: { resource: string; chance: number; amount: [number, number] }[];
  techFragments?: number;
}

export const LOOT_BY_tier: Record<number, LootTable> = {
  1: { credits: [200, 800],   resources: [{ resource: 'iron',    chance: 0.8, amount: [10, 50] }, { resource: 'fuel',  chance: 0.5, amount: [5, 25] }] },
  2: { credits: [800, 2500],  resources: [{ resource: 'titanium', chance: 0.7, amount: [5, 30] }, { resource: 'crystals', chance: 0.4, amount: [2, 15] }], techFragments: 1 },
  3: { credits: [2500, 8000], resources: [{ resource: 'rare_elements', chance: 0.6, amount: [3, 18] }, { resource: 'antimatter', chance: 0.3, amount: [1, 6] }], techFragments: 3 },
  4: { credits: [8000, 25000],resources: [{ resource: 'dark_matter', chance: 0.5, amount: [2, 10] }, { resource: 'helium3', chance: 0.6, amount: [5, 20] }], techFragments: 8 },
  5: { credits: [25000, 80000], resources: [{ resource: 'dark_matter', chance: 0.9, amount: [10, 40] }, { resource: 'antimatter', chance: 0.8, amount: [5, 20] }], techFragments: 20 },
};

// ============================================================================
// UNITS — Massively expanded with 5 tiers, rarity, damage/armor, abilities
// ============================================================================

export type DamageType  = 'kinetic' | 'energy' | 'explosive' | 'plasma' | 'emp' | 'void' | 'psionic';
export type ArmorType   = 'light' | 'medium' | 'heavy' | 'shielded' | 'fortified' | 'void_hardened';
export type UnitRole    = 'assault' | 'tank' | 'support' | 'artillery' | 'scout' | 'capital' | 'special' | 'siege';
export type UnitRarity  = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';
export type Visual3D    =
  | 'interceptor' | 'destroyer' | 'cruiser' | 'dreadnought' | 'titan_ship'
  | 'fighter' | 'bomber' | 'gunship' | 'stealth_wing' | 'void_wing'
  | 'dropship' | 'lander' | 'orbital_paratrooper' | 'siege_walker'
  | 'marine' | 'commando' | 'warbot' | 'tank' | 'mech' | 'titan' | 'artillery'
  | 'quantum_walker' | 'void_entity' | 'psi_warrior';

export interface UnitAbility {
  id: string;
  name: string;
  desc: string;
  trigger: 'volley' | 'pierce' | 'splash' | 'shield_break' | 'first_strike' | 'regen' | 'cloak' | 'siege' | 'aa' | 'overcharge' | 'void_rift' | 'psi_blast' | 'quantum_leap';
  value: number;
}

export interface UnitType {
  id: string;
  name: string;
  icon: string;
  visual: Visual3D;
  layer: BattleLayer;
  role: UnitRole;
  rarity: UnitRarity;
  tier: 1 | 2 | 3 | 4 | 5;
  attack: number;
  hp: number;
  damageType: DamageType;
  armor: ArmorType;
  speed: number;
  range: number;
  cost: number;
  trainTime: number;
  upkeep: number;
  abilities: UnitAbility[];
  desc: string;
  color: string;
  /** Lore/flavor text */
  lore?: string;
}

// Helper: damage-vs-armor matrix
export const DAMAGE_MATRIX: Record<DamageType, Record<ArmorType, number>> = {
  kinetic:   { light: 1.20, medium: 1.00, heavy: 0.70, shielded: 0.55, fortified: 0.60, void_hardened: 0.40 },
  energy:    { light: 0.90, medium: 1.05, heavy: 1.10, shielded: 0.45, fortified: 0.80, void_hardened: 0.60 },
  explosive: { light: 1.30, medium: 1.15, heavy: 0.95, shielded: 0.70, fortified: 1.20, void_hardened: 0.50 },
  plasma:    { light: 1.00, medium: 1.20, heavy: 1.30, shielded: 0.85, fortified: 1.10, void_hardened: 0.70 },
  emp:       { light: 0.50, medium: 0.60, heavy: 0.70, shielded: 1.60, fortified: 0.40, void_hardened: 0.80 },
  void:      { light: 1.50, medium: 1.40, heavy: 1.20, shielded: 1.10, fortified: 1.30, void_hardened: 0.30 },
  psionic:   { light: 1.20, medium: 1.10, heavy: 0.90, shielded: 0.80, fortified: 1.00, void_hardened: 1.50 },
};

export const ASSAULT_UNITS: UnitType[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // SPACE LAYER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'u_interceptor', name: 'Interceptador', icon: '🚀', visual: 'interceptor', layer: 'space', role: 'scout',
    rarity: 'common', tier: 1, attack: 14, hp: 40, damageType: 'kinetic', armor: 'light', speed: 9, range: 5, cost: 400, trainTime: 8, upkeep: 0.5,
    abilities: [{ id: 'fs', name: 'Primeiro Golpe', desc: '+15% dano no primeiro turno', trigger: 'first_strike', value: 0.15 }],
    desc: 'Caça rápido de superioridade orbital. Frágil mas ataca primeiro.',
    color: '#22d3ee',
    lore: 'Produzido em massa nos estaleiros da Borda Externa.',
  },
  {
    id: 'u_corvette', name: 'Corveta Pulsar', icon: '🛰️', visual: 'interceptor', layer: 'space', role: 'assault',
    rarity: 'common', tier: 2, attack: 22, hp: 70, damageType: 'energy', armor: 'medium', speed: 7, range: 6, cost: 750, trainTime: 14, upkeep: 1,
    abilities: [{ id: 'sb', name: 'Quebra-Escudo', desc: '+50% dano contra escudos', trigger: 'shield_break', value: 0.5 }],
    desc: 'Especialista em abater geradores de escudo orbital.',
    color: '#38bdf8',
  },
  {
    id: 'u_destroyer', name: 'Destróier Predador', icon: '🛸', visual: 'destroyer', layer: 'space', role: 'assault',
    rarity: 'rare', tier: 2, attack: 30, hp: 90, damageType: 'kinetic', armor: 'medium', speed: 6, range: 6, cost: 1200, trainTime: 22, upkeep: 1.5,
    abilities: [{ id: 'vol', name: 'Salva Tripla', desc: 'Dispara em 3 alvos por turno', trigger: 'volley', value: 3 }],
    desc: 'Cavalo de batalha orbital. Múltiplas torres independentes.',
    color: '#6366f1',
  },
  {
    id: 'u_cruiser', name: 'Cruzador Pesado', icon: '⚓', visual: 'cruiser', layer: 'space', role: 'tank',
    rarity: 'rare', tier: 3, attack: 55, hp: 220, damageType: 'plasma', armor: 'heavy', speed: 4, range: 7, cost: 3200, trainTime: 60, upkeep: 4,
    abilities: [{ id: 'pierce', name: 'Perfurador', desc: '30% do dano ignora armadura', trigger: 'pierce', value: 0.3 }],
    desc: 'Aríete blindado, perfura blindagens grossas com plasma.',
    color: '#8b5cf6',
  },
  {
    id: 'u_carrier', name: 'Porta-Naves Behemoth', icon: '🛳️', visual: 'cruiser', layer: 'space', role: 'support',
    rarity: 'epic', tier: 3, attack: 30, hp: 400, damageType: 'energy', armor: 'heavy', speed: 2, range: 8, cost: 7500, trainTime: 120, upkeep: 8,
    abilities: [
      { id: 'vol', name: 'Lança Esquadrões', desc: 'Lança 4 interceptadores por turno', trigger: 'volley', value: 4 },
      { id: 'reg', name: 'Docas de Reparo', desc: 'Repara 4% HP de aliados/turno', trigger: 'regen', value: 0.04 },
    ],
    desc: 'Plataforma móvel de lançamento. Leva esquadrões ao combate orbital.',
    color: '#0891b2',
    lore: 'Cada Behemoth pode lançar mais de 500 caças antes de recarregar.',
  },
  {
    id: 'u_dreadnought', name: 'Dreadnought "Sol Negro"', icon: '🌑', visual: 'dreadnought', layer: 'space', role: 'capital',
    rarity: 'legendary', tier: 4, attack: 140, hp: 600, damageType: 'plasma', armor: 'fortified', speed: 2, range: 9, cost: 12000, trainTime: 240, upkeep: 18,
    abilities: [
      { id: 'sup', name: 'Canhão Solar', desc: 'Splash 40% em alvos próximos', trigger: 'splash', value: 0.4 },
      { id: 'fs',  name: 'Doutrina de Salva', desc: '+20% dano de abertura', trigger: 'first_strike', value: 0.2 },
    ],
    desc: 'Nave capital lendária. Uma só vira o curso de uma batalha.',
    color: '#f59e0b',
    lore: '"Sol Negro" destruiu a 7ª Frota Imperial sozinha sobre Kepler-442.',
  },
  {
    id: 'u_voidcrusher', name: 'Cruzador do Vazio "Abismo"', icon: '🕳️', visual: 'titan_ship', layer: 'space', role: 'capital',
    rarity: 'mythic', tier: 5, attack: 280, hp: 1400, damageType: 'void', armor: 'void_hardened', speed: 1, range: 12, cost: 45000, trainTime: 720, upkeep: 55,
    abilities: [
      { id: 'void_rift', name: 'Ruptura do Vazio', desc: 'Cria uma fissura dimensional que absorve 60% dos projéteis inimigos', trigger: 'void_rift', value: 0.6 },
      { id: 'spl', name: 'Cascata Dimensional', desc: 'Splash 80% — aniquila esquadrões inteiros', trigger: 'splash', value: 0.8 },
      { id: 'reg', name: 'Matéria Escura', desc: 'Regenera 6% HP/turno de matéria escura absorvida', trigger: 'regen', value: 0.06 },
    ],
    desc: 'Lenda viva. Diz-se que surgiu do vazio entre as galáxias.',
    color: '#7c3aed',
    lore: 'Classificado como arma de destruição em massa por 6 impérios galácticos.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // ATMOSPHERE LAYER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'u_fighter', name: 'Caça Atmosférico', icon: '✈️', visual: 'fighter', layer: 'atmosphere', role: 'assault',
    rarity: 'common', tier: 1, attack: 18, hp: 50, damageType: 'kinetic', armor: 'light', speed: 10, range: 4, cost: 600, trainTime: 10, upkeep: 0.7,
    abilities: [{ id: 'aa', name: 'Caça AA', desc: '+40% dano contra unidades aéreas inimigas', trigger: 'aa', value: 0.4 }],
    desc: 'Caça de superioridade aérea. Ágil em dogfights.',
    color: '#3b82f6',
  },
  {
    id: 'u_gunship', name: 'Canhoneira de Ataque', icon: '🚁', visual: 'gunship', layer: 'atmosphere', role: 'support',
    rarity: 'common', tier: 2, attack: 26, hp: 100, damageType: 'explosive', armor: 'medium', speed: 6, range: 5, cost: 1100, trainTime: 18, upkeep: 1.2,
    abilities: [{ id: 'spl', name: 'Foguetes em Salva', desc: 'Splash 25% em estruturas leves', trigger: 'splash', value: 0.25 }],
    desc: 'Apoio aéreo persistente. Devasta concentrações inimigas.',
    color: '#0ea5e9',
  },
  {
    id: 'u_bomber', name: 'Bombardeiro Pesado', icon: '🛩️', visual: 'bomber', layer: 'atmosphere', role: 'artillery',
    rarity: 'rare', tier: 3, attack: 40, hp: 60, damageType: 'explosive', armor: 'light', speed: 5, range: 8, cost: 1400, trainTime: 28, upkeep: 1.8,
    abilities: [{ id: 'siege', name: 'Carga de Demolição', desc: '+60% dano em estruturas', trigger: 'siege', value: 0.6 }],
    desc: 'Carga útil massiva. Excelente contra fortificações fixas.',
    color: '#64748b',
  },
  {
    id: 'u_stealth', name: 'Asa Fantasma', icon: '🦇', visual: 'stealth_wing', layer: 'atmosphere', role: 'special',
    rarity: 'epic', tier: 3, attack: 35, hp: 70, damageType: 'emp', armor: 'light', speed: 8, range: 6, cost: 2400, trainTime: 50, upkeep: 3,
    abilities: [
      { id: 'cloak', name: 'Camuflagem Stealth', desc: '50% chance de evitar AA inimiga', trigger: 'cloak', value: 0.5 },
      { id: 'emp',   name: 'Pulso EMP', desc: 'Devasta escudos com EMP', trigger: 'shield_break', value: 0.8 },
    ],
    desc: 'Penetra defesas indetectado e desativa escudos.',
    color: '#475569',
  },
  {
    id: 'u_stormwing', name: 'Caça da Tempestade', icon: '⚡', visual: 'void_wing', layer: 'atmosphere', role: 'assault',
    rarity: 'epic', tier: 4, attack: 80, hp: 130, damageType: 'plasma', armor: 'medium', speed: 12, range: 7, cost: 5500, trainTime: 90, upkeep: 6,
    abilities: [
      { id: 'overcharge', name: 'Sobrecarga de Plasma', desc: '+80% dano no próximo ataque acumulado', trigger: 'overcharge', value: 0.8 },
      { id: 'aa', name: 'Superioridade Total', desc: '+60% dano contra aeronaves inimigas', trigger: 'aa', value: 0.6 },
    ],
    desc: 'Lendário na atmosfera. Nenhum inimigo voador escapa.',
    color: '#f59e0b',
    lore: 'Os pilotos da Tempestade fazem voto de nunca pousar até a batalha terminar.',
  },
  {
    id: 'u_void_wing', name: 'Asa do Vazio', icon: '🌪️', visual: 'void_wing', layer: 'atmosphere', role: 'special',
    rarity: 'mythic', tier: 5, attack: 160, hp: 200, damageType: 'void', armor: 'void_hardened', speed: 15, range: 10, cost: 18000, trainTime: 300, upkeep: 22,
    abilities: [
      { id: 'void_rift', name: 'Fenda Dimensional', desc: 'Teletransporta para trás das linhas inimigas', trigger: 'void_rift', value: 0.9 },
      { id: 'cloak', name: 'Invisibilidade do Vazio', desc: 'Invulnerável no primeiro turno', trigger: 'cloak', value: 1.0 },
    ],
    desc: 'Ser do vazio interdimensional. Redefine o combate atmosférico.',
    color: '#6d28d9',
    lore: 'Capturado em uma anomalia dimensional. Domesticado — de alguma forma.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // LANDING LAYER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'u_dropship', name: 'Nave de Desembarque', icon: '🪂', visual: 'dropship', layer: 'landing', role: 'support',
    rarity: 'common', tier: 1, attack: 6, hp: 120, damageType: 'kinetic', armor: 'medium', speed: 7, range: 2, cost: 1000, trainTime: 16, upkeep: 1,
    abilities: [{ id: 'reg', name: 'Casco Reforçado', desc: 'Recupera 5% HP por turno', trigger: 'regen', value: 0.05 }],
    desc: 'Transporta tropas e dá apoio leve durante o pouso.',
    color: '#10b981',
  },
  {
    id: 'u_lander', name: 'Cápsula de Assalto', icon: '💥', visual: 'lander', layer: 'landing', role: 'assault',
    rarity: 'rare', tier: 2, attack: 18, hp: 90, damageType: 'explosive', armor: 'medium', speed: 9, range: 1, cost: 1400, trainTime: 22, upkeep: 1.4,
    abilities: [{ id: 'fs', name: 'Aterrissagem Cinética', desc: '+40% dano no impacto inicial', trigger: 'first_strike', value: 0.4 }],
    desc: 'Cai do céu como meteoro e abre brechas defensivas.',
    color: '#f97316',
  },
  {
    id: 'u_paratrooper', name: 'Paraquedista Orbital', icon: '🪖', visual: 'orbital_paratrooper', layer: 'landing', role: 'scout',
    rarity: 'rare', tier: 2, attack: 22, hp: 75, damageType: 'kinetic', armor: 'light', speed: 8, range: 3, cost: 1100, trainTime: 18, upkeep: 1.1,
    abilities: [{ id: 'cloak', name: 'Inserção Furtiva', desc: '40% chance de ignorar primeira salva inimiga', trigger: 'cloak', value: 0.4 }],
    desc: 'Tropas de elite lançadas direto da órbita.',
    color: '#84cc16',
  },
  {
    id: 'u_siege_walker', name: 'Marchador de Cerco', icon: '🦿', visual: 'siege_walker', layer: 'landing', role: 'siege',
    rarity: 'epic', tier: 3, attack: 65, hp: 250, damageType: 'explosive', armor: 'heavy', speed: 3, range: 6, cost: 4500, trainTime: 80, upkeep: 5,
    abilities: [
      { id: 'siege', name: 'Morteiro de Cerco', desc: '+90% dano em estruturas', trigger: 'siege', value: 0.9 },
      { id: 'spl', name: 'Bombardeio Massivo', desc: 'Splash 40%', trigger: 'splash', value: 0.4 },
    ],
    desc: 'Máquina de cerco andante. Destrói muros antes de as tropas avançarem.',
    color: '#dc2626',
    lore: 'Inventado após o Cerco de Nova Roma, que durou 3 anos sem um.',
  },
  {
    id: 'u_quantum_lander', name: 'Módulo Quântico de Assalto', icon: '🌀', visual: 'lander', layer: 'landing', role: 'special',
    rarity: 'mythic', tier: 5, attack: 200, hp: 500, damageType: 'void', armor: 'void_hardened', speed: 20, range: 5, cost: 30000, trainTime: 600, upkeep: 40,
    abilities: [
      { id: 'quantum_leap', name: 'Salto Quântico', desc: 'Teleporta instantaneamente dentro das defesas inimigas', trigger: 'quantum_leap', value: 1.0 },
      { id: 'void_rift', name: 'Cratera do Vazio', desc: 'Cria zona de dano permanente que drena HP inimigo', trigger: 'void_rift', value: 0.5 },
    ],
    desc: 'Teletransporta-se através das defesas. Impossível de interceptar.',
    color: '#7c3aed',
    lore: 'Desenvolvido em segredo pelo Projeto Void. Só 12 unidades existem.',
  },

  // ══════════════════════════════════════════════════════════════════════════
  // URBAN LAYER
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: 'u_marine', name: 'Tropa de Choque', icon: '🪖', visual: 'marine', layer: 'urban', role: 'assault',
    rarity: 'common', tier: 1, attack: 16, hp: 35, damageType: 'kinetic', armor: 'light', speed: 6, range: 3, cost: 300, trainTime: 6, upkeep: 0.3,
    abilities: [],
    desc: 'Infantaria padrão. Barata, abundante e versátil.',
    color: '#dc2626',
  },
  {
    id: 'u_commando', name: 'Comando de Elite', icon: '🥷', visual: 'commando', layer: 'urban', role: 'special',
    rarity: 'epic', tier: 3, attack: 38, hp: 75, damageType: 'explosive', armor: 'medium', speed: 8, range: 4, cost: 1800, trainTime: 36, upkeep: 2.4,
    abilities: [
      { id: 'fs',    name: 'Emboscada', desc: '+50% dano na primeira troca', trigger: 'first_strike', value: 0.5 },
      { id: 'pierce', name: 'Sabotador', desc: '25% do dano ignora armadura', trigger: 'pierce', value: 0.25 },
    ],
    desc: 'Operadores de elite. Caros mas mortais.',
    color: '#a855f7',
  },
  {
    id: 'u_warbot', name: 'Robô de Guerra Mk.III', icon: '🤖', visual: 'warbot', layer: 'urban', role: 'assault',
    rarity: 'rare', tier: 2, attack: 28, hp: 70, damageType: 'energy', armor: 'medium', speed: 5, range: 4, cost: 800, trainTime: 16, upkeep: 1,
    abilities: [{ id: 'reg', name: 'Auto-reparo', desc: 'Recupera 3% HP por turno', trigger: 'regen', value: 0.03 }],
    desc: 'Bípede de combate autônomo. Confiável em qualquer cenário.',
    color: '#06b6d4',
  },
  {
    id: 'u_tank', name: 'Tanque de Assalto "Colossus"', icon: '🛻', visual: 'tank', layer: 'urban', role: 'tank',
    rarity: 'rare', tier: 2, attack: 36, hp: 180, damageType: 'kinetic', armor: 'heavy', speed: 3, range: 5, cost: 1500, trainTime: 30, upkeep: 2,
    abilities: [{ id: 'pierce', name: 'APFSDS', desc: '40% perfurante', trigger: 'pierce', value: 0.4 }],
    desc: 'Tanque pesado. Anula tropas leves no contato.',
    color: '#7c2d12',
  },
  {
    id: 'u_mech', name: 'Mech "Golias"', icon: '🦾', visual: 'mech', layer: 'urban', role: 'tank',
    rarity: 'epic', tier: 3, attack: 55, hp: 280, damageType: 'plasma', armor: 'heavy', speed: 4, range: 5, cost: 3000, trainTime: 60, upkeep: 4,
    abilities: [
      { id: 'spl',  name: 'Mini-Splash', desc: 'Splash 20%', trigger: 'splash', value: 0.2 },
      { id: 'siege', name: 'Demolidor', desc: '+30% contra fortificações', trigger: 'siege', value: 0.3 },
    ],
    desc: 'Bípede pesado com canhão de plasma e blindagem reativa.',
    color: '#facc15',
  },
  {
    id: 'u_artillery', name: 'Artilharia "Long Tom"', icon: '💥', visual: 'artillery', layer: 'urban', role: 'artillery',
    rarity: 'rare', tier: 3, attack: 70, hp: 95, damageType: 'explosive', armor: 'light', speed: 2, range: 10, cost: 2400, trainTime: 45, upkeep: 2.5,
    abilities: [
      { id: 'spl',  name: 'Tiro de Saturação', desc: 'Splash 50%', trigger: 'splash', value: 0.5 },
      { id: 'siege', name: 'Devastação', desc: '+50% dano em estruturas', trigger: 'siege', value: 0.5 },
    ],
    desc: 'Artilharia de longo alcance. Devasta defesas sem entrar no fogo.',
    color: '#b45309',
  },
  {
    id: 'u_titan', name: 'Titã "Ragnarok"', icon: '⚙️', visual: 'titan', layer: 'urban', role: 'capital',
    rarity: 'legendary', tier: 4, attack: 160, hp: 800, damageType: 'plasma', armor: 'fortified', speed: 2, range: 7, cost: 14000, trainTime: 300, upkeep: 22,
    abilities: [
      { id: 'spl',  name: 'Pisada Sísmica', desc: 'Splash 60%', trigger: 'splash', value: 0.6 },
      { id: 'siege', name: 'Aniquilador', desc: '+80% dano em estruturas', trigger: 'siege', value: 0.8 },
      { id: 'reg',  name: 'Nanomáquinas', desc: 'Regenera 4% HP/turno', trigger: 'regen', value: 0.04 },
    ],
    desc: 'Caminhão de guerra colossal. A definição de superioridade terrestre.',
    color: '#ef4444',
    lore: '"Ragnarok" é o nome dado ao fim dos mundos. E esse vive à altura.',
  },
  {
    id: 'u_quantum_walker', name: 'Marchador Quântico', icon: '⚛️', visual: 'quantum_walker', layer: 'urban', role: 'special',
    rarity: 'legendary', tier: 4, attack: 130, hp: 450, damageType: 'void', armor: 'shielded', speed: 6, range: 8, cost: 20000, trainTime: 480, upkeep: 30,
    abilities: [
      { id: 'quantum_leap', name: 'Salto Quântico', desc: 'Pode atacar qualquer ponto do campo de batalha', trigger: 'quantum_leap', value: 1.0 },
      { id: 'psi_blast', name: 'Onda Psiônica', desc: 'Dano em área 70% psiônico', trigger: 'psi_blast', value: 0.7 },
      { id: 'reg', name: 'Campo de Força Reativo', desc: 'Regenera 8% HP/turno', trigger: 'regen', value: 0.08 },
    ],
    desc: 'Entidade do plano quântico materializada como arma de guerra.',
    color: '#8b5cf6',
    lore: 'Criado ao colapsar um buraco negro artificial em um chassi de combate.',
  },
  {
    id: 'u_void_titan', name: 'Titã do Vazio "Eschaton"', icon: '🌌', visual: 'void_entity', layer: 'urban', role: 'capital',
    rarity: 'mythic', tier: 5, attack: 400, hp: 2500, damageType: 'void', armor: 'void_hardened', speed: 3, range: 10, cost: 80000, trainTime: 1440, upkeep: 100,
    abilities: [
      { id: 'void_rift', name: 'Apocalipse do Vazio', desc: 'Cria uma zona de destruição total. Tudo dentro perde 20% HP/turno', trigger: 'void_rift', value: 0.2 },
      { id: 'spl', name: 'Extinção', desc: 'Splash 100% — dano total em área', trigger: 'splash', value: 1.0 },
      { id: 'reg', name: 'Imortalidade do Vazio', desc: 'Regenera 10% HP/turno de energia do vazio', trigger: 'regen', value: 0.10 },
      { id: 'pierce', name: 'Rasga Realidade', desc: '80% do dano ignora toda armadura', trigger: 'pierce', value: 0.8 },
    ],
    desc: 'O fim de tudo em forma de arma. Poucos impérios possuem. Menos ainda sobrevivem.',
    color: '#4c1d95',
    lore: 'Catalogado como "Evento de Extinção Nível 5". Proibido pelo Tratado de Andromeda.',
  },
  {
    id: 'u_psi_warrior', name: 'Guerreiro Psiônico', icon: '🔮', visual: 'psi_warrior', layer: 'urban', role: 'special',
    rarity: 'mythic', tier: 5, attack: 220, hp: 600, damageType: 'psionic', armor: 'void_hardened', speed: 8, range: 9, cost: 35000, trainTime: 900, upkeep: 50,
    abilities: [
      { id: 'psi_blast', name: 'Tormento Mental', desc: 'Dano psiônico ignora toda armadura física', trigger: 'psi_blast', value: 1.0 },
      { id: 'cloak', name: 'Invisibilidade Psiônica', desc: 'Imperceptível a sensores e visão', trigger: 'cloak', value: 0.95 },
      { id: 'quantum_leap', name: 'Dobra Cognitiva', desc: 'Ataca 3 alvos simultaneamente por turno', trigger: 'quantum_leap', value: 3 },
    ],
    desc: 'Ser de pura psiônica. Dissolve a vontade do inimigo antes de destruir seus corpos.',
    color: '#db2777',
    lore: 'Surgiu nos Campos de Treino Psiônicos de Arcadia. Categoria: Lenda Viva.',
  },
];

export const UNIT_BY_ID: Record<string, UnitType> = Object.fromEntries(ASSAULT_UNITS.map(u => [u.id, u]));

// ============================================================================
// POWER SCORE
// ============================================================================
export function computeUnitPower(u: UnitType): number {
  const offensive = u.attack * (1 + u.range * 0.04);
  const defensive = u.hp * 0.35;
  const mobility  = u.speed * 1.6;
  const abilityScore = u.abilities.reduce((sum, a) => {
    switch (a.trigger) {
      case 'volley':       return sum + a.value * 8;
      case 'pierce':       return sum + a.value * 30;
      case 'splash':       return sum + a.value * 40;
      case 'shield_break': return sum + a.value * 20;
      case 'first_strike': return sum + a.value * 25;
      case 'regen':        return sum + a.value * 200;
      case 'cloak':        return sum + a.value * 20;
      case 'siege':        return sum + a.value * 30;
      case 'aa':           return sum + a.value * 18;
      case 'overcharge':   return sum + a.value * 25;
      case 'void_rift':    return sum + a.value * 80;
      case 'psi_blast':    return sum + a.value * 60;
      case 'quantum_leap': return sum + a.value * 50;
      default:             return sum;
    }
  }, 0);
  const armorBonus = ({ light: 0, medium: 8, heavy: 18, shielded: 22, fortified: 30, void_hardened: 50 } as Record<ArmorType, number>)[u.armor];
  const rarityMult = ({ common: 1.0, rare: 1.05, epic: 1.12, legendary: 1.22, mythic: 1.45 } as Record<UnitRarity, number>)[u.rarity];
  return Math.round((offensive + defensive + mobility + abilityScore + armorBonus) * rarityMult);
}

export function computeArmyPower(stacks: { unitId: string; count: number }[]): number {
  return stacks.reduce((sum, s) => {
    const u = UNIT_BY_ID[s.unitId];
    if (!u) return sum;
    return sum + computeUnitPower(u) * s.count;
  }, 0);
}

export const RARITY_INFO: Record<UnitRarity, { label: string; color: string; ring: string; glow: string; bg: string }> = {
  common:    { label: 'Comum',     color: 'text-slate-300',   ring: 'ring-slate-500/40',    glow: 'shadow-slate-500/20',   bg: 'bg-slate-800/30' },
  rare:      { label: 'Raro',      color: 'text-sky-300',     ring: 'ring-sky-400/50',      glow: 'shadow-sky-500/30',     bg: 'bg-sky-900/20' },
  epic:      { label: 'Épico',     color: 'text-fuchsia-300', ring: 'ring-fuchsia-400/50',  glow: 'shadow-fuchsia-500/40', bg: 'bg-fuchsia-900/20' },
  legendary: { label: 'Lendário',  color: 'text-amber-300',   ring: 'ring-amber-400/60',    glow: 'shadow-amber-500/40',   bg: 'bg-amber-900/20' },
  mythic:    { label: 'Mítico',    color: 'text-violet-200',  ring: 'ring-violet-400/70',   glow: 'shadow-violet-500/60',  bg: 'bg-violet-900/30' },
};

export const ROLE_INFO: Record<UnitRole, { label: string; icon: string }> = {
  assault:   { label: 'Assalto',    icon: '⚔️' },
  tank:      { label: 'Tanque',     icon: '🛡️' },
  support:   { label: 'Apoio',      icon: '🩹' },
  artillery: { label: 'Artilharia', icon: '💥' },
  scout:     { label: 'Batedor',    icon: '👁️' },
  capital:   { label: 'Capital',    icon: '👑' },
  special:   { label: 'Especial',   icon: '✨' },
  siege:     { label: 'Cerco',      icon: '🏰' },
};

export const DAMAGE_INFO: Record<DamageType, { label: string; color: string }> = {
  kinetic:   { label: 'Cinético',    color: '#94a3b8' },
  energy:    { label: 'Energia',     color: '#22d3ee' },
  explosive: { label: 'Explosivo',   color: '#f97316' },
  plasma:    { label: 'Plasma',      color: '#a855f7' },
  emp:       { label: 'EMP',         color: '#facc15' },
  void:      { label: 'Vazio',       color: '#7c3aed' },
  psionic:   { label: 'Psiônico',    color: '#db2777' },
};

export const ARMOR_INFO: Record<ArmorType, { label: string; color: string }> = {
  light:         { label: 'Leve',           color: '#cbd5e1' },
  medium:        { label: 'Média',          color: '#94a3b8' },
  heavy:         { label: 'Pesada',         color: '#64748b' },
  shielded:      { label: 'Escudada',       color: '#22d3ee' },
  fortified:     { label: 'Fortificada',    color: '#f59e0b' },
  void_hardened: { label: 'Endurecida do Vazio', color: '#7c3aed' },
};
