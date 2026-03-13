/**
 * hint-system.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Sistema de dicas contextuais.
 * Dicas sao: visuais, discretas, orientadas ao raciocinio.
 * Nunca entregam a resposta — reduzem a incerteza ou destacam o caminho.
 */

/**
 * Tipos de dica disponiveis.
 */
const HINT_TYPES = {
  HIGHLIGHT:   'highlight',    // destaca uma area relevante
  RELATION:    'relation',     // aponta uma relacao entre elementos
  REDUCE:      'reduce',       // elimina opcoes improvaveis
  FOCUS:       'focus',        // foca no processo correto
  ARROW:       'arrow',        // seta suave apontando para elemento
};

/**
 * Registra um hint para um exercicio especifico.
 * @param {string} exerciseId
 * @param {object[]} hints - array de { type, target, message }
 */
const _hintRegistry = new Map();

const register = (exerciseId, hints) => {
  _hintRegistry.set(exerciseId, hints);
};

/**
 * Exibe a proxima dica disponivel para um exercicio.
 * @param {string} exerciseId
 * @param {HTMLElement} container - container do exercicio
 */
const showNext = (exerciseId, container) => {
  const hints = _hintRegistry.get(exerciseId);
  if (!hints || hints.length === 0) {
    _showGenericHint(container);
    return;
  }

  // Rastrear qual dica ja foi exibida
  const shownKey  = `hint-shown-${exerciseId}`;
  const shownIdx  = parseInt(container.getAttribute(shownKey) ?? '-1', 10);
  const nextIdx   = (shownIdx + 1) % hints.length;
  container.setAttribute(shownKey, String(nextIdx));

  const hint = hints[nextIdx];
  _renderHint(container, hint, nextIdx, hints.length);
};

/**
 * Renderiza uma dica no container do exercicio.
 * @param {HTMLElement} container
 * @param {object} hint
 * @param {number} current - indice atual
 * @param {number} total   - total de dicas
 */
const _renderHint = (container, hint, current, total) => {
  // Remover dica anterior
  container.querySelector('.hint-display')?.remove();

  const hintEl = document.createElement('div');
  hintEl.className = 'hint hint-display';
  hintEl.setAttribute('role', 'note');
  hintEl.setAttribute('aria-label', 'Dica');
  hintEl.style.marginTop = 'var(--space-4)';

  hintEl.innerHTML = `
    <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;">
      <div>
        <p style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-primary);
                  text-transform: uppercase; letter-spacing: 0.07em; margin-bottom: 0.35rem;">
          Dica ${current + 1}/${total}
        </p>
        <p style="font-size: var(--text-sm);">${hint.message}</p>
      </div>
      <button
        aria-label="Fechar dica"
        style="color: var(--color-text-muted); background: none; border: none; cursor: pointer;
               font-size: 1.1rem; line-height: 1; padding: 0; flex-shrink: 0; margin-top: 2px;"
      >x</button>
    </div>
  `;

  hintEl.querySelector('button').addEventListener('click', () => hintEl.remove());

  // Inserir apos o exercicio__body
  const body = container.querySelector('.exercise__body');
  if (body) {
    body.appendChild(hintEl);
  } else {
    container.appendChild(hintEl);
  }

  // Destacar elemento alvo se houver
  if (hint.target && hint.type === HINT_TYPES.HIGHLIGHT) {
    _highlightTarget(container, hint.target);
  }
};

/**
 * Destaca visualmente um elemento alvo.
 * @param {HTMLElement} container
 * @param {string} selector
 */
const _highlightTarget = (container, selector) => {
  const target = container.querySelector(selector);
  if (!target) return;

  target.style.outline = '2px solid var(--color-primary)';
  target.style.outlineOffset = '3px';
  target.style.borderRadius = 'var(--radius-sm)';
  target.style.transition = 'outline 0.2s';

  setTimeout(() => {
    target.style.outline = '';
    target.style.outlineOffset = '';
  }, 3000);
};

/**
 * Exibe uma dica generica quando nao ha dicas registradas.
 * @param {HTMLElement} container
 */
const _showGenericHint = (container) => {
  _renderHint(container, {
    type: HINT_TYPES.FOCUS,
    message: 'Releia o enunciado com atencao. Identifique o processo descrito e qual escala biologica ele envolve.',
  }, 0, 1);
};

/**
 * Inicializa botoes de dica em um container de exercicio.
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
