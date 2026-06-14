import React, { useMemo, useState } from 'react';
import { useGameStore, type RobotBlock, type RobotChassis, type Robot } from './gameStore';
import { ROBOT_BEHAVIORS, BEHAVIOR_BY_ID } from './robotBehaviors';
import { Robot3DPreview } from './Robot3DPreview';
import { X, Plus, Trash2, Tag, Save, ShoppingCart } from 'lucide-react';

const CHASSIS_OPTIONS: { id: RobotChassis; label: string }[] = [
  { id: 'wheeled', label: 'Rodas' },
  { id: 'tracked', label: 'Esteiras' },
  { id: 'tank', label: 'Tanque' },
  { id: 'biped', label: 'Bípede' },
  { id: 'humanoid', label: 'Humanoide' },
  { id: 'quadruped', label: 'Quadrúpede' },
  { id: 'hexapod', label: 'Hexápode' },
  { id: 'spider', label: 'Aracnídeo' },
  { id: 'snake', label: 'Serpente' },
  { id: 'drone_quad', label: 'Drone Quad' },
  { id: 'drone_fixed', label: 'Drone fixo' },
  { id: 'submarine', label: 'Submarino' },
];

const CATEGORY_LABEL: Record<string, string> = {
  movement: 'Movimento',
  sensing: 'Sensores',
  combat: 'Combate',
  logic: 'Lógica',
  work: 'Trabalho',
  comms: 'Comunicação',
  power: 'Energia',
  social: 'Social',
};

const CATEGORY_COLOR: Record<string, string> = {
  movement: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  sensing: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
  combat: 'bg-red-500/20 text-red-300 border-red-500/40',
  logic: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
  work: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  comms: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  power: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
  social: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
};

export const EngineeringPanel: React.FC = () => {
  const {
    showEngineering,
    toggleEngineering,
    robots,
    createRobot,
    deleteRobot,
    listRobotOnMarket,
    credits,
  } = useGameStore();

  const [name, setName] = useState('Unit-01');
  const [chassis, setChassis] = useState<RobotChassis>('humanoid');
  const [color, setColor] = useState('#7dd3fc');
  const [height, setHeight] = useState(1.6);
  const [armor, setArmor] = useState(50);
  const [speed, setSpeed] = useState(50);
  const [power, setPower] = useState(50);
  const [intelligence, setIntelligence] = useState(50);
  const [program, setProgram] = useState<RobotBlock[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('movement');
  const [search, setSearch] = useState('');
  const [salePrice, setSalePrice] = useState(500);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ROBOT_BEHAVIORS.filter(b => {
      if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
      if (!q) return true;
      return b.label.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
    });
  }, [categoryFilter, search]);

  if (!showEngineering) return null;

  const addBlock = (id: RobotBlock['behavior']) =>
    setProgram(p => [...p, { id: Math.random().toString(36).slice(2), behavior: id }]);

  const removeBlock = (id: string) => setProgram(p => p.filter(b => b.id !== id));

  const moveBlock = (idx: number, dir: -1 | 1) => {
    setProgram(p => {
      const next = [...p];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return next;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  };

  const totalEnergy = program.reduce((a, b) => a + BEHAVIOR_BY_ID[b.behavior].energyCost, 0);

  const handleSave = () => {
    if (!name.trim()) return;
    createRobot({ name, chassis, color, height, armor, speed, power, intelligence, program });
    setProgram([]);
  };

  return (
    <div className="fixed inset-0 z-50 text-white flex flex-col"
         style={{ background: 'linear-gradient(160deg, #040810 0%, #060d1a 50%, #050a14 100%)' }}>
      {/* Holographic Header */}
      <div className="h-16 border-b border-cyan-500/30 flex items-center px-4 gap-4 shrink-0"
           style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.08) 0%, rgba(99,102,241,0.05) 50%, transparent 100%)' }}>
        <button onClick={toggleEngineering}
                className="p-2 rounded-lg hover:bg-cyan-500/10 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
          <X size={18} className="text-gray-400 hover:text-cyan-300" />
        </button>
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛠️</span>
          <div>
            <h2 className="text-base font-bold tracking-wide"
                style={{ background: 'linear-gradient(90deg, #67e8f9, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              ENGENHARIA DE ROBÔS
            </h2>
            <p className="text-xs text-gray-500 font-mono">// programação de comportamentos</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm">
          <div className="px-3 py-1.5 rounded-lg border border-yellow-500/30 font-mono text-yellow-300 text-xs"
               style={{ background: 'rgba(234,179,8,0.08)' }}>
            ⊕ {credits.toLocaleString()} cr
          </div>
          <div className="px-3 py-1.5 rounded-lg border border-cyan-500/30 font-mono text-cyan-300 text-xs"
               style={{ background: 'rgba(6,182,212,0.08)' }}>
            🤖 {robots.length} robôs
          </div>
          <div className="h-6 w-px" style={{ background: 'rgba(255,255,255,0.12)' }} />
          <div className="px-3 py-1.5 rounded-lg border border-purple-500/30 font-mono text-purple-300 text-xs"
               style={{ background: 'rgba(168,85,247,0.08)' }}>
            ⚡ {totalEnergy.toFixed(1)} E
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: behavior library */}
        <div className="w-80 flex flex-col" style={{ background: 'rgba(4,6,16,0.95)', borderRight: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar comportamento..."
              className="w-full px-3 py-2 rounded text-sm outline-none text-white placeholder:text-gray-600"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="flex flex-wrap gap-1 mt-2">
              {['all', ...Object.keys(CATEGORY_LABEL)].map(c => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className="px-2 py-1 text-xs rounded transition-all"
                  style={categoryFilter === c
                    ? { background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)', color: '#22d3ee' }
                    : { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.07)', color: '#9ca3af' }}
                >
                  {c === 'all' ? 'Todas' : CATEGORY_LABEL[c]}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.map(b => (
              <button
                key={b.id}
                onClick={() => addBlock(b.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded border text-xs hover:brightness-125 ${CATEGORY_COLOR[b.category]}`}
              >
                <span className="text-left">{b.label}</span>
                <Plus size={14} />
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-500 text-xs text-center py-8">Nenhum comportamento encontrado.</div>
            )}
          </div>
          <div className="p-2 text-xs text-gray-500 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            {ROBOT_BEHAVIORS.length} blocos disponíveis
          </div>
        </div>

        {/* Center: program builder */}
        <div className="flex-1 flex flex-col" style={{ background: 'rgba(2,4,12,0.98)' }}>
          <div className="p-3 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="px-3 py-2 rounded text-sm w-48 text-white placeholder:text-gray-600 outline-none"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
              placeholder="Nome do robô"
            />
            <select
              value={chassis}
              onChange={e => setChassis(e.target.value as RobotChassis)}
              className="px-3 py-2 rounded text-sm text-white"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {CHASSIS_OPTIONS.map(o => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
            <input
              type="color"
              value={color}
              onChange={e => setColor(e.target.value)}
              className="w-10 h-9 rounded cursor-pointer"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            <div className="ml-auto text-xs text-gray-400">
              Consumo de energia: <span className="text-cyan-300 font-bold">{totalEnergy.toFixed(1)}</span>
            </div>
            <button
              onClick={handleSave}
              disabled={program.length === 0}
              className="px-3 py-2 rounded text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-40"
              style={{ background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.5)', color: '#22d3ee' }}
            >
              <Save size={14} /> Montar robô
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="text-xs text-gray-400 mb-2">
              PROGRAMA ({program.length} bloco{program.length === 1 ? '' : 's'}) — executa de cima para baixo
            </div>
            <div className="space-y-1">
              {program.map((b, i) => {
                const def = BEHAVIOR_BY_ID[b.behavior];
                return (
                  <div
                    key={b.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded border ${CATEGORY_COLOR[def.category]}`}
                  >
                    <span className="text-xs text-gray-400 w-6">{i + 1}.</span>
                    <span className="text-xs uppercase tracking-wide w-24 opacity-70">{CATEGORY_LABEL[def.category]}</span>
                    <span className="flex-1 text-sm">{def.label}</span>
                    <span className="text-xs opacity-60">⚡{def.energyCost}</span>
                    <button onClick={() => moveBlock(i, -1)} className="px-1 text-gray-400 hover:text-white">▲</button>
                    <button onClick={() => moveBlock(i, 1)} className="px-1 text-gray-400 hover:text-white">▼</button>
                    <button onClick={() => removeBlock(b.id)} className="p-1 text-red-400 hover:text-red-300">
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
              {program.length === 0 && (
                <div className="text-gray-600 text-sm text-center py-16 rounded" style={{ border: '1px dashed rgba(255,255,255,0.1)' }}>
                  Clique nos comportamentos à esquerda para montar o programa do seu robô.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: 3D preview + stats + roster */}
        <div className="w-96 flex flex-col" style={{ background: 'rgba(4,6,16,0.95)', borderLeft: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="h-64" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <Robot3DPreview robot={{ chassis, color, height }} />
          </div>
          <div className="p-3 space-y-2 text-xs" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {[
              { label: 'Altura (m)', value: height, min: 0.4, max: 4, step: 0.1, set: setHeight },
              { label: 'Armadura', value: armor, min: 0, max: 100, step: 1, set: setArmor },
              { label: 'Velocidade', value: speed, min: 0, max: 100, step: 1, set: setSpeed },
              { label: 'Potência', value: power, min: 0, max: 100, step: 1, set: setPower },
              { label: 'Inteligência', value: intelligence, min: 0, max: 100, step: 1, set: setIntelligence },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="w-24 text-gray-400">{s.label}</span>
                <input
                  type="range"
                  min={s.min}
                  max={s.max}
                  step={s.step}
                  value={s.value}
                  onChange={e => s.set(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-500"
                />
                <span className="w-10 text-right text-cyan-300">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <div className="text-xs text-gray-400 mb-2 flex items-center gap-2">
              <ShoppingCart size={12} /> SEUS ROBÔS
            </div>
            {robots.length === 0 && (
              <div className="text-gray-500 text-xs">Você ainda não montou nenhum robô.</div>
            )}
            <div className="space-y-2">
              {robots.map(r => (
                <RobotRow
                  key={r.id}
                  robot={r}
                  defaultPrice={salePrice}
                  onPrice={setSalePrice}
                  onSell={(price) => listRobotOnMarket(r.id, price)}
                  onDelete={() => deleteRobot(r.id)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RobotRow: React.FC<{
  robot: Robot;
  defaultPrice: number;
  onPrice: (n: number) => void;
  onSell: (price: number) => void;
  onDelete: () => void;
}> = ({ robot, defaultPrice, onPrice, onSell, onDelete }) => {
  const [price, setPrice] = useState(defaultPrice);
  return (
    <div className="rounded-xl p-2 text-xs" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: robot.color }} />
        <span className="font-bold flex-1 text-white">{robot.name}</span>
        <span className="text-gray-500">{robot.chassis}</span>
      </div>
      <div className="text-gray-500 mt-1">{robot.program.length} blocos · ARM {robot.armor} · INT {robot.intelligence}</div>
      {robot.forSale ? (
        <div className="mt-2 text-yellow-300 flex items-center gap-1">
          <Tag size={12} /> À venda por {robot.price} créditos
        </div>
      ) : (
        <div className="mt-2 flex items-center gap-1">
          <input
            type="number"
            value={price}
            min={1}
            onChange={e => {
              const v = parseInt(e.target.value || '0', 10);
              setPrice(v);
              onPrice(v);
            }}
            className="w-24 px-2 py-1 rounded text-white text-xs"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
          />
          <button
            onClick={() => onSell(price)}
            className="flex-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 rounded font-bold"
          >
            Vender
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-400 hover:text-red-300"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};