// ============================================================================
// COMMAND PALETTE — Ctrl/Cmd+K opens a searchable launcher with every action
// across the game: panels, speeds, ship interior, timeline, engineering,
// empire sub-panels, colony jumps, planet focus.
// ============================================================================
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Command as CmdIcon, Play, Pause, Gauge, Rocket, BookOpen, Wrench,
  Factory, ShoppingCart, Hammer, Swords, Target, Map, Flag, Building2,
  ListTodo, Cpu, Zap,
} from 'lucide-react';
import { useGameStore } from './gameStore';
import { useEmpireUI, type PanelId } from './empireUI';
import { useColonizationStore } from './colonizationStore';
import { useColonyStore } from './colonyStore';

interface Action {
  id: string;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  group: string;
  keywords?: string;
  run: () => void;
}

export const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);

  const gs = useGameStore();
  const setPanel = useEmpireUI(s => s.setPanel);
  const openColz = useColonizationStore(s => s.openPanelFor);
  const setViewingCity = useColonyStore(s => s.setViewingCity);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      } else if (!open) {
        // global shortcuts when palette closed
        if (e.key === ' ' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
          e.preventDefault(); gs.togglePause();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, gs]);

  const citiesMap = useColonyStore(s => s.cities);

  const actions = useMemo<Action[]>(() => {
    const open = (p: PanelId) => () => { setPanel(p); setOpen(false); };
    const list: Action[] = [
      // ── Game control
      { id: 'pause', group: 'Tempo', icon: gs.paused ? <Play size={14}/> : <Pause size={14}/>,
        label: gs.paused ? 'Retomar jogo' : 'Pausar jogo', hint: 'Espaço',
        run: () => { gs.togglePause(); setOpen(false); } },
      ...[1,2,5,10,20].map(s => ({
        id: `spd-${s}`, group: 'Tempo', icon: <Gauge size={14}/>,
        label: `Velocidade ${s}×`, hint: gs.gameSpeed === s ? 'atual' : '',
        run: () => { gs.setGameSpeed(s); setOpen(false); },
      })),
      // ── Painéis principais
      { id: 'timeline', group: 'Painéis', icon: <BookOpen size={14}/>, label: 'Linha do Tempo Universal',
        run: () => { gs.toggleTimeline(); setOpen(false); } },
      { id: 'engineering', group: 'Painéis', icon: <Wrench size={14}/>, label: 'Engenharia / Robôs',
        run: () => { gs.toggleEngineering(); setOpen(false); } },
      { id: 'ship', group: 'Painéis', icon: <Rocket size={14}/>, label: 'Interior da nave (cockpit)',
        run: () => { gs.toggleShipInterior(); setOpen(false); } },
      // ── Empire sub-panels
      { id: 'p-industry', group: 'Império', icon: <Factory size={14}/>, label: 'Indústria',
        keywords: 'fabrica produção materiais', run: open('industry') },
      { id: 'p-market', group: 'Império', icon: <ShoppingCart size={14}/>, label: 'Mercado',
        keywords: 'compra venda comércio', run: open('market') },
      { id: 'p-build', group: 'Império', icon: <Hammer size={14}/>, label: 'Construção',
        keywords: 'distritos edifícios', run: open('build') },
      { id: 'p-war', group: 'Império', icon: <Swords size={14}/>, label: 'Guerra',
        keywords: 'batalha frotas exército', run: open('war') },
      { id: 'p-missions', group: 'Império', icon: <Target size={14}/>, label: 'Missões',
        run: open('missions') },
      { id: 'p-colonies', group: 'Império', icon: <Building2 size={14}/>, label: 'Colônias',
        run: open('colonies') },
      { id: 'p-tasks', group: 'Império', icon: <ListTodo size={14}/>, label: 'Tarefas & Notificações',
        run: open('tasks') },
      { id: 'p-components', group: 'Império', icon: <Cpu size={14}/>, label: 'Componentes',
        run: open('components') },
      { id: 'p-colz', group: 'Império', icon: <Flag size={14}/>, label: 'Colonização (wizard)',
        run: () => { openColz(null); setPanel('colonization'); setOpen(false); } },
      // ── Views
      { id: 'v-gal', group: 'Visão', icon: <Map size={14}/>, label: 'Mapa da galáxia',
        run: () => { gs.setCurrentView('galaxy'); setOpen(false); } },
      { id: 'v-sys', group: 'Visão', icon: <Map size={14}/>, label: 'Sistema selecionado',
        run: () => { gs.setCurrentView('system'); setOpen(false); } },
      { id: 'v-pla', group: 'Visão', icon: <Map size={14}/>, label: 'Planeta selecionado',
        run: () => { gs.setCurrentView('planet'); setOpen(false); } },
    ];
    Object.values(citiesMap).forEach(c => list.push({
      id: `city-${c.id}`, group: 'Saltar para cidade', icon: <Zap size={14}/>,
      label: `Ver ${c.name} (3D)`, hint: `Nv ${c.level}`,
      run: () => { setViewingCity(c.id); setOpen(false); },
    }));
    return list;
  }, [gs, citiesMap, setPanel, openColz, setViewingCity]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return actions;
    return actions.filter(a => {
      const hay = `${a.label} ${a.group} ${a.keywords ?? ''}`.toLowerCase();
      return hay.includes(t);
    });
  }, [q, actions]);

  useEffect(() => { setIdx(0); }, [q, open]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[60] px-3 py-1.5 rounded-full
                   border border-cyan-500/30 backdrop-blur text-[11px]
                   text-cyan-300 hover:bg-cyan-600/20 hover:border-cyan-400 transition-all
                   shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center gap-2"
        title="Abrir Command Palette (Ctrl/Cmd+K)"
      >
        <CmdIcon size={12} /> Painel de comando
        <kbd className="px-1.5 py-0.5 rounded text-[10px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>Ctrl K</kbd>
      </button>
    );
  }

  const groups = Array.from(new Set(filtered.map(a => a.group)));

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[10vh] bg-black/60 backdrop-blur-sm animate-in fade-in"
         onClick={() => setOpen(false)}>
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl overflow-hidden animate-in zoom-in-95"
        style={{
          background: 'linear-gradient(145deg, rgba(4,4,28,0.99), rgba(6,6,36,0.98))',
          border: '1px solid rgba(34,211,238,0.25)',
          boxShadow: '0 30px 100px rgba(0,0,0,0.7), 0 0 60px rgba(34,211,238,0.08)',
        }}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b"
             style={{ borderColor: 'rgba(34,211,238,0.1)', background: 'rgba(34,211,238,0.04)' }}>
          <Search size={15} className="text-cyan-400" />
          <input
            autoFocus
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(filtered.length - 1, i + 1)); }
              if (e.key === 'ArrowUp')   { e.preventDefault(); setIdx(i => Math.max(0, i - 1)); }
              if (e.key === 'Enter')     { filtered[idx]?.run(); }
            }}
            placeholder="Buscar ação, painel, cidade, atalho..."
            className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
          />
          <kbd className="px-1.5 py-0.5 rounded text-[10px] text-gray-400" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>esc</kbd>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-gray-500">Nada encontrado para "{q}"</div>
          )}
          {groups.map(g => (
            <div key={g} className="mb-2">
              <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-cyan-400/70 font-bold">{g}</div>
              {filtered.filter(a => a.group === g).map(a => {
                const i = filtered.indexOf(a);
                const active = i === idx;
                return (
                  <button
                    key={a.id}
                    onMouseEnter={() => setIdx(i)}
                    onClick={() => a.run()}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${active ? 'bg-cyan-600/25 border border-cyan-500/40' : 'border border-transparent'}`}
                  >
                    <span className={`w-7 h-7 rounded-md flex items-center justify-center
                      ${active ? 'bg-cyan-500/30 text-cyan-200' : 'text-gray-300'}`}
                      style={active ? {} : { background: 'rgba(255,255,255,0.07)' }}>
                      {a.icon}
                    </span>
                    <span className="flex-1 text-sm text-white">{a.label}</span>
                    {a.hint && <span className="text-[10px] text-gray-400">{a.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t flex items-center justify-between text-[10px] text-gray-600 font-mono"
             style={{ borderColor: 'rgba(34,211,238,0.08)', background: 'rgba(0,0,10,0.5)' }}>
          <span>↑↓ navegar · Enter executar · Esc fechar</span>
          <span>Espaço = pausar · Ctrl K alternar</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;