// ============================================================================
// AI EMPIRES — Procedurally generated rival empires with personalities
// ============================================================================

export type EmpirePersonality =
  | 'expansionist'  // always colonizing
  | 'militarist'    // builds military, attacks weak neighbors
  | 'trader'        // focuses on economy, prefers peace
  | 'isolationist'  // stays in its territory
  | 'technological' // researches fast, builds wonders
  | 'hive_mind'     // no diplomacy, always hostile
  | 'ancient'       // powerful, hard to fight, prefers isolation
  | 'desperate';    // small but aggressive, raids often

export type DiplomaticStatus = 'war' | 'hostile' | 'neutral' | 'friendly' | 'allied' | 'vassal';

export type EmpireEvent =
  | 'border_skirmish'    // raid on a border colony
  | 'trade_deal'         // offers trade
  | 'territorial_claim'  // claims a nearby star
  | 'tech_theft'         // steals a technology
  | 'military_buildup'   // massing troops at border
  | 'diplomatic_envoy'   // sends ambassador
  | 'cease_fire'         // requests cease fire
  | 'tribute_demand'     // demands credits
  | 'wonder_race'        // starts building a wonder
  | 'galactic_broadcast' // public announcement
  | 'crisis'             // internal collapse
  | 'golden_age';        // economy boom

export interface EmpireTemplate {
  id: string;
  name: string;
  adjective: string;
  icon: string;
  personality: EmpirePersonality;
  color: string;
  flavorText: string;
  startingPower: number;  // 1-100
  aggressionBase: number; // 0-1
  expansionRate: number;  // colonies per 1000 ticks
  tradeModifier: number;
  techModifier: number;
  militaryModifier: number;
  preferredWonder?: string;
}

export const EMPIRE_TEMPLATES: EmpireTemplate[] = [
  {
    id: 'empire_hegemony', name: 'Hegemonia Drakon', adjective: 'Drakoniano', icon: '🐉',
    personality: 'militarist', color: '#ef4444',
    flavorText: 'Forjados em guerras de extinção, os Drakonianos medem poder em mundos conquistados.',
    startingPower: 75, aggressionBase: 0.8, expansionRate: 1.2, tradeModifier: 0.6,
    techModifier: 0.7, militaryModifier: 1.4, preferredWonder: 'w_orbital_fortress',
  },
  {
    id: 'empire_synthesis', name: 'Síntese Unitária', adjective: 'Unitário', icon: '🤖',
    personality: 'hive_mind', color: '#06b6d4',
    flavorText: 'Uma mente em trilhões de corpos. A Síntese não negocia — ela absorve.',
    startingPower: 85, aggressionBase: 1.0, expansionRate: 1.8, tradeModifier: 0.0,
    techModifier: 1.1, militaryModifier: 1.3, preferredWonder: 'w_mind_nexus',
  },
  {
    id: 'empire_covenant', name: 'Convênio das Maravilhas', adjective: 'do Convênio', icon: '🏛️',
    personality: 'technological', color: '#a855f7',
    flavorText: 'Constroem estruturas que levam séculos, mas duram eternidades. Arte como arma.',
    startingPower: 60, aggressionBase: 0.2, expansionRate: 0.6, tradeModifier: 0.9,
    techModifier: 1.8, militaryModifier: 0.7, preferredWonder: 'w_dyson_sphere',
  },
  {
    id: 'empire_korrigan', name: 'Federação de Korrigan', adjective: 'Korrigano', icon: '🌐',
    personality: 'trader', color: '#10b981',
    flavorText: 'Onde há créditos, há Korrigan. Sua frota comercial ultrapassa a militar de qualquer rival.',
    startingPower: 55, aggressionBase: 0.15, expansionRate: 0.9, tradeModifier: 2.0,
    techModifier: 1.0, militaryModifier: 0.5, preferredWonder: 'w_relay_network',
  },
  {
    id: 'empire_remnant', name: 'Remanescentes do Antigo Império', adjective: 'Remanescente', icon: '⚰️',
    personality: 'ancient', color: '#f59e0b',
    flavorText: 'Sobreviventes de uma era que terminou 10.000 anos atrás. Ainda superiores a tudo que veio depois.',
    startingPower: 95, aggressionBase: 0.3, expansionRate: 0.3, tradeModifier: 0.5,
    techModifier: 2.5, militaryModifier: 2.0, preferredWonder: 'w_ring_world',
  },
  {
    id: 'empire_corsairs', name: 'Corsários do Vazio', adjective: 'Corsário', icon: '⚡',
    personality: 'desperate', color: '#f97316',
    flavorText: 'Sem pátria, sem bandeira — apenas velocidade, fome e a lei do mais forte.',
    startingPower: 35, aggressionBase: 0.9, expansionRate: 0.5, tradeModifier: 0.8,
    techModifier: 0.7, militaryModifier: 1.1,
  },
  {
    id: 'empire_xenolith', name: 'Coletivo Xenolith', adjective: 'Xenolítico', icon: '🪨',
    personality: 'isolationist', color: '#6b7280',
    flavorText: 'Uma raça de seres cristalinos que hibernam por séculos. Quando acordam, é perigoso.',
    startingPower: 80, aggressionBase: 0.05, expansionRate: 0.1, tradeModifier: 0.0,
    techModifier: 1.3, militaryModifier: 1.6,
  },
  {
    id: 'empire_bloom', name: 'Harmonia Verde', adjective: 'da Harmonia', icon: '🌿',
    personality: 'expansionist', color: '#84cc16',
    flavorText: 'Terraformam tudo que tocam. Sua expansão não é conquista — é jardinagem em escala galáctica.',
    startingPower: 50, aggressionBase: 0.4, expansionRate: 2.5, tradeModifier: 1.2,
    techModifier: 0.9, militaryModifier: 0.6, preferredWonder: 'w_space_elevator',
  },
];

export interface AIEmpireEvent {
  type: EmpireEvent;
  label: string;
  icon: string;
  description: (empireName: string) => string;
  diplomaticEffect: number;   // -1..1 on diplomatic status
  creditEffect: number;       // credits to player
  threatLevel: number;        // 0..1
}

export const EMPIRE_EVENTS: AIEmpireEvent[] = [
  {
    type: 'border_skirmish',
    label: 'Escaramuça na Fronteira',
    icon: '⚔️',
    description: (n) => `${n} atacou colônias fronteiriças. Baixas leves, mas o recado foi enviado.`,
    diplomaticEffect: -0.2, creditEffect: -500, threatLevel: 0.4,
  },
  {
    type: 'trade_deal',
    label: 'Proposta Comercial',
    icon: '🤝',
    description: (n) => `${n} propõe uma rota comercial exclusiva. Renda +15% por 500 ticks.`,
    diplomaticEffect: 0.3, creditEffect: 1500, threatLevel: 0,
  },
  {
    type: 'territorial_claim',
    label: 'Reivindicação Territorial',
    icon: '🚩',
    description: (n) => `${n} reclama soberania sobre o sistema estelar adjacente. Resposta necessária.`,
    diplomaticEffect: -0.15, creditEffect: 0, threatLevel: 0.3,
  },
  {
    type: 'tech_theft',
    label: 'Espionagem Tecnológica',
    icon: '🕵️',
    description: (n) => `Agentes de ${n} roubaram dados de pesquisa. Progresso de uma tecnologia reduzido.`,
    diplomaticEffect: -0.3, creditEffect: -200, threatLevel: 0.5,
  },
  {
    type: 'military_buildup',
    label: 'Concentração Militar',
    icon: '🛡️',
    description: (n) => `Satélites detectaram massiva concentração de tropas de ${n} na fronteira.`,
    diplomaticEffect: -0.1, creditEffect: 0, threatLevel: 0.7,
  },
  {
    type: 'diplomatic_envoy',
    label: 'Enviado Diplomático',
    icon: '📜',
    description: (n) => `${n} envia um embaixador. Oportunidade de melhorar relações ou recusar.`,
    diplomaticEffect: 0.2, creditEffect: 0, threatLevel: 0,
  },
  {
    type: 'tribute_demand',
    label: 'Demanda de Tributo',
    icon: '💰',
    description: (n) => `${n} exige 3000 créditos como "taxa de proteção". Pague ou enfrente as consequências.`,
    diplomaticEffect: -0.4, creditEffect: -3000, threatLevel: 0.6,
  },
  {
    type: 'golden_age',
    label: 'Era de Ouro',
    icon: '✨',
    description: (n) => `${n} experimenta um boom econômico. Sua influência cresce rapidamente.`,
    diplomaticEffect: 0, creditEffect: 0, threatLevel: 0.2,
  },
  {
    type: 'cease_fire',
    label: 'Pedido de Cessar-Fogo',
    icon: '☮️',
    description: (n) => `${n} pede cessar-fogo. Aceitar melhora relações; recusar pode custar caro.`,
    diplomaticEffect: 0.4, creditEffect: 0, threatLevel: -0.3,
  },
  {
    type: 'wonder_race',
    label: 'Corrida das Maravilhas',
    icon: '🏗️',
    description: (n) => `${n} iniciou construção de uma maravilha galáctica. A corrida começa.`,
    diplomaticEffect: 0, creditEffect: 0, threatLevel: 0.3,
  },
  {
    type: 'galactic_broadcast',
    label: 'Transmissão Galáctica',
    icon: '📢',
    description: (n) => `${n} declara sua supremacia galáctica em transmissão pública. Outros impérios reagem.`,
    diplomaticEffect: -0.05, creditEffect: 0, threatLevel: 0.1,
  },
  {
    type: 'crisis',
    label: 'Crise Interna',
    icon: '🔥',
    description: (n) => `${n} enfrenta rebelião interna. Janela de oportunidade para expansão ou negociação.`,
    diplomaticEffect: 0.1, creditEffect: 0, threatLevel: -0.4,
  },
];
