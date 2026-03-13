/**
 * main.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Ponto de entrada da aplicacao.
 * Responsabilidades:
 *  1. Carregar todos os dados JSON
 *  2. Inicializar State
 *  3. Inicializar Router, UI e Accessibility
 *  4. Montar navegacao global
 *  5. Despachar view inicial
 */

import State        from './state.js';
import Router       from './router.js';
import UI           from './ui.js';
import Accessibility from './accessibility.js';

/* ============================================================
   CAMINHOS DOS DADOS
   ============================================================ */

const DATA_FILES = {
  axes:         '../data/axes.json',
  modules:      '../data/modules.json',
  scales:       '../data/scales.json',
  processes:    '../data/processes.json',
  applications: '../data/applications.json',
  glossary:     '../data/glossary.json',
  exercises:    '../data/exercises.json',
};

/* ============================================================
   CARREGAMENTO DE DADOS
   ============================================================ */

/**
 * Carrega todos os JSONs em paralelo e registra no State.
 * @returns {Promise<void>}
 */
const loadAllData = async () => {
  const entries = Object.entries(DATA_FILES);

  const results = await Promise.allSettled(
    entries.map(([key, path]) =>
      fetch(path)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} para ${path}`);
          return res.json();
        })
        .then(data => ({ key, data }))
    )
  );

  const loaded = {};
  results.forEach((result, i) => {
    const [key] = entries[i];
    if (result.status === 'fulfilled') {
      loaded[key] = result.value.data;
    } else {
      console.warn(`[main] Falha ao carregar ${key}:`, result.reason?.message);
      loaded[key] = null;
    }
  });

  State.loadData(loaded);
};

/* ============================================================
   MONTAGEM DA NAVEGACAO
   ============================================================ */

/**
 * Configura o toggle do menu mobile.
 */
const initMobileNav = () => {
  const toggle = document.querySelector('.site-nav__menu-toggle');
  const links  = document.querySelector('.site-nav__links');

  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    State.set('ui.navOpen', isOpen);
  });

  // Fechar ao clicar num link
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      State.set('ui.navOpen', false);
    });
  });
};

/**
 * Atualiza o link ativo na nav ao mudar de rota.
 */
const initNavHighlight = () => {
  Router.onChange(({ view, name }) => {
    document.querySelectorAll('.site-nav__links a[data-nav-link]').forEach(link => {
      const target = link.getAttribute('data-nav-link');
      if (target === view || target === name) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  });
};

/* ============================================================
   BOOTSTRAP
   ============================================================ */

const bootstrap = async () => {
  const contentEl = document.getElementById('main-content');
  if (!contentEl) {
    console.error('[main] Elemento #main-content nao encontrado.');
    return;
  }

  // 1. Acessibilidade primeiro (registra handlers de teclado globais)
  Accessibility.init();

  // 2. UI — registra o container e o listener de rota
  UI.init(contentEl);

  // 3. Navegacao
  initMobileNav();
  initNavHighlight();

  // 4. Dados — carrega em paralelo antes de iniciar o router
  await loadAllData();

  // 5. Router — processa a rota atual e despacha a view
  Router.init();
};

// Aguarda o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
