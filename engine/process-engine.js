/**
 * process-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsável por:
 *  - Representar e exibir processos biológicos
 *  - Renderizar lições seguindo a sequência imutável de fases:
 *    fenômeno > visualização > processo > relação > aplicação > atividade
 */

import State          from '../js/state.js';
import FeedbackEngine from './feedback-engine.js';

/**
 * Fases obrigatórias de cada lição.
 * Ordem é imutável — não reordenar.
 */
const LESSON_PHASES = [
  {
    id:          'fenomeno',
    label:       'Fenômeno',
    description: 'O ponto de partida — uma pergunta ou observação concreta.',
  },
  {
    id:          'visualizacao',
    label:       'Visualização',
    description: 'Representação visual do processo ou estrutura.',
  },
  {
    id:          'processo',
    label:       'Processo',
    description: 'O mecanismo biológico — o que acontece e por quê.',
  },
  {
    id:          'relacao',
    label:       'Relação com outras escalas',
    description: 'Como este processo se conecta a outros níveis da vida.',
  },
  {
    id:          'aplicacao',
    label:       'Aplicação real',
    description: 'Onde este processo aparece em contextos concretos (saúde, ambiente, tecnologia).',
  },
  {
    id:          'atividade',
    label:       'Atividade',
    description: 'Exercício guiado para consolidar o aprendizado.',
  },
];

/**
 * Retorna os dados de uma lição a partir do módulo e da lição.
 * @param {string} moduleSlug
 * @param {string} lessonId
 * @returns {{ mod: object, lesson: object }|null}
 */
const getLessonData = (moduleSlug, lessonId) => {
  const data = State.getValue('data.modules');
  if (!data) return null;

  const mod = data.modules.find(
    m => m.slug === moduleSlug || m.id === moduleSlug
  );
  if (!mod) return null;

  const lesson = mod.lessons.find(l => l.id === lessonId);
  if (!lesson) return null;

  return { mod, lesson };
};

/**
 * Renderiza a view de processo (navegação /processo/:id).
 * @param {HTMLElement} container
 * @param {{ processId: string }} params
 */
const render = (container, params) => {
  const { processId, moduleId, lessonId } = params;

  // Se tem moduleId e lessonId, renderizar lição
  if (moduleId && lessonId) {
    _renderLesson(container, moduleId, lessonId);
    return;
  }

  // Caso contrário, renderizar view de processo
  const data = State.getValue('data.processes');
  if (!data) {
    container.innerHTML = `<div class="container page-body"><p>Dados não carregados.</p></div>`;
    return;
  }

  const process = data.processes.find(p => p.id === processId);
  if (!process) {
    container.innerHTML = `
      <div class="container page-body">
        <p class="section-label" style="color: var(--color-accent-rare);">Processo não encontrado</p>
        <a href="#/" class="btn btn--secondary error-action">Voltar ao início</a>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="container page-body">
      <nav aria-label="Localização" class="page-breadcrumb">
        <ol class="breadcrumb">
          <li><a href="#/">Início</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${process.label}</li>
        </ol>
      </nav>
      <header class="page-header">
        <span class="section-label">Processo biológico</span>
        <h1 class="page-header__title">${process.label}</h1>
        <p class="page-header__description">${process.description}</p>
      </header>
      <div class="callout callout--info">
        <p>Escalas: <strong>${process.scales.join(', ')}</strong></p>
      </div>
    </div>
  `;
};

/**
 * Renderiza uma lição completa seguindo as 6 fases.
 * @param {HTMLElement} container
 * @param {string} moduleId
 * @param {string} lessonId
 */
const _renderLesson = (container, moduleId, lessonId) => {
  const result = getLessonData(moduleId, lessonId);

  if (!result) {
    container.innerHTML = `
      <div class="container page-body">
        <p class="section-label" style="color: var(--color-accent-rare);">Lição não encontrada</p>
        <a href="#/modulo/${moduleId}" class="btn btn--secondary error-action">
          Voltar ao módulo
        </a>
      </div>
    `;
    return;
  }

  const { mod, lesson } = result;

  // Índice para navegação prev/next
  const lessonIndex = mod.lessons.findIndex(l => l.id === lessonId);
  const prevLesson  = mod.lessons[lessonIndex - 1] ?? null;
  const nextLesson  = mod.lessons[lessonIndex + 1] ?? null;

  container.innerHTML = `
    <div class="container page-body">

      <nav aria-label="Localização" class="page-breadcrumb">
        <ol class="breadcrumb">
          <li><a href="#/">Início</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li><a href="#/modulo/${mod.slug}">${mod.title}</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${lesson.title}</li>
        </ol>
      </nav>

      <header class="lesson-header">
        <p class="lesson-header__meta">
          Módulo ${mod.number} &mdash; Lição ${String(lesson.order).padStart(2, '0')}
        </p>
        <h1 class="lesson-header__title">${lesson.title}</h1>

        <div class="callout callout--insight">
          <p class="callout__title">Fenômeno</p>
          <p class="lesson-header__phenomenon">${lesson.phenomenon}</p>
        </div>
      </header>

      <div class="lesson" id="lesson-body">
        ${_renderLessonPhases(lesson, mod)}
      </div>

      <nav aria-label="Navegação de lições" class="lesson-nav">
        ${prevLesson ? `
          <a href="#/modulo/${mod.slug}/${prevLesson.id}" class="lesson-nav__link lesson-nav__link--prev">
            <span class="lesson-nav__direction">Lição anterior</span>
            <span class="lesson-nav__title">${prevLesson.title}</span>
          </a>
        ` : '<div></div>'}
        ${nextLesson ? `
          <a href="#/modulo/${mod.slug}/${nextLesson.id}" class="lesson-nav__link lesson-nav__link--next">
            <span class="lesson-nav__direction">Próxima lição</span>
            <span class="lesson-nav__title">${nextLesson.title}</span>
          </a>
        ` : '<div></div>'}
      </nav>

    </div>
  `;

  _initLessonInteractions(container, lesson, mod);
};

/**
 * Renderiza todas as fases de uma lição.
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderLessonPhases = (lesson, mod) =>
  LESSON_PHASES
    .filter(phase => lesson.phases.includes(phase.id))
    .map(phase => _renderPhase(phase, lesson, mod))
    .join('');

/**
 * Renderiza uma fase específica.
 * @param {object} phase
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderPhase = (phase, lesson, mod) => {
  const body = _renderPhaseBody(phase, lesson, mod);

  return `
    <section class="lesson-phase" id="phase-${phase.id}" aria-labelledby="phase-heading-${phase.id}">
      <div class="lesson-phase__header">
        <span class="lesson-phase__label">${phase.label}</span>
        <h2 id="phase-heading-${phase.id}" class="lesson-phase__description">
          ${phase.description}
        </h2>
      </div>
      <div class="lesson-phase__body">
        ${body}
      </div>
    </section>
  `;
};

/**
 * Retorna o conteúdo do corpo de cada fase.
 * @param {object} phase
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderPhaseBody = (phase, lesson, mod) => {
  switch (phase.id) {

    case 'fenomeno':
      return `
        <div class="callout callout--insight">
          <p class="callout__title">Ponto de partida</p>
          <p>${lesson.phenomenon}</p>
          <p class="callout__note">
            Esta é a questão central desta lição. Ao longo das próximas fases, você vai
            construir a resposta a partir da estrutura, do processo e das relações biológicas.
          </p>
        </div>
      `;

    case 'visualizacao':
      return `
        <div class="diagram-placeholder" aria-label="Diagrama de visualização — ${lesson.title}">
          <p class="diagram-placeholder__title">Diagrama: ${lesson.title}</p>
          <p class="diagram-placeholder__subtitle">Representação visual carregada do módulo de dados.</p>
        </div>
      `;

    case 'processo':
      return `
        <div class="prose">
          <p>
            Descrição mecanística do processo biológico — como ele ocorre, em que
            sequência e por quê. Conteúdo específico será carregado do módulo de dados.
          </p>
          <p>
            <strong>Lição:</strong> ${lesson.title} &mdash;
            <strong>Módulo:</strong> ${mod.title}
          </p>
        </div>
      `;

    case 'relacao':
      return `
        <div class="prose">
          <p>
            Conexão explícita com outras escalas: como o processo descrito nesta lição
            se manifesta em níveis diferentes da vida — do molecular ao ecossistema.
          </p>
          <div class="tag-row tag-row--sm">
            ${mod.scales.map(s => `
              <a href="#/escala/${s}" class="badge badge--neutral">${s}</a>
            `).join('')}
          </div>
        </div>
      `;

    case 'aplicacao':
      return `
        <div class="prose">
          <p>
            Onde este processo aparece no mundo concreto: saúde, doença, tecnologia,
            alimentação, ambiente.
          </p>
          <div class="tag-row tag-row--sm">
            ${mod.applications.map(app => `
              <a href="#/aplicacao/${app}" class="tag">${app}</a>
            `).join('')}
          </div>
        </div>
      `;

    case 'atividade':
      return `<div id="exercise-container-${lesson.id}"></div>`;

    default:
      return `<p>Fase desconhecida: ${phase.id}</p>`;
  }
};

/**
 * Inicializa interações da lição (renderiza exercícios).
 * @param {HTMLElement} container
 * @param {object} lesson
 * @param {object} mod
 */
const _initLessonInteractions = (container, lesson, mod) => {
  const exerciseContainer = container.querySelector(`#exercise-container-${lesson.id}`);
  if (!exerciseContainer) return;

  const exercisesData = State.getValue('data.exercises');
  if (!exercisesData) return;

  const exercise = exercisesData.exercises.find(e => e.lesson === lesson.id);
  if (exercise) {
    FeedbackEngine.renderExercise(exerciseContainer, exercise.id);
  } else {
    exerciseContainer.innerHTML = `
      <p class="exercise__not-found">Atividade não disponível para esta lição na versão atual.</p>
    `;
  }
};

const ProcessEngine = { render, getLessonData };

export default ProcessEngine;
export { render };
