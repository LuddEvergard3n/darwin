/** Motor dos exercícios do Darwin, sem dependências externas. */
import State from '../js/state.js';
import Accessibility from '../js/accessibility.js';

const EXERCISE_TYPES = { ASSOCIATION: 'association', ORDERING: 'ordering', FLOW: 'flow', COMPARISON: 'comparison', ANALYSIS: 'analysis' };
const getExercise = id => State.getValue('data.exercises')?.exercises.find(exercise => exercise.id === id) ?? null;
const getByModule = id => State.getValue('data.exercises')?.exercises.filter(exercise => exercise.module === id) ?? [];
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const record = (exercise, correct, answer) => {
  State.recordExercise(exercise.id, correct, answer);
  Accessibility.announce(correct ? 'Resposta correta.' : 'Resposta registrada. Consulte o feedback e tente novamente.');
};

const appendGuide = (root, guide) => {
  if (!State.getValue('ui.teacherMode') || !guide) return;
  const fields = [['Objetivo', guide.objective], ['Conceito central', guide.centralConcept], ['Relação de escala', guide.scaleRelation], ['Mediação sugerida', guide.mediationSuggestion], ['Tempo estimado', guide.estimatedMinutes && `${guide.estimatedMinutes} min`]].filter(([, value]) => value);
  if (!fields.length) return;
  const panel = document.createElement('aside');
  panel.className = 'teacher-panel';
  panel.innerHTML = `<p class="teacher-panel__label">Modo Professor</p>${fields.map(([label, value]) => `<p><strong>${escape(label)}:</strong> ${escape(value)}</p>`).join('')}`;
  root.append(panel);
};

const addHint = (root, exercise) => {
  const button = document.createElement('button');
  button.type = 'button'; button.className = 'btn btn--ghost btn--sm'; button.textContent = 'Ver dica';
  const note = document.createElement('p'); note.className = 'hint'; note.hidden = true;
  note.textContent = exercise.hint || 'Volte ao fenômeno e identifique a relação ou sequência que o enunciado pede.';
  button.addEventListener('click', () => { note.hidden = !note.hidden; button.textContent = note.hidden ? 'Ver dica' : 'Ocultar dica'; });
  root.append(button, note);
};

const shell = (container, exercise, label, body) => {
  container.innerHTML = `<section class="exercise" id="ex-${escape(exercise.id)}"><header class="exercise__header"><span class="exercise__type">${label} — ${escape(exercise.title)}</span></header><div class="exercise__body"><p class="exercise__question">${escape(exercise.question)}</p>${body}</div><footer class="exercise__footer"></footer></section>`;
  const root = container.firstElementChild;
  addHint(root.querySelector('.exercise__footer'), exercise);
  appendGuide(root, exercise.teacherGuide);
  return root;
};

const renderAnalysis = (container, exercise) => {
  const root = shell(container, exercise, 'Análise', `<fieldset class="exercise__options"><legend class="sr-only">Opções de resposta</legend>${exercise.options.map(option => `<label class="exercise__option"><input type="radio" name="${escape(exercise.id)}" value="${escape(option.id)}"> ${escape(option.text)}</label>`).join('')}</fieldset><div class="exercise__feedback" role="status" hidden></div>`);
  const submit = document.createElement('button'); submit.className = 'btn btn--primary'; submit.textContent = 'Confirmar resposta';
  root.querySelector('.exercise__footer').append(submit);
  submit.addEventListener('click', () => {
    const answer = root.querySelector('input:checked')?.value; if (!answer) return;
    const option = exercise.options.find(item => item.id === answer); const correct = Boolean(option?.isCorrect);
    root.querySelectorAll('input').forEach(input => input.disabled = true);
    const feedback = root.querySelector('.exercise__feedback'); feedback.hidden = false; feedback.textContent = option?.feedback ?? '';
    submit.disabled = true; record(exercise, correct, answer);
    const restart = document.createElement('button'); restart.type = 'button'; restart.className = 'btn btn--ghost btn--sm'; restart.textContent = 'Tentar novamente';
    restart.addEventListener('click', () => renderAnalysis(container, exercise));
    root.querySelector('.exercise__footer').append(restart);
  });
};

const seededOrder = (items, seed) => {
  let value = [...seed].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 2166136261);
  return [...items].map(item => ({ item, value: (value = (value * 1664525 + 1013904223) >>> 0) })).sort((a, b) => a.value - b.value).map(entry => entry.item);
};

const renderOrdering = (container, exercise, flow = false) => {
  const steps = flow ? exercise.nodes.map((text, index) => ({ id: String(index), text, order: index + 1 })) : exercise.steps;
  const root = shell(container, exercise, flow ? 'Fluxo' : 'Ordenação', `<p class="exercise__hint-text">Use os botões para organizar a sequência.</p><ol class="exercise__order-list">${seededOrder(steps, exercise.id).map(step => `<li class="exercise__order-item" data-id="${escape(step.id)}"><span>${escape(step.text)}</span><span><button type="button" class="btn btn--ghost btn--sm" data-move="up" aria-label="Mover para cima">↑</button><button type="button" class="btn btn--ghost btn--sm" data-move="down" aria-label="Mover para baixo">↓</button></span></li>`).join('')}</ol><div class="exercise__feedback" role="status" hidden></div>`);
  const list = root.querySelector('ol'); const footer = root.querySelector('.exercise__footer');
  const submit = document.createElement('button'); submit.className = 'btn btn--primary'; submit.textContent = 'Verificar ordem'; footer.append(submit);
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-move]'); if (!button || submit.disabled) return;
    const item = button.closest('li'); const sibling = button.dataset.move === 'up' ? item.previousElementSibling : item.nextElementSibling;
    if (sibling) list.insertBefore(button.dataset.move === 'up' ? item : sibling, button.dataset.move === 'up' ? sibling : item);
  });
  submit.addEventListener('click', () => {
    const answer = [...list.children].map(item => item.dataset.id); const expected = [...steps].sort((a, b) => a.order - b.order).map(step => String(step.id));
    const correct = answer.every((id, index) => id === expected[index]); const feedback = root.querySelector('.exercise__feedback');
    feedback.hidden = false; feedback.textContent = correct ? 'Ordem correta.' : 'A ordem ainda não está correta. Reorganize e tente novamente.';
    record(exercise, correct, answer); if (!correct) return;
    submit.disabled = true; root.querySelectorAll('button[data-move]').forEach(button => button.disabled = true);
  });
};

const renderComparison = (container, exercise) => {
  const categories = Array.isArray(exercise.categories) && exercise.categories.length ? exercise.categories : [{ id: 'F', label: 'Fotossíntese' }, { id: 'R', label: 'Respiração' }, { id: 'A', label: 'Ambos' }];
  const root = shell(container, exercise, 'Comparação', `<div class="exercise__comparison-grid">${exercise.items.map(item => `<fieldset class="exercise__comparison-row"><legend>${escape(item.text)}</legend>${categories.map(category => `<label><input type="radio" name="${escape(exercise.id)}-${escape(item.id)}" value="${escape(category.id)}"> ${escape(category.label)}</label>`).join('')}</fieldset>`).join('')}</div><div class="exercise__feedback" role="status" hidden></div>`);
  const submit = document.createElement('button'); submit.className = 'btn btn--primary'; submit.textContent = 'Verificar respostas'; root.querySelector('.exercise__footer').append(submit);
  submit.addEventListener('click', () => {
    const answer = Object.fromEntries(exercise.items.map(item => [item.id, root.querySelector(`input[name="${CSS.escape(exercise.id)}-${CSS.escape(item.id)}"]:checked`)?.value ?? null]));
    const correctCount = exercise.items.filter(item => answer[item.id] === item.answer).length; const correct = correctCount === exercise.items.length;
    const feedback = root.querySelector('.exercise__feedback'); feedback.hidden = false; feedback.textContent = `${correctCount}/${exercise.items.length} corretos.${correct ? '' : ' Revise os itens e tente novamente.'}`;
    record(exercise, correct, answer); if (correct) { submit.disabled = true; root.querySelectorAll('input').forEach(input => input.disabled = true); }
  });
};

const renderAssociation = (container, exercise) => {
  const root = shell(container, exercise, 'Associação', `<p class="exercise__hint-text">Escolha uma estrutura e a função correspondente.</p><div class="exercise__association-grid"><div>${exercise.items.map(item => `<button type="button" class="exercise__association-btn assoc-left" data-id="${escape(item.id)}" data-match="${escape(item.matchId)}">${escape(item.text)}</button>`).join('')}</div><div>${exercise.matches.map(item => `<button type="button" class="exercise__association-btn assoc-right" data-id="${escape(item.id)}">${escape(item.text)}</button>`).join('')}</div></div><div class="exercise__feedback" role="status" hidden></div>`);
  let selected = null; let correctCount = 0; const feedback = root.querySelector('.exercise__feedback');
  root.querySelectorAll('.assoc-left').forEach(button => button.addEventListener('click', () => { if (button.disabled) return; root.querySelectorAll('.assoc-left').forEach(item => item.classList.remove('is-selected')); selected = button; button.classList.add('is-selected'); }));
  root.querySelectorAll('.assoc-right').forEach(button => button.addEventListener('click', () => {
    if (!selected || button.disabled) return; const correct = selected.dataset.match === button.dataset.id; feedback.hidden = false;
    if (!correct) { feedback.textContent = 'Essa associação não corresponde. Tente outra função.'; record(exercise, false, { left: selected.dataset.id, right: button.dataset.id }); selected.classList.remove('is-selected'); selected.classList.add('is-wrong'); selected = null; return; }
    selected.disabled = true; button.disabled = true; selected.classList.remove('is-selected'); selected.classList.add('is-correct'); button.classList.add('is-correct'); selected = null; correctCount += 1;
    if (correctCount === exercise.items.length) { feedback.textContent = 'Todas as associações estão corretas.'; record(exercise, true, 'completed'); }
  }));
};

const renderExercise = (container, id) => {
  const exercise = getExercise(id);
  if (!exercise) { container.textContent = 'Exercício não encontrado.'; return; }
  if (exercise.type === EXERCISE_TYPES.ANALYSIS) return renderAnalysis(container, exercise);
  if (exercise.type === EXERCISE_TYPES.ORDERING) return renderOrdering(container, exercise);
  if (exercise.type === EXERCISE_TYPES.FLOW) return renderOrdering(container, exercise, true);
  if (exercise.type === EXERCISE_TYPES.COMPARISON) return renderComparison(container, exercise);
  if (exercise.type === EXERCISE_TYPES.ASSOCIATION) return renderAssociation(container, exercise);
  container.textContent = `Tipo de exercício não suportado: ${exercise.type}`;
};

export { renderExercise, getExercise, getByModule, EXERCISE_TYPES, seededOrder };
export default { renderExercise, getExercise, getByModule, EXERCISE_TYPES };
