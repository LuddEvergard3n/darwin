/**
 * ui.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Responsavel por:
 *  - Renderizar a view correta a cada mudanca de rota
 *  - Coordenar os componentes na pagina
 *  - Gerenciar o container principal de conteudo
 *
 * Nao contem logica de dominio — apenas orquestracao de UI.
 */

import State from './state.js';
import Router from './router.js';

/** Referencia ao container principal de conteudo. */
let _contentEl = null;

/** Cache de modulos de view ja carregados. */
const _viewCache = new Map();

/**
 * Mapa de view -> modulo que sabe renderiza-la.
 * Cada modulo deve exportar uma funcao `render(container, params)`.
 */
const VIEW_MODULES = {
  home:        () => import('../components/home-hero.js'),
  module:      () => import('../components/module-card.js'),
  lesson:      () => import('../engine/process-engine.js'),
  scale:       () => import('../engine/scale-engine.js'),
  process:     () => import('../engine/process-engine.js'),
  application: () => import('../components/application-card.js'),
  glossary:    () => import('../components/glossary-panel.js'),
  'not-found': null,
};

/**
 * Inicializa o modulo de UI.
 * @param {HTMLElement} contentEl - elemento que recebe as views
 */
const init = (contentEl) => {
  if (!contentEl) {
    console.error('[UI] contentEl e obrigatorio.');
    return;
  }
  _contentEl = contentEl;

  Router.onChange(({ view, params }) => _dispatch(view, params));

  // Modo professor via query param ?teacher=1
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('teacher') === '1') {
    State.set('ui.teacherMode', true);
  }
};

/**
 * Faz dispatch da view correta.
 * @param {string} view
 * @param {object} params
 */
const _dispatch = async (view, params) => {
  if (!_contentEl) return;

  _showLoading();

  if (view === 'not-found') {
    _renderNotFound();
    return;
  }

  const loader = VIEW_MODULES[view];
  if (!loader) {
    _renderNotFound();
    return;
  }

  try {
    let mod = _viewCache.get(view);
    if (!mod) {
      mod = await loader();
      _viewCache.set(view, mod);
    }

    _contentEl.innerHTML = '';

    if (typeof mod.render === 'function') {
      mod.render(_contentEl, params);
    } else if (typeof mod.default === 'function') {
      mod.default(_contentEl, params);
    } else {
      _renderNotFound();
    }
  } catch (err) {
    console.error(`[UI] Erro ao carregar view '${view}':`, err);
    _renderError(err);
  }
};

/**
 * Renderiza a view 'home' diretamente — chamada pelo main.js apos carregamento.
 */
const renderHome = async () => {
  if (!_contentEl) return;

  try {
    const { render } = await import('../components/home-hero.js');
    _contentEl.innerHTML = '';
    render(_contentEl, {});
  } catch (err) {
    console.error('[UI] Erro ao renderizar home:', err);
    _renderError(err);
  }
};

/**
 * Exibe estado de loading temporario no container.
 */
const _showLoading = () => {
  if (!_contentEl) return;
  _contentEl.innerHTML = `
    <div class="container" style="padding-block: 4rem;">
      <div class="loading-skeleton" style="height: 200px; margin-bottom: 1.5rem;"></div>
      <div class="loading-skeleton" style="height: 120px; margin-bottom: 1rem;"></div>
      <div class="loading-skeleton" style="height: 80px;"></div>
    </div>
  `;
};

/**
 * Renderiza estado de pagina não encontrada.
 */
const _renderNotFound = () => {
  if (!_contentEl) return;
  _contentEl.innerHTML = `
    <div class="container not-found">
      <span class="section-label">404</span>
      <h1 class="not-found__title" style="font-family: var(--font-serif); font-size: var(--text-2xl); margin-block: 1rem 0.75rem;">
        Pagina não encontrada
      </h1>
      <p style="color: var(--color-text-secondary); margin-bottom: 2rem;">
        O conteudo que voce procura nao existe ou foi movido.
      </p>
      <a href="#/" class="btn btn--primary">Voltar ao início</a>
    </div>
  `;
};

/**
 * Renderiza estado de erro.
 * @param {Error} err
 */
const _renderError = (err) => {
  if (!_contentEl) return;
  _contentEl.innerHTML = `
    <div class="container" style="padding-block: 4rem; text-align: center;">
      <span class="section-label" style="color: var(--color-accent-rare);">Erro</span>
      <h2 style="font-family: var(--font-serif); margin-block: 1rem 0.75rem;">
        Falha ao carregar conteudo
      </h2>
      <p style="color: var(--color-text-secondary); margin-bottom: 2rem; font-family: var(--font-mono); font-size: var(--text-sm);">
        ${err.message}
      </p>
      <a href="#/" class="btn btn--secondary">Voltar ao início</a>
    </div>
  `;
};

/**
 * Utilitario: cria elemento com atributos e filhos.
 * @param {string} tag
 * @param {object} attrs
 * @param {...string|HTMLElement} children
 * @returns {HTMLElement}
 */
const createElement = (tag, attrs = {}, ...children) => {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'className') {
      el.className = v;
    } else if (k === 'textContent') {
      el.textContent = v;
    } else if (k.startsWith('on') && typeof v === 'function') {
      el.addEventListener(k.slice(2).toLowerCase(), v);
    } else {
      el.setAttribute(k, v);
    }
  });
  children.forEach(child => {
    if (typeof child === 'string') {
      el.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      el.appendChild(child);
    }
  });
  return el;
};

/**
 * Utilitario: renderiza HTML seguro a partir de template string.
 * Nao usar com input de usuario sem sanitizacao.
 * @param {HTMLElement} container
 * @param {string} html
 */
const setHTML = (container, html) => {
  container.innerHTML = html;
};

const UI = { init, renderHome, createElement, setHTML };

export default UI;
