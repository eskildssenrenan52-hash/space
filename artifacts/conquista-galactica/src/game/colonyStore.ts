// ============================================================================
// COLONY STORE — colonization, cities that grow with investment, mining,
// multi-dimension empire management (Economia, Energia, Segurança, Ecologia,
// Saúde/População) and a live component market with price & demand.
// Self-contained: reads from gameStore (colonies/planets) and writes resources
// into empireStore inventory + credits into gameStore.
// ============================================================================
import { create } from 'zustand';
import { useGameStore, type ResourceType } from './gameStore';
import { useEmpireStore } from './empireStore';
import { MAT_BY_ID } from './data/industryData';
import { CATALOG_PARTS, type CatCategory, type CatalogItem } from './data/engineeringCatalog';

let cid = 0;
const nid = (p = 'c') => `${p}_${cid++}`;
const clamp = (v: number, a = 0, b = 100) => Math.max(a, Math.min(b, v));

// ---------------------------------------------------------------------------
// Districts — what you build inside a city to grow it. Each consumes credits +
// materials and contributes to one of the 5 management dimensions + pop cap.
// ---------------------------------------------------------------------------
export type Dimension = 'economy' | 'energy' | 'security' | 'ecology' | 'health';

export type DistrictTier = 1 | 2 | 3 | 4;
export type DistrictCategory = 'civilian' | 'industrial' | 'military' | 'research' | 'special';

export interface District {
  id: string;
  name: string;
  icon: string;
  dim: Dimension;
  support: number;     // how much it raises its dimension target
  popCap: number;      // population capacity added
  ecoPenalty?: number; // pollution it creates (lowers ecology target)
  credits: number;
  materials: { mat: string; qty: number }[];
  desc: string;
  tier: DistrictTier;
  category: DistrictCategory;
  color: string;       // accent color for the card
  /** Secondary bonus: extra credit income per tick */
  bonusIncome?: number;
  /** Science points per tick (future use) */
  scienceBonus?: number;
  /** Defense power added to planet */
  defenseBonus?: number;
}

export const DISTRICTS: District[] = [
  // ── CIVILIAN ──────────────────────────────────────────────────────────────
  { id: 'housing',   name: 'Distrito Residencial',  icon: '🏘️', dim: 'health',   support: 4,  popCap: 4000,  credits: 600,   materials: [{ mat: 'structural_alloy', qty: 4 }],                                        desc: 'Moradias padrão para novos colonos.',             tier: 1, category: 'civilian',  color: '#34d399' },
  { id: 'arcology',  name: 'Arcologia',             icon: '🏢', dim: 'health',   support: 8,  popCap: 14000, credits: 4200,  materials: [{ mat: 'advanced_buildings', qty: 3 }],                                       desc: 'Cidade vertical de alta densidade.',              tier: 2, category: 'civilian',  color: '#6ee7b7' },
  { id: 'megacity',  name: 'Megalópole Orbital',    icon: '🌆', dim: 'health',   support: 14, popCap: 40000, credits: 18000, materials: [{ mat: 'advanced_buildings', qty: 8 }, { mat: 'ai_cores', qty: 3 }],           desc: 'Cidade-planeta. Capacidade pop massiva.',         tier: 4, category: 'civilian',  color: '#a7f3d0' },
  { id: 'hospital',  name: 'Complexo Médico',       icon: '🏥', dim: 'health',   support: 16, popCap: 1500,  credits: 1600,  materials: [{ mat: 'industrial_components', qty: 3 }],                                    desc: 'Aumenta saúde e crescimento populacional.',       tier: 1, category: 'civilian',  color: '#f472b6' },
  { id: 'biolab',    name: 'Laboratório de Genoma', icon: '🧬', dim: 'health',   support: 24, popCap: 2000,  credits: 7200,  materials: [{ mat: 'medical_compounds', qty: 4 }, { mat: 'ai_cores', qty: 1 }],            desc: 'Cura doenças e duplica crescimento genético.',    tier: 3, category: 'research',  color: '#f9a8d4' },

  // ── ECONOMY ───────────────────────────────────────────────────────────────
  { id: 'market',   name: 'Centro Comercial',       icon: '🏬', dim: 'economy',  support: 8,  popCap: 800,   credits: 900,   materials: [{ mat: 'industrial_components', qty: 3 }],                                    desc: 'Aumenta a renda da cidade.',                      tier: 1, category: 'civilian',  color: '#fbbf24', bonusIncome: 0.3 },
  { id: 'bank',     name: 'Distrito Financeiro',    icon: '🏦', dim: 'economy',  support: 14, popCap: 500,   credits: 3600,  materials: [{ mat: 'advanced_buildings', qty: 2 }, { mat: 'ai_cores', qty: 1 }],           desc: 'Gera muita renda passiva.',                       tier: 2, category: 'civilian',  color: '#f59e0b', bonusIncome: 0.8 },
  { id: 'trade_hub',name: 'Hub de Comércio Galáctico', icon: '🛸', dim: 'economy', support: 20, popCap: 1000, credits: 9500, materials: [{ mat: 'advanced_buildings', qty: 4 }, { mat: 'rare_elements', qty: 3 }],    desc: 'Exporta para impérios vizinhos — renda enorme.',  tier: 3, category: 'special',   color: '#fcd34d', bonusIncome: 2.5 },
  { id: 'factory_district', name: 'Distrito Industrial', icon: '🏭', dim: 'economy', support: 18, popCap: 1000, ecoPenalty: 16, credits: 2000, materials: [{ mat: 'construction_modules', qty: 2 }], desc: 'Muita renda, mas polui o planeta.',          tier: 1, category: 'industrial', color: '#d97706', bonusIncome: 0.5 },
  { id: 'quantum_econ', name: 'Centro Quântico de Finanças', icon: '⚛️', dim: 'economy', support: 30, popCap: 200, credits: 22000, materials: [{ mat: 'ai_cores', qty: 6 }, { mat: 'energy_crystals', qty: 10 }], desc: 'IA quântica gerencia trilhões. Renda estratosférica.', tier: 4, category: 'research', color: '#fef08a', bonusIncome: 6.0 },

  // ── ENERGY ────────────────────────────────────────────────────────────────
  { id: 'reactor',  name: 'Usina de Energia',       icon: '⚡', dim: 'energy',   support: 16, popCap: 0,     credits: 1400,  materials: [{ mat: 'power_grids', qty: 2 }],                                              desc: 'Abastece a cidade de energia.',                   tier: 1, category: 'industrial', color: '#38bdf8' },
  { id: 'fusion',   name: 'Reator de Fusão',        icon: '☢️', dim: 'energy',   support: 30, popCap: 0,     credits: 5200,  materials: [{ mat: 'power_grids', qty: 4 }, { mat: 'energy_crystals', qty: 8 }],          desc: 'Energia limpa em larga escala.',                  tier: 2, category: 'industrial', color: '#7dd3fc' },
  { id: 'dyson',    name: 'Anel de Dyson Parcial',  icon: '🌟', dim: 'energy',   support: 60, popCap: 0,     credits: 35000, materials: [{ mat: 'power_grids', qty: 12 }, { mat: 'rare_elements', qty: 8 }, { mat: 'energy_crystals', qty: 20 }], desc: 'Capta energia estelar. Poder quase ilimitado.', tier: 4, category: 'special',   color: '#bae6fd' },
  { id: 'antimatter_plant', name: 'Planta de Antimatéria', icon: '🔮', dim: 'energy', support: 45, popCap: 0, credits: 14000, materials: [{ mat: 'energy_crystals', qty: 12 }, { mat: 'ai_cores', qty: 2 }], desc: 'Antimatéria como combustível. Energia quase inesgotável.', tier: 3, category: 'research', color: '#93c5fd' },

  // ── SECURITY ──────────────────────────────────────────────────────────────
  { id: 'garrison', name: 'Guarnição',              icon: '🛡️', dim: 'security', support: 12, popCap: 0,     credits: 1100,  materials: [{ mat: 'weapon_systems', qty: 1 }],                                           desc: 'Protege contra revoltas e ataques.',              tier: 1, category: 'military',  color: '#f87171', defenseBonus: 10 },
  { id: 'shield',   name: 'Cúpula de Escudo',       icon: '🔆', dim: 'security', support: 24, popCap: 0,     credits: 4800,  materials: [{ mat: 'power_grids', qty: 2 }, { mat: 'industrial_components', qty: 4 }],    desc: 'Blinda a cidade inteira.',                        tier: 2, category: 'military',  color: '#fca5a5', defenseBonus: 25 },
  { id: 'mil_academy', name: 'Academia Militar',    icon: '🎖️', dim: 'security', support: 20, popCap: 500,   credits: 6500,  materials: [{ mat: 'weapon_systems', qty: 3 }, { mat: 'advanced_buildings', qty: 2 }],    desc: 'Treina elite. Dobra eficiência das guarnições.',  tier: 3, category: 'military',  color: '#ef4444', defenseBonus: 40 },
  { id: 'fortress', name: 'Fortaleza Planetária',   icon: '⚔️', dim: 'security', support: 40, popCap: 0,     credits: 20000, materials: [{ mat: 'weapon_systems', qty: 8 }, { mat: 'power_grids', qty: 4 }, { mat: 'structural_alloy', qty: 6 }], desc: 'Muralha invulnerável. Nenhum inimigo passa.', tier: 4, category: 'military', color: '#dc2626', defenseBonus: 100 },
  { id: 'cyber_warfare', name: 'Centro de Guerra Cibernética', icon: '💻', dim: 'security', support: 28, popCap: 0, credits: 8500, materials: [{ mat: 'ai_cores', qty: 4 }, { mat: 'weapon_systems', qty: 2 }], desc: 'IA de contra-inteligência. Neutraliza espionagem.', tier: 3, category: 'military', color: '#fecaca', defenseBonus: 35 },

  // ── ECOLOGY ───────────────────────────────────────────────────────────────
  { id: 'park',     name: 'Bioparque',              icon: '🌳', dim: 'ecology',  support: 14, popCap: 200,   credits: 800,   materials: [{ mat: 'biomass', qty: 6 }],                                                  desc: 'Recupera o meio ambiente.',                       tier: 1, category: 'civilian',  color: '#4ade80' },
  { id: 'recycler', name: 'Reciclador Atmosférico', icon: '♻️', dim: 'ecology',  support: 26, popCap: 0,     credits: 3200,  materials: [{ mat: 'industrial_components', qty: 5 }],                                    desc: 'Limpa a poluição industrial.',                    tier: 2, category: 'industrial', color: '#86efac' },
  { id: 'biosphere_dome', name: 'Domo Biosférico',  icon: '🌿', dim: 'ecology',  support: 40, popCap: 5000,  credits: 12000, materials: [{ mat: 'biomass', qty: 15 }, { mat: 'advanced_buildings', qty: 4 }],          desc: 'Ecossistema completo em redoma. Restauração total.', tier: 3, category: 'special', color: '#a3e635' },
  { id: 'terra_engine', name: 'Motor de Terraformação', icon: '🌍', dim: 'ecology', support: 55, popCap: 10000, credits: 28000, materials: [{ mat: 'biomass', qty: 20 }, { mat: 'energy_crystals', qty: 10 }, { mat: 'rare_elements', qty: 5 }], desc: 'Transforma planetas hostis em paraísos verdes.', tier: 4, category: 'special', color: '#d9f99d' },

  // ── RESEARCH ──────────────────────────────────────────────────────────────
  { id: 'research_lab', name: 'Laboratório de Pesquisa', icon: '🔬', dim: 'economy', support: 10, popCap: 200, credits: 2000, materials: [{ mat: 'industrial_components', qty: 3 }, { mat: 'ai_cores', qty: 1 }], desc: 'Produz ciência e aceleração tecnológica.', tier: 2, category: 'research', color: '#c4b5fd', scienceBonus: 1, bonusIncome: 0.4 },
  { id: 'quantum_lab', name: 'Centro de Computação Quântica', icon: '🧪', dim: 'economy', support: 18, popCap: 100, credits: 9000, materials: [{ mat: 'ai_cores', qty: 5 }, { mat: 'energy_crystals', qty: 6 }], desc: 'Problemas impossíveis resolvidos em segundos.', tier: 3, category: 'research', color: '#a78bfa', scienceBonus: 4, bonusIncome: 1.2 },
  { id: 'singularity_core', name: 'Núcleo de Singularidade', icon: '🌀', dim: 'economy', support: 35, popCap: 0, credits: 45000, materials: [{ mat: 'ai_cores', qty: 12 }, { mat: 'energy_crystals', qty: 20 }, { mat: 'rare_elements', qty: 8 }], desc: 'IA superinteligente. Acelera tudo em 10x.', tier: 4, category: 'research', color: '#8b5cf6', scienceBonus: 20, bonusIncome: 5.0 },

  // ── CULTURE / SPECIAL ─────────────────────────────────────────────────────
  { id: 'culture_center', name: 'Centro Cultural', icon: '🎭', dim: 'health', support: 12, popCap: 1000, credits: 1800, materials: [{ mat: 'advanced_buildings', qty: 1 }], desc: 'Arte e cultura elevam a moral da população.', tier: 1, category: 'civilian', color: '#f9a8d4', bonusIncome: 0.2 },
  { id: 'stargate_term', name: 'Terminal de Portão Estelar', icon: '🌌', dim: 'economy', support: 25, popCap: 5000, credits: 16000, materials: [{ mat: 'rare_elements', qty: 6 }, { mat: 'energy_crystals', qty: 8 }, { mat: 'advanced_buildings', qty: 3 }], desc: 'Viagens instantâneas entre planetas. Comércio expl.', tier: 4, category: 'special', color: '#818cf8', bonusIncome: 3.5 },
  { id: 'oracle_spire', name: 'Oráculo-Spire', icon: '🏔️', dim: 'security', support: 22, popCap: 0, credits: 11000, materials: [{ mat: 'ai_cores', qty: 4 }, { mat: 'rare_elements', qty: 3 }], desc: 'IA profética. Detecta ataques antes de acontecerem.', tier: 3, category: 'special', color: '#f0abfc', defenseBonus: 50, scienceBonus: 3 },
];

export const DIM_INFO: Record<Dimension, { name: string; icon: string; color: string }> = {
  economy:  { name: 'Economia',  icon: '💰', color: '#fbbf24' },
  energy:   { name: 'Energia',   icon: '⚡', color: '#38bdf8' },
  security: { name: 'Segurança', icon: '🛡️', color: '#f87171' },
  ecology:  { name: 'Ecologia',  icon: '🌱', color: '#4ade80' },
  health:   { name: 'Saúde',     icon: '❤️', color: '#f472b6' },
};

// ---------------------------------------------------------------------------
// Mining — extract raw materials from a planet's deposits into the empire.
// ---------------------------------------------------------------------------
export interface Mine {
  id: string;
  planetId: string;
  planetName: string;
  resource: ResourceType;
  matId: string;
  rate: number;          // units/sec base
  quality: number;
  remaining: number;     // deposit left
  upgradeLevel: number;
}

const RES_TO_MAT: Record<string, string> = {
  iron: 'iron_ore', titanium: 'titanium_ore', crystals: 'energy_crystals',
  fuel: 'hydrocarbons', biomass: 'biomass', rare_elements: 'rare_elements',
  electronics: 'silicon_ore', alloys: 'structural_alloy', medicine: 'medical_compounds',
  energy: 'energy_crystals', gold: 'rare_elements', copper: 'iron_ore',
  uranium: 'rare_elements', helium3: 'energy_crystals', water: 'biomass',
  food: 'biomass', antimatter: 'rare_elements', dark_matter: 'rare_elements',
};

export interface City {
  id: string;
  planetId: string;
  name: string;
  level: number;
  xp: number;
  xpNext: number;
  population: number;
  isCapital: boolean;
  buildings: District[];
  /** Buildings placed on the 3D grid (visible in CityScene). Parallel to `buildings`. */
  placedBuildings: PlacedBuilding[];
  // current live dimension values 0..100
  economy: number;
  energy: number;
  security: number;
  ecology: number;
  health: number;
  /** Accumulated defense power from military buildings */
  defenseRating: number;
}

/** A district placed at a specific grid cell of the city, with timestamp for grow animation. */
export interface PlacedBuilding {
  instanceId: string;
  districtId: string;
  /** integer grid coordinate in the CityScene plane */
  x: number;
  z: number;
  /** real-time ms when it was placed — drives the grow-in animation */
  placedAt: number;
}

const CATS: CatCategory[] = ['chassis', 'locomotion', 'power', 'sensor', 'weapon', 'defense', 'manipulator', 'comms', 'ai_core', 'utility', 'plating'];

interface ColonyState {
  cities: Record<string, City>;
  mines: Mine[];
  componentDemand: Record<CatCategory, number>; // 0.4..2.2 price multiplier
  componentStock: Record<string, number>;
  viewingCityId: string | null;
  lastIncome: number;
  difficulty: number; // global decay multiplier
  /** Per-city auto-manage: when true, the tick tries to invest in the
   *  weakest dimension whenever the player can afford it. */
  autoManage: Record<string, boolean>;
  /** Cooldown timestamps so auto-manage doesn't spam every frame. */
  _lastAutoAt: Record<string, number>;

  sync: () => void;
  tick: (delta: number) => void;
  invest: (cityId: string, districtId: string) => void;
  placeBuilding: (cityId: string, districtId: string, x: number, z: number) => boolean;
  removePlacedBuilding: (cityId: string, instanceId: string) => void;
  buildMine: (planetId: string, depositIndex: number) => void;
  upgradeMine: (mineId: string) => void;
  removeMine: (id: string) => void;
  setViewingCity: (id: string | null) => void;
  setCapital: (cityId: string) => void;
  buyComponent: (itemId: string) => void;
  sellComponent: (itemId: string) => void;
  toggleAutoManage: (cityId: string) => void;
  quickFixCity: (cityId: string) => void;
}

function popCapOf(city: City): number {
  return 3000 + city.buildings.reduce((a, d) => a + d.popCap, 0) + city.level * 1500;
}
function supportFor(city: City, dim: Dimension): number {
  let s = dim === 'ecology' ? 60 : 35; // base
  city.buildings.forEach(d => {
    if (d.dim === dim) s += d.support;
    if (dim === 'ecology' && d.ecoPenalty) s -= d.ecoPenalty;
  });
  return clamp(s);
}

function defenseOf(city: City): number {
  return city.buildings.reduce((a, d) => a + (d.defenseBonus || 0), 0);
}

function makeCity(id: string, planetId: string, name: string, isCapital: boolean): City {
  return {
    id, planetId, name, level: 1, xp: 0, xpNext: 1000, population: 500, isCapital,
    buildings: [], placedBuildings: [],
    economy: 35, energy: 35, security: 35, ecology: 60, health: 40,
    defenseRating: 0,
  };
}

export const useColonyStore = create<ColonyState>((set, get) => ({
  cities: {},
  mines: [],
  componentDemand: CATS.reduce((a, c) => { a[c] = 0.8 + Math.random() * 0.8; return a; }, {} as Record<CatCategory, number>),
  componentStock: {},
  viewingCityId: null,
  lastIncome: 0,
  difficulty: 1,
  autoManage: {},
  _lastAutoAt: {},

  sync: () => {
    const g = useGameStore.getState();
    set(state => {
      const cities = { ...state.cities };
      let isFirst = Object.keys(cities).length === 0;
      g.planets.forEach(p => {
        p.colonies.forEach(col => {
          if (!cities[col.id]) {
            cities[col.id] = makeCity(col.id, p.id, col.name.replace('Colony', 'Cidade'), isFirst);
            isFirst = false;
          }
        });
      });
      // backfill placedBuildings and defenseRating on any legacy city missing the field
      Object.values(cities).forEach(c => {
        if (!Array.isArray((c as City).placedBuildings)) (c as City).placedBuildings = [];
        if ((c as City).defenseRating === undefined) (c as City).defenseRating = 0;
      });
      return { cities };
    });
  },

  tick: (delta) => {
    const g = useGameStore.getState();
    if (g.paused) return;
    const dt = delta * g.gameSpeed * 0.02;
    const state = get();
    const diff = state.difficulty;

    let income = 0;
    const cities = { ...state.cities };
    Object.values(cities).forEach(c0 => {
      const c = { ...c0 };
      const cap = popCapOf(c);
      const overcrowd = Math.max(0, (c.population / cap - 1)) * 50;

      (['economy', 'energy', 'security', 'ecology', 'health'] as Dimension[]).forEach(dim => {
        const target = clamp(supportFor(c, dim) - overcrowd);
        const decay = 0.6 * diff * dt;
        c[dim] = clamp(c[dim] + (target - c[dim]) * 0.5 * dt - decay);
      });

      // population growth gated by health, ecology, energy
      const wellbeing = (c.health + c.ecology + Math.min(c.energy, 60)) / 220;
      const blackout = c.energy < 25 ? 0.3 : 1;
      const room = 1 - c.population / cap;
      c.population = Math.max(200, c.population + c.population * 0.06 * wellbeing * blackout * Math.max(0, room) * dt);

      // unrest from low security/health cuts income
      const unrest = c.security < 30 || c.health < 25 ? 0.4 : 1;
      const econ = (c.economy / 100) * c.population * 0.0018 * unrest * blackout * dt;
      const upkeep = c.buildings.length * 0.4 * dt;
      // bonus income from special buildings
      const bonusInc = c.buildings.reduce((a, d) => a + (d.bonusIncome || 0), 0) * dt * unrest;
      income += econ + bonusInc - upkeep;

      // update defense rating
      c.defenseRating = defenseOf(c);

      cities[c.id] = c;
    });

    // mining -> empire inventory
    const emp = useEmpireStore.getState();
    const inv = { ...emp.inventory };
    let minesChanged = false;
    const mines = state.mines.map(m => {
      if (m.remaining <= 0) return m;
      const amt = m.rate * (1 + m.upgradeLevel * 0.6) * m.quality * dt * 4;
      const take = Math.min(amt, m.remaining);
      inv[m.matId] = (inv[m.matId] || 0) + take;
      minesChanged = true;
      return { ...m, remaining: m.remaining - take };
    });
    if (minesChanged) useEmpireStore.setState({ inventory: inv });

    // component demand drift
    const componentDemand = { ...state.componentDemand };
    CATS.forEach(cat => {
      const d = componentDemand[cat] + (Math.random() - 0.5) * 0.06 * (1 + g.gameSpeed * dt);
      componentDemand[cat] = Math.max(0.4, Math.min(2.2, d));
    });

    if (income !== 0) useGameStore.getState().addCredits(income);
    set({ cities, mines, componentDemand, lastIncome: income });

    // -------- auto-manage tick --------
    const auto = get().autoManage;
    const lastAt = { ...get()._lastAutoAt };
    const now = Date.now();
    Object.values(get().cities).forEach(c => {
      if (!auto[c.id]) return;
      if ((lastAt[c.id] || 0) + 6000 > now) return;
      const dims: Dimension[] = ['energy', 'security', 'health', 'ecology', 'economy'];
      let weak: Dimension | null = null; let weakVal = 56;
      dims.forEach(d => { if (c[d] < weakVal) { weakVal = c[d]; weak = d; } });
      if (!weak) return;
      const candidates = DISTRICTS
        .filter(d => d.dim === weak && d.tier <= 2)
        .sort((a, b) => a.credits - b.credits);
      const empNow = useEmpireStore.getState();
      const gNow = useGameStore.getState();
      for (const d of candidates) {
        const okMat = d.materials.every(m => (empNow.inventory[m.mat] || 0) >= m.qty);
        if (!okMat) continue;
        if (gNow.credits < d.credits) continue;
        const cell = findFreeCell(c);
        const ok = get().placeBuilding(c.id, d.id, cell.x, cell.z);
        if (ok) { lastAt[c.id] = now; break; }
      }
    });
    set({ _lastAutoAt: lastAt });
  },

  invest: (cityId, districtId) => {
    const city = get().cities[cityId];
    if (!city) return;
    const free = findFreeCell(city);
    get().placeBuilding(cityId, districtId, free.x, free.z);
  },

  placeBuilding: (cityId, districtId, x, z) => {
    const district = DISTRICTS.find(d => d.id === districtId);
    const state = get();
    const city = state.cities[cityId];
    if (!district || !city) return false;
    const occupied = (city.placedBuildings || []).some(p => p.x === x && p.z === z);
    if (occupied) return false;
    const g = useGameStore.getState();
    const emp = useEmpireStore.getState();
    const hasMats = district.materials.every(m => (emp.inventory[m.mat] || 0) >= m.qty);
    if (!hasMats) {
      g.addNotification({ type: 'warning', message: `Materiais insuficientes para ${district.name}.` });
      return false;
    }
    if (!g.spendCredits(district.credits)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para investir na cidade.' });
      return false;
    }
    const inv = { ...emp.inventory };
    district.materials.forEach(m => { inv[m.mat] = (inv[m.mat] || 0) - m.qty; });
    useEmpireStore.setState({ inventory: inv });

    const placed: PlacedBuilding = {
      instanceId: nid('pb'),
      districtId: district.id,
      x, z,
      placedAt: Date.now(),
    };

    set(s => {
      const c = { ...s.cities[cityId] };
      c.buildings = [...c.buildings, district];
      c.placedBuildings = [...(c.placedBuildings || []), placed];
      c[district.dim] = clamp(c[district.dim] + district.support * 0.6);
      c.defenseRating = defenseOf(c);
      c.xp += district.credits;
      while (c.xp >= c.xpNext) {
        c.xp -= c.xpNext;
        c.level += 1;
        c.xpNext = Math.round(c.xpNext * 1.5);
        g.addNotification({ type: 'success', message: `🎉 ${c.name} subiu para o nível ${c.level}!` });
      }
      return { cities: { ...s.cities, [cityId]: c } };
    });
    g.addNotification({ type: 'info', message: `${district.icon} ${district.name} construído em ${city.name}.` });
    return true;
  },

  removePlacedBuilding: (cityId, instanceId) => {
    set(s => {
      const c = s.cities[cityId];
      if (!c) return s;
      const pb = (c.placedBuildings || []).find(p => p.instanceId === instanceId);
      if (!pb) return s;
      const district = DISTRICTS.find(d => d.id === pb.districtId);
      const newCity: City = { ...c };
      newCity.placedBuildings = (c.placedBuildings || []).filter(p => p.instanceId !== instanceId);
      if (district) {
        const i = newCity.buildings.findIndex(b => b.id === district.id);
        if (i >= 0) newCity.buildings = [...newCity.buildings.slice(0, i), ...newCity.buildings.slice(i + 1)];
      }
      newCity.defenseRating = defenseOf(newCity);
      return { cities: { ...s.cities, [cityId]: newCity } };
    });
    useGameStore.getState().addNotification({ type: 'info', message: '🏚️ Construção demolida.' });
  },

  buildMine: (planetId, depositIndex) => {
    const g = useGameStore.getState();
    const planet = g.planets.find(p => p.id === planetId);
    if (!planet) return;
    const dep = planet.resources[depositIndex];
    if (!dep) return;
    if (!g.spendCredits(800)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para a mina (800).' });
      return;
    }
    const matId = RES_TO_MAT[dep.resource] || 'iron_ore';
    set(s => ({
      mines: [...s.mines, {
        id: nid('mine'), planetId, planetName: planet.name, resource: dep.resource, matId,
        rate: 0.5 + dep.accessibility, quality: dep.quality, remaining: dep.amount, upgradeLevel: 0,
      }],
    }));
    g.addNotification({ type: 'success', message: `⛏️ Mina de ${MAT_BY_ID[matId]?.namePt || dep.resource} construída em ${planet.name}.` });
  },

  upgradeMine: (mineId) => {
    const g = useGameStore.getState();
    const m = get().mines.find(x => x.id === mineId);
    if (!m) return;
    const cost = 600 * (m.upgradeLevel + 1);
    if (!g.spendCredits(cost)) { g.addNotification({ type: 'warning', message: `Créditos insuficientes (${cost}).` }); return; }
    set(s => ({ mines: s.mines.map(x => x.id === mineId ? { ...x, upgradeLevel: x.upgradeLevel + 1 } : x) }));
    g.addNotification({ type: 'success', message: `⬆️ Mina em ${m.planetName} atualizada para Nível ${m.upgradeLevel + 2}!` });
  },

  removeMine: (id) => set(s => ({ mines: s.mines.filter(m => m.id !== id) })),
  setViewingCity: (id) => set({ viewingCityId: id }),
  toggleAutoManage: (cityId) => set(s => ({
    autoManage: { ...s.autoManage, [cityId]: !s.autoManage[cityId] },
  })),
  quickFixCity: (cityId) => {
    const city = get().cities[cityId];
    if (!city) return;
    const dims: Dimension[] = ['energy', 'security', 'health', 'ecology', 'economy'];
    let weak: Dimension = 'economy'; let weakVal = 101;
    dims.forEach(d => { if (city[d] < weakVal) { weakVal = city[d]; weak = d; } });
    const candidates = DISTRICTS.filter(d => d.dim === weak && d.tier <= 2).sort((a, b) => a.credits - b.credits);
    const empNow = useEmpireStore.getState();
    const gNow = useGameStore.getState();
    for (const d of candidates) {
      const okMat = d.materials.every(m => (empNow.inventory[m.mat] || 0) >= m.qty);
      if (!okMat || gNow.credits < d.credits) continue;
      const cell = findFreeCell(city);
      if (get().placeBuilding(city.id, d.id, cell.x, cell.z)) return;
    }
    gNow.addNotification({ type: 'warning', message: `${city.name}: nada acessível agora para reforçar ${DIM_INFO[weak].name}.` });
  },
  setCapital: (cityId) => set(s => ({
    cities: Object.fromEntries(Object.entries(s.cities).map(([k, c]) => [k, { ...c, isCapital: k === cityId }])),
  })),

  buyComponent: (itemId) => {
    const item = CATALOG_PARTS.find(p => p.id === itemId);
    if (!item) return;
    const g = useGameStore.getState();
    const price = componentPriceOf(item, get().componentDemand);
    if (!g.spendCredits(price)) { g.addNotification({ type: 'warning', message: 'Créditos insuficientes.' }); return; }
    set(s => ({ componentStock: { ...s.componentStock, [itemId]: (s.componentStock[itemId] || 0) + 1 } }));
  },

  sellComponent: (itemId) => {
    const item = CATALOG_PARTS.find(p => p.id === itemId);
    const state = get();
    if (!item || (state.componentStock[itemId] || 0) <= 0) return;
    const price = Math.round(componentPriceOf(item, state.componentDemand) * 0.92);
    useGameStore.getState().addCredits(price);
    set(s => ({ componentStock: { ...s.componentStock, [itemId]: (s.componentStock[itemId] || 0) - 1 } }));
    useGameStore.getState().addNotification({ type: 'success', message: `💰 Vendido ${item.name} por ${price} créditos.` });
  },
}));

export function componentPriceOf(item: CatalogItem, demand: Record<CatCategory, number>): number {
  return Math.round(item.cost * (demand[item.category] ?? 1));
}

// ---------------------------------------------------------------------------
// Grid utilities for placement in CityScene
// ---------------------------------------------------------------------------
export const CITY_GRID_HALF = 7;
export const CITY_CELL = 2.4;

export function findFreeCell(city: City): { x: number; z: number } {
  const taken = new Set((city.placedBuildings || []).map(p => `${p.x},${p.z}`));
  for (let r = 0; r <= CITY_GRID_HALF; r++) {
    for (let dx = -r; dx <= r; dx++) {
      for (let dz = -r; dz <= r; dz++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        if (!taken.has(`${dx},${dz}`)) return { x: dx, z: dz };
      }
    }
  }
  return { x: 0, z: 0 };
}

// ---------------------------------------------------------------------------
// Tasks / agenda
// ---------------------------------------------------------------------------
export interface Task { id: string; label: string; priority: 'high' | 'med' | 'low'; panel?: string; }

export function computeTasks(): Task[] {
  const g = useGameStore.getState();
  const emp = useEmpireStore.getState();
  const col = useColonyStore.getState();
  const tasks: Task[] = [];
  const cities = Object.values(col.cities);

  if (cities.length === 0) tasks.push({ id: 't_colony', label: 'Selecione um planeta habitável e funde sua primeira colônia.', priority: 'high', panel: 'colonies' });
  if (col.mines.length === 0) tasks.push({ id: 't_mine', label: 'Construa sua primeira mina para extrair matéria-prima.', priority: 'high', panel: 'colonies' });
  if (emp.factories.length === 0) tasks.push({ id: 't_factory', label: 'Construa uma fábrica para refinar materiais.', priority: 'med', panel: 'industry' });
  if (g.robots.length === 0) tasks.push({ id: 't_robot', label: 'Projete seu primeiro robô na Engenharia.', priority: 'low', panel: 'engineering' });

  cities.forEach(c => {
    if (c.energy < 30) tasks.push({ id: `t_e_${c.id}`, label: `${c.name}: energia crítica — construa uma usina.`, priority: 'high', panel: 'colonies' });
    if (c.security < 30) tasks.push({ id: `t_s_${c.id}`, label: `${c.name}: segurança baixa — risco de revolta.`, priority: 'high', panel: 'colonies' });
    if (c.ecology < 25) tasks.push({ id: `t_ec_${c.id}`, label: `${c.name}: poluição alta — construa um reciclador.`, priority: 'med', panel: 'colonies' });
    if (c.health < 30) tasks.push({ id: `t_h_${c.id}`, label: `${c.name}: saúde baixa — construa um hospital.`, priority: 'med', panel: 'colonies' });
    if (c.population >= popCapOf(c) * 0.95) tasks.push({ id: `t_p_${c.id}`, label: `${c.name}: superlotada — adicione moradias.`, priority: 'med', panel: 'colonies' });
  });

  col.mines.forEach(m => {
    if (m.remaining <= 0) tasks.push({ id: `t_m_${m.id}`, label: `Mina em ${m.planetName} esgotada — remova-a.`, priority: 'low', panel: 'colonies' });
  });

  if (g.credits < 500) tasks.push({ id: 't_credits', label: 'Créditos baixos — venda recursos no Mercado.', priority: 'med', panel: 'market' });

  const order = { high: 0, med: 1, low: 2 };
  return tasks.sort((a, b) => order[a.priority] - order[b.priority]);
}

export { popCapOf };
