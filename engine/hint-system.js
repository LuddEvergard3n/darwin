/**
 * hint-system.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Sistema de dicas contextuais para exercícios.
 * Dicas são discretas e orientadas ao raciocínio — nunca entregam a resposta.
 */

/** Tipos de dica disponíveis. */
const HINT_TYPES = {
  HIGHLIGHT: 'highlight',  // destaca uma área relevante
  RELATION:  'relation',   // aponta uma relação entre elementos
  REDUCE:    'reduce',     // elimina opções improváveis
  FOCUS:     'focus',      // foca no processo correto
  ARROW:     'arrow',      // seta suave apontando para elemento
};

/** Registro de dicas por exercício. */
const _hintRegistry = new Map();

/**
 * Registra dicas para um exercício.
 * @param {string} exerciseId
 * @param {object[]} hints - array de { type, target?, message }
 */
const register = (exerciseId, hints) => {
  _hintRegistry.set(exerciseId, hints);
};

/**
 * Exibe a próxima dica disponível para um exercício.
 * @param {string} exerciseId
 * @param {HTMLElement} container
 */
const showNext = (exerciseId, container) => {
  const hints = _hintRegistry.get(exerciseId);
  if (!hints || hints.length === 0) {
    _renderHint(container, {
      type:    HINT_TYPES.FOCUS,
      message: 'Releia o enunciado com atenção. Identifique o processo descrito e qual escala biológica ele envolve.',
    }, 0, 1);
    return;
  }

  const shownKey = `hint-shown-${exerciseId}`;
  const shownIdx = parseInt(container.getAttribute(shownKey) ?? '-1', 10);
  const nextIdx  = (shownIdx + 1) % hints.length;
  container.setAttribute(shownKey, String(nextIdx));

  _renderHint(container, hints[nextIdx], nextIdx, hints.length);
};

/**
 * Renderiza uma dica no container do exercício.
 * @param {HTMLElement} container
 * @param {object} hint
 * @param {number} current
 * @param {number} total
 */
const _renderHint = (container, hint, current, total) => {
  container.querySelector('.hint-display')?.remove();

  const hintEl = document.createElement('div');
  hintEl.className = 'hint hint-display';
  hintEl.setAttribute('role', 'note');
  hintEl.setAttribute('aria-label', 'Dica');

  hintEl.innerHTML = `
    <div class="hint__inner">
      <div class="hint__content">
        <p class="hint__counter">Dica ${current + 1}/${total}</p>
        <p class="hint__message">${hint.message}</p>
      </div>
      <button class="hint__close" aria-label="Fechar dica">&#x2715;</button>
    </div>
  `;

  hintEl.querySelector('.hint__close').addEventListener('click', () => hintEl.remove());

  const body = container.querySelector('.exercise__body');
  (body ?? container).appendChild(hintEl);

  if (hint.target && hint.type === HINT_TYPES.HIGHLIGHT) {
    _highlightTarget(container, hint.target);
  }
};

/**
 * Destaca visualmente um elemento alvo por 3 segundos.
 * @param {HTMLElement} container
 * @param {string} selector
 */
const _highlightTarget = (container, selector) => {
  const target = container.querySelector(selector);
  if (!target) return;

  target.classList.add('hint-highlight');
  setTimeout(() => target.classList.remove('hint-highlight'), 3000);
};

/**
 * Inicializa botões de dica em um container de exercício.
 * @param {HTMLElement} container
 */
const initHintButtons = (container) => {
  container.querySelectorAll('[data-hint-for]').forEach(btn => {
    const exerciseId = btn.getAttribute('data-hint-for');
    btn.addEventListener('click', () => showNext(exerciseId, container));
  });
};

const HintSystem = { register, showNext, initHintButtons, HINT_TYPES };

export default HintSystem;
