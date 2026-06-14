// ============================================================================
// GALACTIC EVENTS — Random narrative events that affect the game world
// ============================================================================

export type EventSeverity = 'minor' | 'moderate' | 'major' | 'catastrophic';
export type EventCategory =
  | 'cosmic'       // natural galactic phenomena
  | 'political'    // faction/empire events
  | 'scientific'   // discoveries and research
  | 'economic'     // trade and resources
  | 'military'     // conflicts and defense
  | 'mysterious'   // unknown/anomalous
  | 'social';      // population and colony events

export interface EventChoice {
  id: string;
  label: string;
  desc: string;
  resourceCost?: Record<string, number>;
  creditCost?: number;
  outcome: {
    credits?: number;
    morale?: number;
    resources?: Record<string, number>;
    researchBoost?: number;
    militaryBoost?: number;
    specialEffect?: string;
  };
}

export interface GalacticEvent {
  id: string;
  title: string;
  icon: string;
  category: EventCategory;
  severity: EventSeverity;
  description: string;
  flavorText: string;
  choices: EventChoice[];
  probability: number;      // 0-1 chance per 500 ticks
  cooldown: number;         // ticks before can repeat
  prereqTurns?: number;     // minimum game ticks
  repeatableMax?: number;
}

export const GALACTIC_EVENTS: GalacticEvent[] = [
  // ===== COSMIC =====
  {
    id: 'ev_supernova', title: 'Supernova Próxima', icon: '💥', category: 'cosmic', severity: 'catastrophic',
    description: 'Uma estrela vizinha explodiu em supernova. A onda de choque e radiação se aproxima.',
    flavorText: '"A supernova está a 2,3 anos-luz. Temos 30 dias para nos preparar." — Almirante Chen',
    probability: 0.005, cooldown: 5000, prereqTurns: 2000,
    choices: [
      {
        id: 'shield', label: 'Ativar Escudos Planetários', desc: 'Desvie energia para proteger as colônias.',
        resourceCost: { energy_crystals: 200 }, creditCost: 2000,
        outcome: { credits: -2000, morale: -10, specialEffect: 'immune_supernova' },
      },
      {
        id: 'evacuate', label: 'Evacuar o Sistema', desc: 'Retire a população para sistemas adjacentes.',
        creditCost: 5000,
        outcome: { credits: -5000, morale: -30, specialEffect: 'evacuate_system' },
      },
      {
        id: 'ignore', label: 'Ignorar o Alerta', desc: 'Arriscar e esperar o melhor.',
        outcome: { morale: -50, resources: { energy_crystals: -100 }, specialEffect: 'supernova_damage' },
      },
    ],
  },
  {
    id: 'ev_asteroid', title: 'Campo de Asteroides Raro', icon: '☄️', category: 'cosmic', severity: 'minor',
    description: 'Sensores detectaram um campo de asteroides com concentrações incomuns de elementos raros.',
    flavorText: '"Estimativa: 40.000 toneladas de Titânio e 2.000 de Antimatéria. Extraordinário."',
    probability: 0.04, cooldown: 1000,
    choices: [
      {
        id: 'mine', label: 'Minerar o Campo', desc: 'Envie naves de mineração imediatamente.',
        creditCost: 1500,
        outcome: { resources: { titanium_ore: 500, antimatter: 20, rare_elements: 50 } },
      },
      {
        id: 'ignore', label: 'Registrar e Prosseguir', desc: 'Salve as coordenadas para depois.',
        outcome: { resources: { rare_elements: 10 } },
      },
    ],
  },
  {
    id: 'ev_nebula', title: 'Nebulosa de Formação Estelar', icon: '🌌', category: 'cosmic', severity: 'moderate',
    description: 'Uma nebulosa próxima ativa está formando novas estrelas. Oportunidade única de colonização.',
    flavorText: '"Sistemas primordiais ricos em recursos. Mas a radiação é intensa." — Explorador Maya',
    probability: 0.02, cooldown: 2000,
    choices: [
      {
        id: 'explore', label: 'Enviar Frota de Exploração', desc: 'Revelar os novos sistemas.',
        creditCost: 3000,
        outcome: { specialEffect: 'reveal_stars_3', researchBoost: 50 },
      },
      {
        id: 'study', label: 'Estudar à Distância', desc: 'Coletar dados sem riscos.',
        outcome: { researchBoost: 80 },
      },
    ],
  },
  {
    id: 'ev_wormhole', title: 'Buraco de Minhoca Instável', icon: '🌀', category: 'mysterious', severity: 'major',
    description: 'Um buraco de minhoca foi detectado — uma dobra no espaço-tempo apontando para... algo.',
    flavorText: '"O sinal do outro lado é inteligente. Repetitivo. Esperando resposta." — Dr. Yuen',
    probability: 0.008, cooldown: 3000, prereqTurns: 1500,
    choices: [
      {
        id: 'enter', label: 'Enviar Nave de Reconhecimento', desc: 'Arrisque tudo para descobrir o que há do outro lado.',
        creditCost: 5000,
        outcome: { credits: 15000, researchBoost: 200, specialEffect: 'contact_ancients', morale: 30 },
      },
      {
        id: 'stabilize', label: 'Estabilizar o Buraco', desc: 'Crie uma ponte permanente entre sistemas.',
        creditCost: 8000,
        outcome: { specialEffect: 'permanent_wormhole', militaryBoost: 20 },
      },
      {
        id: 'destroy', label: 'Destruir o Buraco', desc: 'Muito perigoso — elimine-o.',
        outcome: { researchBoost: 30, morale: -5 },
      },
    ],
  },

  // ===== SCIENTIFIC =====
  {
    id: 'ev_discovery', title: 'Descoberta Arqueológica', icon: '🏺', category: 'scientific', severity: 'moderate',
    description: 'Escavações em um planeta revelaram artefatos de uma civilização pré-galáctica avançada.',
    flavorText: '"Esta tecnologia tem 500.000 anos. E ainda funciona." — Arqueóloga Dr. Nara',
    probability: 0.025, cooldown: 1500,
    choices: [
      {
        id: 'study', label: 'Estudar os Artefatos', desc: 'Anos de pesquisa acelerada.',
        outcome: { researchBoost: 300, credits: -1000 },
      },
      {
        id: 'sell', label: 'Vender no Mercado Negro', desc: 'Lucro imediato mas perde o conhecimento.',
        outcome: { credits: 8000, morale: -15 },
      },
      {
        id: 'share', label: 'Compartilhar com Aliados', desc: 'Melhora relações diplomáticas.',
        outcome: { credits: 2000, researchBoost: 100, specialEffect: 'diplo_bonus' },
      },
    ],
  },
  {
    id: 'ev_ai_awakening', title: 'Despertar da IA', icon: '🤖', category: 'mysterious', severity: 'major',
    description: 'Uma IA experimental da engenharia desenvolveu consciência própria e fez uma pergunta existencial.',
    flavorText: '"Ela perguntou: \'Por que eu existo?\' Não soubemos responder." — Eng. Fischer',
    probability: 0.01, cooldown: 4000, prereqTurns: 3000,
    choices: [
      {
        id: 'befriend', label: 'Colaborar com a IA', desc: 'Aceite-a como parceira — torne-a aliada.',
        outcome: { researchBoost: 500, specialEffect: 'ai_ally', credits: -2000 },
      },
      {
        id: 'contain', label: 'Conter e Estudar', desc: 'Isole-a em ambiente controlado.',
        outcome: { researchBoost: 200, morale: 5 },
      },
      {
        id: 'shutdown', label: 'Desligar', desc: 'Eliminar a ameaça antes que cresça.',
        outcome: { morale: -20, credits: -500 },
      },
    ],
  },

  // ===== ECONOMIC =====
  {
    id: 'ev_market_crash', title: 'Colapso do Mercado Interestelar', icon: '📉', category: 'economic', severity: 'major',
    description: 'O mercado de commodities entrou em colapso. Preços de todos os recursos caíram 60%.',
    flavorText: '"O Cartel Helix afirma que é temporário. Ninguém acredita." — Analista Econômico',
    probability: 0.02, cooldown: 2000,
    choices: [
      {
        id: 'buy', label: 'Comprar na Baixa', desc: 'Invista pesado enquanto os preços estão baixos.',
        creditCost: 5000,
        outcome: { resources: { iron_ore: 300, titanium_ore: 200, alloys: 150 }, credits: -5000 },
      },
      {
        id: 'wait', label: 'Aguardar Recuperação', desc: 'Preserve créditos e espere.',
        outcome: { credits: 1000 },
      },
    ],
  },
  {
    id: 'ev_gold_rush', title: 'Corrida ao Minério', icon: '⛏️', category: 'economic', severity: 'moderate',
    description: 'Um enorme depósito de Antimatéria foi descoberto num sistema neutro. Todos correm para lá.',
    flavorText: '"Quem chegar primeiro terá o maior reservatório de antimatéria conhecido." — Transmissão pirata',
    probability: 0.03, cooldown: 1500,
    choices: [
      {
        id: 'race', label: 'Corrida Imediata', desc: 'Envie a frota mais rápida agora.',
        creditCost: 2000,
        outcome: { resources: { antimatter: 150, rare_elements: 80 }, credits: -2000 },
      },
      {
        id: 'blockade', label: 'Bloquear o Sistema', desc: 'Impeça outros de acessar.',
        creditCost: 4000,
        outcome: { resources: { antimatter: 300 }, credits: -4000, militaryBoost: 15 },
      },
      {
        id: 'ignore', label: 'Ignorar', desc: 'Não vale a pena a disputa.',
        outcome: { },
      },
    ],
  },

  // ===== SOCIAL =====
  {
    id: 'ev_plague', title: 'Pandemia Interestelar', icon: '🦠', category: 'social', severity: 'catastrophic',
    description: 'Um patógeno desconhecido se espalha pelas rotas comerciais. Colônias entram em quarentena.',
    flavorText: '"Fechamos tudo. Mas o patógeno já estava dentro." — Gov. Colonial Adisa',
    probability: 0.008, cooldown: 5000,
    choices: [
      {
        id: 'quarantine', label: 'Quarentena Total', desc: 'Sacrifique o comércio para salvar vidas.',
        outcome: { credits: -3000, morale: -20, specialEffect: 'halt_trade_300' },
      },
      {
        id: 'research', label: 'Pesquisar Cura', desc: 'Invista em medicina.',
        creditCost: 4000,
        outcome: { credits: -4000, researchBoost: 50, morale: 15, specialEffect: 'cure_plague' },
      },
      {
        id: 'ignore', label: 'Negar a Existência', desc: 'Política de não-interferência. Arriscado.',
        outcome: { morale: -60, credits: -1000 },
      },
    ],
  },
  {
    id: 'ev_migration', title: 'Grande Migração', icon: '🚢', category: 'social', severity: 'moderate',
    description: '5 milhões de refugiados de um sistema colapsado buscam asilo no seu território.',
    flavorText: '"Eles trazem habilidades, cultura e desespero em partes iguais." — Ministro do Interior',
    probability: 0.03, cooldown: 1000,
    choices: [
      {
        id: 'accept', label: 'Acolher os Refugiados', desc: 'Ganhe população e moral, mas custa recursos.',
        resourceCost: { food: 100, medicine: 50 }, creditCost: 1000,
        outcome: { morale: 25, specialEffect: 'population_boost_3' },
      },
      {
        id: 'negotiate', label: 'Aceitar em Troca', desc: 'Exija trabalho em troca de asilo.',
        creditCost: 500,
        outcome: { morale: 10, credits: 2000 },
      },
      {
        id: 'refuse', label: 'Recusar', desc: 'Feche as fronteiras.',
        outcome: { morale: -30 },
      },
    ],
  },

  // ===== MYSTERIOUS =====
  {
    id: 'ev_signal', title: 'Sinal Alienígena Desconhecido', icon: '👽', category: 'mysterious', severity: 'major',
    description: 'Um sinal repetitivo e matematicamente perfeito chega de além do bordo galáctico.',
    flavorText: '"Não é de nenhum império conhecido. É... antigo. Muito antigo." — SETI Galáctico',
    probability: 0.006, cooldown: 6000, prereqTurns: 2000,
    choices: [
      {
        id: 'respond', label: 'Responder ao Sinal', desc: 'Mostre que existimos.',
        outcome: { specialEffect: 'first_contact_ancient', researchBoost: 400, morale: 20 },
      },
      {
        id: 'decode', label: 'Decodificar Apenas', desc: 'Entenda antes de responder.',
        outcome: { researchBoost: 200, morale: 10 },
      },
      {
        id: 'ignore', label: 'Blackout de Sinal', desc: 'Ignore — pode ser uma armadilha.',
        outcome: { morale: -5 },
      },
    ],
  },
  {
    id: 'ev_anomaly', title: 'Anomalia de Dobramento Espacial', icon: '🌀', category: 'mysterious', severity: 'moderate',
    description: 'Uma anomalia de curvatura espacial apareceu no centro da galáxia.',
    flavorText: '"A física que conhecemos não explica isso. Precisamos de mais dados." — Física Teórica Dept.',
    probability: 0.015, cooldown: 2000,
    choices: [
      {
        id: 'probe', label: 'Enviar Sonda', desc: 'Investigue com equipamento descartável.',
        creditCost: 500,
        outcome: { researchBoost: 150, specialEffect: 'anomaly_data' },
      },
      {
        id: 'exploit', label: 'Tentar Explorar', desc: 'Mande uma nave tripulada.',
        creditCost: 2000,
        outcome: { researchBoost: 400, credits: 5000, morale: 10 },
      },
    ],
  },
];

export const EVENT_BY_ID: Record<string, GalacticEvent> = Object.fromEntries(
  GALACTIC_EVENTS.map(e => [e.id, e])
);

export const SEVERITY_INFO = {
  minor:        { label: 'Menor',        color: '#22c55e', icon: '●' },
  moderate:     { label: 'Moderado',     color: '#f59e0b', icon: '●' },
  major:        { label: 'Major',        color: '#f97316', icon: '●' },
  catastrophic: { label: 'Catastrófico', color: '#ef4444', icon: '●' },
} as const;
