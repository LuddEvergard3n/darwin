/**
 * accessibility.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Gerencia:
 *  - Navegacao por teclado
 *  - Anuncios para screen readers (aria-live)
 *  - Focus trap em modais
 *  - Preferencias de acessibilidade detectadas
 */

/**
 * Elementos focaveis padrao.
 */
const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

/** Regiao de anuncio aria-live. */
let _announcer = null;

/**
 * Inicializa o modulo de acessibilidade.
 */
const init = () => {
  _createAnnouncer();
  _registerKeyboardHandlers();
  _detectReducedMotion();
  _enhanceInteractiveElements();
};

/**
 * Cria o elemento aria-live para anuncios de screen reader.
 */
const _createAnnouncer = () => {
  _announcer = document.createElement('div');
  _announcer.setAttribute('aria-live', 'polite');
  _announcer.setAttribute('aria-atomic', 'true');
  _announcer.setAttribute('role', 'status');
  Object.assign(_announcer.style, {
    position:  'absolute',
    width:     '1px',
    height:    '1px',
    padding:   '0',
    margin:    '-1px',
    overflow:  'hidden',
    clip:      'rect(0,0,0,0)',
    whiteSpace: 'nowrap',
    border:    '0',
  });
  document.body.appendChild(_announcer);
};

/**
 * Anuncia uma mensagem para screen readers.
 * @param {string} message
 */
const announce = (message) => {
  if (!_announcer) return;
  _announcer.textContent = '';
  // Delay necessario para garantir que o DOM change seja detectado
  requestAnimationFrame(() => {
    _announcer.textContent = message;
  });
};

/**
 * Registra handlers de teclado globais.
 */
const _registerKeyboardHandlers = () => {
  document.addEventListener('keydown', (e) => {
    // ESC fecha modais e glossarios abertos
    if (e.key === 'Escape') {
      _handleEscape();
    }

    // Tab — gerencia focus trap em modais
    if (e.key === 'Tab') {
      const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
      if (modal) {
        _trapFocus(modal, e);
      }
    }
  });
};

/**
 * Acoes ao pressionar ESC.
 */
const _handleEscape = () => {
  // Fechar nav mobile
  const nav = document.querySelector('.site-nav__links.is-open');
  if (nav) {
    nav.classList.remove('is-open');
    document.querySelector('.site-nav__menu-toggle')?.focus();
  }

  // Fechar glossario
  const glossaryPanel = document.querySelector('.glossary-panel[aria-expanded="true"]');
  if (glossaryPanel) {
    glossaryPanel.setAttribute('aria-expanded', 'false');
  }

  // Fechar modal generico
  const modal = document.querySelector('[role="dialog"][aria-modal="true"]');
  if (modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.style.display = 'none';
  }
};

/**
 * Mantem o focus dentro de um elemento (focus trap).
 * @param {HTMLElement} container
 * @param {KeyboardEvent} e
 */
const trapFocus = (container, e) => {
  _trapFocus(container, e);
};

const _trapFocus = (container, e) => {
  const focusable = [...container.querySelectorAll(FOCUSABLE_SELECTORS)];
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  if (e.shiftKey) {
    if (document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};

/**
 * Move o focus para um elemento, com fallback.
 * @param {string|HTMLElement} target - seletor CSS ou elemento
 */
const moveFocus = (target) => {
  const el = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (el) {
    if (!el.hasAttribute('tabindex')) {
      el.setAttribute('tabindex', '-1');
    }
    el.focus({ preventScroll: false });
  }
};

/**
 * Detecta prefers-reduced-motion e aplica classe no documento.
 */
const _detectReducedMotion = () => {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mq.matches) {
    document.documentElement.classList.add('reduced-motion');
  }
  mq.addEventListener('change', (e) => {
    document.documentElement.classList.toggle('reduced-motion', e.matches);
  });
};

/**
 * Melhora elementos interativos que nao tem role ou aria adequado.
 * Executado apos cada mudanca de view.
 */
const _enhanceInteractiveElements = () => {
  // Delegacao — funciona para elementos inseridos dinamicamente
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.card--interactive, .module-card, .axis-card[data-href]');
    if (card) {
      const href = card.getAttribute('data-href');
      if (href) {
        window.location.hash = href;
      }
    }
  });

  // Ativa click via Enter em elementos com role=button sem ser <button>
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const target = e.target;
      if (target.getAttribute('role') === 'button' && target.tagName !== 'BUTTON') {
        e.preventDefault();
        target.click();
      }
    }
  });
};

/**
 * Aplicado apos renderizacao de nova view: reprocessa focus e roles.
 */
const onViewRendered = () => {
  // Mover focus para o h1 da nova pagina
  const h1 = document.querySelector('main h1, main h2');
  if (h1) {
    moveFocus(h1);
  }
};

const Accessibility = { init, announce, trapFocus, moveFocus, onViewRendered };

export default Accessibility;
