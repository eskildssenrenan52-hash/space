import { create } from 'zustand';

export type Lang = 'pt' | 'en';

// ============== TRANSLATION TABLE ==============
// Default language is Brazilian Portuguese.
type Dict = Record<string, { pt: string; en: string }>;

const DICT: Dict = {
  // Generic
  'app.title': { pt: 'Conquista Galáctica', en: 'Galactic Conquest' },
  'app.subtitle': { pt: 'Estratégia Espacial 3D — Comande seu Império', en: '3D Space Strategy — Command Your Empire' },
  'menu.new': { pt: 'NOVO JOGO', en: 'NEW GAME' },
  'menu.load': { pt: 'CARREGAR JOGO', en: 'LOAD GAME' },
  'common.close': { pt: 'Fechar', en: 'Close' },
  'common.cancel': { pt: 'Cancelar', en: 'Cancel' },
  'common.confirm': { pt: 'Confirmar', en: 'Confirm' },
  'common.build': { pt: 'Construir', en: 'Build' },
  'common.buy': { pt: 'Comprar', en: 'Buy' },
  'common.sell': { pt: 'Vender', en: 'Sell' },
  'common.credits': { pt: 'Créditos', en: 'Credits' },
  'common.qty': { pt: 'Qtd', en: 'Qty' },
  'common.price': { pt: 'Preço', en: 'Price' },
  'common.level': { pt: 'Nível', en: 'Level' },
  'common.none': { pt: 'Nenhum', en: 'None' },
  'common.all': { pt: 'Todos', en: 'All' },
  'common.search': { pt: 'Buscar...', en: 'Search...' },
  'common.back': { pt: 'Voltar', en: 'Back' },
  'common.next': { pt: 'Próximo', en: 'Next' },
  'common.start': { pt: 'Iniciar', en: 'Start' },
  'common.reward': { pt: 'Recompensa', en: 'Reward' },
  'common.progress': { pt: 'Progresso', en: 'Progress' },
  'common.complete': { pt: 'Concluído', en: 'Complete' },
  'common.locked': { pt: 'Bloqueado', en: 'Locked' },

  // Toolbar buttons
  'toolbar.industry': { pt: 'Indústria', en: 'Industry' },
  'toolbar.market': { pt: 'Mercado', en: 'Market' },
  'toolbar.missions': { pt: 'Missões', en: 'Missions' },
  'toolbar.war': { pt: 'Guerra', en: 'War' },
  'toolbar.build': { pt: 'Construir', en: 'Build' },
  'toolbar.engineering': { pt: 'Engenharia', en: 'Engineering' },
  'toolbar.timeline': { pt: 'Linha do Tempo', en: 'Timeline' },
  'toolbar.tutorial': { pt: 'Tutorial', en: 'Tutorial' },
  'toolbar.lang': { pt: 'Idioma', en: 'Language' },
  'toolbar.colonies': { pt: 'Colônias', en: 'Colonies' },
  'toolbar.components': { pt: 'Componentes', en: 'Components' },
  'toolbar.tasks': { pt: 'Tarefas', en: 'Tasks' },

  // Industry
  'industry.title': { pt: 'Complexo Industrial', en: 'Industrial Complex' },
  'industry.chains': { pt: 'Cadeias Produtivas', en: 'Production Chains' },
  'industry.factories': { pt: 'Fábricas', en: 'Factories' },
  'industry.logistics': { pt: 'Logística', en: 'Logistics' },
  'industry.machines': { pt: 'Máquinas', en: 'Machines' },
  'industry.efficiency': { pt: 'Eficiência', en: 'Efficiency' },
  'industry.build_factory': { pt: 'Construir Fábrica', en: 'Build Factory' },
  'industry.output': { pt: 'Produção', en: 'Output' },
  'industry.input': { pt: 'Insumos', en: 'Inputs' },
  'industry.zoom': { pt: 'Observar', en: 'Observe' },
  'industry.weight': { pt: 'Peso', en: 'Weight' },
  'industry.volume': { pt: 'Volume', en: 'Volume' },
  'industry.quality': { pt: 'Qualidade', en: 'Quality' },
  'industry.purity': { pt: 'Pureza', en: 'Purity' },
  'industry.empty': { pt: 'Nenhuma fábrica construída. Escolha uma máquina para começar a cadeia produtiva.', en: 'No factory built. Pick a machine to start the production chain.' },

  // Market
  'market.title': { pt: 'Mercado Galáctico', en: 'Galactic Market' },
  'market.buy_tab': { pt: 'Comprar', en: 'Buy' },
  'market.sell_tab': { pt: 'Vender', en: 'Sell' },
  'market.mine': { pt: 'Meus Anúncios', en: 'My Listings' },
  'market.list': { pt: 'Anunciar', en: 'List' },
  'market.seller': { pt: 'Vendedor', en: 'Seller' },
  'market.robots': { pt: 'Robôs', en: 'Robots' },
  'market.resources': { pt: 'Recursos', en: 'Resources' },
  'market.blueprints': { pt: 'Projetos', en: 'Blueprints' },

  // Missions
  'missions.title': { pt: 'Missões', en: 'Missions' },
  'missions.active': { pt: 'Ativas', en: 'Active' },
  'missions.done': { pt: 'Concluídas', en: 'Completed' },
  'missions.claim': { pt: 'Resgatar', en: 'Claim' },
  'missions.objectives': { pt: 'Objetivos', en: 'Objectives' },

  // War
  'war.title': { pt: 'Comando de Guerra', en: 'War Command' },
  'war.targets': { pt: 'Alvos', en: 'Targets' },
  'war.recon': { pt: 'Reconhecimento', en: 'Reconnaissance' },
  'war.plan': { pt: 'Planejar Ataque', en: 'Plan Attack' },
  'war.attack': { pt: 'Atacar', en: 'Attack' },
  'war.waves': { pt: 'Ondas', en: 'Waves' },
  'war.heroes': { pt: 'Heróis', en: 'Heroes' },
  'war.replays': { pt: 'Replays', en: 'Replays' },
  'war.stars': { pt: 'Estrelas de Vitória', en: 'Victory Stars' },
  'war.alliance': { pt: 'Guerra de Alianças', en: 'Alliance War' },
  'war.blockade': { pt: 'Bloqueio', en: 'Blockade' },
  'war.scan': { pt: 'Investigar', en: 'Scan' },
  'war.intel': { pt: 'Inteligência', en: 'Intel' },
  'war.launch': { pt: 'Lançar Invasão', en: 'Launch Invasion' },
  'war.layer.space': { pt: 'Órbita', en: 'Orbit' },
  'war.layer.atmo': { pt: 'Atmosfera', en: 'Atmosphere' },
  'war.layer.landing': { pt: 'Desembarque', en: 'Landing' },
  'war.layer.urban': { pt: 'Combate Urbano', en: 'Urban Combat' },

  // Build
  'build.title': { pt: 'Estaleiro & Construção', en: 'Shipyard & Construction' },
  'build.queue': { pt: 'Fila de Produção', en: 'Build Queue' },
  'build.category': { pt: 'Categoria', en: 'Category' },

  // Engineering
  'eng.title': { pt: 'Bancada de Engenharia', en: 'Engineering Bench' },
  'eng.catalog': { pt: 'Catálogo de Componentes', en: 'Component Catalog' },
  'eng.behaviors': { pt: 'Comportamentos', en: 'Behaviors' },
  'eng.parts': { pt: 'Peças', en: 'Parts' },
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
}

export const useI18n = create<I18nState>((set) => ({
  lang: 'pt',
  setLang: (lang) => set({ lang }),
  toggleLang: () => set((s) => ({ lang: s.lang === 'pt' ? 'en' : 'pt' })),
}));

/** Translate a key. Falls back to the key itself if missing. */
export function translate(key: string, lang: Lang): string {
  const entry = DICT[key];
  if (!entry) return key;
  return entry[lang];
}

/** Hook returning a bound translator for the current language. */
export function useT() {
  const lang = useI18n((s) => s.lang);
  return (key: string) => translate(key, lang);
}
