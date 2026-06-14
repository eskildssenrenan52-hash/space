import { create } from 'zustand';
import * as THREE from 'three';

// ============== TYPES ==============

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export type ResourceType =
  | 'energy' | 'food' | 'water' | 'iron' | 'titanium' | 'copper' | 'gold'
  | 'uranium' | 'helium3' | 'crystals' | 'antimatter' | 'dark_matter' | 'fuel'
  | 'electronics' | 'medicine' | 'alloys' | 'biomass' | 'rare_elements';

export type StarType = 'main_sequence' | 'red_giant' | 'white_dwarf' | 'neutron' | 'binary' | 'black_hole';

export type PlanetType =
  // Classic biomes
  | 'terrestrial' | 'gas_giant' | 'ice' | 'lava' | 'ocean' | 'desert' | 'frozen' | 'toxic' | 'artificial' | 'living'
  // New biomes — Tier 2
  | 'crystalline'    // covered in crystal formations, refraction effects
  | 'fungal'         // giant mushroom forests, bioluminescent
  | 'volcanic_ocean' // magma oceans with volcanic islands
  | 'swamp'          // dense wetlands, extreme biodiversity
  | 'paradise'       // near-perfect conditions, high habitability
  | 'ruins'          // dead world with ancient infrastructure
  | 'hollow'         // hollow-core world with inner ecosystem
  | 'storm'          // permanent storm systems, massive cyclones
  | 'jungle'         // planet-wide rainforest biome
  | 'tundra'         // frozen plains with sparse life
  // New biomes — Tier 3 (exotic)
  | 'plasma'         // superheated plasma atmosphere
  | 'diamond'        // carbon-compressed diamond surface
  | 'shadow'         // tidally locked, permanent dark side
  | 'ring_world'     // artificially ringed habitat world
  | 'gas_dwarf'      // smaller than gas giant, habitable upper layers
  | 'nebula_world'   // inside a nebula cloud, strange chemistry
  | 'binary_world'   // co-orbiting twin planets
  | 'pulsed'         // irradiated by a pulsar, extreme life forms
  // New biomes — Tier 4 (mega-rare)
  | 'dyson_shell'    // interior of a partially built Dyson sphere
  | 'quantum'        // quantum-superposed, exists in multiple states
  | 'void'           // matter-drained, reality-thin world
  | 'ascended';      // post-biological civilization remains

export type ShipType = 'scout' | 'fighter' | 'corvette' | 'frigate' | 'cruiser' | 'battleship' | 'carrier' | 'titan' | 'transport' | 'mining' | 'colony';

export type RoomType = 'bridge' | 'engineering' | 'reactor' | 'hangar' | 'medbay' | 'quarters' | 'cargo' | 'life_support' | 'lab' | 'comms' | 'brig' | 'recreation' | 'defense' | 'kitchen' | 'hydroponics' | 'armory' | 'shield_control' | 'navigation' | 'warp_drive' | 'sensor_array';

export type RoomStatus = 'operational' | 'degraded' | 'critical' | 'offline';

export type PowerStatus = 'active' | 'low_power' | 'offline' | 'damaged';

export type IssueType = 'fire' | 'leak' | 'electrical' | 'life_support' | 'structural' | 'radiation' | 'malfunction' | 'blockage';

export type IssueSeverity = 'minor' | 'major' | 'critical';

export type GalaxyType = 'spiral' | 'elliptical' | 'irregular' | 'ring' | 'lenticular' | 'dwarf' | 'ancient' | 'war_torn' | 'ai_dominated' | 'living' | 'destroyed' | 'artificial';

// ============== TIMELINE ==============

export type TimelineCategory =
  | 'foundation' | 'war' | 'discovery' | 'colony' | 'death' | 'collapse'
  | 'invention' | 'cosmic' | 'diplomacy' | 'economy' | 'tech' | 'misc';

export interface TimelineEvent {
  id: string;
  time: number;
  year: number;
  category: TimelineCategory;
  title: string;
  description: string;
  location?: string; // galaxy / star / planet name
  importance: 1 | 2 | 3 | 4 | 5;
}

// ============== ROBOTS / ENGINEERING ==============

export type RobotChassis =
  | 'wheeled' | 'tracked' | 'biped' | 'quadruped' | 'hexapod'
  | 'drone_quad' | 'drone_fixed' | 'submarine' | 'spider' | 'snake' | 'humanoid' | 'tank';

export type RobotBehaviorId =
  // movement
  | 'move_forward' | 'move_back' | 'turn_left' | 'turn_right' | 'strafe_left' | 'strafe_right'
  | 'jump' | 'crouch' | 'hover' | 'land' | 'follow_path' | 'patrol' | 'orbit' | 'roam'
  // sensing
  | 'detect_enemy' | 'detect_ally' | 'detect_resource' | 'detect_obstacle' | 'scan_area'
  | 'thermal_scan' | 'sound_detect' | 'radar_ping' | 'lidar_scan' | 'spectroscopy'
  // combat
  | 'attack_target' | 'attack_melee' | 'fire_ranged' | 'fire_missile' | 'launch_drone'
  | 'shield_up' | 'shield_down' | 'evade' | 'flank' | 'retreat' | 'self_destruct'
  // logic
  | 'if_then' | 'if_else' | 'while_loop' | 'for_loop' | 'repeat_n' | 'wait_seconds'
  | 'random' | 'remember' | 'recall' | 'forget' | 'compare' | 'count'
  // work
  | 'mine' | 'drill' | 'haul' | 'deposit' | 'refine' | 'assemble' | 'weld' | 'repair'
  | 'build' | 'demolish' | 'plant' | 'harvest' | 'cook' | 'water' | 'fertilize'
  // comms
  | 'broadcast' | 'listen' | 'encrypt' | 'decrypt' | 'jam_signal' | 'relay'
  | 'request_help' | 'send_coords' | 'send_data' | 'connect_swarm'
  // power
  | 'recharge' | 'sleep' | 'wake' | 'overclock' | 'cool_down' | 'vent_heat'
  // social / civilian
  | 'greet' | 'sell' | 'buy' | 'deliver' | 'guard' | 'escort' | 'entertain' | 'teach';

export interface RobotBehavior {
  id: RobotBehaviorId;
  label: string;
  category: 'movement' | 'sensing' | 'combat' | 'logic' | 'work' | 'comms' | 'power' | 'social';
  energyCost: number;
}

export interface RobotBlock {
  id: string;
  behavior: RobotBehaviorId;
  param?: string | number; // optional parameter (seconds, target, count)
}

export interface Robot {
  id: string;
  name: string;
  chassis: RobotChassis;
  color: string;
  height: number;
  armor: number;
  speed: number;
  power: number;
  intelligence: number;
  program: RobotBlock[];
  createdAt: number;
  ownerId: 'player' | 'market';
  price: number;
  forSale: boolean;
}

// ============== MARKET ==============

export interface MarketListing {
  id: string;
  kind: 'robot' | 'resource' | 'blueprint';
  refId: string;
  seller: string;
  price: number;
  qty: number;
  listedAt: number;
}

export interface ResourceStock {
  resource: ResourceType;
  amount: number;
  maxStorage: number;
  production: number;
  consumption: number;
}

export interface ResourceDeposit {
  resource: ResourceType;
  amount: number;
  accessibility: number;
  quality: number;
}

export interface Moon {
  id: string;
  name: string;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  type: 'rocky' | 'ice' | 'volcanic' | 'captured';
  size: number;
  resources: ResourceDeposit[];
  explored: boolean;
}

export interface Colony {
  id: string;
  name: string;
  planetId: string;
  population: number;
  populationGrowth: number;
  happiness: number;
  health: number;
  education: number;
  culture: number;
  defense: number;
  infrastructure: number;
  economy: number;
  distanceFromOrigin: number;
  founded: number;
}

export interface Planet {
  id: string;
  name: string;
  position: Vector3;
  orbitRadius: number;
  orbitSpeed: number;
  angle: number;
  type: PlanetType;
  size: number;
  gravity: number;
  atmosphere: boolean;
  atmosphereType?: 'breathable' | 'toxic' | 'thin' | 'dense';
  temperature: number;
  water?: number;
  resources: ResourceDeposit[];
  moons: Moon[];
  rings: boolean;
  habitability: number;
  population?: number;
  colonies: Colony[];
  explored: boolean;
  owned: boolean;
  color: string;
}

export interface Star {
  id: string;
  name: string;
  position: Vector3;
  type: StarType;
  color: string;
  size: number;
  temperature: number;
  planets: Planet[];
  explored: boolean;
}

export interface Galaxy {
  id: string;
  name: string;
  type: GalaxyType;
  position: Vector3;
  size: number;
  age: number;
  stars: Star[];
  explored: boolean;
  distanceFromOrigin: number;
  color: string;
}

export interface RoomIssue {
  id: string;
  type: IssueType;
  severity: IssueSeverity;
  description: string;
  detectedAt: number;
  repairRequired: number;
  repairProgress: number;
}

export interface MaintenanceRecord {
  timestamp: number;
  type: 'routine' | 'repair' | 'upgrade' | 'emergency';
  description: string;
  cost: number;
}

export interface Room {
  id: string;
  name: string;
  type: RoomType;
  position: Vector3;
  size: Vector3;
  health: number;
  maxHealth: number;
  temperature: number;
  oxygenLevel: number;
  powerDraw: number;
  powerStatus: PowerStatus;
  wearLevel: number;
  efficiency: number;
  maintenanceHistory: MaintenanceRecord[];
  currentIssue?: RoomIssue;
  status: RoomStatus;
  occupants: number;
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'captain' | 'pilot' | 'engineer' | 'scientist' | 'medic' | 'soldier' | 'technician';
  skills: Record<string, number>;
  health: number;
  morale: number;
}

export interface CargoHold {
  capacity: number;
  used: number;
  items: { resource: ResourceType; amount: number }[];
}

export interface Ship {
  id: string;
  name: string;
  type: ShipType;
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  size: number;
  health: number;
  maxHealth: number;
  shield: number;
  maxShield: number;
  energy: number;
  maxEnergy: number;
  fuel: number;
  maxFuel: number;
  crew: CrewMember[];
  maxCrew: number;
  rooms: Room[];
  cargo: CargoHold;
  destination?: Vector3;
  inTransit: boolean;
  speed: number;
  alerts: ShipAlert[];
  maintenanceLevel: number;
  overallEfficiency: number;
}

export interface ShipAlert {
  id: string;
  roomId: string;
  type: 'fire' | 'breach' | 'malfunction' | 'low_power' | 'life_support' | 'radiation';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
}

export interface Technology {
  id: string;
  name: string;
  category: 'space' | 'military' | 'economic' | 'scientific' | 'energy' | 'biological' | 'industrial' | 'dimensional';
  tier: number;
  cost: number;
  progress: number;
  prerequisites: string[];
  researched: boolean;
  description: string;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  message: string;
  timestamp: number;
  read: boolean;
}

// ============== GAME STATE ==============

export interface GameState {
  // Core
  gameTime: number;
  gameSpeed: number;
  paused: boolean;

  // World
  galaxies: Galaxy[];
  stars: Star[];
  planets: Planet[];
  originWorld: Planet;

  // Player
  playerShips: Ship[];
  resources: ResourceStock[];
  technologies: Technology[];
  researchQueue: string[];

  // Timeline + Engineering + Market
  timeline: TimelineEvent[];
  robots: Robot[];
  market: MarketListing[];
  credits: number;

  // Selections
  selectedShip: Ship | null;
  selectedRoom: Room | null;
  selectedPlanet: Planet | null;
  selectedStar: Star | null;
  selectedGalaxy: Galaxy | null;

  // UI State
  currentView: 'galaxy' | 'system' | 'planet' | 'ship';
  showShipInterior: boolean;
  showResearch: boolean;
  showTimeline: boolean;
  showEngineering: boolean;
  showMarket: boolean;
  notifications: Notification[];

  // Camera
  cameraTarget: Vector3;
  cameraPosition: Vector3;
  zoomLevel: number;
}

// ============== ACTIONS ==============

export interface GameActions {
  setGameSpeed: (speed: number) => void;
  togglePause: () => void;
  advanceTime: (delta: number) => void;
  selectShip: (ship: Ship | null) => void;
  selectRoom: (room: Room | null) => void;
  selectPlanet: (planet: Planet | null) => void;
  selectStar: (star: Star | null) => void;
  selectGalaxy: (galaxy: Galaxy | null) => void;
  setCurrentView: (view: GameState['currentView']) => void;
  toggleShipInterior: () => void;
  toggleResearch: () => void;
  toggleTimeline: () => void;
  toggleEngineering: () => void;
  toggleMarket: () => void;
  repairRoom: (shipId: string, roomId: string) => void;
  acknowledgeAlert: (alertId: string) => void;
  buildColony: (planetId: string) => void;
  queueResearch: (techId: string) => void;
  cancelResearch: (techId: string) => void;
  moveShipTo: (shipId: string, target: Vector3) => void;
  initializeGame: () => void;
  saveGame: () => void;
  loadGame: () => void;
  addTimelineEvent: (e: Omit<TimelineEvent, 'id' | 'time' | 'year'>) => void;
  createRobot: (robot: Omit<Robot, 'id' | 'createdAt' | 'ownerId' | 'forSale' | 'price'>) => string;
  updateRobot: (id: string, patch: Partial<Robot>) => void;
  deleteRobot: (id: string) => void;
  listRobotOnMarket: (robotId: string, price: number) => void;
  buyMarketListing: (listingId: string) => void;
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

// ============== GENERATORS ==============

let idCounter = 0;
const genId = (): string => `id_${idCounter++}`;

const resourceTypes: ResourceType[] = ['energy', 'food', 'water', 'iron', 'titanium', 'fuel', 'electronics', 'medicine', 'crystals', 'rare_elements'];

const generateResourceStock = (): ResourceStock[] => {
  return resourceTypes.map(r => ({
    resource: r,
    amount: Math.floor(Math.random() * 1000) + 500,
    maxStorage: 5000,
    production: Math.random() * 5 + 1,
    consumption: Math.random() * 4 + 0.5
  }));
};

const generateResourceDeposit = (): ResourceDeposit[] => {
  const count = Math.floor(Math.random() * 4) + 1;
  return Array.from({ length: count }, () => ({
    resource: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
    amount: Math.random() * 5000 + 100,
    accessibility: Math.random(),
    quality: Math.random() * 0.5 + 0.5
  }));
};

const romanize = (num: number): string => {
  const lookup = { X: 10, IX: 9, V: 5, IV: 4, I: 1 };
  let roman = '';
  for (const i in lookup) {
    while (num >= lookup[i as keyof typeof lookup]) {
      roman += i;
      num -= lookup[i as keyof typeof lookup];
    }
  }
  return roman;
};

const generateMoons = (): Moon[] => {
  const count = Math.floor(Math.random() * 3);
  if (count === 0) return [];
  return Array.from({ length: count }, (_, i) => ({
    id: genId(),
    name: `Moon ${romanize(i + 1)}`,
    orbitRadius: 2 + i * 0.5,
    orbitSpeed: 0.05 - i * 0.01,
    angle: Math.random() * Math.PI * 2,
    type: ['rocky', 'ice', 'volcanic', 'captured'][Math.floor(Math.random() * 4)] as Moon['type'],
    size: 0.2 + Math.random() * 0.3,
    resources: [],
    explored: Math.random() > 0.7
  }));
};

const starColors: Record<StarType, string> = {
  main_sequence: '#FFFFCC',
  red_giant: '#FF6B6B',
  white_dwarf: '#FFFFFF',
  neutron: '#99CCFF',
  binary: '#FFFF99',
  black_hole: '#1a1a2e'
};

const planetColors: Record<PlanetType, string> = {
  terrestrial: '#4A7C59', gas_giant: '#E8A87C', ice: '#A8D8EA',
  lava: '#FF6B6B', ocean: '#4A90D9', desert: '#D4A574',
  frozen: '#B8D4E3', toxic: '#9B59B6', artificial: '#C0C0C0', living: '#32CD32',
  crystalline: '#7DD8F8', fungal: '#7B4FBA', volcanic_ocean: '#E05020',
  swamp: '#4A6741', paradise: '#50E8A0', ruins: '#8B7355',
  hollow: '#B8A060', storm: '#4466CC', jungle: '#228B22', tundra: '#C8DCE8',
  plasma: '#FF4500', diamond: '#B9F2FF', shadow: '#1a1a3e',
  ring_world: '#44AAFF', gas_dwarf: '#FFCC88', nebula_world: '#CC44FF',
  binary_world: '#66CCCC', pulsed: '#00FF88',
  dyson_shell: '#FF8800', quantum: '#FF44FF', void: '#110011', ascended: '#FFD700',
};

const generatePlanets = (starPos: Vector3, starId: string): Planet[] => {
  const count = Math.floor(Math.random() * 7) + 4;
  const types: PlanetType[] = [
    'terrestrial', 'gas_giant', 'ice', 'lava', 'ocean', 'desert', 'frozen', 'toxic',
    'crystalline', 'fungal', 'volcanic_ocean', 'swamp', 'paradise', 'ruins',
    'hollow', 'storm', 'jungle', 'tundra',
    'plasma', 'diamond', 'shadow', 'ring_world', 'gas_dwarf', 'nebula_world',
    'binary_world', 'pulsed', 'dyson_shell', 'quantum', 'void', 'ascended',
  ];

  // Weighted distribution: common biomes appear more often, rare ones less
  const typeWeights: Partial<Record<PlanetType, number>> = {
    terrestrial: 8, gas_giant: 8, ice: 7, lava: 6, ocean: 7, desert: 7,
    frozen: 6, toxic: 5, jungle: 5, tundra: 5, swamp: 4, storm: 4,
    crystalline: 3, fungal: 3, volcanic_ocean: 3, paradise: 2, ruins: 2,
    hollow: 2, shadow: 2, gas_dwarf: 2, nebula_world: 2, binary_world: 2,
    pulsed: 1, plasma: 1, diamond: 1, ring_world: 1,
    artificial: 0.5, living: 0.5, dyson_shell: 0.3, quantum: 0.2, void: 0.2, ascended: 0.1,
  };
  const weightedTypes: PlanetType[] = [];
  for (const [t, w] of Object.entries(typeWeights)) {
    const count = Math.max(1, Math.round(w));
    for (let k = 0; k < count; k++) weightedTypes.push(t as PlanetType);
  }

  const getHabitability = (t: PlanetType): number => {
    const base: Partial<Record<PlanetType, [number, number]>> = {
      paradise: [0.85, 1.0], terrestrial: [0.5, 0.9], ocean: [0.5, 0.85],
      jungle: [0.4, 0.75], swamp: [0.35, 0.65], hollow: [0.3, 0.6],
      tundra: [0.15, 0.4], fungal: [0.2, 0.5], storm: [0.1, 0.35],
      gas_dwarf: [0.1, 0.3], crystalline: [0.05, 0.2], ruins: [0.1, 0.3],
      shadow: [0.05, 0.2], desert: [0.05, 0.2], frozen: [0.02, 0.1],
      ice: [0.02, 0.1], binary_world: [0.1, 0.3], nebula_world: [0.1, 0.25],
      ascended: [0.0, 0.05], ring_world: [0.7, 0.95],
    };
    const r = base[t];
    return r ? r[0] + Math.random() * (r[1] - r[0]) : Math.random() * 0.1;
  };

  const getTemperature = (t: PlanetType): number => {
    const temps: Partial<Record<PlanetType, [number, number]>> = {
      lava: [700, 1200], volcanic_ocean: [400, 900], plasma: [2000, 8000],
      pulsed: [300, 600], desert: [50, 150], shadow: [-100, 20],
      frozen: [-220, -150], tundra: [-80, -20], ice: [-180, -100],
      paradise: [15, 30], terrestrial: [5, 35], ocean: [0, 25],
      jungle: [20, 40], swamp: [20, 40], storm: [-20, 50],
      gas_giant: [-150, 50], gas_dwarf: [-100, 80], nebula_world: [-50, 200],
      diamond: [-200, 500], quantum: [-273, 1000], void: [-273, -200],
      ascended: [20, 25], dyson_shell: [18, 28], ring_world: [18, 28],
    };
    const r = temps[t];
    return r ? r[0] + Math.random() * (r[1] - r[0]) : -50 + Math.random() * 100;
  };

  const getWater = (t: PlanetType): number => {
    const w: Partial<Record<PlanetType, [number, number]>> = {
      ocean: [0.75, 0.95], paradise: [0.5, 0.75], swamp: [0.55, 0.8],
      jungle: [0.4, 0.65], terrestrial: [0.2, 0.5], hollow: [0.2, 0.5],
      frozen: [0.1, 0.3], ice: [0.05, 0.2], storm: [0.1, 0.4],
      tundra: [0.1, 0.25], desert: [0.0, 0.05], lava: [0.0, 0.02],
      volcanic_ocean: [0.0, 0.1], plasma: [0.0, 0.0], void: [0.0, 0.0],
    };
    const r = w[t];
    return r ? r[0] + Math.random() * (r[1] - r[0]) : Math.random() * 0.2;
  };

  const getAtmosphere = (t: PlanetType): string => {
    const a: Partial<Record<PlanetType, string>> = {
      toxic: 'toxic', desert: 'thin', frozen: 'thin', lava: 'volcanic',
      plasma: 'plasma', storm: 'dense', gas_giant: 'dense', gas_dwarf: 'dense',
      nebula_world: 'nebular', pulsed: 'irradiated', void: 'none',
      paradise: 'breathable', terrestrial: 'breathable', jungle: 'breathable',
      swamp: 'breathable', ocean: 'breathable', ring_world: 'breathable',
      dyson_shell: 'breathable', ascended: 'breathable',
    };
    return a[t] ?? (Math.random() > 0.5 ? 'breathable' : 'dense');
  };

  return Array.from({ length: count }, (_, i) => {
    const type = weightedTypes[Math.floor(Math.random() * weightedTypes.length)];
    const habitability = getHabitability(type);
    const temperature = getTemperature(type);
    const water = getWater(type);
    const atm = getAtmosphere(type);

    const baseRadius = 4 + i * 2.2 + (Math.random() - 0.5) * 1.5;
    const startAngle = Math.random() * Math.PI * 2;
    const inclination = (Math.random() - 0.5) * 0.6;

    const isLarge = type === 'gas_giant' || type === 'gas_dwarf' || type === 'ring_world' || type === 'dyson_shell';
    const isTiny = type === 'void' || type === 'quantum' || type === 'ascended';

    return {
      id: genId(),
      name: `Planet ${romanize(i + 1)}-${starId.slice(0, 3)}`,
      position: {
        x: starPos.x + Math.cos(startAngle) * baseRadius,
        y: starPos.y + inclination * baseRadius * 0.4,
        z: starPos.z + Math.sin(startAngle) * baseRadius,
      },
      orbitRadius: baseRadius,
      orbitSpeed: 0.02 - i * 0.0015 + Math.random() * 0.005,
      angle: startAngle,
      type,
      size: isLarge ? 1.4 + Math.random() * 0.8 : isTiny ? 0.2 + Math.random() * 0.2 : 0.4 + Math.random() * 0.4,
      gravity: type === 'gas_giant' ? 2 + Math.random() * 3 : 0.5 + Math.random() * 1.5,
      atmosphere: atm !== 'none',
      atmosphereType: atm,
      temperature,
      water,
      resources: generateResourceDeposit(),
      moons: isLarge ? generateMoons() : generateMoons().slice(0, Math.floor(Math.random() * 2)),
      rings: (type === 'gas_giant' || type === 'ring_world') && Math.random() > 0.4,
      habitability,
      population: 0,
      colonies: [],
      explored: false,
      owned: false,
      color: planetColors[type]
    };
  });
};

const generateStars = (count: number, galaxyId: string): Star[] => {
  const types: StarType[] = ['main_sequence', 'red_giant', 'white_dwarf', 'neutron', 'binary'];

  return Array.from({ length: count }, () => {
    const type = types[Math.floor(Math.random() * types.length)];
    // Disc-like 3D distribution for stars
    const r = Math.pow(Math.random(), 0.6) * 320;
    const theta = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 60;
    const pos: Vector3 = {
      x: Math.cos(theta) * r,
      y: height,
      z: Math.sin(theta) * r
    };

    return {
      id: genId(),
      name: `Star ${genId().slice(0, 5)}`,
      position: pos,
      type,
      color: starColors[type],
      size: type === 'red_giant' ? 2 : type === 'white_dwarf' ? 0.3 : 0.8 + Math.random() * 0.3,
      temperature: 3000 + Math.random() * 15000,
      planets: generatePlanets(pos, galaxyId),
      explored: false
    };
  });
};

const galaxyColors: Record<GalaxyType, string> = {
  spiral: '#6B93D6',
  elliptical: '#FFE4B5',
  irregular: '#98D8C8',
  ring: '#FF69B4',
  lenticular: '#DDA0DD',
  dwarf: '#87CEEB',
  ancient: '#FFD700',
  war_torn: '#FF4500',
  ai_dominated: '#00FF00',
  living: '#32CD32',
  destroyed: '#8B0000',
  artificial: '#00CED1'
};

const generateGalaxy = (index: number, isOrigin: boolean = false): Galaxy => {
  const types: GalaxyType[] = ['spiral', 'elliptical', 'irregular', 'ring', 'lenticular', 'dwarf', 'ancient'];
  // Galaxies in a true 3D cluster, not a diagonal line.
  const golden = Math.PI * (3 - Math.sqrt(5));
  const t = index / 50;
  const inclination = Math.acos(1 - 2 * t);
  const azimuth = golden * index;
  const radius = isOrigin ? 0 : 1200 + Math.random() * 2400; // very spread out
  const pos: Vector3 = isOrigin
    ? { x: 0, y: 0, z: 0 }
    : {
        x: Math.sin(inclination) * Math.cos(azimuth) * radius + (Math.random() - 0.5) * 300,
        y: Math.cos(inclination) * radius * 0.5 + (Math.random() - 0.5) * 400,
        z: Math.sin(inclination) * Math.sin(azimuth) * radius + (Math.random() - 0.5) * 300,
      };

  const stars = isOrigin
    ? generateStars(100, `galaxy_${index}`)
    : generateStars(Math.floor(Math.random() * 80) + 30, `galaxy_${index}`);

  const type = isOrigin ? 'spiral' : types[Math.floor(Math.random() * types.length)];

  return {
    id: `galaxy_${index}`,
    name: isOrigin ? 'Origin Galaxy - Home' : `Galaxy ${index}`,
    type,
    position: pos,
    size: isOrigin ? 200 : 120 + Math.random() * 240,
    age: Math.random() * 13,
    stars,
    explored: isOrigin,
    distanceFromOrigin: isOrigin ? 0 : Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2),
    color: galaxyColors[type]
  };
};

// Ship generation
const roomConfigs: Record<ShipType, { type: RoomType; count: number }[]> = {
  scout: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 1 }, { type: 'reactor', count: 1 },
    { type: 'quarters', count: 1 }, { type: 'life_support', count: 1 }, { type: 'navigation', count: 1 }
  ],
  fighter: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 1 }, { type: 'reactor', count: 1 },
    { type: 'quarters', count: 1 }, { type: 'life_support', count: 1 }, { type: 'armory', count: 1 }
  ],
  corvette: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 2 }, { type: 'reactor', count: 2 },
    { type: 'quarters', count: 2 }, { type: 'life_support', count: 1 }, { type: 'medbay', count: 1 },
    { type: 'cargo', count: 1 }, { type: 'defense', count: 1 }
  ],
  frigate: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 2 }, { type: 'reactor', count: 2 },
    { type: 'quarters', count: 3 }, { type: 'life_support', count: 2 }, { type: 'medbay', count: 1 },
    { type: 'cargo', count: 2 }, { type: 'defense', count: 1 }, { type: 'hangar', count: 1 }
  ],
  cruiser: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 3 }, { type: 'reactor', count: 3 },
    { type: 'quarters', count: 4 }, { type: 'life_support', count: 2 }, { type: 'medbay', count: 2 },
    { type: 'cargo', count: 3 }, { type: 'defense', count: 2 }, { type: 'hangar', count: 1 },
    { type: 'lab', count: 1 }, { type: 'recreation', count: 1 }
  ],
  battleship: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 4 }, { type: 'reactor', count: 4 },
    { type: 'quarters', count: 6 }, { type: 'life_support', count: 3 }, { type: 'medbay', count: 2 },
    { type: 'cargo', count: 4 }, { type: 'defense', count: 3 }, { type: 'hangar', count: 2 },
    { type: 'lab', count: 1 }, { type: 'recreation', count: 2 }, { type: 'armory', count: 2 }
  ],
  carrier: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 4 }, { type: 'reactor', count: 4 },
    { type: 'quarters', count: 8 }, { type: 'life_support', count: 4 }, { type: 'medbay', count: 3 },
    { type: 'cargo', count: 6 }, { type: 'hangar', count: 4 }, { type: 'defense', count: 2 },
    { type: 'recreation', count: 2 }, { type: 'kitchen', count: 2 }
  ],
  titan: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 8 }, { type: 'reactor', count: 6 },
    { type: 'quarters', count: 15 }, { type: 'life_support', count: 6 }, { type: 'medbay', count: 4 },
    { type: 'cargo', count: 10 }, { type: 'defense', count: 5 }, { type: 'hangar', count: 6 },
    { type: 'lab', count: 3 }, { type: 'recreation', count: 5 }, { type: 'hydroponics', count: 2 },
    { type: 'brig', count: 2 }, { type: 'comms', count: 2 }, { type: 'shield_control', count: 2 }
  ],
  transport: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 2 }, { type: 'reactor', count: 2 },
    { type: 'quarters', count: 2 }, { type: 'life_support', count: 2 }, { type: 'cargo', count: 8 }
  ],
  mining: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 2 }, { type: 'reactor', count: 2 },
    { type: 'quarters', count: 2 }, { type: 'life_support', count: 2 }, { type: 'cargo', count: 6 },
    { type: 'lab', count: 1 }
  ],
  colony: [
    { type: 'bridge', count: 1 }, { type: 'engineering', count: 3 }, { type: 'reactor', count: 3 },
    { type: 'quarters', count: 10 }, { type: 'life_support', count: 4 }, { type: 'medbay', count: 2 },
    { type: 'cargo', count: 8 }, { type: 'hydroponics', count: 2 }, { type: 'recreation', count: 2 }
  ]
};

const shipStats: Record<ShipType, { size: number; maxHealth: number; maxCrew: number; maxFuel: number; speed: number }> = {
  scout: { size: 0.4, maxHealth: 80, maxCrew: 4, maxFuel: 150, speed: 2.5 },
  fighter: { size: 0.5, maxHealth: 120, maxCrew: 2, maxFuel: 100, speed: 3 },
  corvette: { size: 0.8, maxHealth: 250, maxCrew: 12, maxFuel: 350, speed: 1.8 },
  frigate: { size: 1.2, maxHealth: 450, maxCrew: 35, maxFuel: 550, speed: 1.4 },
  cruiser: { size: 1.8, maxHealth: 750, maxCrew: 90, maxFuel: 900, speed: 1.1 },
  battleship: { size: 2.5, maxHealth: 1400, maxCrew: 280, maxFuel: 1800, speed: 0.85 },
  carrier: { size: 3, maxHealth: 1100, maxCrew: 450, maxFuel: 2200, speed: 0.65 },
  titan: { size: 4.5, maxHealth: 4500, maxCrew: 900, maxFuel: 4500, speed: 0.45 },
  transport: { size: 1.8, maxHealth: 350, maxCrew: 18, maxFuel: 1200, speed: 0.75 },
  mining: { size: 1.3, maxHealth: 320, maxCrew: 25, maxFuel: 700, speed: 0.55 },
  colony: { size: 3.5, maxHealth: 500, maxCrew: 1800, maxFuel: 2800, speed: 0.35 }
};

const crewNames = ['Marcus Chen', 'Elena Volkov', 'James Morrison', 'Yuki Tanaka', 'Kira Patel', 'Viktor Novak', 'Sarah Williams', 'Alex Rodriguez', 'Nina Kowalski', 'Zara Okonkwo', 'John Shepard', 'Li Wei', 'Ana Silva', 'David Kim'];

const generateCrew = (count: number): CrewMember[] => {
  const roles: CrewMember['role'][] = ['captain', 'pilot', 'engineer', 'scientist', 'medic', 'soldier', 'technician'];
  return Array.from({ length: count }, (_, i) => ({
    id: genId(),
    name: crewNames[i % crewNames.length] + (i >= crewNames.length ? ` ${Math.floor(i / crewNames.length) + 1}` : ''),
    role: roles[Math.floor(Math.random() * roles.length)],
    skills: {
      engineering: Math.random() * 100,
      combat: Math.random() * 100,
      science: Math.random() * 100,
      medical: Math.random() * 100,
      piloting: Math.random() * 100,
      leadership: Math.random() * 100
    },
    health: 85 + Math.random() * 15,
    morale: 65 + Math.random() * 35
  }));
};

const generateRooms = (shipType: ShipType): Room[] => {
  const config = roomConfigs[shipType];
  const rooms: Room[] = [];
  let yOffset = 0;

  config.forEach(roomConfig => {
    for (let i = 0; i < roomConfig.count; i++) {
      const width = 2 + Math.random() * 2.5;
      const height = 2.5;
      const depth = 2 + Math.random() * 2.5;

      rooms.push({
        id: genId(),
        name: `${roomConfig.type.replace('_', ' ').toUpperCase()} ${i + 1}`,
        type: roomConfig.type,
        position: { x: (i % 2 === 0 ? -width - 0.5 : 0.5), y: yOffset, z: -depth / 2 },
        size: { x: width, y: height, z: depth },
        health: 100,
        maxHealth: 100,
        temperature: 18 + Math.random() * 8,
        oxygenLevel: 92 + Math.random() * 6,
        powerDraw: 3 + Math.random() * 8,
        powerStatus: 'active',
        wearLevel: Math.random() * 0.25,
        efficiency: 0.85 + Math.random() * 0.15,
        maintenanceHistory: [],
        status: 'operational',
        occupants: 0
      });

      if (i % 2 === 1) yOffset += 3.5;
    }
  });

  return rooms;
};

const generateShip = (type: ShipType): Ship => {
  const stats = shipStats[type];
  return {
    id: genId(),
    name: `ISS ${['Pioneer', 'Endeavour', 'Discovery', 'Horizon', 'Odyssey'][Math.floor(Math.random() * 5)]}`,
    type,
    position: { x: 5, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    velocity: { x: 0, y: 0, z: 0 },
    size: stats.size,
    health: stats.maxHealth,
    maxHealth: stats.maxHealth,
    shield: stats.maxHealth * 0.4,
    maxShield: stats.maxHealth * 0.4,
    energy: 100,
    maxEnergy: 100,
    fuel: stats.maxFuel,
    maxFuel: stats.maxFuel,
    crew: generateCrew(Math.floor(stats.maxCrew * 0.25) + 1),
    maxCrew: stats.maxCrew,
    rooms: generateRooms(type),
    cargo: { capacity: stats.size * 80, used: 0, items: [] },
    inTransit: false,
    speed: stats.speed,
    alerts: [],
    maintenanceLevel: 100,
    overallEfficiency: 100
  };
};

// Technology generation
const generateTechnologies = (): Technology[] => [
  { id: 'basic_spaceflight', name: 'Basic Spaceflight', category: 'space', tier: 1, cost: 100, progress: 100, prerequisites: [], researched: true, description: 'Enables space travel' },
  { id: 'basic_mining', name: 'Basic Mining', category: 'industrial', tier: 1, cost: 80, progress: 100, prerequisites: [], researched: true, description: 'Basic resource extraction' },
  { id: 'basic_construction', name: 'Basic Construction', category: 'industrial', tier: 1, cost: 80, progress: 100, prerequisites: [], researched: true, description: 'Build basic structures' },
  { id: 'advanced_propulsion', name: 'Advanced Propulsion', category: 'space', tier: 2, cost: 500, progress: 0, prerequisites: ['basic_spaceflight'], researched: false, description: 'Faster engines' },
  { id: 'warp_drive', name: 'Warp Drive', category: 'space', tier: 3, cost: 2000, progress: 0, prerequisites: ['advanced_propulsion'], researched: false, description: 'Interstellar travel' },
  { id: 'shield_tech', name: 'Shield Technology', category: 'military', tier: 2, cost: 600, progress: 0, prerequisites: [], researched: false, description: 'Energy shields' },
  { id: 'advanced_mining', name: 'Advanced Mining', category: 'industrial', tier: 2, cost: 400, progress: 0, prerequisites: ['basic_mining'], researched: false, description: 'Better extraction' },
  { id: 'terraforming', name: 'Terraforming', category: 'biological', tier: 3, cost: 3000, progress: 0, prerequisites: ['advanced_mining'], researched: false, description: 'Modify planets' },
  { id: 'fusion_power', name: 'Fusion Power', category: 'energy', tier: 2, cost: 800, progress: 0, prerequisites: [], researched: false, description: 'Clean energy' },
  { id: 'artificial_intelligence', name: 'Artificial Intelligence', category: 'scientific', tier: 3, cost: 2500, progress: 0, prerequisites: ['advanced_propulsion'], researched: false, description: 'AI assistance' },
  { id: 'xenobiology', name: 'Xenobiology', category: 'biological', tier: 2, cost: 400, progress: 0, prerequisites: [], researched: false, description: 'Study alien life' },
  { id: 'orbital_construction', name: 'Orbital Construction', category: 'space', tier: 2, cost: 600, progress: 0, prerequisites: ['basic_construction'], researched: false, description: 'Space stations' },
  { id: 'megastructures', name: 'Megastructure Engineering', category: 'space', tier: 4, cost: 10000, progress: 0, prerequisites: ['orbital_construction', 'fusion_power'], researched: false, description: 'Build megastructures' },
  { id: 'antimatter_power', name: 'Antimatter Power', category: 'energy', tier: 4, cost: 8000, progress: 0, prerequisites: ['fusion_power'], researched: false, description: 'Antimatter reactors' },
  { id: 'dimensional_research', name: 'Dimensional Research', category: 'dimensional', tier: 5, cost: 50000, progress: 0, prerequisites: ['artificial_intelligence', 'antimatter_power'], researched: false, description: 'Other dimensions' }
];

// Initialize game
const initializeGameState = (): GameState => {
  // Create origin galaxy
  const originGalaxy = generateGalaxy(0, true);
  const originStar = originGalaxy.stars[0];
  originStar.name = 'Sol - Home System';
  originStar.explored = true;

  const originWorld = originStar.planets[0];
  originWorld.name = 'Terra - Origin World';
  originWorld.type = 'terrestrial';
  originWorld.habitability = 1;
  originWorld.population = 8000000000;
  originWorld.explored = true;
  originWorld.owned = true;
  originWorld.atmosphere = true;
  originWorld.atmosphereType = 'breathable';
  originWorld.temperature = 15;
  originWorld.water = 0.7;
  originWorld.color = '#4A7C59';
  originWorld.colonies.push({
    id: genId(),
    name: 'New Haven - Capital',
    planetId: originWorld.id,
    population: 50000000,
    populationGrowth: 0.02,
    happiness: 0.75,
    health: 0.85,
    education: 0.8,
    culture: 0.65,
    defense: 0.5,
    infrastructure: 0.45,
    economy: 0.65,
    distanceFromOrigin: 0,
    founded: 0
  });

  // Create starter ship
  const starterShip = generateShip('corvette');
  starterShip.name = 'ISS Pioneer';
  starterShip.crew[0].role = 'captain';
  starterShip.crew[0].name = 'Captain Marcus Chen';

  // Generate more galaxies
  const galaxies = [originGalaxy];
  for (let i = 1; i < 50; i++) {
    galaxies.push(generateGalaxy(i, false));
  }

  // All stars and planets
  const allStars = galaxies.flatMap(g => g.stars);
  const allPlanets = galaxies.flatMap(g => g.stars.flatMap(s => s.planets));

  return {
    gameTime: 0,
    gameSpeed: 1,
    paused: true,
    galaxies,
    stars: allStars,
    planets: allPlanets,
    originWorld,
    playerShips: [starterShip],
    resources: generateResourceStock(),
    technologies: generateTechnologies(),
    researchQueue: [],
    selectedShip: starterShip,
    selectedRoom: null,
    selectedPlanet: originWorld,
    selectedStar: originStar,
    selectedGalaxy: originGalaxy,
    currentView: 'galaxy',
    showShipInterior: false,
    showResearch: false,
    showTimeline: false,
    showEngineering: false,
    showMarket: false,
    timeline: [
      {
        id: genId(),
        time: 0,
        year: 0,
        category: 'foundation',
        title: 'Foundation of New Haven',
        description: 'The capital colony of New Haven is founded on Terra, marking the dawn of the spacefaring era.',
        location: 'Terra - Origin World',
        importance: 5,
      },
      {
        id: genId(),
        time: 0,
        year: 0,
        category: 'invention',
        title: 'First Faster-Than-Light Engine',
        description: 'Engineers complete the first stable warp prototype, unlocking interstellar exploration.',
        location: 'Sol - Home System',
        importance: 4,
      },
    ],
    robots: [],
    market: [],
    credits: 5000,
    notifications: [{ id: 'welcome', type: 'info', message: 'Welcome to Conquista Galactica!', timestamp: 0, read: false }],
    cameraTarget: { x: 0, y: 0, z: 0 },
    cameraPosition: { x: 0, y: 50, z: 100 },
    zoomLevel: 1
  };
};

// ============== STORE ==============

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initializeGameState(),

  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  togglePause: () => set(state => ({ paused: !state.paused })),

  advanceTime: (delta) => set(state => {
    if (state.paused) return state;

    const newTime = state.gameTime + delta * state.gameSpeed;

    // Update ships
    const playerShips = state.playerShips.map(ship => {
      let rooms = [...ship.rooms];
      let alerts = [...ship.alerts];

      // Random issues
      if (Math.random() < 0.0008 * delta) {
        const roomIndex = Math.floor(Math.random() * rooms.length);
        const room = rooms[roomIndex];

        if (!room.currentIssue && Math.random() < 0.4) {
          const issueTypes: IssueType[] = ['fire', 'leak', 'electrical', 'malfunction', 'blockage'];
          const severities: IssueSeverity[] = ['minor', 'major', 'critical'];

          const newIssue: RoomIssue = {
            id: genId(),
            type: issueTypes[Math.floor(Math.random() * issueTypes.length)],
            severity: severities[Math.floor(Math.random() * severities.length)],
            description: `${room.name} malfunction detected`,
            detectedAt: newTime,
            repairRequired: 80 + Math.random() * 180,
            repairProgress: 0
          };

          const updatedRoom: Room = {
            ...room,
            currentIssue: newIssue,
            status: 'degraded'
          };

          rooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);

          alerts.push({
            id: genId(),
            roomId: room.id,
            type: 'malfunction',
            severity: 'warning',
            message: `${room.name}: ${newIssue.description}`,
            timestamp: newTime,
            acknowledged: false,
            resolved: false
          });
        }
      }

      // Wear and efficiency
      rooms = rooms.map(room => ({
        ...room,
        wearLevel: Math.min(1, room.wearLevel + 0.000008 * delta),
        efficiency: Math.max(0.1, room.efficiency - 0.000008 * delta)
      }));

      // Ship movement
      let position = ship.position;
      let inTransit = ship.inTransit;

      if (inTransit && ship.destination) {
        const dx = ship.destination.x - position.x;
        const dy = ship.destination.y - position.y;
        const dz = ship.destination.z - position.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < 0.5) {
          position = { ...ship.destination };
          inTransit = false;
        } else {
          const spd = ship.speed * state.gameSpeed * 0.1;
          position = {
            x: position.x + (dx / dist) * spd * delta,
            y: position.y + (dy / dist) * spd * delta,
            z: position.z + (dz / dist) * spd * delta
          };
        }
      }

      // Fuel consumption
      const fuel = Math.max(0, ship.fuel - (inTransit ? 0.08 * delta : 0.008 * delta));

      // Efficiency calculation
      const avgEfficiency = rooms.reduce((a, r) => a + r.efficiency, 0) / rooms.length;
      const maintenanceLevel = rooms.reduce((a, r) => a + (1 - r.wearLevel), 0) / rooms.length * 100;

      return {
        ...ship,
        position,
        inTransit,
        rooms,
        alerts,
        fuel,
        maintenanceLevel,
        overallEfficiency: avgEfficiency * 100
      };
    });

    // Update planet orbits
    const planets = state.planets.map(planet => ({
      ...planet,
      angle: planet.angle + planet.orbitSpeed * delta * 0.0008
    }));

    // Research progress
    let technologies = state.technologies;
    if (state.researchQueue.length > 0 && !state.paused) {
      const currentTechId = state.researchQueue[0];
      const researchRate = 0.5 * delta; // Base research rate
      technologies = technologies.map(tech => {
        if (tech.id === currentTechId && !tech.researched) {
          const newProgress = tech.progress + researchRate;
          if (newProgress >= tech.cost) {
            return { ...tech, progress: tech.cost, researched: true };
          }
          return { ...tech, progress: newProgress };
        }
        return tech;
      });

      // Remove completed research from queue
      const completedTech = technologies.find(t => t.id === currentTechId && t.researched);
      if (completedTech) {
        set({ researchQueue: state.researchQueue.filter(id => id !== currentTechId) });
        set(s => ({
          timeline: [
            ...s.timeline,
            {
              id: genId(),
              time: newTime,
              year: Math.floor(newTime / 365),
              category: 'tech',
              title: `Breakthrough: ${completedTech.name}`,
              description: completedTech.description,
              importance: completedTech.tier >= 4 ? 5 : (completedTech.tier as 1 | 2 | 3 | 4 | 5),
            },
          ],
        }));
      }
    }

    return { ...state, gameTime: newTime, playerShips, planets, technologies };
  }),

  selectShip: (ship) => set({ selectedShip: ship }),
  selectRoom: (room) => set({ selectedRoom: room }),
  selectPlanet: (planet) => set({ selectedPlanet: planet, currentView: planet ? 'planet' : get().currentView }),
  selectStar: (star) => set({ selectedStar: star, currentView: star ? 'system' : get().currentView }),
  selectGalaxy: (galaxy) => {
    if (galaxy) {
      set({
        selectedGalaxy: galaxy,
        stars: galaxy.stars,
        planets: galaxy.stars.flatMap(s => s.planets),
        currentView: 'galaxy'
      });
    } else {
      set({ selectedGalaxy: null });
    }
  },

  setCurrentView: (view) => set({ currentView: view }),
  toggleShipInterior: () => set(state => ({ showShipInterior: !state.showShipInterior })),
  toggleResearch: () => set(state => ({ showResearch: !state.showResearch })),
  toggleTimeline: () => set(state => ({ showTimeline: !state.showTimeline })),
  toggleEngineering: () => set(state => ({ showEngineering: !state.showEngineering })),
  toggleMarket: () => set(state => ({ showMarket: !state.showMarket })),

  addTimelineEvent: (e) => set(state => ({
    timeline: [
      ...state.timeline,
      {
        id: genId(),
        time: state.gameTime,
        year: Math.floor(state.gameTime / 365),
        ...e,
      },
    ],
  })),

  createRobot: (robot) => {
    const id = genId();
    set(state => ({
      robots: [
        ...state.robots,
        {
          ...robot,
          id,
          createdAt: state.gameTime,
          ownerId: 'player',
          forSale: false,
          price: 0,
        },
      ],
      timeline: [
        ...state.timeline,
        {
          id: genId(),
          time: state.gameTime,
          year: Math.floor(state.gameTime / 365),
          category: 'invention',
          title: `Robot "${robot.name}" assembled`,
          description: `A ${robot.chassis} robot with ${robot.program.length} programmed behaviors was assembled in the engineering bay.`,
          importance: 2,
        },
      ],
    }));
    return id;
  },

  updateRobot: (id, patch) => set(state => ({
    robots: state.robots.map(r => (r.id === id ? { ...r, ...patch } : r)),
  })),

  deleteRobot: (id) => set(state => ({
    robots: state.robots.filter(r => r.id !== id),
    market: state.market.filter(l => !(l.kind === 'robot' && l.refId === id)),
  })),

  listRobotOnMarket: (robotId, price) => set(state => {
    const robot = state.robots.find(r => r.id === robotId);
    if (!robot) return state;
    const listingId = genId();
    return {
      robots: state.robots.map(r => (r.id === robotId ? { ...r, forSale: true, price } : r)),
      market: [
        ...state.market,
        {
          id: listingId,
          kind: 'robot',
          refId: robotId,
          seller: 'Player Industries',
          price,
          qty: 1,
          listedAt: state.gameTime,
        },
      ],
      timeline: [
        ...state.timeline,
        {
          id: genId(),
          time: state.gameTime,
          year: Math.floor(state.gameTime / 365),
          category: 'economy',
          title: `${robot.name} listed on the Galactic Market`,
          description: `Sale price: ${price} credits.`,
          importance: 1,
        },
      ],
    };
  }),

  buyMarketListing: (listingId) => set(state => {
    const listing = state.market.find(l => l.id === listingId);
    if (!listing) return state;
    if (state.credits < listing.price) return state;
    return {
      credits: state.credits - listing.price,
      market: state.market.filter(l => l.id !== listingId),
      timeline: [
        ...state.timeline,
        {
          id: genId(),
          time: state.gameTime,
          year: Math.floor(state.gameTime / 365),
          category: 'economy',
          title: `Acquired listing on the Galactic Market`,
          description: `Purchased ${listing.kind} for ${listing.price} credits.`,
          importance: 1,
        },
      ],
    };
  }),

  addCredits: (amount) => set(state => ({ credits: state.credits + amount })),

  spendCredits: (amount) => {
    const state = get();
    if (state.credits < amount) return false;
    set({ credits: state.credits - amount });
    return true;
  },

  addNotification: (n) => set(state => ({
    notifications: [
      ...state.notifications,
      { ...n, id: genId(), timestamp: state.gameTime, read: false },
    ],
  })),



  repairRoom: (shipId, roomId) => set(state => {
    const resources = state.resources.map(r =>
      r.resource === 'electronics' ? { ...r, amount: Math.max(0, r.amount - 15) } : r
    );

    const playerShips = state.playerShips.map(ship =>
      ship.id === shipId
        ? {
          ...ship,
          rooms: ship.rooms.map(room =>
            room.id === roomId && room.currentIssue
              ? {
                ...room,
                currentIssue: undefined,
                wearLevel: Math.max(0, room.wearLevel - 0.15),
                efficiency: Math.min(1, room.efficiency + 0.12),
                health: Math.min(room.maxHealth, room.health + 25),
                status: 'operational' as RoomStatus,
                maintenanceHistory: [...room.maintenanceHistory, {
                  timestamp: state.gameTime,
                  type: 'repair' as const,
                  description: `Repaired issue`,
                  cost: 100
                }]
              }
              : room
          ),
          alerts: ship.alerts.map(alert =>
            alert.roomId === roomId ? { ...alert, resolved: true } : alert
          )
        }
        : ship
    );

    return { ...state, playerShips, resources };
  }),

  acknowledgeAlert: (alertId) => set(state => ({
    playerShips: state.playerShips.map(ship => ({
      ...ship,
      alerts: ship.alerts.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    }))
  })),

  buildColony: (planetId) => set(state => {
    const planet = state.planets.find(p => p.id === planetId);
    if (!planet || planet.colonies.length > 0 || planet.habitability < 0.25) return state;

    const distanceFromOrigin = Math.sqrt(
      (planet.position.x - state.originWorld.position.x) ** 2 +
      (planet.position.y - state.originWorld.position.y) ** 2 +
      (planet.position.z - state.originWorld.position.z) ** 2
    );

    const newColony: Colony = {
      id: genId(),
      name: `Colony ${planet.name.split(' ')[0]}`,
      planetId,
      population: 500,
      populationGrowth: 0.015,
      happiness: 0.55,
      health: 0.6,
      education: 0.45,
      culture: 0.35,
      defense: 0.25,
      infrastructure: 0.2,
      economy: 0.35,
      distanceFromOrigin,
      founded: state.gameTime
    };

    planet.colonies.push(newColony);
    planet.owned = true;
    planet.population = (planet.population || 0) + 500;

    const notification: Notification = {
      id: genId(),
      type: 'success',
      message: `Colony established on ${planet.name}!`,
      timestamp: state.gameTime,
      read: false
    };

    return {
      ...state,
      planets: [...state.planets],
      notifications: [...state.notifications, notification],
      timeline: [
        ...state.timeline,
        {
          id: genId(),
          time: state.gameTime,
          year: Math.floor(state.gameTime / 365),
          category: 'colony',
          title: `Colony founded on ${planet.name}`,
          description: `${newColony.name} established with 500 colonists. Distance from origin: ${distanceFromOrigin.toFixed(1)} units.`,
          location: planet.name,
          importance: 3,
        },
      ],
    };
  }),

  queueResearch: (techId) => set(state => {
    if (state.researchQueue.includes(techId)) return state;

    const tech = state.technologies.find(t => t.id === techId);
    if (!tech || tech.researched) return state;

    const prereqsMet = tech.prerequisites.every(p =>
      state.technologies.find(t => t.id === p)?.researched
    );
    if (!prereqsMet) return state;

    return { researchQueue: [...state.researchQueue, techId] };
  }),

  cancelResearch: (techId) => set(state => ({
    researchQueue: state.researchQueue.filter(id => id !== techId)
  })),

  moveShipTo: (shipId, target) => set(state => ({
    playerShips: state.playerShips.map(ship =>
      ship.id === shipId
        ? { ...ship, destination: target, inTransit: true }
        : ship
    )
  })),

  initializeGame: () => set(initializeGameState()),

  saveGame: () => {
    const state = get();
    localStorage.setItem('conquistaGalactica_save', JSON.stringify(state));
  },

  loadGame: () => {
    const saved = localStorage.getItem('conquistaGalactica_save');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        set(parsed);
      } catch (e) {
        console.error('Failed to load save:', e);
      }
    }
  }
}));

// ============== UTILITY FUNCTIONS ==============

export const vec3ToThree = (v: Vector3): THREE.Vector3 => {
  return new THREE.Vector3(v.x, v.y, v.z);
};

export const threeToVec3 = (v: THREE.Vector3): Vector3 => {
  return { x: v.x, y: v.y, z: v.z };
};

export const calculateDistance = (a: Vector3, b: Vector3): number => {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2);
};
