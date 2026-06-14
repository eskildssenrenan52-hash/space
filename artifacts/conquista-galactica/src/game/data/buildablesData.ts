// ============================================================================
// BUILDABLES — everything the player can construct: satellites, drones, robots,
// land/sea/air vehicles, space stations, fleets, capital ships, megastructures.
// ============================================================================

export type BuildCategory =
  | 'satellite' | 'drone' | 'robot' | 'ground' | 'aquatic' | 'aircraft'
  | 'station' | 'fleet' | 'capital' | 'mega' | 'planet_structure' | 'defense';

export interface Buildable {
  id: string;
  name: string;
  category: BuildCategory;
  icon: string;
  buildTime: number;        // seconds
  credits: number;
  materials: { mat: string; qty: number }[];
  desc: string;
  power?: number;
}

export const BUILD_CATEGORY_LABELS: Record<BuildCategory, string> = {
  satellite: 'Satélites',
  drone: 'Drones',
  robot: 'Robôs',
  ground: 'Veículos Terrestres',
  aquatic: 'Veículos Aquáticos',
  aircraft: 'Veículos Voadores',
  station: 'Estações Espaciais',
  fleet: 'Frotas',
  capital: 'Naves Capitais',
  mega: 'Megaconstruções',
  planet_structure: 'Estruturas Planetárias',
  defense: 'Defesas',
};

export const BUILDABLES: Buildable[] = [
  // Satellites
  { id: 'sat_comms', name: 'Satélite de Comunicação', category: 'satellite', icon: '📡', buildTime: 30, credits: 800, materials: [{ mat: 'navigation_components', qty: 2 }, { mat: 'circuit_boards', qty: 3 }], desc: 'Aumenta coordenação e alcance de comando.' },
  { id: 'sat_spy', name: 'Satélite Espião', category: 'satellite', icon: '🛰️', buildTime: 45, credits: 1400, materials: [{ mat: 'navigation_components', qty: 3 }, { mat: 'ai_cores', qty: 1 }], desc: 'Revela infraestrutura inimiga durante reconhecimento.' },
  { id: 'sat_weather', name: 'Satélite Climático', category: 'satellite', icon: '🌦️', buildTime: 35, credits: 900, materials: [{ mat: 'circuit_boards', qty: 4 }], desc: 'Prevê clima planetário e melhora eficiência.' },
  { id: 'sat_defense', name: 'Satélite de Defesa', category: 'satellite', icon: '🛡️', buildTime: 60, credits: 2200, materials: [{ mat: 'weapon_systems', qty: 1 }, { mat: 'power_grids', qty: 1 }], desc: 'Plataforma orbital de defesa.' },

  // Drones
  { id: 'drone_scout', name: 'Drone de Reconhecimento', category: 'drone', icon: '🛸', buildTime: 12, credits: 200, materials: [{ mat: 'aerospace_frames', qty: 1 }, { mat: 'microchips', qty: 1 }], desc: 'Explora e revela área.' },
  { id: 'drone_combat', name: 'Drone de Combate', category: 'drone', icon: '🚁', buildTime: 18, credits: 420, materials: [{ mat: 'weapon_systems', qty: 1 }, { mat: 'aerospace_frames', qty: 1 }], desc: 'Ataque aéreo autônomo.' },
  { id: 'drone_stealth', name: 'Drone Furtivo', category: 'drone', icon: '🦇', buildTime: 24, credits: 680, materials: [{ mat: 'composites', qty: 2 }, { mat: 'ai_cores', qty: 1 }], desc: 'Espionagem indetectável.' },
  { id: 'drone_cargo', name: 'Drone de Carga', category: 'drone', icon: '📦', buildTime: 14, credits: 260, materials: [{ mat: 'aerospace_frames', qty: 1 }, { mat: 'structural_alloy', qty: 1 }], desc: 'Logística aérea.' },

  // Robots (links to engineering)
  { id: 'robot_worker', name: 'Robô Operário', category: 'robot', icon: '🤖', buildTime: 20, credits: 350, materials: [{ mat: 'robotics', qty: 1 }], desc: 'Trabalha em fábricas e minas.' },
  { id: 'robot_soldier', name: 'Robô Soldado', category: 'robot', icon: '🦾', buildTime: 28, credits: 620, materials: [{ mat: 'robotics', qty: 1 }, { mat: 'weapon_systems', qty: 1 }], desc: 'Unidade terrestre de combate.' },
  { id: 'robot_engineer', name: 'Robô Engenheiro', category: 'robot', icon: '🛠️', buildTime: 26, credits: 540, materials: [{ mat: 'robotics', qty: 1 }, { mat: 'industrial_components', qty: 2 }], desc: 'Constrói e repara em campo.' },

  // Ground vehicles
  { id: 'gv_apc', name: 'Transporte Blindado', category: 'ground', icon: '🚙', buildTime: 30, credits: 700, materials: [{ mat: 'structural_alloy', qty: 4 }, { mat: 'industrial_components', qty: 2 }], desc: 'Leva tropas com segurança.' },
  { id: 'gv_tank', name: 'Tanque de Batalha', category: 'ground', icon: '🛻', buildTime: 45, credits: 1500, materials: [{ mat: 'structural_alloy', qty: 6 }, { mat: 'weapon_systems', qty: 1 }], desc: 'Força terrestre pesada.' },
  { id: 'gv_crawler', name: 'Escavadeira de Mineração', category: 'ground', icon: '🚜', buildTime: 40, credits: 1100, materials: [{ mat: 'industrial_components', qty: 4 }], desc: 'Mineração móvel em larga escala.' },

  // Aquatic
  { id: 'aq_sub', name: 'Submarino', category: 'aquatic', icon: '🚤', buildTime: 50, credits: 1700, materials: [{ mat: 'structural_alloy', qty: 6 }, { mat: 'navigation_components', qty: 2 }], desc: 'Operações subaquáticas.' },
  { id: 'aq_carrier', name: 'Porta-Aviões Naval', category: 'aquatic', icon: '🛳️', buildTime: 90, credits: 4200, materials: [{ mat: 'construction_modules', qty: 4 }, { mat: 'ship_systems', qty: 2 }], desc: 'Base naval móvel.' },

  // Aircraft
  { id: 'ac_fighter', name: 'Caça Atmosférico', category: 'aircraft', icon: '✈️', buildTime: 35, credits: 1300, materials: [{ mat: 'aerospace_frames', qty: 4 }, { mat: 'weapon_systems', qty: 1 }], desc: 'Superioridade aérea.' },
  { id: 'ac_bomber', name: 'Bombardeiro', category: 'aircraft', icon: '🛩️', buildTime: 55, credits: 2400, materials: [{ mat: 'aerospace_frames', qty: 6 }, { mat: 'munitions', qty: 4 }], desc: 'Bombardeio estratégico.' },
  { id: 'ac_dropship', name: 'Nave de Desembarque', category: 'aircraft', icon: '🚀', buildTime: 60, credits: 2800, materials: [{ mat: 'ship_systems', qty: 1 }, { mat: 'aerospace_frames', qty: 4 }], desc: 'Leva tropas à superfície durante invasões.' },

  // Stations
  { id: 'st_outpost', name: 'Posto Orbital', category: 'station', icon: '🛰️', buildTime: 120, credits: 6000, materials: [{ mat: 'construction_modules', qty: 6 }, { mat: 'planetary_infrastructure', qty: 1 }], desc: 'Pequena estação de apoio.' },
  { id: 'st_shipyard', name: 'Estaleiro Orbital', category: 'station', icon: '🏗️', buildTime: 200, credits: 14000, materials: [{ mat: 'construction_modules', qty: 10 }, { mat: 'ship_systems', qty: 4 }], desc: 'Constrói naves no espaço.' },
  { id: 'st_city', name: 'Cidade Orbital', category: 'station', icon: '🌆', buildTime: 300, credits: 28000, materials: [{ mat: 'advanced_buildings', qty: 6 }, { mat: 'planetary_infrastructure', qty: 4 }], desc: 'Habitat espacial para milhões.' },

  // Fleets
  { id: 'fl_patrol', name: 'Frota de Patrulha', category: 'fleet', icon: '🚀', buildTime: 150, credits: 9000, materials: [{ mat: 'ship_systems', qty: 4 }, { mat: 'weapon_systems', qty: 3 }], desc: 'Esquadrão de defesa móvel.' },
  { id: 'fl_strike', name: 'Frota de Assalto', category: 'fleet', icon: '⚔️', buildTime: 220, credits: 18000, materials: [{ mat: 'ship_systems', qty: 8 }, { mat: 'weapon_systems', qty: 6 }], desc: 'Força ofensiva completa.' },
  { id: 'fl_invasion', name: 'Frota de Invasão', category: 'fleet', icon: '🛸', buildTime: 320, credits: 36000, materials: [{ mat: 'ship_systems', qty: 14 }, { mat: 'weapon_systems', qty: 10 }, { mat: 'robotics', qty: 8 }], desc: 'Frota completa para conquista planetária.' },

  // Capital ships
  { id: 'cap_battleship', name: 'Couraçado', category: 'capital', icon: '🛳️', buildTime: 280, credits: 24000, materials: [{ mat: 'ship_systems', qty: 8 }, { mat: 'weapon_systems', qty: 8 }, { mat: 'advanced_buildings', qty: 2 }], desc: 'Nave de guerra pesada.' },
  { id: 'cap_carrier', name: 'Porta-Naves Capital', category: 'capital', icon: '🚀', buildTime: 360, credits: 42000, materials: [{ mat: 'ship_systems', qty: 12 }, { mat: 'advanced_buildings', qty: 4 }], desc: 'Lança esquadrões de caças.' },
  { id: 'cap_titan', name: 'Titã de Guerra', category: 'capital', icon: '🌟', buildTime: 600, credits: 90000, materials: [{ mat: 'megastructure_modules', qty: 1 }, { mat: 'weapon_systems', qty: 20 }, { mat: 'ai_cores', qty: 6 }], desc: 'A maior nave de batalha imaginável.' },

  // Megastructures
  { id: 'mega_dyson', name: 'Esfera de Dyson (Anel)', category: 'mega', icon: '☀️', buildTime: 1200, credits: 250000, materials: [{ mat: 'megastructure_modules', qty: 10 }, { mat: 'planetary_infrastructure', qty: 20 }], desc: 'Coleta toda a energia de uma estrela.' },
  { id: 'mega_ringworld', name: 'Mundo-Anel', category: 'mega', icon: '💫', buildTime: 1800, credits: 400000, materials: [{ mat: 'megastructure_modules', qty: 20 }, { mat: 'advanced_buildings', qty: 30 }], desc: 'Habitat artificial em torno de uma estrela.' },
  { id: 'mega_gate', name: 'Portal Estelar', category: 'mega', icon: '🌀', buildTime: 900, credits: 180000, materials: [{ mat: 'megastructure_modules', qty: 6 }, { mat: 'ai_cores', qty: 10 }], desc: 'Viagem instantânea entre sistemas.' },

  // Planet structures
  { id: 'ps_factory', name: 'Complexo Fabril', category: 'planet_structure', icon: '🏭', buildTime: 80, credits: 3000, materials: [{ mat: 'construction_modules', qty: 4 }], desc: 'Núcleo industrial planetário.' },
  { id: 'ps_powerplant', name: 'Usina de Energia', category: 'planet_structure', icon: '⚡', buildTime: 70, credits: 2600, materials: [{ mat: 'power_grids', qty: 3 }], desc: 'Abastece toda a colônia.', power: -300 },
  { id: 'ps_lab', name: 'Laboratório de Pesquisa', category: 'planet_structure', icon: '🔬', buildTime: 90, credits: 3400, materials: [{ mat: 'circuit_boards', qty: 6 }, { mat: 'advanced_buildings', qty: 1 }], desc: 'Acelera a pesquisa tecnológica.' },
  { id: 'ps_spaceport', name: 'Porto Espacial', category: 'planet_structure', icon: '🚀', buildTime: 110, credits: 5000, materials: [{ mat: 'construction_modules', qty: 6 }, { mat: 'ship_systems', qty: 1 }], desc: 'Conecta o planeta ao espaço.' },
  { id: 'ps_city', name: 'Megacidade', category: 'planet_structure', icon: '🏙️', buildTime: 240, credits: 16000, materials: [{ mat: 'advanced_buildings', qty: 8 }, { mat: 'planetary_infrastructure', qty: 4 }], desc: 'Centro populacional gigante.' },

  // Defenses (used by the war/defense layout)
  { id: 'def_turret', name: 'Torre de Defesa', category: 'defense', icon: '🔫', buildTime: 25, credits: 600, materials: [{ mat: 'weapon_systems', qty: 1 }], desc: 'Defesa terrestre antiaérea.', power: 20 },
  { id: 'def_shield', name: 'Gerador de Escudo', category: 'defense', icon: '🛡️', buildTime: 60, credits: 2400, materials: [{ mat: 'power_grids', qty: 2 }, { mat: 'industrial_components', qty: 3 }], desc: 'Protege estruturas de bombardeio.', power: 120 },
  { id: 'def_orbital_cannon', name: 'Canhão Orbital', category: 'defense', icon: '💥', buildTime: 90, credits: 4800, materials: [{ mat: 'weapon_systems', qty: 3 }, { mat: 'power_grids', qty: 1 }], desc: 'Destrói naves na órbita.', power: 200 },
  { id: 'def_flak', name: 'Bateria Antiaérea', category: 'defense', icon: '🎯', buildTime: 40, credits: 1200, materials: [{ mat: 'munitions', qty: 4 }, { mat: 'structural_alloy', qty: 2 }], desc: 'Abate aeronaves e drones.', power: 40 },
];

export const BUILDABLES_BY_CATEGORY: Record<BuildCategory, Buildable[]> = BUILDABLES.reduce((acc, b) => {
  (acc[b.category] ||= []).push(b);
  return acc;
}, {} as Record<BuildCategory, Buildable[]>);
