// ============================================================================
// ENGINEERING CATALOG — 1000+ components for the robot/vehicle workshop.
// Combines hand-authored behaviors with a large generated parts catalog so the
// player has well over a thousand distinct options to design and program with.
// ============================================================================

export type CatCategory =
  | 'chassis' | 'locomotion' | 'power' | 'sensor' | 'weapon' | 'defense'
  | 'manipulator' | 'comms' | 'ai_core' | 'utility' | 'plating' | 'behavior';

export interface CatalogItem {
  id: string;
  name: string;       // pt name
  category: CatCategory;
  tier: number;       // 1..6
  cost: number;       // credits
  stats: Partial<Record<'armor' | 'speed' | 'power' | 'intelligence' | 'range' | 'damage' | 'stealth' | 'cargo' | 'energy', number>>;
  desc: string;
}

// Naming pools (Portuguese) to generate many variants per archetype.
const PREFIX = ['Mk', 'Tipo', 'Série', 'Modelo', 'Classe', 'Geração'];
const GRADE = ['Padrão', 'Reforçado', 'Tático', 'Pesado', 'Leve', 'Furtivo', 'Quântico', 'Plasma', 'Nano', 'Iônico', 'Fotônico', 'Híbrido', 'Militar', 'Industrial', 'Experimental', 'Veterano', 'Elite', 'Imperial', 'Arcano', 'Estelar'];

interface Archetype {
  base: string;
  category: CatCategory;
  stat: keyof CatalogItem['stats'];
  baseVal: number;
  baseCost: number;
  desc: string;
}

const ARCHETYPES: Archetype[] = [
  { base: 'Chassi Rodado', category: 'chassis', stat: 'armor', baseVal: 10, baseCost: 120, desc: 'Estrutura sobre rodas para terrenos planos.' },
  { base: 'Chassi de Esteiras', category: 'chassis', stat: 'armor', baseVal: 16, baseCost: 180, desc: 'Tração para terrenos acidentados.' },
  { base: 'Chassi Bípede', category: 'chassis', stat: 'armor', baseVal: 12, baseCost: 220, desc: 'Forma humanoide ágil.' },
  { base: 'Chassi Quadrúpede', category: 'chassis', stat: 'armor', baseVal: 14, baseCost: 240, desc: 'Estável e veloz em terrenos irregulares.' },
  { base: 'Chassi Hexápode', category: 'chassis', stat: 'armor', baseVal: 18, baseCost: 280, desc: 'Seis pernas para máxima estabilidade.' },
  { base: 'Chassi Aracnídeo', category: 'chassis', stat: 'armor', baseVal: 15, baseCost: 300, desc: 'Escala paredes e tetos.' },
  { base: 'Chassi Tanque', category: 'chassis', stat: 'armor', baseVal: 30, baseCost: 480, desc: 'Blindagem pesada de combate.' },
  { base: 'Chassi Drone Quad', category: 'chassis', stat: 'speed', baseVal: 22, baseCost: 200, desc: 'Quadricóptero aéreo.' },
  { base: 'Chassi Submarino', category: 'chassis', stat: 'armor', baseVal: 20, baseCost: 360, desc: 'Operações aquáticas profundas.' },

  { base: 'Motor de Rodas', category: 'locomotion', stat: 'speed', baseVal: 8, baseCost: 90, desc: 'Propulsão terrestre simples.' },
  { base: 'Propulsor a Jato', category: 'locomotion', stat: 'speed', baseVal: 20, baseCost: 260, desc: 'Voo de alta velocidade.' },
  { base: 'Rotores Antigravidade', category: 'locomotion', stat: 'speed', baseVal: 26, baseCost: 420, desc: 'Levitação magnética.' },
  { base: 'Hélices Aquáticas', category: 'locomotion', stat: 'speed', baseVal: 14, baseCost: 180, desc: 'Navegação submarina.' },
  { base: 'Pernas Servo', category: 'locomotion', stat: 'speed', baseVal: 10, baseCost: 150, desc: 'Atuadores de caminhada.' },
  { base: 'Esteira Magnética', category: 'locomotion', stat: 'speed', baseVal: 12, baseCost: 200, desc: 'Adere a superfícies metálicas.' },

  { base: 'Bateria de Lítio', category: 'power', stat: 'energy', baseVal: 50, baseCost: 80, desc: 'Armazenamento básico.' },
  { base: 'Célula de Fusão', category: 'power', stat: 'energy', baseVal: 200, baseCost: 600, desc: 'Energia densa de longa duração.' },
  { base: 'Reator de Antimatéria', category: 'power', stat: 'energy', baseVal: 500, baseCost: 1800, desc: 'Potência extrema.' },
  { base: 'Coletor Solar', category: 'power', stat: 'energy', baseVal: 80, baseCost: 160, desc: 'Recarrega com luz estelar.' },
  { base: 'Capacitor Quântico', category: 'power', stat: 'power', baseVal: 30, baseCost: 320, desc: 'Picos de energia instantâneos.' },

  { base: 'Sensor Óptico', category: 'sensor', stat: 'intelligence', baseVal: 6, baseCost: 70, desc: 'Visão básica.' },
  { base: 'Radar', category: 'sensor', stat: 'range', baseVal: 30, baseCost: 220, desc: 'Detecção a longa distância.' },
  { base: 'LIDAR', category: 'sensor', stat: 'range', baseVal: 40, baseCost: 320, desc: 'Mapeamento 3D preciso.' },
  { base: 'Scanner Térmico', category: 'sensor', stat: 'intelligence', baseVal: 10, baseCost: 260, desc: 'Detecta calor através de obstáculos.' },
  { base: 'Sensor Sísmico', category: 'sensor', stat: 'intelligence', baseVal: 8, baseCost: 180, desc: 'Sente vibrações no solo.' },
  { base: 'Espectrômetro', category: 'sensor', stat: 'intelligence', baseVal: 12, baseCost: 360, desc: 'Identifica composição de materiais.' },

  { base: 'Canhão Cinético', category: 'weapon', stat: 'damage', baseVal: 25, baseCost: 300, desc: 'Disparo balístico.' },
  { base: 'Laser de Combate', category: 'weapon', stat: 'damage', baseVal: 35, baseCost: 480, desc: 'Feixe de energia preciso.' },
  { base: 'Lançador de Mísseis', category: 'weapon', stat: 'damage', baseVal: 60, baseCost: 720, desc: 'Munição guiada explosiva.' },
  { base: 'Canhão de Plasma', category: 'weapon', stat: 'damage', baseVal: 80, baseCost: 1100, desc: 'Bolas de plasma superaquecido.' },
  { base: 'Lâmina Vibratória', category: 'weapon', stat: 'damage', baseVal: 40, baseCost: 380, desc: 'Corpo a corpo de alta frequência.' },
  { base: 'Torre de Enxame', category: 'weapon', stat: 'damage', baseVal: 50, baseCost: 900, desc: 'Libera mini-drones de ataque.' },

  { base: 'Escudo Defletor', category: 'defense', stat: 'armor', baseVal: 40, baseCost: 500, desc: 'Campo de energia absorvente.' },
  { base: 'Blindagem Reativa', category: 'defense', stat: 'armor', baseVal: 60, baseCost: 640, desc: 'Explode para dispersar impactos.' },
  { base: 'Camuflagem Óptica', category: 'defense', stat: 'stealth', baseVal: 50, baseCost: 780, desc: 'Torna o robô quase invisível.' },
  { base: 'Sistema Anti-Míssil', category: 'defense', stat: 'armor', baseVal: 30, baseCost: 560, desc: 'Intercepta projéteis.' },

  { base: 'Braço Manipulador', category: 'manipulator', stat: 'cargo', baseVal: 20, baseCost: 140, desc: 'Manuseio de objetos.' },
  { base: 'Garra Hidráulica', category: 'manipulator', stat: 'cargo', baseVal: 35, baseCost: 240, desc: 'Levanta cargas pesadas.' },
  { base: 'Broca de Mineração', category: 'manipulator', stat: 'power', baseVal: 25, baseCost: 220, desc: 'Extrai recursos do solo.' },
  { base: 'Soldador a Arco', category: 'manipulator', stat: 'power', baseVal: 18, baseCost: 160, desc: 'Constrói e repara estruturas.' },
  { base: 'Impressora 3D Móvel', category: 'manipulator', stat: 'power', baseVal: 22, baseCost: 420, desc: 'Fabrica peças em campo.' },

  { base: 'Antena de Rádio', category: 'comms', stat: 'range', baseVal: 25, baseCost: 90, desc: 'Comunicação básica.' },
  { base: 'Uplink por Satélite', category: 'comms', stat: 'range', baseVal: 60, baseCost: 340, desc: 'Alcance planetário.' },
  { base: 'Relé Quântico', category: 'comms', stat: 'range', baseVal: 120, baseCost: 900, desc: 'Comunicação instantânea.' },
  { base: 'Módulo de Enxame', category: 'comms', stat: 'intelligence', baseVal: 14, baseCost: 520, desc: 'Coordena múltiplos robôs.' },

  { base: 'Núcleo de IA', category: 'ai_core', stat: 'intelligence', baseVal: 20, baseCost: 400, desc: 'Processamento de decisões.' },
  { base: 'Co-Processador Neural', category: 'ai_core', stat: 'intelligence', baseVal: 35, baseCost: 760, desc: 'Aprendizado adaptativo.' },
  { base: 'Mente de Colmeia', category: 'ai_core', stat: 'intelligence', baseVal: 55, baseCost: 1400, desc: 'Consciência distribuída.' },

  { base: 'Placa de Aço', category: 'plating', stat: 'armor', baseVal: 20, baseCost: 100, desc: 'Proteção econômica.' },
  { base: 'Placa de Titânio', category: 'plating', stat: 'armor', baseVal: 35, baseCost: 240, desc: 'Leve e resistente.' },
  { base: 'Placa de Nanocarbono', category: 'plating', stat: 'armor', baseVal: 55, baseCost: 520, desc: 'Resistência extrema.' },
  { base: 'Casca Cerâmica', category: 'plating', stat: 'armor', baseVal: 45, baseCost: 360, desc: 'Resiste a calor e plasma.' },

  { base: 'Reparador Automático', category: 'utility', stat: 'power', baseVal: 10, baseCost: 280, desc: 'Restaura saúde em campo.' },
  { base: 'Compartimento de Carga', category: 'utility', stat: 'cargo', baseVal: 60, baseCost: 160, desc: 'Armazena recursos coletados.' },
  { base: 'Dissipador de Calor', category: 'utility', stat: 'power', baseVal: 8, baseCost: 120, desc: 'Permite overclock seguro.' },
  { base: 'Estabilizador Giroscópico', category: 'utility', stat: 'speed', baseVal: 6, baseCost: 140, desc: 'Melhora precisão e equilíbrio.' },
];

// Generate ~18 graded variants per archetype across 6 tiers -> 49 archetypes * ~18 = ~880 parts.
function generateParts(): CatalogItem[] {
  const items: CatalogItem[] = [];
  ARCHETYPES.forEach((a, ai) => {
    for (let tier = 1; tier <= 6; tier++) {
      // 3 grades per tier
      for (let g = 0; g < 3; g++) {
        const grade = GRADE[(ai + tier * 3 + g) % GRADE.length];
        const prefix = PREFIX[(ai + g) % PREFIX.length];
        const mult = 1 + (tier - 1) * 0.55 + g * 0.12;
        const statVal = Math.round(a.baseVal * mult);
        const cost = Math.round(a.baseCost * mult * (1 + g * 0.15));
        items.push({
          id: `part_${ai}_${tier}_${g}`,
          name: `${a.base} ${grade} ${prefix}${tier}`,
          category: a.category,
          tier,
          cost,
          stats: { [a.stat]: statVal } as CatalogItem['stats'],
          desc: a.desc,
        });
      }
    }
  });
  return items;
}

export const CATALOG_PARTS: CatalogItem[] = generateParts();

// Behaviors are exported from robotBehaviors; we expose count helper for UI.
export const CATALOG_PART_COUNT = CATALOG_PARTS.length;

export const CATALOG_BY_CATEGORY: Record<CatCategory, CatalogItem[]> = CATALOG_PARTS.reduce((acc, item) => {
  (acc[item.category] ||= []).push(item);
  return acc;
}, {} as Record<CatCategory, CatalogItem[]>);

export const CATEGORY_LABELS: Record<CatCategory, string> = {
  chassis: 'Chassi',
  locomotion: 'Locomoção',
  power: 'Energia',
  sensor: 'Sensores',
  weapon: 'Armas',
  defense: 'Defesa',
  manipulator: 'Manipuladores',
  comms: 'Comunicação',
  ai_core: 'Núcleos de IA',
  utility: 'Utilitários',
  plating: 'Blindagem',
  behavior: 'Comportamentos',
};
