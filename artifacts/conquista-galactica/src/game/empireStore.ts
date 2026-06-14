import { create } from 'zustand';
import { useGameStore } from './gameStore';
import {
  RECIPES, MAT_BY_ID, MACHINE_BY_ID, computeEfficiency, MATERIALS,
} from './data/industryData';
import { BUILDABLES } from './data/buildablesData';
import {
  RECON_TOOLS, HEROES, ASSAULT_UNITS, STAR_OBJECTIVES, BATTLE_LAYERS,
  DEFENSE_TYPE_INFO, DAMAGE_MATRIX, UNIT_BY_ID, computeUnitPower, computeArmyPower,
  type DefenseStructure, type DefenseStructureType, type BattleLayer, type UnitType,
} from './data/warData';

let eid = 0;
const nid = (p = 'e') => `${p}_${eid++}`;

// ============== INDUSTRY ==============
export interface Factory {
  id: string;
  machineId: string;
  recipeId: string | null;
  planetName: string;
  active: boolean;
  progress: number;       // 0..1 within current cycle
  efficiency: number;     // 0.05..1.4
  cyclesDone: number;
}

// ============== MARKET ==============
export interface NpcListing {
  id: string;
  kind: 'robot' | 'resource' | 'blueprint';
  name: string;
  price: number;
  qty: number;
  seller: string;
  matId?: string;
  stats?: string;
}

// ============== MISSIONS ==============
export interface MissionObjective { label: string; done: boolean; }
export interface Mission {
  id: string;
  title: string;
  desc: string;
  objectives: MissionObjective[];
  rewardCredits: number;
  claimed: boolean;
  check: () => boolean[];   // returns objective completion booleans
}

// ============== BUILD QUEUE ==============
export interface BuildJob { id: string; buildableId: string; planetName: string; progress: number; }

// ============== WAR ==============
export interface EnemyTarget {
  id: string;
  name: string;
  difficulty: number;       // 1..10
  layout: DefenseStructure[];
  intel: number;            // 0..100 revealed
  loot: number;             // recoverable credits
  starsEarned: number;
  conquered: boolean;
}

export interface WaveUnit { unitId: string; count: number; }
export interface AttackWave { id: string; layer: BattleLayer; units: WaveUnit[]; }

export interface AttackPlan {
  reconUsed: string[];
  heroId: string | null;
  waves: AttackWave[];
  entryPoint: 'north' | 'south' | 'east' | 'west' | 'orbital';
}

export interface ReplayFrame { t: number; layer: BattleLayer; text: string; }
export interface BattleReplay {
  id: string;
  targetName: string;
  stars: number;
  lootGained: number;
  outcome: 'victory' | 'partial' | 'defeat';
  frames: ReplayFrame[];
  date: number;
}

export interface Blockade { id: string; targetName: string; turnsLeft: number; }

// ============== BARRACKS ==============
export interface TrainingJob {
  id: string;
  unitId: string;
  remaining: number;   // count still in queue
  progress: number;    // 0..1 of the currently-training unit
}
export interface BarracksState {
  level: number;             // 1..5 — multiplies training speed and slots
  troops: Record<string, number>;   // unitId -> stockpile count
  queue: TrainingJob[];
}


interface EmpireState {
  // industry
  factories: Factory[];
  inventory: Record<string, number>;
  power: { generation: number; demand: number };

  // market
  npcListings: NpcListing[];
  marketTimer: number;

  // missions / tutorial
  missions: Mission[];
  tutorialOpen: boolean;
  tutorialStep: number;
  tutorialDone: boolean;

  // build
  buildQueue: BuildJob[];
  builtUnits: Record<string, number>;

  // war
  targets: EnemyTarget[];
  selectedTargetId: string | null;
  plan: AttackPlan;
  currentReplay: BattleReplay | null;
  replays: BattleReplay[];
  blockades: Blockade[];
  allianceWarActive: boolean;

  // barracks
  barracks: BarracksState;



  // actions
  initEmpire: () => void;
  tick: (delta: number) => void;

  buildFactory: (machineId: string, planetName: string) => void;
  setFactoryRecipe: (factoryId: string, recipeId: string) => void;
  toggleFactory: (factoryId: string) => void;
  removeFactory: (factoryId: string) => void;

  refreshMarket: () => void;
  buyListing: (id: string) => void;
  sellMaterial: (matId: string, qty: number) => void;
  listRobotForSale: (robotId: string, price: number) => void;

  queueBuild: (buildableId: string, planetName: string) => void;

  claimMission: (id: string) => void;
  openTutorial: () => void;
  closeTutorial: () => void;
  setTutorialStep: (n: number) => void;
  finishTutorial: () => void;

  selectTarget: (id: string | null) => void;
  runRecon: (toolId: string) => void;
  addWave: (layer: BattleLayer) => void;
  removeWave: (waveId: string) => void;
  setWaveUnit: (waveId: string, unitId: string, count: number) => void;
  setHero: (heroId: string | null) => void;
  setEntryPoint: (ep: AttackPlan['entryPoint']) => void;
  launchInvasion: () => void;
  clearReplay: () => void;
  startBlockade: (targetName: string) => void;
  toggleAllianceWar: () => void;

  // barracks actions
  trainTroop: (unitId: string, count: number) => void;
  cancelTraining: (jobId: string) => void;
  upgradeBarracks: () => void;
  disbandTroop: (unitId: string, count: number) => void;
}


// ---------- generators ----------
function genEnemyLayout(difficulty: number): DefenseStructure[] {
  const types: DefenseStructureType[] = [
    'command_center', 'reactor', 'shield_generator', 'orbital_battery',
    'logistics_hub', 'refinery', 'ammo_depot', 'comms_array',
    'research_center', 'hangar', 'flak_battery', 'storage',
  ];
  const count = 8 + difficulty * 2;
  const out: DefenseStructure[] = [];
  // always one command center
  out.push(mkStruct('command_center', difficulty, 50, 50));
  for (let i = 0; i < count; i++) {
    const t = types[1 + Math.floor(Math.random() * (types.length - 1))];
    out.push(mkStruct(t, difficulty, 10 + Math.random() * 80, 10 + Math.random() * 80));
  }
  return out;
}
function mkStruct(type: DefenseStructureType, diff: number, x: number, y: number): DefenseStructure {
  const info = DEFENSE_TYPE_INFO[type];
  const hp = Math.round((80 + diff * 40) * (info.priority * 0.4 + 0.6));
  return { id: nid('def'), type, name: info.name, icon: info.icon, x, y, hp, maxHp: hp, destroyed: false, effect: info.effect };
}
function genTargets(): EnemyTarget[] {
  const names = ['Colônia Drakon', 'Estação Vortex', 'Fortaleza Zular', 'Cidade Orbital Hex', 'Sistema Korr', 'Bastião Nexus'];
  return names.map((name, i) => {
    const difficulty = i + 2;
    return {
      id: nid('tgt'),
      name,
      difficulty,
      layout: genEnemyLayout(difficulty),
      intel: 0,
      loot: 2000 + difficulty * 1500 + Math.floor(Math.random() * 2000),
      starsEarned: 0,
      conquered: false,
    };
  });
}

function genNpcListings(): NpcListing[] {
  const out: NpcListing[] = [];
  // resource listings
  const resMats = MATERIALS.filter(m => m.tier <= 3);
  for (let i = 0; i < 8; i++) {
    const m = resMats[Math.floor(Math.random() * resMats.length)];
    out.push({
      id: nid('npc'), kind: 'resource', name: m.namePt, matId: m.id,
      price: Math.round((10 + m.tier * 12) * (0.8 + Math.random() * 0.6)),
      qty: 10 + Math.floor(Math.random() * 40), seller: ['Sindicato Orion', 'Mercadores de Vega', 'Cartel Helix'][i % 3],
    });
  }
  // robot listings
  const robotNames = ['Sentinela X9', 'Operário VULCAN', 'Caçador Phantom', 'Escavador Titan'];
  for (let i = 0; i < 3; i++) {
    out.push({
      id: nid('npc'), kind: 'robot', name: robotNames[i % robotNames.length],
      price: 1200 + Math.floor(Math.random() * 4000), qty: 1, seller: 'Robótica Galáctica',
      stats: `Blindagem ${20 + i * 10} · Velocidade ${15 + i * 5} · IA ${10 + i * 8}`,
    });
  }
  // blueprint listings
  const bps = ['Projeto: Caça Atmosférico', 'Projeto: Drone Furtivo', 'Projeto: Torre Orbital'];
  for (let i = 0; i < 2; i++) {
    out.push({ id: nid('npc'), kind: 'blueprint', name: bps[i % bps.length], price: 800 + i * 600, qty: 1, seller: 'Arquivo Tecnológico' });
  }
  return out;
}

function buildMissions(): Mission[] {
  return [
    {
      id: 'm_colony', title: 'Primeiros Passos', desc: 'Estabeleça sua primeira colônia.',
      objectives: [{ label: 'Fundar 1 colônia', done: false }], rewardCredits: 1500, claimed: false,
      check: () => {
        const g = useGameStore.getState();
        const colonies = g.planets.reduce((a, p) => a + p.colonies.length, 0);
        return [colonies >= 1];
      },
    },
    {
      id: 'm_factory', title: 'Revolução Industrial', desc: 'Construa fábricas para iniciar a cadeia produtiva.',
      objectives: [{ label: 'Construir 2 fábricas', done: false }], rewardCredits: 2000, claimed: false,
      check: () => [useEmpireStore.getState().factories.length >= 2],
    },
    {
      id: 'm_produce', title: 'Linha de Produção', desc: 'Produza materiais refinados.',
      objectives: [{ label: 'Ter 20 de Ferro Refinado', done: false }], rewardCredits: 2500, claimed: false,
      check: () => [(useEmpireStore.getState().inventory['refined_iron'] || 0) >= 20],
    },
    {
      id: 'm_robot', title: 'Engenheiro Chefe', desc: 'Projete e monte um robô na engenharia.',
      objectives: [{ label: 'Criar 1 robô', done: false }], rewardCredits: 2000, claimed: false,
      check: () => [useGameStore.getState().robots.length >= 1],
    },
    {
      id: 'm_build', title: 'Estaleiro Ativo', desc: 'Construa uma unidade no estaleiro.',
      objectives: [{ label: 'Concluir 1 construção', done: false }], rewardCredits: 3000, claimed: false,
      check: () => [Object.values(useEmpireStore.getState().builtUnits).reduce((a, b) => a + b, 0) >= 1],
    },
    {
      id: 'm_recon', title: 'Olhos no Inimigo', desc: 'Faça reconhecimento de um alvo inimigo.',
      objectives: [{ label: 'Investigar 1 alvo (intel > 0)', done: false }], rewardCredits: 2500, claimed: false,
      check: () => [useEmpireStore.getState().targets.some(t => t.intel > 0)],
    },
    {
      id: 'm_war', title: 'Conquistador', desc: 'Lance sua primeira invasão e ganhe estrelas.',
      objectives: [{ label: 'Ganhar 1 estrela de vitória', done: false }], rewardCredits: 5000, claimed: false,
      check: () => [useEmpireStore.getState().targets.some(t => t.starsEarned > 0)],
    },
  ];
}

const startingInventory = (): Record<string, number> => ({
  iron_ore: 40, titanium_ore: 20, silicon_ore: 20, energy_crystals: 15,
  refined_iron: 30, hydrocarbons: 20, biomass: 20,
});

export const useEmpireStore = create<EmpireState>((set, get) => ({
  factories: [],
  inventory: startingInventory(),
  power: { generation: 200, demand: 0 },
  npcListings: [],
  marketTimer: 0,
  missions: buildMissions(),
  tutorialOpen: false,
  tutorialStep: 0,
  tutorialDone: false,
  buildQueue: [],
  builtUnits: {},
  targets: [],
  selectedTargetId: null,
  plan: { reconUsed: [], heroId: null, waves: [], entryPoint: 'orbital' },
  currentReplay: null,
  replays: [],
  blockades: [],
  allianceWarActive: false,
  barracks: { level: 1, troops: { u_marine: 20, u_interceptor: 8, u_fighter: 6, u_dropship: 4 }, queue: [] },

  initEmpire: () => set({
    factories: [],
    inventory: startingInventory(),
    npcListings: genNpcListings(),
    missions: buildMissions(),
    targets: genTargets(),
    buildQueue: [],
    builtUnits: {},
    replays: [],
    blockades: [],
    barracks: { level: 1, troops: { u_marine: 20, u_interceptor: 8, u_fighter: 6, u_dropship: 4 }, queue: [] },
    tutorialOpen: !localStorage.getItem('cg_tutorial_done'),
    tutorialStep: 0,
    tutorialDone: !!localStorage.getItem('cg_tutorial_done'),
  }),

  tick: (delta) => {
    const state = get();
    const g = useGameStore.getState();
    if (g.paused) return;
    const speed = g.gameSpeed;
    const dt = delta * speed;

    const inv = { ...state.inventory };
    let powerDemand = 0;
    let powerGen = 200; // base grid

    const factories = state.factories.map(f => {
      const machine = MACHINE_BY_ID[f.machineId];
      if (!machine) return f;
      if (machine.powerDraw < 0) powerGen += -machine.powerDraw; // generators
      if (!f.active || !f.recipeId) return f;
      const recipe = RECIPES.find(r => r.id === f.recipeId);
      if (!recipe) return f;
      powerDemand += machine.powerDraw;

      // efficiency model
      const efficiency = computeEfficiency({
        temperature: 20 + (Math.random() - 0.5) * 4,
        energy: powerGen > powerDemand ? 1 : 0.5,
        labor: 0.7,
        distance: 0.8,
        tech: Math.min(1, 0.4 + g.technologies.filter(t => t.researched).length * 0.05),
        maintenance: 0.85,
      });

      let progress = f.progress + (dt / recipe.time) * efficiency;
      let cyclesDone = f.cyclesDone;
      while (progress >= 1) {
        // check inputs
        const hasInputs = recipe.inputs.every(i => (inv[i.mat] || 0) >= i.qty);
        if (!hasInputs) { progress = 0.999; break; }
        recipe.inputs.forEach(i => { inv[i.mat] = (inv[i.mat] || 0) - i.qty; });
        recipe.outputs.forEach(o => { inv[o.mat] = (inv[o.mat] || 0) + o.qty; });
        progress -= 1;
        cyclesDone++;
      }
      return { ...f, progress, efficiency, cyclesDone };
    });

    // build queue progress
    let builtUnits = state.builtUnits;
    const buildQueue: BuildJob[] = [];
    let changed = false;
    state.buildQueue.forEach(job => {
      const b = BUILDABLES.find(x => x.id === job.buildableId);
      if (!b) return;
      const progress = job.progress + dt / b.buildTime;
      if (progress >= 1) {
        builtUnits = { ...builtUnits, [job.buildableId]: (builtUnits[job.buildableId] || 0) + 1 };
        changed = true;
        useGameStore.getState().addNotification({ type: 'success', message: `Construção concluída: ${b.name}` });
      } else {
        buildQueue.push({ ...job, progress });
      }
    });

    // market refresh timer
    let marketTimer = state.marketTimer + dt;
    let npcListings = state.npcListings;
    if (marketTimer > 60) { marketTimer = 0; npcListings = genNpcListings(); }

    // barracks training progress
    const barracks = { ...state.barracks, troops: { ...state.barracks.troops }, queue: [] as TrainingJob[] };
    const speedMult = 1 + (barracks.level - 1) * 0.4;
    state.barracks.queue.forEach(job => {
      const u = UNIT_BY_ID[job.unitId];
      if (!u) return;
      let remaining = job.remaining;
      let progress = job.progress + (dt / u.trainTime) * speedMult;
      while (progress >= 1 && remaining > 0) {
        barracks.troops[job.unitId] = (barracks.troops[job.unitId] || 0) + 1;
        remaining -= 1;
        progress -= 1;
      }
      if (remaining > 0) barracks.queue.push({ ...job, remaining, progress });
      else useGameStore.getState().addNotification({ type: 'success', message: `Quartel: lote de ${u.name} concluído.` });
    });

    // missions auto-check
    const missions = state.missions.map(m => {
      if (m.claimed) return m;
      const results = m.check();
      return { ...m, objectives: m.objectives.map((o, i) => ({ ...o, done: results[i] ?? o.done })) };
    });

    set({
      inventory: inv,
      factories,
      power: { generation: powerGen, demand: powerDemand },
      buildQueue: changed || buildQueue.length !== state.buildQueue.length ? buildQueue : state.buildQueue,
      builtUnits,
      marketTimer,
      npcListings,
      missions,
      barracks,
    });
  },

  buildFactory: (machineId, planetName) => {
    const machine = MACHINE_BY_ID[machineId];
    if (!machine) return;
    const g = useGameStore.getState();
    if (!g.spendCredits(machine.buildCredits)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para a fábrica.' });
      return;
    }
    set(state => ({
      factories: [...state.factories, {
        id: nid('fac'), machineId, recipeId: null, planetName,
        active: true, progress: 0, efficiency: 1, cyclesDone: 0,
      }],
    }));
  },

  setFactoryRecipe: (factoryId, recipeId) => set(state => ({
    factories: state.factories.map(f => f.id === factoryId ? { ...f, recipeId, progress: 0 } : f),
  })),

  toggleFactory: (factoryId) => set(state => ({
    factories: state.factories.map(f => f.id === factoryId ? { ...f, active: !f.active } : f),
  })),

  removeFactory: (factoryId) => set(state => ({
    factories: state.factories.filter(f => f.id !== factoryId),
  })),

  refreshMarket: () => set({ npcListings: genNpcListings() }),

  buyListing: (id) => {
    const state = get();
    const listing = state.npcListings.find(l => l.id === id);
    if (!listing) return;
    const g = useGameStore.getState();
    if (!g.spendCredits(listing.price)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes.' });
      return;
    }
    if (listing.kind === 'resource' && listing.matId) {
      set(s => ({
        inventory: { ...s.inventory, [listing.matId!]: (s.inventory[listing.matId!] || 0) + listing.qty },
        npcListings: s.npcListings.filter(l => l.id !== id),
      }));
    } else {
      set(s => ({ npcListings: s.npcListings.filter(l => l.id !== id) }));
    }
    g.addNotification({ type: 'success', message: `Comprado: ${listing.name}` });
  },

  sellMaterial: (matId, qty) => {
    const state = get();
    if ((state.inventory[matId] || 0) < qty) return;
    const mat = MAT_BY_ID[matId];
    const price = Math.round((10 + mat.tier * 12) * 0.7 * qty);
    set(s => ({ inventory: { ...s.inventory, [matId]: (s.inventory[matId] || 0) - qty } }));
    useGameStore.getState().addCredits(price);
    useGameStore.getState().addNotification({ type: 'success', message: `Vendido ${qty}x ${mat.namePt} por ${price} créditos.` });
  },

  listRobotForSale: (robotId, price) => {
    useGameStore.getState().listRobotOnMarket(robotId, price);
  },

  queueBuild: (buildableId, planetName) => {
    const b = BUILDABLES.find(x => x.id === buildableId);
    if (!b) return;
    const g = useGameStore.getState();
    const inv = get().inventory;
    const hasMats = b.materials.every(m => (inv[m.mat] || 0) >= m.qty);
    if (!hasMats) {
      g.addNotification({ type: 'warning', message: `Materiais insuficientes para ${b.name}.` });
      return;
    }
    if (!g.spendCredits(b.credits)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes.' });
      return;
    }
    set(s => {
      const newInv = { ...s.inventory };
      b.materials.forEach(m => { newInv[m.mat] = (newInv[m.mat] || 0) - m.qty; });
      return {
        inventory: newInv,
        buildQueue: [...s.buildQueue, { id: nid('job'), buildableId, planetName, progress: 0 }],
      };
    });
    g.addNotification({ type: 'info', message: `${b.name} entrou na fila de construção.` });
  },

  claimMission: (id) => {
    const state = get();
    const m = state.missions.find(x => x.id === id);
    if (!m || m.claimed) return;
    const done = m.check().every(Boolean);
    if (!done) return;
    useGameStore.getState().addCredits(m.rewardCredits);
    useGameStore.getState().addNotification({ type: 'success', message: `Missão concluída: ${m.title} (+${m.rewardCredits} créditos)` });
    set(s => ({ missions: s.missions.map(x => x.id === id ? { ...x, claimed: true } : x) }));
  },

  openTutorial: () => set({ tutorialOpen: true, tutorialStep: 0 }),
  closeTutorial: () => set({ tutorialOpen: false }),
  setTutorialStep: (n) => set({ tutorialStep: n }),
  finishTutorial: () => { localStorage.setItem('cg_tutorial_done', '1'); set({ tutorialOpen: false, tutorialDone: true }); },

  selectTarget: (id) => set({ selectedTargetId: id, plan: { reconUsed: [], heroId: null, waves: [], entryPoint: 'orbital' } }),

  runRecon: (toolId) => {
    const tool = RECON_TOOLS.find(t => t.id === toolId);
    const state = get();
    if (!tool || !state.selectedTargetId) return;
    const g = useGameStore.getState();
    if (!g.spendCredits(tool.cost)) {
      g.addNotification({ type: 'warning', message: 'Créditos insuficientes para reconhecimento.' });
      return;
    }
    set(s => ({
      targets: s.targets.map(t => t.id === s.selectedTargetId
        ? { ...t, intel: Math.min(100, t.intel + tool.intelGain) } : t),
      plan: { ...s.plan, reconUsed: [...s.plan.reconUsed, tool.id] },
    }));
    g.addNotification({ type: 'info', message: `${tool.name} revelou parte da infraestrutura inimiga.` });
  },

  addWave: (layer) => set(s => ({
    plan: { ...s.plan, waves: [...s.plan.waves, { id: nid('wave'), layer, units: [] }] },
  })),
  removeWave: (waveId) => set(s => ({ plan: { ...s.plan, waves: s.plan.waves.filter(w => w.id !== waveId) } })),
  setWaveUnit: (waveId, unitId, count) => set(s => ({
    plan: {
      ...s.plan,
      waves: s.plan.waves.map(w => {
        if (w.id !== waveId) return w;
        const units = w.units.filter(u => u.unitId !== unitId);
        if (count > 0) units.push({ unitId, count });
        return { ...w, units };
      }),
    },
  })),
  setHero: (heroId) => set(s => ({ plan: { ...s.plan, heroId } })),
  setEntryPoint: (ep) => set(s => ({ plan: { ...s.plan, entryPoint: ep } })),

  launchInvasion: () => {
    const state = get();
    const target = state.targets.find(t => t.id === state.selectedTargetId);
    if (!target) return;
    const g = useGameStore.getState();
    const plan = state.plan;
    if (plan.waves.length === 0 || plan.waves.every(w => w.units.length === 0)) {
      g.addNotification({ type: 'warning', message: 'Adicione tropas às ondas antes de atacar.' });
      return;
    }

    // ----- 1. Validate stockpile (tropas vêm do QUARTEL, não compra-na-hora) -----
    const required: Record<string, number> = {};
    plan.waves.forEach(w => w.units.forEach(u => {
      required[u.unitId] = (required[u.unitId] || 0) + u.count;
    }));
    for (const [uid, need] of Object.entries(required)) {
      const have = state.barracks.troops[uid] || 0;
      if (have < need) {
        const u = UNIT_BY_ID[uid];
        g.addNotification({ type: 'warning', message: `Estoque insuficiente: ${u?.name ?? uid} (precisa ${need}, tem ${have}).` });
        return;
      }
    }

    const hero = HEROES.find(h => h.id === plan.heroId) || null;
    const heroCost = hero?.cost ?? 0;
    if (heroCost > 0 && !g.spendCredits(heroCost)) {
      g.addNotification({ type: 'warning', message: `Créditos insuficientes para contratar herói (${heroCost}).` });
      return;
    }

    // ----- 2. Deep combat resolver — per layer, per ability, with casualties -----
    const frames: ReplayFrame[] = [];
    let t = 0;
    const layout = target.layout.map(s => ({ ...s }));
    const armyPower = computeArmyPower(plan.waves.flatMap(w => w.units));
    frames.push({ t: t++, layer: 'space', text: `⚔️ Frente lançada. Poder total da armada: ${armyPower.toLocaleString()}.` });
    if (hero) frames.push({ t: t++, layer: 'space', text: `${hero.icon} ${hero.name} no comando — ${hero.ability}.` });

    // running casualty bag
    const casualties: Record<string, number> = {};
    let layerPenalty = 0;

    for (const layer of BATTLE_LAYERS) {
      const wavesForLayer = plan.waves.filter(w => w.layer === layer);
      const layerStacks: { u: UnitType; count: number }[] = [];
      wavesForLayer.forEach(w => w.units.forEach(u => {
        const ut = UNIT_BY_ID[u.unitId];
        if (!ut) return;
        const surviving = u.count - (casualties[u.unitId] || 0);
        if (surviving > 0) layerStacks.push({ u: ut, count: surviving });
      }));

      if (layerStacks.length === 0) {
        frames.push({ t: t++, layer, text: `Nenhuma tropa disponível para ${layer}. Camada pulada.` });
        layerPenalty = Math.min(0.7, layerPenalty + 0.2);
        continue;
      }

      const enemyHere = layout.filter(s => !s.destroyed && layerMatch(layer, s.type));
      enemyHere.sort((a, b) => DEFENSE_TYPE_INFO[b.type].priority - DEFENSE_TYPE_INFO[a.type].priority);
      const enemyHp = enemyHere.reduce((a, s) => a + s.hp, 0);

      const layerPower = layerStacks.reduce((sum, s) => sum + computeUnitPower(s.u) * s.count, 0);
      frames.push({ t: t++, layer, text: `▶ Iniciando ${layer.toUpperCase()} — poder ${Math.round(layerPower * (1 - layerPenalty)).toLocaleString()} vs defesa ${enemyHp.toLocaleString()}.` });

      // ---- per-structure attack rolls (3 rounds) ----
      for (let round = 0; round < 3 && layerStacks.some(s => s.count > 0); round++) {
        const targets = enemyHere.filter(s => !s.destroyed);
        if (targets.length === 0) break;

        // accumulate damage to each target this round
        const dmgTo = new Map<typeof targets[number], number>();
        for (const stack of layerStacks) {
          if (stack.count <= 0) continue;
          const u = stack.u;
          // pick a target (priority + ability bias)
          const target = pickTarget(targets, u);
          const armorInfo = DEFENSE_TYPE_INFO[target.type];
          let dmg = u.attack * stack.count;

          // damage-type multiplier vs armor
          dmg *= DAMAGE_MATRIX[u.damageType][armorInfo.armor];

          // hero bonus
          if (hero) {
            if (layer === 'space'      && hero.bonus.type === 'space')  dmg *= 1 + hero.bonus.value;
            if (layer === 'atmosphere' && hero.bonus.type === 'air')    dmg *= 1 + hero.bonus.value;
            if (layer === 'urban'      && hero.bonus.type === 'ground') dmg *= 1 + hero.bonus.value;
            if (hero.bonus.type === 'bombard') dmg *= 1 + hero.bonus.value * 0.5;
          }

          // abilities
          for (const ab of u.abilities) {
            if (ab.trigger === 'first_strike' && round === 0) dmg *= 1 + ab.value;
            if (ab.trigger === 'siege') dmg *= 1 + ab.value;
            if (ab.trigger === 'shield_break' && armorInfo.armor === 'shielded') dmg *= 1 + ab.value;
            if (ab.trigger === 'pierce')  dmg *= 1 + ab.value * 0.4;
            if (ab.trigger === 'volley')  dmg *= 1 + (ab.value - 1) * 0.25;
          }

          dmg *= 1 - layerPenalty;
          dmgTo.set(target, (dmgTo.get(target) || 0) + dmg);

          // splash damage to next priority target
          const splash = u.abilities.find(a => a.trigger === 'splash');
          if (splash && targets.length > 1) {
            const next = targets.find(tt => tt !== target);
            if (next) dmgTo.set(next, (dmgTo.get(next) || 0) + dmg * splash.value * 0.5);
          }
        }

        // apply damage
        for (const [s, d] of dmgTo) {
          if (s.destroyed) continue;
          if (d >= s.hp) {
            s.destroyed = true;
            s.hp = 0;
            frames.push({ t: t++, layer, text: `💥 ${s.icon} ${s.name} destruído! ${s.effect}.` });
          } else {
            s.hp -= d;
          }
        }

        // ---- enemy counter-fire causes casualties ----
        const enemyFirepower = targets.reduce((sum, s) => sum + (s.destroyed ? 0 : DEFENSE_TYPE_INFO[s.type].priority * 12), 0);
        if (enemyFirepower > 0) {
          // distribute damage proportional to stack HP pool, weighted by armor type
          const totalArmy = layerStacks.reduce((a, s) => a + s.count * s.u.hp, 0);
          if (totalArmy > 0) {
            for (const stack of layerStacks) {
              if (stack.count <= 0) continue;
              const armorReduction = ({ light: 1.2, medium: 1.0, heavy: 0.75, shielded: 0.55, fortified: 0.45 } as Record<string, number>)[stack.u.armor] ?? 1;
              let lost = (enemyFirepower * stack.u.hp * stack.count / totalArmy) * armorReduction / Math.max(20, stack.u.hp);
              // regen ability mitigates
              const regen = stack.u.abilities.find(a => a.trigger === 'regen');
              if (regen) lost *= 1 - regen.value * 4;
              // cloak ability dodges some
              const cloak = stack.u.abilities.find(a => a.trigger === 'cloak');
              if (cloak) lost *= 1 - cloak.value * 0.5;
              // hero repair
              if (hero?.bonus.type === 'repair') lost *= 1 - hero.bonus.value;
              const lostInt = Math.max(0, Math.floor(lost));
              if (lostInt > 0) {
                const actual = Math.min(stack.count, lostInt);
                stack.count -= actual;
                casualties[stack.u.id] = (casualties[stack.u.id] || 0) + actual;
                if (actual > 1 || Math.random() < 0.4)
                  frames.push({ t: t++, layer, text: `☠️ ${actual}x ${stack.u.icon} ${stack.u.name} perdidos sob fogo defensivo.` });
              }
            }
          }
        }
      }

      // layer wrap-up: residual penalties
      const orbitalLeft = layout.some(s => !s.destroyed && (s.type === 'orbital_battery' || s.type === 'flak_battery'));
      if (orbitalLeft && (layer === 'space' || layer === 'atmosphere')) {
        layerPenalty = Math.min(0.6, layerPenalty + 0.25);
        frames.push({ t: t++, layer, text: `⚠️ Defesas remanescentes: próxima camada -${Math.round(layerPenalty * 100)}% eficácia.` });
      } else {
        layerPenalty = Math.max(0, layerPenalty - 0.15);
      }
    }

    // ----- 3. Stars + loot -----
    const totalStructures = layout.length;
    const destroyed = layout.filter(s => s.destroyed).length;
    const destroyedPct = destroyed / totalStructures;
    const commandDown = !!layout.find(s => s.type === 'command_center')?.destroyed;
    const productionDown = layout.filter(s => (s.type === 'refinery' || s.type === 'logistics_hub') && s.destroyed).length >= 1;

    let stars = 0;
    if (commandDown) stars++;
    if (destroyedPct >= 0.5) stars++;
    if (productionDown) stars++;
    stars = Math.min(3, stars);

    const outcome: BattleReplay['outcome'] = stars >= 3 ? 'victory' : stars >= 1 ? 'partial' : 'defeat';
    const lootMult = 1 + (hero?.bonus.type === 'logistics' ? hero.bonus.value : 0);
    const lootGained = Math.round(target.loot * destroyedPct * lootMult);

    g.addCredits(lootGained);

    // ----- 4. Subtract casualties from barracks stockpile -----
    const newTroops = { ...state.barracks.troops };
    for (const [uid, dead] of Object.entries(casualties)) {
      newTroops[uid] = Math.max(0, (newTroops[uid] || 0) - dead);
    }
    const totalLosses = Object.values(casualties).reduce((a, b) => a + b, 0);

    frames.push({ t: t++, layer: 'urban', text: `🏁 Encerrado: ${stars}★ · saque ${lootGained.toLocaleString()} cr · baixas ${totalLosses}.` });

    const replay: BattleReplay = {
      id: nid('rep'), targetName: target.name, stars, lootGained, outcome, frames, date: g.gameTime,
    };

    set(s => ({
      targets: s.targets.map(tt => tt.id === target.id
        ? { ...tt, layout, starsEarned: Math.max(tt.starsEarned, stars), conquered: commandDown || tt.conquered, loot: Math.max(0, tt.loot - lootGained) }
        : tt),
      currentReplay: replay,
      replays: [replay, ...s.replays].slice(0, 20),
      barracks: { ...s.barracks, troops: newTroops },
      plan: { ...s.plan, waves: [] },
    }));
    g.addNotification({ type: stars > 0 ? 'success' : 'danger', message: `Invasão de ${target.name}: ${stars} estrela(s) · ${totalLosses} baixas.` });
  },

  clearReplay: () => set({ currentReplay: null }),

  startBlockade: (targetName) => {
    const g = useGameStore.getState();
    if (!g.spendCredits(1500)) { g.addNotification({ type: 'warning', message: 'Créditos insuficientes para o bloqueio.' }); return; }
    set(s => ({ blockades: [...s.blockades, { id: nid('blk'), targetName, turnsLeft: 5 }] }));
    g.addNotification({ type: 'info', message: `Bloqueio econômico iniciado contra ${targetName}.` });
  },

  toggleAllianceWar: () => set(s => ({ allianceWarActive: !s.allianceWarActive })),

  // ============== BARRACKS ACTIONS ==============
  trainTroop: (unitId, count) => {
    if (count <= 0) return;
    const u = UNIT_BY_ID[unitId];
    if (!u) return;
    const g = useGameStore.getState();
    const totalCost = u.cost * count;
    if (!g.spendCredits(totalCost)) {
      g.addNotification({ type: 'warning', message: `Créditos insuficientes para treinar ${count}x ${u.name} (${totalCost.toLocaleString()}cr).` });
      return;
    }
    set(s => {
      const existing = s.barracks.queue.find(j => j.unitId === unitId);
      const queue = existing
        ? s.barracks.queue.map(j => j.unitId === unitId ? { ...j, remaining: j.remaining + count } : j)
        : [...s.barracks.queue, { id: nid('trn'), unitId, remaining: count, progress: 0 }];
      return { barracks: { ...s.barracks, queue } };
    });
    g.addNotification({ type: 'info', message: `${count}x ${u.name} em treinamento.` });
  },

  cancelTraining: (jobId) => {
    const state = get();
    const job = state.barracks.queue.find(j => j.id === jobId);
    if (!job) return;
    const u = UNIT_BY_ID[job.unitId];
    if (u) useGameStore.getState().addCredits(Math.round(u.cost * job.remaining * 0.6));
    set(s => ({ barracks: { ...s.barracks, queue: s.barracks.queue.filter(j => j.id !== jobId) } }));
  },

  upgradeBarracks: () => {
    const state = get();
    const cost = 2500 * state.barracks.level;
    const g = useGameStore.getState();
    if (state.barracks.level >= 5) { g.addNotification({ type: 'info', message: 'Quartel já está no nível máximo.' }); return; }
    if (!g.spendCredits(cost)) { g.addNotification({ type: 'warning', message: `Custa ${cost.toLocaleString()}cr para upgrade.` }); return; }
    set(s => ({ barracks: { ...s.barracks, level: s.barracks.level + 1 } }));
    g.addNotification({ type: 'success', message: `Quartel evoluído para nível ${state.barracks.level + 1}!` });
  },

  disbandTroop: (unitId, count) => {
    set(s => {
      const have = s.barracks.troops[unitId] || 0;
      const actual = Math.min(have, count);
      return { barracks: { ...s.barracks, troops: { ...s.barracks.troops, [unitId]: have - actual } } };
    });
  },
}));

function pickTarget<T extends DefenseStructure>(targets: T[], u: UnitType): T {
  // siege/artillery prefer high-priority targets; scouts/stealth go for soft targets
  const wantsHard = u.role === 'artillery' || u.role === 'capital' || u.abilities.some(a => a.trigger === 'siege');
  const wantsSoft = u.role === 'scout' || u.role === 'special';
  const alive = targets.filter(s => !s.destroyed);
  if (alive.length === 0) return targets[0];
  if (wantsHard) return alive[0];
  if (wantsSoft) return alive[alive.length - 1];
  // assault default — random among top-3
  const slice = alive.slice(0, Math.min(3, alive.length));
  return slice[Math.floor(Math.random() * slice.length)];
}

function layerMatch(layer: BattleLayer, type: DefenseStructureType): boolean {
  switch (layer) {
    case 'space': return type === 'orbital_battery' || type === 'comms_array';
    case 'atmosphere': return type === 'flak_battery' || type === 'hangar' || type === 'shield_generator';
    case 'landing': return type === 'storage' || type === 'reactor';
    case 'urban': return type === 'command_center' || type === 'refinery' || type === 'logistics_hub' || type === 'ammo_depot' || type === 'research_center';
  }
}

export { RECON_TOOLS, HEROES, ASSAULT_UNITS, STAR_OBJECTIVES };
