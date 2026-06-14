// ============================================================================
// COLONIZATION STORE — multi-phase colonization missions with planetary
// hazards, supply costs, random events and survival mechanics. The mission
// completes by calling the existing `buildColony` action in gameStore, so
// no schema changes are needed on the universe data.
// ============================================================================
import { create } from 'zustand';
import { useGameStore, type Planet, type ResourceType } from './gameStore';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type MissionPhase =
  | 'survey'        // probes scanning the world
  | 'transit'       // colony ship en route
  | 'landing'       // descent / orbital insertion
  | 'setup'         // building first shelters
  | 'establishment' // city forming
  | 'complete'
  | 'failed';

export type HazardId =
  | 'extreme_cold' | 'extreme_heat' | 'toxic_atmo' | 'thin_atmo' | 'no_atmo'
  | 'low_gravity' | 'high_gravity' | 'radiation' | 'tectonic' | 'no_water'
  | 'storms' | 'hostile_fauna' | 'pirates' | 'low_resources';

export interface Hazard {
  id: HazardId;
  label: string;
  icon: string;
  severity: number;       // 0..1
  // multipliers applied to mission
  riskAdd: number;        // adds to per-tick failure chance
  supplyDrain: number;    // extra supplies/tick
  timeMult: number;       // setup time multiplier
  mitigation: string;     // hint shown to player
}

export interface MissionSupplies {
  colonists: number;
  food: number;
  water: number;
  medicine: number;
  alloys: number;
  fuel: number;
}

export interface MissionEvent {
  time: number;
  kind: 'info' | 'warn' | 'danger' | 'good';
  text: string;
}

export interface ColonizationMission {
  id: string;
  planetId: string;
  planetName: string;
  hazards: Hazard[];
  habitability: number;
  difficulty: number;          // 0..1
  phase: MissionPhase;
  phaseProgress: number;       // 0..1 of current phase
  totalProgress: number;       // 0..1 of whole mission
  morale: number;              // 0..1 — drops on events; under 0 fails
  supplies: MissionSupplies;
  startSupplies: MissionSupplies;
  events: MissionEvent[];
  startedAt: number;
  etaTicks: number;
  // chosen options
  terraformBoost: boolean;     // paid upgrade, raises hab over time
  escortFleet: boolean;        // reduces pirate risk
  premiumGear: boolean;        // reduces environmental risk
}

// ---------------------------------------------------------------------------
// Hazard derivation from a planet
// ---------------------------------------------------------------------------
export function deriveHazards(p: Planet): Hazard[] {
  const out: Hazard[] = [];
  if (p.temperature < -40) out.push({
    id: 'extreme_cold', label: 'Frio extremo', icon: '❄️',
    severity: Math.min(1, (-p.temperature - 40) / 120),
    riskAdd: 0.002, supplyDrain: 0.6, timeMult: 1.35,
    mitigation: 'Equipamento criogênico (premium gear) reduz consumo de combustível.',
  });
  if (p.temperature > 50) out.push({
    id: 'extreme_heat', label: 'Calor extremo', icon: '🔥',
    severity: Math.min(1, (p.temperature - 50) / 200),
    riskAdd: 0.0025, supplyDrain: 0.5, timeMult: 1.3,
    mitigation: 'Climatização requer mais energia. Premium gear ajuda.',
  });
  if (p.atmosphereType === 'toxic') out.push({
    id: 'toxic_atmo', label: 'Atmosfera tóxica', icon: '☠️',
    severity: 0.85, riskAdd: 0.004, supplyDrain: 0.8, timeMult: 1.4,
    mitigation: 'Trajes selados consomem mais medicina e oxigênio.',
  });
  if (p.atmosphereType === 'thin') out.push({
    id: 'thin_atmo', label: 'Atmosfera rarefeita', icon: '🌫️',
    severity: 0.45, riskAdd: 0.001, supplyDrain: 0.4, timeMult: 1.15,
    mitigation: 'Pressurização aumenta o consumo de energia.',
  });
  if (!p.atmosphere) out.push({
    id: 'no_atmo', label: 'Sem atmosfera', icon: '🌑',
    severity: 0.7, riskAdd: 0.003, supplyDrain: 0.9, timeMult: 1.35,
    mitigation: 'Domos pressurizados são obrigatórios.',
  });
  if (p.gravity < 0.4) out.push({
    id: 'low_gravity', label: 'Gravidade baixa', icon: '🪶',
    severity: 0.4, riskAdd: 0.0006, supplyDrain: 0.2, timeMult: 1.1,
    mitigation: 'Atrofia muscular requer suplementos médicos.',
  });
  if (p.gravity > 1.6) out.push({
    id: 'high_gravity', label: 'Gravidade alta', icon: '⬇️',
    severity: Math.min(1, (p.gravity - 1.6) / 2.4),
    riskAdd: 0.0015, supplyDrain: 0.3, timeMult: 1.2,
    mitigation: 'Estruturas reforçadas consomem mais ligas.',
  });
  if (p.type === 'lava' || p.type === 'toxic') out.push({
    id: 'radiation', label: 'Radiação forte', icon: '☢️',
    severity: 0.7, riskAdd: 0.003, supplyDrain: 0.6, timeMult: 1.3,
    mitigation: 'Medicina e blindagem reduzem mortalidade.',
  });
  if (p.type === 'lava' || p.type === 'desert') out.push({
    id: 'storms', label: 'Tempestades violentas', icon: '🌪️',
    severity: 0.5, riskAdd: 0.002, supplyDrain: 0.3, timeMult: 1.2,
    mitigation: 'Pontos de abrigo automáticos reduzem perdas.',
  });
  if ((p.water ?? 0) < 0.1) out.push({
    id: 'no_water', label: 'Sem água superficial', icon: '🏜️',
    severity: 0.6, riskAdd: 0.0015, supplyDrain: 0.7, timeMult: 1.25,
    mitigation: 'Recicladores e estoques iniciais de água são críticos.',
  });
  if (p.habitability < 0.15) out.push({
    id: 'low_resources', label: 'Solo estéril', icon: '🪨',
    severity: 0.55, riskAdd: 0.001, supplyDrain: 0.4, timeMult: 1.2,
    mitigation: 'Hidroponia requer mais ligas para começar.',
  });
  if (p.type === 'living') out.push({
    id: 'hostile_fauna', label: 'Fauna hostil', icon: '🦖',
    severity: 0.7, riskAdd: 0.0035, supplyDrain: 0.5, timeMult: 1.3,
    mitigation: 'Escolta militar é altamente recomendada.',
  });
  // pirate risk scales with distance from origin
  const dist = distanceFromOrigin(p);
  if (dist > 60) out.push({
    id: 'pirates', label: 'Piratas na rota', icon: '🏴‍☠️',
    severity: Math.min(1, dist / 200),
    riskAdd: 0.0025, supplyDrain: 0.4, timeMult: 1.15,
    mitigation: 'Escolta militar reduz drasticamente o risco de pirataria.',
  });
  return out;
}

export function distanceFromOrigin(p: Planet): number {
  const o = useGameStore.getState().originWorld.position;
  const dx = p.position.x - o.x, dy = p.position.y - o.y, dz = p.position.z - o.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// ---------------------------------------------------------------------------
// Mission cost & viability
// ---------------------------------------------------------------------------
export interface MissionPlan {
  baseCost: number;
  totalCost: number;
  supplies: MissionSupplies;
  durationTicks: number;
  difficulty: number;
  hazards: Hazard[];
  canAfford: boolean;
  canColonize: boolean;
  reason?: string;
}

export interface PlanOptions {
  terraformBoost?: boolean;
  escortFleet?: boolean;
  premiumGear?: boolean;
  colonists?: number;
}

export function planMission(planet: Planet, opts: PlanOptions = {}): MissionPlan {
  const hazards = deriveHazards(planet);
  const dist = distanceFromOrigin(planet);
  const difficulty = Math.min(1,
    (1 - planet.habitability) * 0.55 +
    Math.min(1, dist / 150) * 0.25 +
    hazards.reduce((a, h) => a + h.severity * 0.06, 0)
  );
  const colonists = opts.colonists ?? Math.max(200, Math.round(500 + planet.habitability * 800));

  const baseCost = 800 + Math.round(dist * 35) + Math.round((1 - planet.habitability) * 4000);
  const upgradeCost =
    (opts.terraformBoost ? 6000 : 0) +
    (opts.escortFleet ? 2500 : 0) +
    (opts.premiumGear ? 3500 : 0);
  const totalCost = baseCost + upgradeCost;

  const hazSeverity = hazards.reduce((a, h) => a + h.severity, 0);
  const timeMult = hazards.reduce((a, h) => a * h.timeMult, 1) * (opts.premiumGear ? 0.8 : 1);
  // ticks: ~600 baseline (~20s at default tick)
  const durationTicks = Math.round((600 + dist * 6 + colonists * 0.3) * timeMult);

  const supplyMult = 1 + hazSeverity * 0.4;
  const supplies: MissionSupplies = {
    colonists,
    food: Math.round(colonists * 1.2 * supplyMult),
    water: Math.round(colonists * 1.5 * supplyMult),
    medicine: Math.round(colonists * 0.2 * supplyMult + (hazards.some(h => h.id === 'radiation') ? 100 : 0)),
    alloys: Math.round(150 + colonists * 0.25 * supplyMult),
    fuel: Math.round(80 + dist * 1.8 + (opts.premiumGear ? -20 : 0)),
  };

  const credits = useGameStore.getState().credits;
  const canAfford = credits >= totalCost;
  const canColonize = planet.colonies.length === 0 && planet.habitability >= 0.1;
  let reason: string | undefined;
  if (!canColonize) {
    reason = planet.colonies.length > 0
      ? 'Esse planeta já está colonizado.'
      : 'Habitabilidade abaixo de 10% — impossível colonizar (use terraformação prévia).';
  } else if (!canAfford) {
    reason = `Faltam ${(totalCost - credits).toFixed(0)}c.`;
  }

  return { baseCost, totalCost, supplies, durationTicks, difficulty, hazards, canAfford, canColonize, reason };
}

// ---------------------------------------------------------------------------
// Random event pool (per phase)
// ---------------------------------------------------------------------------
interface EventDef {
  kind: MissionEvent['kind'];
  text: string;
  effect: (m: ColonizationMission) => void;
  phases?: MissionPhase[];
  weight: number;
}
const EVENTS: EventDef[] = [
  { kind: 'warn', text: 'Tempestade solar danifica painéis — fuel -10%.', weight: 1.5,
    phases: ['transit'],
    effect: (m) => { m.supplies.fuel = Math.max(0, m.supplies.fuel * 0.9); m.morale -= 0.04; } },
  { kind: 'danger', text: 'Pirataria interceptou parte do comboio! Perda de mantimentos.', weight: 1,
    phases: ['transit'],
    effect: (m) => {
      const loss = m.escortFleet ? 0.05 : 0.18;
      m.supplies.food = Math.max(0, m.supplies.food * (1 - loss));
      m.supplies.alloys = Math.max(0, m.supplies.alloys * (1 - loss));
      m.morale -= m.escortFleet ? 0.05 : 0.15;
    } },
  { kind: 'warn', text: 'Pouso turbulento — alguns colonos ficaram feridos.', weight: 1.2,
    phases: ['landing'],
    effect: (m) => { m.supplies.medicine = Math.max(0, m.supplies.medicine - 20); m.morale -= 0.08; } },
  { kind: 'danger', text: 'Falha no escudo atmosférico durante o pouso! Perda de equipamento.', weight: 0.6,
    phases: ['landing'],
    effect: (m) => {
      const loss = m.premiumGear ? 0.08 : 0.25;
      m.supplies.alloys = Math.max(0, m.supplies.alloys * (1 - loss));
      m.morale -= 0.18;
    } },
  { kind: 'good', text: 'Veia mineral exposta no local de pouso — bônus de ligas!', weight: 0.6,
    phases: ['landing', 'setup'],
    effect: (m) => { m.supplies.alloys += 120; m.morale += 0.04; } },
  { kind: 'warn', text: 'Surto viral na colônia inicial — medicina baixou.', weight: 1.1,
    phases: ['setup'],
    effect: (m) => { m.supplies.medicine = Math.max(0, m.supplies.medicine - 40); m.morale -= 0.06; } },
  { kind: 'danger', text: 'Ataque de fauna nativa! Vidas perdidas, escudo reforçado.', weight: 0.9,
    phases: ['setup', 'establishment'],
    effect: (m) => {
      if (m.hazards.some(h => h.id === 'hostile_fauna') || Math.random() < 0.3) {
        m.supplies.colonists = Math.max(50, m.supplies.colonists - 35);
        m.morale -= 0.12;
      }
    } },
  { kind: 'good', text: 'Aquífero subterrâneo descoberto — água restabelecida!', weight: 0.5,
    phases: ['setup'],
    effect: (m) => { m.supplies.water += 200; m.morale += 0.08; } },
  { kind: 'good', text: 'Reforços chegaram da nave-mãe.', weight: 0.4,
    effect: (m) => { m.supplies.food += 80; m.supplies.water += 80; m.morale += 0.05; } },
  { kind: 'warn', text: 'Tremor sísmico — algumas estruturas precisam de reparo.', weight: 0.7,
    phases: ['setup', 'establishment'],
    effect: (m) => { m.supplies.alloys = Math.max(0, m.supplies.alloys - 60); m.morale -= 0.07; } },
  { kind: 'good', text: 'Marco simbólico hasteado — moral em alta!', weight: 0.6,
    phases: ['establishment'],
    effect: (m) => { m.morale = Math.min(1, m.morale + 0.15); } },
];

function pickEvent(phase: MissionPhase): EventDef | null {
  const pool = EVENTS.filter(e => !e.phases || e.phases.includes(phase));
  const total = pool.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (const e of pool) { r -= e.weight; if (r <= 0) return e; }
  return null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------
interface ColzState {
  missions: ColonizationMission[];
  selectedPlanetId: string | null;
  showPanel: boolean;
  // actions
  openPanelFor: (planetId: string | null) => void;
  closePanel: () => void;
  launch: (planet: Planet, opts: PlanOptions) => string | null;
  abort: (id: string) => void;
  tick: (delta: number) => void;
}

const PHASE_ORDER: MissionPhase[] = ['survey', 'transit', 'landing', 'setup', 'establishment', 'complete'];
const PHASE_WEIGHT: Record<MissionPhase, number> = {
  survey: 0.08, transit: 0.32, landing: 0.10, setup: 0.30, establishment: 0.20,
  complete: 0, failed: 0,
};

let mid = 0;
const newId = () => `colz_${++mid}_${Date.now().toString(36)}`;

function deduct(res: ResourceType, qty: number) {
  const gs = useGameStore.getState();
  const stock = gs.resources.find(r => r.resource === res);
  if (stock) stock.amount = Math.max(0, stock.amount - qty);
}

export const useColonizationStore = create<ColzState>((set, get) => ({
  missions: [],
  selectedPlanetId: null,
  showPanel: false,

  openPanelFor: (planetId) => set({ showPanel: true, selectedPlanetId: planetId }),
  closePanel: () => set({ showPanel: false }),

  launch: (planet, opts) => {
    const plan = planMission(planet, opts);
    if (!plan.canColonize || !plan.canAfford) return null;
    const gs = useGameStore.getState();
    if (!gs.spendCredits(plan.totalCost)) return null;
    // best-effort resource deduction (won't go negative)
    deduct('food', plan.supplies.food * 0.4);
    deduct('water', plan.supplies.water * 0.4);
    deduct('medicine', plan.supplies.medicine * 0.4);
    deduct('alloys', plan.supplies.alloys * 0.4);
    deduct('fuel', plan.supplies.fuel * 0.6);

    const mission: ColonizationMission = {
      id: newId(),
      planetId: planet.id,
      planetName: planet.name,
      hazards: plan.hazards,
      habitability: planet.habitability,
      difficulty: plan.difficulty,
      phase: 'survey',
      phaseProgress: 0,
      totalProgress: 0,
      morale: 0.8,
      supplies: { ...plan.supplies },
      startSupplies: { ...plan.supplies },
      events: [{
        time: gs.gameTime, kind: 'info',
        text: `Missão de colonização iniciada — destino ${planet.name}, ${plan.supplies.colonists} colonos.`,
      }],
      startedAt: gs.gameTime,
      etaTicks: plan.durationTicks,
      terraformBoost: !!opts.terraformBoost,
      escortFleet: !!opts.escortFleet,
      premiumGear: !!opts.premiumGear,
    };
    set(s => ({ missions: [...s.missions, mission] }));
    gs.addTimelineEvent({
      category: 'colony', title: `Expedição partiu para ${planet.name}`,
      description: `Missão de colonização iniciada com ${plan.supplies.colonists} colonos. ${plan.hazards.length} risco(s) conhecido(s).`,
      location: planet.name, importance: 3,
    });
    return mission.id;
  },

  abort: (id) => set(s => ({
    missions: s.missions.map(m => m.id === id ? { ...m, phase: 'failed' as const, events: [...m.events, { time: Date.now(), kind: 'danger' as const, text: 'Missão abortada pelo comando.' }] } : m),
  })),

  tick: (delta) => {
    const gs = useGameStore.getState();
    if (gs.paused) return;
    const dt = delta * gs.gameSpeed * 0.02;
    const missions = get().missions;
    if (missions.length === 0) return;

    const updated = missions.map(m0 => {
      if (m0.phase === 'complete' || m0.phase === 'failed') return m0;
      const m: ColonizationMission = { ...m0, supplies: { ...m0.supplies } };
      const hazSeverity = m.hazards.reduce((a, h) => a + h.severity, 0);

      // supply drain proportional to colonists & hazards
      const drain = (1 + m.hazards.reduce((a, h) => a + h.supplyDrain * h.severity, 0)) * dt;
      m.supplies.food = Math.max(0, m.supplies.food - 0.6 * drain);
      m.supplies.water = Math.max(0, m.supplies.water - 0.7 * drain);
      m.supplies.medicine = Math.max(0, m.supplies.medicine - 0.1 * drain);
      m.supplies.fuel = m.phase === 'transit'
        ? Math.max(0, m.supplies.fuel - 0.4 * drain)
        : m.supplies.fuel;

      // morale dynamics
      const lowFood = m.supplies.food < m.startSupplies.food * 0.2;
      const lowWater = m.supplies.water < m.startSupplies.water * 0.2;
      if (lowFood) m.morale -= 0.02 * dt;
      if (lowWater) m.morale -= 0.03 * dt;
      m.morale = Math.max(0, Math.min(1, m.morale + (m.terraformBoost ? 0.005 : 0) * dt));

      // random event chance
      const eventChance = (0.012 + hazSeverity * 0.006) * dt;
      if (Math.random() < eventChance) {
        const def = pickEvent(m.phase);
        if (def) {
          def.effect(m);
          m.events = [...m.events, { time: gs.gameTime, kind: def.kind, text: def.text }].slice(-30);
        }
      }

      // failure check
      const riskPerTick = (0.0005 + m.hazards.reduce((a, h) => a + h.riskAdd, 0)) * (m.premiumGear ? 0.6 : 1) * dt;
      const collapsed = m.morale <= 0 || (m.supplies.food === 0 && m.supplies.water === 0);
      if (collapsed || Math.random() < riskPerTick * (1 - m.morale)) {
        m.phase = 'failed';
        m.events = [...m.events, { time: gs.gameTime, kind: 'danger', text: collapsed ? 'Colônia colapsou — moral e mantimentos esgotados.' : 'Catástrofe imprevisível encerrou a missão.' }];
        gs.addTimelineEvent({
          category: 'death', title: `Missão para ${m.planetName} fracassou`,
          description: collapsed ? 'Moral e suprimentos esgotaram-se.' : 'Catástrofe encerrou a expedição.',
          location: m.planetName, importance: 4,
        });
        return m;
      }

      // phase progress — terraform boost cuts late-phase difficulty
      const speed = (1 / m.etaTicks) * dt * 30 * (PHASE_ORDER.length - 1) / PHASE_WEIGHT[m.phase];
      const factor = (m.terraformBoost && (m.phase === 'setup' || m.phase === 'establishment')) ? 1.25 : 1;
      m.phaseProgress = Math.min(1, m.phaseProgress + speed * factor);

      if (m.phaseProgress >= 1) {
        const idx = PHASE_ORDER.indexOf(m.phase);
        const next = PHASE_ORDER[Math.min(PHASE_ORDER.length - 1, idx + 1)];
        m.phase = next;
        m.phaseProgress = 0;
        m.events = [...m.events, { time: gs.gameTime, kind: 'good', text: `Fase concluída — agora: ${PHASE_LABEL[next]}.` }];
      }

      // compute total progress
      const idx = PHASE_ORDER.indexOf(m.phase);
      let acc = 0;
      for (let i = 0; i < idx; i++) acc += PHASE_WEIGHT[PHASE_ORDER[i]];
      acc += PHASE_WEIGHT[m.phase] * m.phaseProgress;
      m.totalProgress = Math.min(1, acc);

      // completion — call gameStore.buildColony to actually create the colony
      if ((m.phase as MissionPhase) === 'complete' && (m0.phase as MissionPhase) !== 'complete') {
        gs.buildColony(m.planetId);
        // bonus credits on success scaled by difficulty
        gs.addCredits(Math.round(800 + m.difficulty * 2400));
        gs.addTimelineEvent({
          category: 'colony', title: `Colônia estabelecida em ${m.planetName}!`,
          description: `Missão concluída com sucesso. Moral final: ${(m.morale * 100).toFixed(0)}%.`,
          location: m.planetName, importance: 4,
        });
        m.events = [...m.events, { time: gs.gameTime, kind: 'good', text: '🎉 Colônia oficialmente estabelecida!' }];
      }
      return m;
    });
    set({ missions: updated });
  },
}));

export const PHASE_LABEL: Record<MissionPhase, string> = {
  survey: 'Sondagem orbital',
  transit: 'Trânsito interestelar',
  landing: 'Pouso planetário',
  setup: 'Montagem da base',
  establishment: 'Estabelecimento da cidade',
  complete: 'Concluída',
  failed: 'Fracassada',
};

export const PHASE_ICON: Record<MissionPhase, string> = {
  survey: '🛰️', transit: '🚀', landing: '🛬', setup: '🏗️',
  establishment: '🏙️', complete: '✅', failed: '💀',
};
