import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, type TimelineCategory } from './gameStore';
import { X, BookOpen, Search } from 'lucide-react';

const CATEGORY_META: Record<TimelineCategory, { label: string; emoji: string; color: string; bg: string }> = {
  foundation: { label: 'Fundação',       emoji: '🌟', color: '#22d3ee', bg: 'rgba(34,211,238,0.08)' },
  war:        { label: 'Guerra',          emoji: '⚔️', color: '#f43f5e', bg: 'rgba(244,63,94,0.08)' },
  discovery:  { label: 'Descoberta',      emoji: '🔭', color: '#38bdf8', bg: 'rgba(56,189,248,0.08)' },
  colony:     { label: 'Colônia',         emoji: '🏙️', color: '#4ade80', bg: 'rgba(74,222,128,0.08)' },
  death:      { label: 'Morte de líder',  emoji: '💀', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  collapse:   { label: 'Colapso',         emoji: '💥', color: '#fb923c', bg: 'rgba(251,146,60,0.08)' },
  invention:  { label: 'Invenção',        emoji: '💡', color: '#c084fc', bg: 'rgba(192,132,252,0.08)' },
  cosmic:     { label: 'Evento cósmico',  emoji: '🌌', color: '#818cf8', bg: 'rgba(129,140,248,0.08)' },
  diplomacy:  { label: 'Diplomacia',      emoji: '🤝', color: '#f472b6', bg: 'rgba(244,114,182,0.08)' },
  economy:    { label: 'Economia',        emoji: '💰', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
  tech:       { label: 'Tecnologia',      emoji: '🤖', color: '#e879f9', bg: 'rgba(232,121,249,0.08)' },
  misc:       { label: 'Outros',          emoji: '📋', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
};

const IMPORTANCE_STARS: Record<number, string> = { 1: '★', 2: '★★', 3: '★★★', 4: '★★★★', 5: '★★★★★' };

export const TimelinePanel: React.FC = () => {
  const { showTimeline, toggleTimeline, timeline } = useGameStore();
  const [filter, setFilter] = useState<'all' | TimelineCategory>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...timeline]
      .sort((a, b) => b.time - a.time)
      .filter(e => {
        if (filter !== 'all' && e.category !== filter) return false;
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.location?.toLowerCase().includes(q) ?? false)
        );
      });
  }, [timeline, filter, search]);

  if (!showTimeline) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col text-white"
      style={{
        background: 'linear-gradient(160deg, rgba(2,2,16,0.99) 0%, rgba(4,4,24,0.99) 100%)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-4 px-6 py-3 shrink-0"
        style={{
          background: 'rgba(4,4,24,0.95)',
          borderBottom: '1px solid rgba(34,211,238,0.15)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <button
          onClick={toggleTimeline}
          className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        >
          <X size={18} />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl" style={{ background: 'rgba(34,211,238,0.1)', border: '1px solid rgba(34,211,238,0.2)' }}>
            <BookOpen size={18} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">Linha do Tempo Universal</h2>
            <p className="text-[10px] text-gray-500">Enciclopédia Histórica do Império</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500 tabular-nums">{timeline.length} registros</span>
        </div>
      </div>

      {/* Filters */}
      <div
        className="px-6 py-3 shrink-0 flex flex-wrap items-center gap-2"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(4,4,20,0.6)' }}
      >
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar evento..."
            className="pl-7 pr-3 py-1.5 text-xs rounded-xl outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              width: '220px',
            }}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setFilter('all')}
            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
            style={{
              background: filter === 'all' ? 'rgba(34,211,238,0.15)' : 'rgba(255,255,255,0.03)',
              color: filter === 'all' ? '#22d3ee' : '#6b7280',
              border: filter === 'all' ? '1px solid rgba(34,211,238,0.3)' : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            Tudo
          </button>
          {(Object.keys(CATEGORY_META) as TimelineCategory[]).map(c => {
            const m = CATEGORY_META[c];
            const active = filter === c;
            return (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all"
                style={{
                  background: active ? `${m.bg}` : 'rgba(255,255,255,0.03)',
                  color: active ? m.color : '#6b7280',
                  border: active ? `1px solid ${m.color}50` : '1px solid rgba(255,255,255,0.06)',
                }}
              >
                {m.emoji} {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Timeline feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {filtered.length === 0 && (
            <div className="text-center py-24">
              <p className="text-5xl mb-4 opacity-40">🌌</p>
              <div className="text-[10px] font-mono text-gray-700 mb-2">// NO RECORDS FOUND</div>
              <p className="text-gray-400 text-sm font-bold">Nenhum evento registrado ainda.</p>
              <p className="text-gray-600 text-xs mt-2">Conforme o universo evolui, sua história aparecerá aqui.</p>
            </div>
          )}

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, rgba(34,211,238,0.3) 0%, rgba(34,211,238,0.05) 100%)' }} />

            <div className="space-y-4">
              {filtered.map((e, idx) => {
                const meta = CATEGORY_META[e.category] || CATEGORY_META.misc;
                const days = Math.floor(e.time % 365);
                return (
                  <motion.div
                    key={e.id}
                    className="flex gap-6 items-start"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.4) }}
                  >
                    {/* Dot on timeline */}
                    <div className="relative shrink-0 w-12 flex flex-col items-center">
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] z-10 mt-0.5"
                        style={{
                          background: `${meta.bg}`,
                          borderColor: `${meta.color}80`,
                          boxShadow: `0 0 12px ${meta.color}30`,
                        }}
                      >
                        {meta.emoji}
                      </div>
                      <div className="text-[9px] text-gray-600 mt-1 tabular-nums text-center">A{e.year}</div>
                    </div>

                    {/* Event card */}
                    <div
                      className="flex-1 rounded-xl p-4 mb-1"
                      style={{
                        background: meta.bg,
                        border: `1px solid ${meta.color}25`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ color: meta.color, background: `${meta.color}18`, border: `1px solid ${meta.color}35` }}
                          >
                            {meta.label}
                          </span>
                          {e.location && (
                            <span className="text-[10px] text-gray-500">📍 {e.location}</span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold" style={{ color: meta.color }}>
                          {IMPORTANCE_STARS[e.importance] || '★'}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-white">{e.title}</div>
                      <div className="text-xs text-gray-400 mt-1 leading-relaxed">{e.description}</div>
                      <div className="text-[10px] text-gray-600 mt-2 tabular-nums">Ano {e.year} · Dia {days}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
