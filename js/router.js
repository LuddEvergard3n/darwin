/**
 * router.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Roteamento SPA baseado em hash.
 * Rotas: #/ | #/modulo/:id | #/modulo/:id/:licao | #/escala/:id | #/processo/:id | #/aplicacao/:id
 * Sem dependencias externas.
 */

import State from './state.js';

/**
 * Definicao das rotas disponiveis.
 * Cada rota tem: pattern (RegExp), name, handler.
 */
const ROUTES = [
  {
    name: 'home',
    pattern: /^\/?(#\/)?$/,
    handler: () => ({ view: 'home', params: {} }),
  },
  {
    name: 'module',
    pattern: /^#\/modulo\/([^/]+)$/,
    handler: (match) => ({ view: 'module', params: { moduleId: match[1] } }),
  },
  {
    name: 'lesson',
    pattern: /^#\/modulo\/([^/]+)\/([^/]+)$/,
    handler: (match) => ({ view: 'lesson', params: { moduleId: match[1], lessonId: match[2] } }),
  },
  {
    name: 'scale',
    pattern: /^#\/escala\/([^/]+)$/,
    handler: (match) => ({ view: 'scale', params: { scaleId: match[1] } }),
  },
  {
    name: 'process',
    pattern: /^#\/processo\/([^/]+)$/,
    handler: (match) => ({ view: 'process', params: { processId: match[1] } }),
  },
  {
    name: 'application',
    pattern: /^#\/aplicacao\/([^/]+)$/,
    handler: (match) => ({ view: 'application', params: { applicationId: match[1] } }),
  },
  {
    name: 'glossary',
    pattern: /^#\/glossario$/,
    handler: () => ({ view: 'glossary', params: {} }),
  },
];

/**
 * Callbacks registrados para navegacao.
 * @type {Array<function>}
 */
const _onChangeCallbacks = [];

/**
 * Parseia o hash atual e retorna o objeto de rota correspondente.
 * @returns {{ view: string, params: object, name: string } | null}
 */
const _parseHash = () => {
  const hash = window.location.hash || '';
  const fullPath = hash || '/';

  for (const route of ROUTES) {
    const match = fullPath.match(route.pattern);
    if (match) {
      return { ...route.handler(match), name: route.name };
    }
  }

  return { view: 'not-found', params: {}, name: 'not-found' };
};

/**
 * Executa a navegacao: atualiza o State e dispara callbacks.
 */
const _navigate = () => {
  const route = _parseHash();

  State.setMany({
    'route.current':  route.view,
    'route.moduleId': route.params.moduleId ?? null,
    'route.lessonId': route.params.lessonId ?? null,
    'route.scaleId':  route.params.scaleId  ?? null,
  });

  _onChangeCallbacks.forEach(cb => {
    try {
      cb(route);
    } catch (err) {
      console.error('[Router] Erro em callback de navegacao:', err);
    }
  });

  // Rola para o topo em cada navegacao
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Atualiza aria-current nos links de nav
  _updateNavLinks(route);
};

/**
 * Atualiza o atributo aria-current nos links de navegacao.
 * @param {{ view: string, name: string }} route
 */
const _updateNavLinks = (route) => {
  document.querySelectorAll('[data-nav-link]').forEach(link => {
    const target = link.getAttribute('data-nav-link');
    if (target === route.name || target === route.view) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

/**
 * Navega para uma rota programaticamente.
 * @param {string} path - ex: '#/modulo/celula'
 */
const push = (path) => {
  window.location.hash = path.startsWith('#') ? path.slice(1) : path;
};

/**
 * Registra um callback executado em cada mudanca de rota.
 * @param {function} callback - ({ view, params, name }) => void
 * @returns {function} unsubscribe
 */
const onChange = (callback) => {
  _onChangeCallbacks.push(callback);
  return () => {
    const idx = _onChangeCallbacks.indexOf(callback);
    if (idx !== -1) _onChangeCallbacks.splice(idx, 1);
  };
};

/**
 * Inicializa o roteador: registra listener de hashchange e dispara rota inicial.
 */
const init = () => {
  window.addEventListener('hashchange', _navigate);
  _navigate(); // rota inicial
};

/**
 * Retorna a rota atual sem re-parsear o estado.
 * @returns {object}
 */
const current = () => {
  const s = State.get();
  return {
    view:    s.route.current,
    moduleId: s.route.moduleId,
    lessonId: s.route.lessonId,
    scaleId:  s.route.scaleId,
  };
};

const Router = { init, push, onChange, current };

export default Router;
