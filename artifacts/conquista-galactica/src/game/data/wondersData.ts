// ============================================================================
// GALACTIC WONDERS — Mega structures buildable by the player empire
// ============================================================================

export type WonderCategory = 'mega_structure' | 'cultural' | 'military' | 'scientific' | 'economic';
export type WonderStatus = 'locked' | 'available' | 'building' | 'built';

export interface WonderEffect {
  type: 'resource_mult' | 'research_speed' | 'population_cap' | 'defense_bonus'
      | 'trade_income' | 'ship_speed' | 'morale' | 'reveal_map' | 'unique';
  value: number;
  desc: string;
}

export interface GalacticWonder {
  id: string;
  name: string;
  icon: string;
  category: WonderCategory;
  tier: 1 | 2 | 3 | 4 | 5;
  desc: string;
  lore: string;
  buildTime: number;         // game ticks
  creditCost: number;
  resourceCost: Record<string, number>;
  prereqTech?: string[];
  effects: WonderEffect[];
  uniquePower: string;
  color: string;
  rarity: 'rare' | 'epic' | 'legendary' | 'mythic';
  maxInstances: number;
}

export const GALACTIC_WONDERS: GalacticWonder[] = [
  // ===== TIER 1 =====
  {
    id: 'w_relay_network', name: 'Rede de Retransmissores', icon: '📡', category: 'economic', tier: 1,
    desc: 'Rede galáctica de satélites de comunicação que acelera o comércio e transferências de informação.',
    lore: 'O backbone da comunicação interestelar — sem ela, cada colônia seria uma ilha.',
    buildTime: 800, creditCost: 8000,
    resourceCost: { electronics: 200, titanium_ore: 150, energy_crystals: 80 },
    prereqTech: ['t_communication'],
    effects: [
      { type: 'trade_income', value: 0.3, desc: '+30% renda de rotas comerciais' },
      { type: 'research_speed', value: 0.1, desc: '+10% velocidade de pesquisa' },
    ],
    uniquePower: 'Revela posição de todos os impérios IA no mapa',
    color: '#22d3ee', rarity: 'rare', maxInstances: 3,
  },
  {
    id: 'w_solar_harvester', name: 'Coletora Solar Orbital', icon: '☀️', category: 'economic', tier: 1,
    desc: 'Espelhos orbitais colossais que canalizam a energia de uma estrela para as colônias.',
    lore: 'Cada coletora equivale a 1000 usinas planetárias combinadas.',
    buildTime: 600, creditCost: 6000,
    resourceCost: { titanium_ore: 120, alloys: 100, refined_iron: 80 },
    effects: [
      { type: 'resource_mult', value: 0.4, desc: '+40% produção de energia em todo o sistema' },
    ],
    uniquePower: 'Pode ser usada como arma orbital (+200% dano orbital em um ataque)',
    color: '#fbbf24', rarity: 'rare', maxInstances: 5,
  },

  // ===== TIER 2 =====
  {
    id: 'w_space_elevator', name: 'Elevador Espacial', icon: '🛗', category: 'mega_structure', tier: 2,
    desc: 'Torre de carbono de 36.000km que liga a superfície planetária à órbita geoestacionária.',
    lore: 'Tornou obsoletos 90% dos foguetes de decolagem. Mudou civilizações inteiras.',
    buildTime: 1200, creditCost: 15000,
    resourceCost: { alloys: 400, electronics: 200, titanium_ore: 300, carbon_fiber: 500 },
    prereqTech: ['t_engineering_ii'],
    effects: [
      { type: 'trade_income', value: 0.5, desc: '+50% renda de comércio no planeta-âncora' },
      { type: 'ship_speed', value: 0.2, desc: '+20% velocidade de carga/embarque' },
    ],
    uniquePower: 'Reduz custo de colonização em 60% para planetas neste sistema',
    color: '#34d399', rarity: 'epic', maxInstances: 2,
  },
  {
    id: 'w_gen_ship', name: 'Nau de Geração "Exodus"', icon: '🚀', category: 'mega_structure', tier: 2,
    desc: 'Nave-mundo capaz de transportar 10 milhões de colonizadores para qualquer ponto da galáxia.',
    lore: 'A Exodus carrega cidades inteiras dentro de seus decks. Uma civilização em movimento.',
    buildTime: 1500, creditCost: 20000,
    resourceCost: { alloys: 600, electronics: 400, medicine: 200, biomass: 300, fuel: 500 },
    prereqTech: ['t_warp_drive'],
    effects: [
      { type: 'population_cap', value: 0.5, desc: '+50% capacidade populacional em novas colônias' },
    ],
    uniquePower: 'Permite colonização de planetas com habitabilidade < 10%',
    color: '#818cf8', rarity: 'epic', maxInstances: 1,
  },

  // ===== TIER 3 =====
  {
    id: 'w_orbital_fortress', name: 'Fortaleza Orbital "Bastião"', icon: '🏰', category: 'military', tier: 3,
    desc: 'Estação de batalha do tamanho de uma lua com armamentos capazes de devastar flotas inteiras.',
    lore: 'Nenhum inimigo ainda tomou um sistema protegido pelo Bastião. Nenhum.',
    buildTime: 2500, creditCost: 40000,
    resourceCost: { alloys: 1000, electronics: 600, titanium_ore: 800, rare_elements: 100 },
    prereqTech: ['t_military_iv'],
    effects: [
      { type: 'defense_bonus', value: 1.0, desc: '+100% força defensiva do sistema' },
    ],
    uniquePower: 'Pode lançar ataques de retaliação automática contra invasores',
    color: '#f43f5e', rarity: 'epic', maxInstances: 2,
  },
  {
    id: 'w_mind_nexus', name: 'Nexo da Mente', icon: '🧠', category: 'scientific', tier: 3,
    desc: 'Supercomputador quântico neural capaz de processar a informação de toda uma galáxia simultaneamente.',
    lore: 'Cientistas dizem que o Nexo "pensa". Poucos têm coragem de questionar o que isso significa.',
    buildTime: 3000, creditCost: 50000,
    resourceCost: { electronics: 1200, rare_elements: 300, crystals: 400, antimatter: 50 },
    prereqTech: ['t_ai_research', 't_quantum_computing'],
    effects: [
      { type: 'research_speed', value: 0.6, desc: '+60% velocidade de pesquisa global' },
      { type: 'unique', value: 1, desc: 'Desbloqueia tecnologias exclusivas da Tier VI' },
    ],
    uniquePower: 'Prediz movimentos de impérios IA com 80% de precisão',
    color: '#a855f7', rarity: 'legendary', maxInstances: 1,
  },

  // ===== TIER 4 =====
  {
    id: 'w_dyson_swarm', name: 'Enxame de Dyson', icon: '🌟', category: 'mega_structure', tier: 4,
    desc: 'Milhões de coletores solares em órbita que captam energia diretamente de uma estrela.',
    lore: 'A estrela ainda brilha — mas agora ela brilha para você.',
    buildTime: 5000, creditCost: 80000,
    resourceCost: { titanium_ore: 2000, electronics: 1500, alloys: 2500, antimatter: 200 },
    prereqTech: ['t_mega_engineering', 't_stellar_manipulation'],
    effects: [
      { type: 'resource_mult', value: 1.5, desc: '+150% produção de energia global' },
      { type: 'trade_income', value: 0.4, desc: '+40% renda de rotas comerciais' },
    ],
    uniquePower: 'Pode ser convertido em Esfera de Dyson (Tier 5) após 10.000 ticks',
    color: '#f59e0b', rarity: 'legendary', maxInstances: 1,
  },
  {
    id: 'w_ring_world', name: 'Mundo Anel', icon: '💍', category: 'mega_structure', tier: 4,
    desc: 'Anel habitável do tamanho de uma órbita terrestre com superfície equivalente a 3 milhões de Terras.',
    lore: 'Construído por quem veio antes. Nossos engenheiros ainda não entendem como.',
    buildTime: 8000, creditCost: 120000,
    resourceCost: { alloys: 5000, titanium_ore: 4000, electronics: 2000, dark_matter: 100 },
    prereqTech: ['t_graviton_physics', 't_mega_engineering'],
    effects: [
      { type: 'population_cap', value: 5.0, desc: '+500% capacidade populacional galáctica' },
      { type: 'morale', value: 0.5, desc: '+50% moral em todas as colônias' },
      { type: 'resource_mult', value: 0.8, desc: '+80% produção de todos os recursos' },
    ],
    uniquePower: 'Torna o Mundo Anel na capital permanente do seu império — impossível de ser capturado',
    color: '#0ea5e9', rarity: 'mythic', maxInstances: 1,
  },

  // ===== TIER 5 =====
  {
    id: 'w_dyson_sphere', name: 'Esfera de Dyson', icon: '⭐', category: 'mega_structure', tier: 5,
    desc: 'Uma esfera sólida ao redor de uma estrela capturando 100% da sua energia por bilhões de anos.',
    lore: 'Aqueles que constroem uma Esfera de Dyson não precisam de mais nada. São deuses entre estrelas.',
    buildTime: 15000, creditCost: 500000,
    resourceCost: { alloys: 20000, titanium_ore: 15000, electronics: 8000, antimatter: 1000, dark_matter: 500 },
    prereqTech: ['t_type_ii_civilization', 't_mega_engineering'],
    effects: [
      { type: 'resource_mult', value: 5.0, desc: '+500% produção de energia global' },
      { type: 'research_speed', value: 1.0, desc: '+100% velocidade de pesquisa global' },
      { type: 'morale', value: 1.0, desc: 'Moral máxima em todas as colônias' },
    ],
    uniquePower: 'Desbloqueio de Condição de Vitória: Dominância Tecnológica',
    color: '#f97316', rarity: 'mythic', maxInstances: 1,
  },
  {
    id: 'w_matrioshka', name: 'Cérebro Matrioshka', icon: '🌐', category: 'scientific', tier: 5,
    desc: 'Múltiplas camadas de computadores Dyson envolvendo uma estrela, formando um supercomputador de escala estelar.',
    lore: 'Uma mente que pensa 10^42 vezes mais rápido que qualquer ser biológico. O que ela pensa sobre nós?',
    buildTime: 20000, creditCost: 800000,
    resourceCost: { electronics: 30000, rare_elements: 5000, dark_matter: 1000, antimatter: 2000, crystals: 5000 },
    prereqTech: ['t_singularity', 't_type_ii_civilization'],
    effects: [
      { type: 'research_speed', value: 10.0, desc: '+1000% velocidade de pesquisa' },
      { type: 'unique', value: 1, desc: 'Pesquisa todas as tecnologias restantes em 100 ticks' },
    ],
    uniquePower: 'Condição de Vitória: Singularidade Tecnológica — você vence o jogo',
    color: '#ec4899', rarity: 'mythic', maxInstances: 1,
  },
  {
    id: 'w_neutron_cannon', name: 'Canhão de Nêutrons', icon: '💫', category: 'military', tier: 5,
    desc: 'Arma capaz de devastar um sistema estelar inteiro num único disparo. A última palavra em poder militar.',
    lore: 'Usada uma vez na história. O sistema Korrigan ainda é radioativo 300 anos depois.',
    buildTime: 12000, creditCost: 600000,
    resourceCost: { antimatter: 500, dark_matter: 200, alloys: 10000, rare_elements: 2000 },
    prereqTech: ['t_singularity_weapons', 't_military_vi'],
    effects: [
      { type: 'defense_bonus', value: 3.0, desc: '+300% poder de dissuasão — impérios evitam atacar você' },
    ],
    uniquePower: 'Uma vez por partida: destrua qualquer sistema estelar inimigo instantaneamente',
    color: '#7c3aed', rarity: 'mythic', maxInstances: 1,
  },
];

export const WONDER_BY_ID: Record<string, GalacticWonder> = Object.fromEntries(
  GALACTIC_WONDERS.map(w => [w.id, w])
);

export const RARITY_WONDER_INFO = {
  rare:      { label: 'Raro',    color: '#38bdf8', glow: 'rgba(56,189,248,0.3)' },
  epic:      { label: 'Épico',   color: '#a855f7', glow: 'rgba(168,85,247,0.3)' },
  legendary: { label: 'Lendário',color: '#f59e0b', glow: 'rgba(245,158,11,0.4)' },
  mythic:    { label: 'Mítico',  color: '#ec4899', glow: 'rgba(236,72,153,0.5)' },
} as const;
