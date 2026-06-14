// ============================================================================
// DEEP INDUSTRIAL SYSTEM — production chains, machines, logistics, efficiency.
// Inspired by Factorio / Satisfactory / Dyson Sphere / Captain of Industry,
// but at planetary, stellar and galactic scale.
// ============================================================================

export type MatTier = 0 | 1 | 2 | 3 | 4 | 5;
// 0 = raw ore, 1 = refined, 2 = alloy/structure, 3 = component, 4 = module, 5 = advanced building/system

export interface Material {
  id: string;
  name: string;
  namePt: string;
  tier: MatTier;
  category: 'metal' | 'energy' | 'chemical' | 'bio' | 'aero' | 'electronic' | 'construction' | 'military' | 'food' | 'medical';
  weight: number;   // kg per unit
  volume: number;   // m3 per unit
  baseQuality: number; // 0..1
  basePurity: number;  // 0..1
  icon: string;     // emoji for quick visual
}

export interface Recipe {
  id: string;
  machine: string;     // machine id
  inputs: { mat: string; qty: number }[];
  outputs: { mat: string; qty: number }[];
  time: number;        // seconds per cycle at 100% efficiency
  energy: number;      // energy per cycle
  namePt: string;
  nameEn: string;
}

export interface MachineDef {
  id: string;
  name: string;
  namePt: string;
  icon: string;
  category: 'extraction' | 'smelting' | 'refining' | 'chemical' | 'assembly' | 'advanced' | 'bio' | 'energy' | 'recycle';
  cost: { mat: string; qty: number }[];
  buildCredits: number;
  powerDraw: number;
  baseSpeed: number;
  descPt: string;
}

export interface LogisticsDef {
  id: string;
  namePt: string;
  nameEn: string;
  icon: string;
  throughput: number;  // units / s
  range: 'local' | 'planet' | 'orbital' | 'interplanetary' | 'galactic';
  costCredits: number;
  descPt: string;
}

// ---------------------------------------------------------------------------
// MATERIALS — the full chain. Six tiers across many branches.
// ---------------------------------------------------------------------------
export const MATERIALS: Material[] = [
  // ---- IRON / STRUCTURAL branch ----
  { id: 'iron_ore', name: 'Iron Ore', namePt: 'Minério de Ferro', tier: 0, category: 'metal', weight: 4, volume: 1.2, baseQuality: 0.5, basePurity: 0.35, icon: '⛏️' },
  { id: 'refined_iron', name: 'Refined Iron', namePt: 'Ferro Refinado', tier: 1, category: 'metal', weight: 2.8, volume: 0.5, baseQuality: 0.65, basePurity: 0.9, icon: '🔩' },
  { id: 'structural_alloy', name: 'Structural Alloy', namePt: 'Liga Estrutural', tier: 2, category: 'metal', weight: 3.2, volume: 0.6, baseQuality: 0.72, basePurity: 0.95, icon: '🧱' },
  { id: 'industrial_components', name: 'Industrial Components', namePt: 'Componentes Industriais', tier: 3, category: 'construction', weight: 2.1, volume: 0.4, baseQuality: 0.78, basePurity: 0.97, icon: '⚙️' },
  { id: 'construction_modules', name: 'Construction Modules', namePt: 'Módulos de Construção', tier: 4, category: 'construction', weight: 5.5, volume: 2.4, baseQuality: 0.82, basePurity: 0.98, icon: '🏗️' },
  { id: 'advanced_buildings', name: 'Advanced Building Kit', namePt: 'Edifícios Avançados', tier: 5, category: 'construction', weight: 18, volume: 9, baseQuality: 0.9, basePurity: 0.99, icon: '🏙️' },

  // ---- TITANIUM / AEROSPACE branch ----
  { id: 'titanium_ore', name: 'Titanium Ore', namePt: 'Minério de Titânio', tier: 0, category: 'metal', weight: 3.6, volume: 1.1, baseQuality: 0.55, basePurity: 0.3, icon: '⛏️' },
  { id: 'refined_titanium', name: 'Refined Titanium', namePt: 'Titânio Refinado', tier: 1, category: 'metal', weight: 2.2, volume: 0.45, baseQuality: 0.7, basePurity: 0.92, icon: '🔗' },
  { id: 'aerospace_frames', name: 'Aerospace Frames', namePt: 'Estruturas Aeroespaciais', tier: 2, category: 'aero', weight: 1.8, volume: 0.7, baseQuality: 0.8, basePurity: 0.96, icon: '🛩️' },
  { id: 'navigation_components', name: 'Navigation Components', namePt: 'Componentes de Navegação', tier: 3, category: 'aero', weight: 0.9, volume: 0.3, baseQuality: 0.85, basePurity: 0.98, icon: '🧭' },
  { id: 'ship_systems', name: 'Ship Systems', namePt: 'Sistemas de Naves', tier: 4, category: 'aero', weight: 4.2, volume: 2.1, baseQuality: 0.88, basePurity: 0.99, icon: '🚀' },

  // ---- ENERGY / CRYSTAL branch ----
  { id: 'energy_crystals', name: 'Energy Crystals', namePt: 'Cristais Energéticos', tier: 0, category: 'energy', weight: 1.2, volume: 0.4, baseQuality: 0.6, basePurity: 0.4, icon: '💎' },
  { id: 'energy_cells', name: 'Energy Cells', namePt: 'Células Energéticas', tier: 1, category: 'energy', weight: 0.8, volume: 0.2, baseQuality: 0.7, basePurity: 0.9, icon: '🔋' },
  { id: 'industrial_batteries', name: 'Industrial Batteries', namePt: 'Baterias Industriais', tier: 2, category: 'energy', weight: 6, volume: 1.5, baseQuality: 0.78, basePurity: 0.94, icon: '🔋' },
  { id: 'power_grids', name: 'Power Grids', namePt: 'Redes de Energia', tier: 3, category: 'energy', weight: 9, volume: 4, baseQuality: 0.83, basePurity: 0.97, icon: '⚡' },
  { id: 'planetary_infrastructure', name: 'Planetary Infrastructure', namePt: 'Infraestrutura Planetária', tier: 4, category: 'energy', weight: 40, volume: 28, baseQuality: 0.9, basePurity: 0.99, icon: '🌐' },

  // ---- ELECTRONIC / SILICON branch ----
  { id: 'silicon_ore', name: 'Silicon Ore', namePt: 'Minério de Silício', tier: 0, category: 'electronic', weight: 2, volume: 0.9, baseQuality: 0.5, basePurity: 0.45, icon: '⛏️' },
  { id: 'silicon_wafers', name: 'Silicon Wafers', namePt: 'Lâminas de Silício', tier: 1, category: 'electronic', weight: 0.3, volume: 0.1, baseQuality: 0.72, basePurity: 0.95, icon: '💿' },
  { id: 'microchips', name: 'Microchips', namePt: 'Microchips', tier: 2, category: 'electronic', weight: 0.1, volume: 0.05, baseQuality: 0.85, basePurity: 0.98, icon: '🔲' },
  { id: 'circuit_boards', name: 'Circuit Boards', namePt: 'Placas de Circuito', tier: 3, category: 'electronic', weight: 0.4, volume: 0.2, baseQuality: 0.87, basePurity: 0.98, icon: '🖥️' },
  { id: 'ai_cores', name: 'AI Cores', namePt: 'Núcleos de IA', tier: 4, category: 'electronic', weight: 1.5, volume: 0.6, baseQuality: 0.93, basePurity: 0.99, icon: '🧠' },

  // ---- CHEMICAL / FUEL branch ----
  { id: 'hydrocarbons', name: 'Hydrocarbons', namePt: 'Hidrocarbonetos', tier: 0, category: 'chemical', weight: 1, volume: 1, baseQuality: 0.4, basePurity: 0.3, icon: '🛢️' },
  { id: 'refined_fuel', name: 'Refined Fuel', namePt: 'Combustível Refinado', tier: 1, category: 'chemical', weight: 0.8, volume: 1, baseQuality: 0.7, basePurity: 0.9, icon: '⛽' },
  { id: 'polymers', name: 'Polymers', namePt: 'Polímeros', tier: 2, category: 'chemical', weight: 0.6, volume: 0.5, baseQuality: 0.75, basePurity: 0.93, icon: '🧪' },
  { id: 'composites', name: 'Composites', namePt: 'Compósitos', tier: 3, category: 'chemical', weight: 1.1, volume: 0.6, baseQuality: 0.82, basePurity: 0.96, icon: '🧴' },

  // ---- BIO / FOOD / MEDICAL branch ----
  { id: 'biomass', name: 'Biomass', namePt: 'Biomassa', tier: 0, category: 'bio', weight: 1.5, volume: 1.8, baseQuality: 0.4, basePurity: 0.5, icon: '🌿' },
  { id: 'nutrient_paste', name: 'Nutrient Paste', namePt: 'Pasta Nutritiva', tier: 1, category: 'food', weight: 1, volume: 0.8, baseQuality: 0.6, basePurity: 0.85, icon: '🥫' },
  { id: 'rations', name: 'Field Rations', namePt: 'Rações de Campo', tier: 2, category: 'food', weight: 0.7, volume: 0.5, baseQuality: 0.75, basePurity: 0.9, icon: '🍱' },
  { id: 'medical_compounds', name: 'Medical Compounds', namePt: 'Compostos Médicos', tier: 2, category: 'medical', weight: 0.3, volume: 0.2, baseQuality: 0.82, basePurity: 0.96, icon: '💊' },
  { id: 'medkits', name: 'Medkits', namePt: 'Kits Médicos', tier: 3, category: 'medical', weight: 0.9, volume: 0.6, baseQuality: 0.88, basePurity: 0.98, icon: '🩺' },

  // ---- MILITARY branch ----
  { id: 'munitions', name: 'Munitions', namePt: 'Munições', tier: 3, category: 'military', weight: 1.4, volume: 0.5, baseQuality: 0.8, basePurity: 0.95, icon: '💣' },
  { id: 'weapon_systems', name: 'Weapon Systems', namePt: 'Sistemas de Armas', tier: 4, category: 'military', weight: 6, volume: 2.5, baseQuality: 0.88, basePurity: 0.98, icon: '🔫' },
  { id: 'robotics', name: 'Robotics Assemblies', namePt: 'Conjuntos Robóticos', tier: 4, category: 'military', weight: 3.5, volume: 1.8, baseQuality: 0.9, basePurity: 0.98, icon: '🤖' },

  // ---- EXOTIC / END-GAME ----
  { id: 'rare_elements', name: 'Rare Elements', namePt: 'Elementos Raros', tier: 0, category: 'metal', weight: 5, volume: 0.5, baseQuality: 0.7, basePurity: 0.25, icon: '✨' },
  { id: 'nanomaterials', name: 'Nanomaterials', namePt: 'Nanomateriais', tier: 3, category: 'electronic', weight: 0.2, volume: 0.1, baseQuality: 0.92, basePurity: 0.99, icon: '🔬' },
  { id: 'megastructure_modules', name: 'Megastructure Modules', namePt: 'Módulos de Megaestrutura', tier: 5, category: 'construction', weight: 220, volume: 140, baseQuality: 0.95, basePurity: 0.99, icon: '🛰️' },
];

export const MAT_BY_ID: Record<string, Material> = MATERIALS.reduce((a, m) => { a[m.id] = m; return a; }, {} as Record<string, Material>);

// ---------------------------------------------------------------------------
// MACHINES — thousands conceptually; here are the archetypes, each upgradeable.
// ---------------------------------------------------------------------------
export const MACHINES: MachineDef[] = [
  { id: 'mining_drill', name: 'Mining Drill', namePt: 'Perfuratriz', icon: '⛏️', category: 'extraction', cost: [{ mat: 'refined_iron', qty: 10 }], buildCredits: 200, powerDraw: 12, baseSpeed: 1, descPt: 'Extrai minérios do solo planetário.' },
  { id: 'pump_jack', name: 'Pump Jack', namePt: 'Bomba de Extração', icon: '🛢️', category: 'extraction', cost: [{ mat: 'refined_iron', qty: 14 }], buildCredits: 240, powerDraw: 10, baseSpeed: 1, descPt: 'Bombeia hidrocarbonetos e fluidos.' },
  { id: 'harvester', name: 'Bio Harvester', namePt: 'Colheitadeira', icon: '🌾', category: 'bio', cost: [{ mat: 'refined_iron', qty: 8 }], buildCredits: 180, powerDraw: 6, baseSpeed: 1, descPt: 'Coleta biomassa de campos cultivados.' },
  { id: 'furnace', name: 'Industrial Furnace', namePt: 'Forno Industrial', icon: '🔥', category: 'smelting', cost: [{ mat: 'refined_iron', qty: 18 }], buildCredits: 320, powerDraw: 22, baseSpeed: 1, descPt: 'Funde minério em metal refinado.' },
  { id: 'foundry', name: 'Alloy Foundry', namePt: 'Fundição de Ligas', icon: '🏭', category: 'smelting', cost: [{ mat: 'structural_alloy', qty: 12 }], buildCredits: 520, powerDraw: 34, baseSpeed: 1, descPt: 'Combina metais em ligas estruturais.' },
  { id: 'refinery', name: 'Chemical Refinery', namePt: 'Refinaria', icon: '⚗️', category: 'refining', cost: [{ mat: 'structural_alloy', qty: 16 }], buildCredits: 560, powerDraw: 30, baseSpeed: 1, descPt: 'Refina combustíveis e cristais energéticos.' },
  { id: 'chem_separator', name: 'Chemical Separator', namePt: 'Separador Químico', icon: '🧪', category: 'chemical', cost: [{ mat: 'industrial_components', qty: 10 }], buildCredits: 680, powerDraw: 28, baseSpeed: 1, descPt: 'Separa compostos em polímeros e químicos.' },
  { id: 'assembler', name: 'Assembly Plant', namePt: 'Montadora', icon: '🔧', category: 'assembly', cost: [{ mat: 'industrial_components', qty: 14 }], buildCredits: 740, powerDraw: 26, baseSpeed: 1, descPt: 'Monta componentes a partir de peças.' },
  { id: 'molecular_printer', name: 'Molecular Printer', namePt: 'Impressora Molecular', icon: '🖨️', category: 'advanced', cost: [{ mat: 'construction_modules', qty: 8 }], buildCredits: 1400, powerDraw: 60, baseSpeed: 1, descPt: 'Imprime estruturas em escala molecular.' },
  { id: 'nano_factory', name: 'Nanotech Factory', namePt: 'Fábrica Nanotecnológica', icon: '🔬', category: 'advanced', cost: [{ mat: 'ai_cores', qty: 4 }], buildCredits: 2600, powerDraw: 90, baseSpeed: 1, descPt: 'Produz nanomateriais e IA.' },
  { id: 'gene_lab', name: 'Genetic Lab', namePt: 'Laboratório Genético', icon: '🧬', category: 'bio', cost: [{ mat: 'circuit_boards', qty: 8 }], buildCredits: 1800, powerDraw: 48, baseSpeed: 1, descPt: 'Sintetiza compostos médicos e bio.' },
  { id: 'fusion_reactor', name: 'Fusion Reactor', namePt: 'Reator de Fusão', icon: '☢️', category: 'energy', cost: [{ mat: 'power_grids', qty: 6 }], buildCredits: 3200, powerDraw: -400, baseSpeed: 1, descPt: 'Gera enorme quantidade de energia.' },
  { id: 'solar_array', name: 'Solar Array', namePt: 'Painel Solar', icon: '🔆', category: 'energy', cost: [{ mat: 'silicon_wafers', qty: 20 }], buildCredits: 600, powerDraw: -80, baseSpeed: 1, descPt: 'Gera energia limpa a partir da estrela.' },
  { id: 'recycler', name: 'Recycling Center', namePt: 'Centro de Reciclagem', icon: '♻️', category: 'recycle', cost: [{ mat: 'industrial_components', qty: 8 }], buildCredits: 520, powerDraw: 18, baseSpeed: 1, descPt: 'Recupera materiais de sucata.' },
  { id: 'weapon_plant', name: 'Weapons Factory', namePt: 'Fábrica de Armas', icon: '🏭', category: 'advanced', cost: [{ mat: 'construction_modules', qty: 10 }], buildCredits: 2200, powerDraw: 70, baseSpeed: 1, descPt: 'Produz munições e sistemas de armas.' },
  { id: 'shipyard_bay', name: 'Shipyard Bay', namePt: 'Doca de Estaleiro', icon: '🛠️', category: 'advanced', cost: [{ mat: 'ship_systems', qty: 4 }], buildCredits: 4000, powerDraw: 120, baseSpeed: 1, descPt: 'Monta sistemas e cascos de naves.' },
];

export const MACHINE_BY_ID: Record<string, MachineDef> = MACHINES.reduce((a, m) => { a[m.id] = m; return a; }, {} as Record<string, MachineDef>);

// ---------------------------------------------------------------------------
// RECIPES — define the chain edges.
// ---------------------------------------------------------------------------
export const RECIPES: Recipe[] = [
  // extraction
  { id: 'r_iron_ore', machine: 'mining_drill', inputs: [], outputs: [{ mat: 'iron_ore', qty: 4 }], time: 2, energy: 4, namePt: 'Extrair Minério de Ferro', nameEn: 'Mine Iron Ore' },
  { id: 'r_ti_ore', machine: 'mining_drill', inputs: [], outputs: [{ mat: 'titanium_ore', qty: 3 }], time: 2.4, energy: 5, namePt: 'Extrair Minério de Titânio', nameEn: 'Mine Titanium Ore' },
  { id: 'r_si_ore', machine: 'mining_drill', inputs: [], outputs: [{ mat: 'silicon_ore', qty: 4 }], time: 2, energy: 4, namePt: 'Extrair Silício', nameEn: 'Mine Silicon' },
  { id: 'r_crystals', machine: 'mining_drill', inputs: [], outputs: [{ mat: 'energy_crystals', qty: 2 }], time: 3, energy: 6, namePt: 'Extrair Cristais Energéticos', nameEn: 'Mine Energy Crystals' },
  { id: 'r_rare', machine: 'mining_drill', inputs: [], outputs: [{ mat: 'rare_elements', qty: 1 }], time: 5, energy: 9, namePt: 'Extrair Elementos Raros', nameEn: 'Mine Rare Elements' },
  { id: 'r_hydro', machine: 'pump_jack', inputs: [], outputs: [{ mat: 'hydrocarbons', qty: 5 }], time: 2, energy: 3, namePt: 'Bombear Hidrocarbonetos', nameEn: 'Pump Hydrocarbons' },
  { id: 'r_biomass', machine: 'harvester', inputs: [], outputs: [{ mat: 'biomass', qty: 5 }], time: 2.5, energy: 2, namePt: 'Colher Biomassa', nameEn: 'Harvest Biomass' },

  // tier1
  { id: 'r_ref_iron', machine: 'furnace', inputs: [{ mat: 'iron_ore', qty: 3 }], outputs: [{ mat: 'refined_iron', qty: 2 }], time: 3, energy: 8, namePt: 'Refinar Ferro', nameEn: 'Smelt Iron' },
  { id: 'r_ref_ti', machine: 'furnace', inputs: [{ mat: 'titanium_ore', qty: 3 }], outputs: [{ mat: 'refined_titanium', qty: 2 }], time: 3.5, energy: 10, namePt: 'Refinar Titânio', nameEn: 'Smelt Titanium' },
  { id: 'r_wafers', machine: 'furnace', inputs: [{ mat: 'silicon_ore', qty: 3 }], outputs: [{ mat: 'silicon_wafers', qty: 4 }], time: 3, energy: 9, namePt: 'Produzir Lâminas de Silício', nameEn: 'Make Wafers' },
  { id: 'r_cells', machine: 'refinery', inputs: [{ mat: 'energy_crystals', qty: 2 }], outputs: [{ mat: 'energy_cells', qty: 3 }], time: 3, energy: 7, namePt: 'Produzir Células Energéticas', nameEn: 'Make Energy Cells' },
  { id: 'r_fuel', machine: 'refinery', inputs: [{ mat: 'hydrocarbons', qty: 4 }], outputs: [{ mat: 'refined_fuel', qty: 3 }], time: 2.5, energy: 6, namePt: 'Refinar Combustível', nameEn: 'Refine Fuel' },
  { id: 'r_nutrient', machine: 'gene_lab', inputs: [{ mat: 'biomass', qty: 3 }], outputs: [{ mat: 'nutrient_paste', qty: 2 }], time: 2.5, energy: 5, namePt: 'Produzir Pasta Nutritiva', nameEn: 'Make Nutrient Paste' },

  // tier2
  { id: 'r_alloy', machine: 'foundry', inputs: [{ mat: 'refined_iron', qty: 3 }, { mat: 'refined_titanium', qty: 1 }], outputs: [{ mat: 'structural_alloy', qty: 2 }], time: 4, energy: 14, namePt: 'Fundir Liga Estrutural', nameEn: 'Forge Structural Alloy' },
  { id: 'r_aero', machine: 'foundry', inputs: [{ mat: 'refined_titanium', qty: 3 }, { mat: 'composites', qty: 1 }], outputs: [{ mat: 'aerospace_frames', qty: 2 }], time: 5, energy: 18, namePt: 'Forjar Estruturas Aeroespaciais', nameEn: 'Forge Aerospace Frames' },
  { id: 'r_chips', machine: 'assembler', inputs: [{ mat: 'silicon_wafers', qty: 3 }], outputs: [{ mat: 'microchips', qty: 2 }], time: 4, energy: 12, namePt: 'Montar Microchips', nameEn: 'Assemble Microchips' },
  { id: 'r_batteries', machine: 'assembler', inputs: [{ mat: 'energy_cells', qty: 3 }, { mat: 'structural_alloy', qty: 1 }], outputs: [{ mat: 'industrial_batteries', qty: 1 }], time: 4, energy: 12, namePt: 'Montar Baterias Industriais', nameEn: 'Assemble Batteries' },
  { id: 'r_polymers', machine: 'chem_separator', inputs: [{ mat: 'hydrocarbons', qty: 4 }], outputs: [{ mat: 'polymers', qty: 3 }], time: 3, energy: 10, namePt: 'Sintetizar Polímeros', nameEn: 'Synthesize Polymers' },
  { id: 'r_rations', machine: 'assembler', inputs: [{ mat: 'nutrient_paste', qty: 2 }], outputs: [{ mat: 'rations', qty: 2 }], time: 3, energy: 6, namePt: 'Produzir Rações', nameEn: 'Make Rations' },
  { id: 'r_medcomp', machine: 'gene_lab', inputs: [{ mat: 'biomass', qty: 2 }, { mat: 'polymers', qty: 1 }], outputs: [{ mat: 'medical_compounds', qty: 2 }], time: 4, energy: 10, namePt: 'Sintetizar Compostos Médicos', nameEn: 'Synthesize Medical Compounds' },

  // tier3
  { id: 'r_ind_comp', machine: 'assembler', inputs: [{ mat: 'structural_alloy', qty: 2 }, { mat: 'microchips', qty: 1 }], outputs: [{ mat: 'industrial_components', qty: 2 }], time: 5, energy: 16, namePt: 'Montar Componentes Industriais', nameEn: 'Assemble Industrial Components' },
  { id: 'r_nav', machine: 'assembler', inputs: [{ mat: 'aerospace_frames', qty: 2 }, { mat: 'microchips', qty: 2 }], outputs: [{ mat: 'navigation_components', qty: 1 }], time: 6, energy: 20, namePt: 'Montar Componentes de Navegação', nameEn: 'Assemble Navigation Components' },
  { id: 'r_circuits', machine: 'assembler', inputs: [{ mat: 'microchips', qty: 2 }, { mat: 'polymers', qty: 1 }], outputs: [{ mat: 'circuit_boards', qty: 2 }], time: 4, energy: 14, namePt: 'Montar Placas de Circuito', nameEn: 'Assemble Circuit Boards' },
  { id: 'r_grids', machine: 'assembler', inputs: [{ mat: 'industrial_batteries', qty: 2 }, { mat: 'structural_alloy', qty: 2 }], outputs: [{ mat: 'power_grids', qty: 1 }], time: 6, energy: 22, namePt: 'Montar Redes de Energia', nameEn: 'Assemble Power Grids' },
  { id: 'r_composites', machine: 'chem_separator', inputs: [{ mat: 'polymers', qty: 2 }, { mat: 'refined_titanium', qty: 1 }], outputs: [{ mat: 'composites', qty: 2 }], time: 4, energy: 14, namePt: 'Produzir Compósitos', nameEn: 'Make Composites' },
  { id: 'r_munitions', machine: 'weapon_plant', inputs: [{ mat: 'structural_alloy', qty: 2 }, { mat: 'refined_fuel', qty: 1 }], outputs: [{ mat: 'munitions', qty: 3 }], time: 4, energy: 18, namePt: 'Produzir Munições', nameEn: 'Make Munitions' },
  { id: 'r_medkits', machine: 'gene_lab', inputs: [{ mat: 'medical_compounds', qty: 2 }, { mat: 'polymers', qty: 1 }], outputs: [{ mat: 'medkits', qty: 2 }], time: 4, energy: 12, namePt: 'Produzir Kits Médicos', nameEn: 'Make Medkits' },
  { id: 'r_nano', machine: 'nano_factory', inputs: [{ mat: 'circuit_boards', qty: 2 }, { mat: 'rare_elements', qty: 1 }], outputs: [{ mat: 'nanomaterials', qty: 2 }], time: 6, energy: 30, namePt: 'Produzir Nanomateriais', nameEn: 'Make Nanomaterials' },

  // tier4
  { id: 'r_cons_mod', machine: 'molecular_printer', inputs: [{ mat: 'industrial_components', qty: 3 }, { mat: 'composites', qty: 2 }], outputs: [{ mat: 'construction_modules', qty: 1 }], time: 8, energy: 34, namePt: 'Imprimir Módulos de Construção', nameEn: 'Print Construction Modules' },
  { id: 'r_ship_sys', machine: 'shipyard_bay', inputs: [{ mat: 'navigation_components', qty: 3 }, { mat: 'power_grids', qty: 1 }], outputs: [{ mat: 'ship_systems', qty: 1 }], time: 10, energy: 50, namePt: 'Montar Sistemas de Naves', nameEn: 'Assemble Ship Systems' },
  { id: 'r_ai', machine: 'nano_factory', inputs: [{ mat: 'circuit_boards', qty: 3 }, { mat: 'nanomaterials', qty: 2 }], outputs: [{ mat: 'ai_cores', qty: 1 }], time: 9, energy: 44, namePt: 'Produzir Núcleos de IA', nameEn: 'Build AI Cores' },
  { id: 'r_weapons', machine: 'weapon_plant', inputs: [{ mat: 'munitions', qty: 3 }, { mat: 'industrial_components', qty: 2 }], outputs: [{ mat: 'weapon_systems', qty: 1 }], time: 8, energy: 38, namePt: 'Montar Sistemas de Armas', nameEn: 'Build Weapon Systems' },
  { id: 'r_robotics', machine: 'assembler', inputs: [{ mat: 'ai_cores', qty: 1 }, { mat: 'industrial_components', qty: 2 }], outputs: [{ mat: 'robotics', qty: 1 }], time: 8, energy: 36, namePt: 'Montar Conjuntos Robóticos', nameEn: 'Build Robotics' },
  { id: 'r_planet_infra', machine: 'molecular_printer', inputs: [{ mat: 'power_grids', qty: 2 }, { mat: 'construction_modules', qty: 1 }], outputs: [{ mat: 'planetary_infrastructure', qty: 1 }], time: 12, energy: 60, namePt: 'Construir Infraestrutura Planetária', nameEn: 'Build Planetary Infrastructure' },

  // tier5
  { id: 'r_adv_build', machine: 'molecular_printer', inputs: [{ mat: 'construction_modules', qty: 3 }, { mat: 'power_grids', qty: 1 }], outputs: [{ mat: 'advanced_buildings', qty: 1 }], time: 16, energy: 80, namePt: 'Construir Edifícios Avançados', nameEn: 'Build Advanced Buildings' },
  { id: 'r_mega', machine: 'shipyard_bay', inputs: [{ mat: 'advanced_buildings', qty: 2 }, { mat: 'ship_systems', qty: 2 }, { mat: 'ai_cores', qty: 1 }], outputs: [{ mat: 'megastructure_modules', qty: 1 }], time: 30, energy: 200, namePt: 'Construir Módulos de Megaestrutura', nameEn: 'Build Megastructure Modules' },

  // recycle (gives back raw)
  { id: 'r_recycle', machine: 'recycler', inputs: [{ mat: 'industrial_components', qty: 1 }], outputs: [{ mat: 'refined_iron', qty: 2 }], time: 3, energy: 6, namePt: 'Reciclar Componentes', nameEn: 'Recycle Components' },

  // energy
  { id: 'r_solar', machine: 'solar_array', inputs: [], outputs: [], time: 1, energy: 0, namePt: 'Gerar Energia Solar', nameEn: 'Generate Solar Power' },
  { id: 'r_fusion', machine: 'fusion_reactor', inputs: [{ mat: 'refined_fuel', qty: 1 }], outputs: [], time: 1, energy: 0, namePt: 'Gerar Energia de Fusão', nameEn: 'Generate Fusion Power' },
];

export const RECIPES_BY_MACHINE: Record<string, Recipe[]> = RECIPES.reduce((a, r) => {
  (a[r.machine] ||= []).push(r); return a;
}, {} as Record<string, Recipe[]>);

// ---------------------------------------------------------------------------
// LOGISTICS — belts, pipes, rails, trucks, drones, orbital, interplanetary.
// ---------------------------------------------------------------------------
export const LOGISTICS: LogisticsDef[] = [
  { id: 'conveyor', namePt: 'Esteira Transportadora', nameEn: 'Conveyor Belt', icon: '🛤️', throughput: 4, range: 'local', costCredits: 60, descPt: 'Move itens entre máquinas adjacentes.' },
  { id: 'pipeline', namePt: 'Tubulação Industrial', nameEn: 'Pipeline', icon: '🚰', throughput: 6, range: 'local', costCredits: 80, descPt: 'Transporta fluidos e gases.' },
  { id: 'railway', namePt: 'Rede Ferroviária', nameEn: 'Railway', icon: '🚆', throughput: 20, range: 'planet', costCredits: 400, descPt: 'Trens de carga para grandes distâncias.' },
  { id: 'cargo_train', namePt: 'Trem de Carga', nameEn: 'Cargo Train', icon: '🚂', throughput: 30, range: 'planet', costCredits: 600, descPt: 'Vagões automatizados de alto volume.' },
  { id: 'auto_truck', namePt: 'Caminhão Autônomo', nameEn: 'Autonomous Truck', icon: '🚛', throughput: 8, range: 'planet', costCredits: 220, descPt: 'Frota terrestre flexível.' },
  { id: 'transport_drone', namePt: 'Drone de Transporte', nameEn: 'Transport Drone', icon: '🛸', throughput: 5, range: 'planet', costCredits: 180, descPt: 'Entregas aéreas rápidas.' },
  { id: 'cargo_aircraft', namePt: 'Aeronave de Carga', nameEn: 'Cargo Aircraft', icon: '✈️', throughput: 18, range: 'planet', costCredits: 700, descPt: 'Carga pesada entre continentes.' },
  { id: 'orbital_elevator', namePt: 'Elevador Orbital', nameEn: 'Orbital Elevator', icon: '🛗', throughput: 40, range: 'orbital', costCredits: 5000, descPt: 'Liga superfície à órbita sem foguetes.' },
  { id: 'space_freighter', namePt: 'Cargueiro Espacial', nameEn: 'Space Freighter', icon: '🚀', throughput: 60, range: 'interplanetary', costCredits: 4000, descPt: 'Transporta cargas entre planetas.' },
  { id: 'space_port', namePt: 'Porto Espacial', nameEn: 'Space Port', icon: '🏗️', throughput: 80, range: 'orbital', costCredits: 6000, descPt: 'Hub de embarque e desembarque orbital.' },
  { id: 'logistics_hub', namePt: 'Centro Logístico', nameEn: 'Logistics Center', icon: '📦', throughput: 100, range: 'planet', costCredits: 3000, descPt: 'Coordena toda a logística planetária.' },
  { id: 'interplanetary_hub', namePt: 'Hub Interplanetário', nameEn: 'Interplanetary Hub', icon: '🌌', throughput: 150, range: 'interplanetary', costCredits: 12000, descPt: 'Conecta sistemas e corredores comerciais.' },
  { id: 'trade_corridor', namePt: 'Corredor Comercial', nameEn: 'Trade Corridor', icon: '🛣️', throughput: 200, range: 'galactic', costCredits: 25000, descPt: 'Rotas comerciais entre galáxias.' },
];

// ---------------------------------------------------------------------------
// EFFICIENCY MODEL — temperature, energy, labor, distance, tech, maintenance.
// ---------------------------------------------------------------------------
export interface EfficiencyFactors {
  temperature: number; // ideal ~20C -> 1, extremes lower
  energy: number;      // 0..1 power availability
  labor: number;       // 0..1 workforce quality
  distance: number;    // 0..1 (closer resources = higher)
  tech: number;        // 0..1 tech level
  maintenance: number; // 0..1 upkeep
}

export function computeEfficiency(f: EfficiencyFactors): number {
  const tempFactor = Math.max(0.2, 1 - Math.abs(f.temperature - 20) / 120);
  const eff = tempFactor * 0.18 + f.energy * 0.22 + f.labor * 0.18 + f.distance * 0.14 + f.tech * 0.16 + f.maintenance * 0.12;
  return Math.max(0.05, Math.min(1.4, eff * 1.2));
}
