/**
 * feedback-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor de exercícios e feedback.
 * Tipos suportados: analysis, ordering, comparison, association.
 *
 * Todos os layouts usam classes CSS definidas em components.css.
 * Nenhum inline style de layout.
 */

import State        from '../js/state.js';
import Accessibility from '../js/accessibility.js';

/** Tipos de exercício suportados. */
const EXERCISE_TYPES = {
  ASSOCIATION: 'association',
  ORDERING:    'ordering',
  FLOW:        'flow',
  COMPARISON:  'comparison',
  ANALYSIS:    'analysis',
};

/**
 * Retorna os dados de um exercício pelo ID.
 * @param {string} exerciseId
 * @returns {object|null}
 */
const getExercise = (exerciseId) => {
  const data = State.getValue('data.exercises');
  if (!data) return null;
  return data.exercises.find(e => e.id === exerciseId) ?? null;
};

/**
 * Retorna exercícios de um módulo.
 * @param {string} moduleId
 * @returns {Array}
 */
const getByModule = (moduleId) => {
  const data = State.getValue('data.exercises');
  if (!data) return [];
  return data.exercises.filter(e => e.module === moduleId);
};

/**
 * Renderiza um exercício no container fornecido.
 * @param {HTMLElement} container
 * @param {string} exerciseId
 */
const renderExercise = (container, exerciseId) => {
  const exercise = getExercise(exerciseId);
  if (!exercise) {
    container.innerHTML = `<p class="exercise__not-found">Exercício não encontrado.</p>`;
    return;
  }

  switch (exercise.type) {
    case EXERCISE_TYPES.ANALYSIS:    _renderAnalysis(container, exercise);    break;
    case EXERCISE_TYPES.ORDERING:    _renderOrdering(container, exercise);    break;
    case EXERCISE_TYPES.COMPARISON:  _renderComparison(container, exercise);  break;
    case EXERCISE_TYPES.ASSOCIATION: _renderAssociation(container, exercise); break;
    default:
      container.innerHTML = `<p class="exercise__not-found">Tipo não suportado: ${exercise.type}</p>`;
  }
};

/* ============================================================
   TIPO: ANÁLISE (múltipla escolha argumentativa)
   ============================================================ */

/**
 * @param {HTMLElement} container
 * @param {object} exercise
 */
const _renderAnalysis = (container, exercise) => {
  container.innerHTML = `
    <div class="exercise" id="ex-${exercise.id}">
      <div class="exercise__header">
        <span class="exercise__type">Análise — ${exercise.title}</span>
      </div>
      <div class="exercise__body">
        <p class="exercise__question">${exercise.question}</p>
        <ul class="exercise__options" role="listbox" aria-label="Opções de resposta">
          ${exercise.options.map(opt => `
            <li class="exercise__option"
                role="option"
                tabindex="0"
                aria-selected="false"
                data-option-id="${opt.id}">
              ${opt.text}
            </li>
          `).join('')}
        </ul>
        <div class="exercise__feedback" id="feedback-${exercise.id}" role="alert">
          <p id="feedback-text-${exercise.id}"></p>
        </div>
      </div>
      <div class="exercise__footer">
        <div id="hint-area-${exercise.id}"></div>
        <button class="btn btn--primary" id="submit-${exercise.id}" disabled>
          Confirmar resposta
        </button>
      </div>
    </div>
  `;

  const options     = container.querySelectorAll('.exercise__option');
  const submitBtn   = container.querySelector(`#submit-${exercise.id}`);
  const feedbackDiv = container.querySelector(`#feedback-${exercise.id}`);
  const feedbackTxt = container.querySelector(`#feedback-text-${exercise.id}`);
  let answered = false;

  options.forEach(opt => {
    const select = () => {
      if (answered) return;
      options.forEach(o => {
        o.classList.remove('is-selected');
        o.setAttribute('aria-selected', 'false');
      });
      opt.classList.add('is-selected');
      opt.setAttribute('aria-selected', 'true');
      submitBtn.disabled = false;
    };
    opt.addEventListener('click', select);
    opt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(); }
    });
  });

  submitBtn.addEventListener('click', () => {
    const selectedId = container.querySelector('.exercise__option.is-selected')
      ?.getAttribute('data-option-id');
    if (!selectedId || answered) return;
    answered = true;

    const chosen    = exercise.options.find(o => o.id === selectedId);
    const isCorrect = chosen?.isCorrect ?? false;

    options.forEach(opt => {
      const optData = exercise.options.find(o => o.id === opt.getAttribute('data-option-id'));
      if (optData?.isCorrect)                                          opt.classList.add('is-correct');
      else if (opt.getAttribute('data-option-id') === selectedId && !isCorrect) opt.classList.add('is-wrong');
    });

    feedbackTxt.textContent = chosen?.feedback ?? '';
    feedbackDiv.classList.add('is-visible');
    submitBtn.disabled  = true;
    submitBtn.textContent = isCorrect ? 'Correto' : 'Ver resposta correta';

    if (State.getValue('ui.teacherMode') && exercise.teacherGuide) {
      _appendTeacherGuide(container.querySelector(`#ex-${exercise.id}`), exercise.teacherGuide);
    }

    Accessibility.announce(isCorrect
      ? 'Resposta correta. ' + (chosen?.feedback ?? '')
      : 'Resposta incorreta. ' + (chosen?.feedback ?? '')
    );
  });
};

/* ============================================================
   TIPO: ORDENAÇÃO
   ============================================================ */

/**
 * @param {HTMLElement} container
 * @param {object} exercise
 */
const _renderOrdering = (container, exercise) => {
  const shuffled = [...exercise.steps].sort(() => Math.random() - 0.5);

  container.innerHTML = `
    <div class="exercise" id="ex-${exercise.id}">
      <div class="exercise__header">
        <span class="exercise__type">Ordenação — ${exercise.title}</span>
      </div>
      <div class="exercise__body">
        <p class="exercise__question">${exercise.question}</p>
        <p class="exercise__hint-text">Use os botões para ordenar os itens.</p>
        <ul class="exercise__order-list" id="order-list-${exercise.id}">
          ${shuffled.map((step, i) => `
            <li class="exercise__order-item" data-step-id="${step.id}" data-pos="${i}">
              <span>${step.text}</span>
              <div class="exercise__order-controls">
                <button class="btn btn--ghost btn--sm" data-move="up"   aria-label="Mover para cima">↑</button>
                <button class="btn btn--ghost btn--sm" data-move="down" aria-label="Mover para baixo">↓</button>
              </div>
            </li>
          `).join('')}
        </ul>
        <div class="exercise__feedback" id="feedback-${exercise.id}" role="alert">
          <p id="feedback-text-${exercise.id}"></p>
        </div>
      </div>
      <div class="exercise__footer">
        <span></span>
        <button class="btn btn--primary" id="submit-${exercise.id}">Verificar ordem</button>
      </div>
    </div>
  `;

  const list        = container.querySelector(`#order-list-${exercise.id}`);
  const submitBtn   = container.querySelector(`#submit-${exercise.id}`);
  const feedback    = container.querySelector(`#feedback-${exercise.id}`);
  const feedbackTxt = container.querySelector(`#feedback-text-${exercise.id}`);

  list.addEventListener('click', (e) => {
    const moveBtn = e.target.closest('[data-move]');
    if (!moveBtn) return;
    const direction = moveBtn.getAttribute('data-move');
    const item      = moveBtn.closest('li');
    const items     = [...list.querySelectorAll('li')];
    const idx       = items.indexOf(item);
    if (direction === 'up'   && idx > 0)              list.insertBefore(item, items[idx - 1]);
    if (direction === 'down' && idx < items.length - 1) list.insertBefore(items[idx + 1], item);
  });

  submitBtn.addEventListener('click', () => {
    const currentOrder = [...list.querySelectorAll('li')].map(li => li.getAttribute('data-step-id'));
    const correctOrder = [...exercise.steps].sort((a, b) => a.order - b.order).map(s => s.id);
    const isCorrect    = currentOrder.every((id, i) => id === correctOrder[i]);

    feedbackTxt.textContent = isCorrect
      ? 'Ordem correta. Esta é a sequência correta do processo.'
      : 'Ordem incorreta. Confira a sequência e tente novamente.';
    feedback.classList.add('is-visible');

    if (isCorrect) { submitBtn.textContent = 'Correto'; submitBtn.disabled = true; }
    Accessibility.announce(isCorrect ? 'Ordem correta.' : 'Ordem incorreta. Tente novamente.');
  });
};

/* ============================================================
   TIPO: COMPARAÇÃO (F / R / A)
   ============================================================ */

/**
 * @param {HTMLElement} container
 * @param {object} exercise
 */
const _renderComparison = (container, exercise) => {
  container.innerHTML = `
    <div class="exercise" id="ex-${exercise.id}">
      <div class="exercise__header">
        <span class="exercise__type">Comparação — ${exercise.title}</span>
      </div>
      <div class="exercise__body">
        <p class="exercise__question">${exercise.question}</p>
        <div class="exercise__comparison-grid">
          ${exercise.items.map(item => `
            <div class="exercise__comparison-row">
              <span class="exercise__comparison-text">${item.text}</span>
              <div class="exercise__comparison-buttons">
                ${['F', 'R', 'A'].map(opt => `
                  <button class="btn btn--ghost btn--sm comparison-btn"
                          data-item="${item.id}"
                          data-option="${opt}"
                          aria-label="${opt} para '${item.text}'">
                    ${opt}
                  </button>
                `).join('')}
              </div>
              <div class="comparison-feedback exercise__comparison-indicator"
                   data-item-feedback="${item.id}"></div>
            </div>
          `).join('')}
        </div>
        <div class="exercise__feedback" id="feedback-${exercise.id}" role="alert"></div>
      </div>
      <div class="exercise__footer">
        <span></span>
        <button class="btn btn--primary" id="submit-${exercise.id}">Verificar respostas</button>
      </div>
    </div>
  `;

  const choices   = {};
  const submitBtn = container.querySelector(`#submit-${exercise.id}`);
  const feedback  = container.querySelector(`#feedback-${exercise.id}`);

  container.querySelectorAll('.comparison-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = btn.getAttribute('data-item');
      container.querySelectorAll(`[data-item="${itemId}"].comparison-btn`).forEach(b => {
        b.classList.remove('is-active');
      });
      choices[itemId] = btn.getAttribute('data-option');
      btn.classList.add('is-active');
    });
  });

  submitBtn.addEventListener('click', () => {
    let correct = 0;
    exercise.items.forEach(item => {
      const fb     = container.querySelector(`[data-item-feedback="${item.id}"]`);
      const chosen = choices[item.id];
      const ok     = chosen === item.answer;
      if (ok) correct++;
      if (fb) {
        fb.textContent = ok ? 'V' : 'X';
        fb.classList.add(ok ? 'exercise__comparison-indicator--correct' : 'exercise__comparison-indicator--wrong');
      }
    });

    const total = exercise.items.length;
    feedback.classList.add('is-visible');
    feedback.innerHTML = `
      <p><strong>${correct}/${total}</strong> corretos.</p>
      ${correct < total ? `
        <ul class="exercise__feedback-list">
          ${exercise.items
            .filter(item => choices[item.id] !== item.answer)
            .map(item => `<li>${item.text}: resposta correta é <strong>${item.answer}</strong>. ${item.explanation}</li>`)
            .join('')}
        </ul>
      ` : ''}
    `;
  });
};

/* ============================================================
   TIPO: ASSOCIAÇÃO (coluna esquerda → direita)
   ============================================================ */

/**
 * @param {HTMLElement} container
 * @param {object} exercise
 */
const _renderAssociation = (container, exercise) => {
  container.innerHTML = `
    <div class="exercise" id="ex-${exercise.id}">
      <div class="exercise__header">
        <span class="exercise__type">Associação — ${exercise.title}</span>
      </div>
      <div class="exercise__body">
        <p class="exercise__question">${exercise.question}</p>
        <p class="exercise__hint-text">
          Selecione um item da coluna esquerda, depois o correspondente da direita.
        </p>
        <div class="exercise__association-grid">
          <div class="exercise__association-col">
            <p class="exercise__association-colhead">Estrutura</p>
            ${exercise.items.map(item => `
              <button class="exercise__association-btn assoc-left"
                      data-id="${item.id}"
                      data-match="${item.matchId}">
                ${item.text}
              </button>
            `).join('')}
          </div>
          <div class="exercise__association-col">
            <p class="exercise__association-colhead">Função</p>
            ${exercise.matches.map(match => `
              <button class="exercise__association-btn assoc-right"
                      data-id="${match.id}">
                ${match.text}
              </button>
            `).join('')}
          </div>
        </div>
        <div class="exercise__feedback" id="feedback-${exercise.id}" role="alert"></div>
      </div>
    </div>
  `;

  let selectedLeft = null;
  const matched    = {};
  const feedback   = container.querySelector(`#feedback-${exercise.id}`);

  container.querySelectorAll('.assoc-left').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.assoc-left').forEach(b => b.classList.remove('is-selected'));
      selectedLeft = btn;
      btn.classList.add('is-selected');
    });
  });

  container.querySelectorAll('.assoc-right').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedLeft) return;

      const leftId    = selectedLeft.getAttribute('data-id');
      const leftMatch = selectedLeft.getAttribute('data-match');
      const rightId   = btn.getAttribute('data-id');
      const isCorrect = leftMatch === rightId;

      selectedLeft.classList.remove('is-selected');
      selectedLeft.classList.add(isCorrect ? 'is-correct' : 'is-wrong');
      if (isCorrect) btn.classList.add('is-correct');

      matched[leftId] = rightId;
      selectedLeft.disabled = true;
      if (isCorrect) btn.disabled = true;
      selectedLeft = null;

      if (Object.keys(matched).length === exercise.items.length) {
        const allCorrect = exercise.items.every(item => matched[item.id] === item.matchId);
        feedback.classList.add('is-visible');
        feedback.innerHTML = allCorrect
          ? '<p>Todas as associações estão corretas.</p>'
          : '<p>Algumas associações estão incorretas. Os itens corretos estão marcados em verde.</p>';
      }
    });
  });
};

/* ============================================================
   PAINEL PROFESSOR
   ============================================================ */

/**
 * Adiciona o painel de modo professor ao exercício.
 * @param {HTMLElement} exerciseEl
 * @param {object} guide
 */
const _appendTeacherGuide = (exerciseEl, guide) => {
  const panel = document.createElement('div');
  panel.className = 'teacher-panel';
  panel.innerHTML = `
    <div class="teacher-panel__header">
      <span class="teacher-panel__label">Modo Professor</span>
    </div>
    ${guide.objective ? `
      <div class="teacher-panel__section">
        <p class="teacher-panel__section-title">Objetivo</p>
        <p class="teacher-panel__section-body">${guide.objective}</p>
      </div>
    ` : ''}
    ${guide.centralConcept ? `
      <div class="teacher-panel__section">
        <p class="teacher-panel__section-title">Conceito central</p>
        <p class="teacher-panel__section-body">${guide.centralConcept}</p>
      </div>
    ` : ''}
    ${guide.scaleRelation ? `
      <div class="teacher-panel__section">
        <p class="teacher-panel__section-title">Relação de escala</p>
        <p class="teacher-panel__section-body">${guide.scaleRelation}</p>
      </div>
    ` : ''}
    ${guide.mediationSuggestion ? `
      <div class="teacher-panel__section">
        <p class="teacher-panel__section-title">Mediação sugerida</p>
        <p class="teacher-panel__section-body">${guide.mediationSuggestion}</p>
      </div>
    ` : ''}
    ${guide.estimatedMinutes ? `
      <div class="teacher-panel__section">
        <p class="teacher-panel__section-title">Tempo estimado</p>
        <p class="teacher-panel__section-body teacher-panel__section-body--mono">
          ${guide.estimatedMinutes} min
        </p>
      </div>
    ` : ''}
  `;
  exerciseEl.appendChild(panel);
};

const FeedbackEngine = { renderExercise, getExercise, getByModule, EXERCISE_TYPES };

export default FeedbackEngine;
