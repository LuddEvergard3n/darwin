/**
 * process-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsavel por:
 *  - Representar e exibir processos biologicos
 *  - Renderizar licoes seguindo a sequencia pedagogica obrigatoria:
 *    fenomeno > visualizacao > processo > relacao > aplicacao > atividade
 *  - Gerenciar fluxos de materia, energia e informacao
 */

import State from '../js/state.js';

/**
 * Fases obrigatorias de cada licao.
 * Ordem e imutavel — e a espinha dorsal pedagogica do Darwin.
 */
const LESSON_PHASES = [
  {
    id:    'fenomeno',
    label: 'Fenomeno',
    description: 'O ponto de partida: um fenomeno observavel que motiva a investigacao.',
  },
  {
    id:    'visualizacao',
    label: 'Visualizacao',
    description: 'Representacao visual do processo ou estrutura.',
  },
  {
    id:    'processo',
    label: 'Processo',
    description: 'Explicacao mecanistica: o que acontece, em que ordem, por que.',
  },
  {
    id:    'relacao',
    label: 'Relacao com outras escalas',
    description: 'Como este processo se conecta a outros niveis da vida.',
  },
  {
    id:    'aplicacao',
    label: 'Aplicacao real',
    description: 'Onde este processo aparece em contextos concretos (saude, ambiente, tecnologia).',
  },
  {
    id:    'atividade',
    label: 'Atividade',
    description: 'Exercicio guiado para consolidar o aprendizado.',
  },
];

/**
 * Retorna os dados de uma licao a partir do modulo e da licao.
 * @param {string} moduleSlug
 * @param {string} lessonId
 * @returns {{ module: object, lesson: object } | null}
 */
const getLessonData = (moduleSlug, lessonId) => {
  const modulesData = State.getValue('data.modules');
  if (!modulesData) return null;

  const mod = modulesData.modules.find(m => m.slug === moduleSlug || m.id === moduleSlug);
  if (!mod) return null;

  const lesson = mod.lessons.find(l => l.id === lessonId);
  return lesson ? { module: mod, lesson } : null;
};

/**
 * Renderiza a view de processo (navegacao /processo/:id).
 * @param {HTMLElement} container
 * @param {{ processId: string }} params
 */
const render = (container, params) => {
  const { processId, moduleId, lessonId } = params;

  if (lessonId && moduleId) {
    _renderLesson(container, moduleId, lessonId);
    return;
  }

  if (processId) {
    _renderProcess(container, processId);
    return;
  }

  container.innerHTML = `<div class="container"><p>Parametros invalidos.</p></div>`;
};

/**
 * Renderiza uma licao completa seguindo as 6 fases.
 * @param {HTMLElement} container
 * @param {string} moduleId
 * @param {string} lessonId
 */
const _renderLesson = (container, moduleId, lessonId) => {
  const data = getLessonData(moduleId, lessonId);

  if (!data) {
    container.innerHTML = `
      <div class="container" style="padding-top: 3rem;">
        <p class="section-label" style="color: var(--color-accent-rare);">Licao nao encontrada</p>
        <a href="#/modulo/${moduleId}" class="btn btn--secondary" style="margin-top: 1rem;">Voltar ao modulo</a>
      </div>
    `;
    return;
  }

  const { module: mod, lesson } = data;
  const axisColorMap = {
    organization: 'var(--color-axis-org)',
    information:  'var(--color-axis-info)',
    energy:       'var(--color-axis-energy)',
    evolution:    'var(--color-axis-evo)',
  };
  const axisColor = axisColorMap[mod.axis] ?? 'var(--color-primary)';

  container.innerHTML = `
    <div class="container" style="padding-top: var(--space-8);">

      <!-- Breadcrumb -->
      <nav aria-label="Localizacao" style="margin-bottom: var(--space-8);">
        <ol class="breadcrumb">
          <li><a href="#/">Inicio</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li><a href="#/modulo/${mod.slug}">${mod.title}</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${lesson.title}</li>
        </ol>
      </nav>

      <!-- Cabecalho da licao -->
      <header style="margin-bottom: var(--space-12);">
        <span class="section-label" style="color: ${axisColor};">
          Modulo ${mod.number} — Licao ${String(lesson.order).padStart(2, '0')}
        </span>
        <h1 style="
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: var(--space-4);
          line-height: 1.15;
        ">${lesson.title}</h1>

        <!-- Fenomeno como destaque inicial -->
        <div class="callout callout--insight" style="max-width: 60ch;">
          <p class="callout__title">Fenomeno</p>
          <p>${lesson.phenomenon}</p>
        </div>
      </header>

      <!-- Corpo da licao com as fases -->
      <div class="lesson" id="lesson-content">
        ${_renderLessonPhases(lesson, mod)}
      </div>

      <!-- Navegacao entre licoes -->
      ${_renderLessonNavigation(mod, lesson)}

    </div>
  `;

  _initLessonInteractions(container);
};

/**
 * Renderiza todas as fases de uma licao.
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderLessonPhases = (lesson, mod) => {
  return LESSON_PHASES.map((phase, index) => {
    const isActive = phase.id === 'fenomeno' || phase.id === 'visualizacao';
    return `
      <section
        class="lesson-phase"
        id="phase-${phase.id}"
        data-phase="${phase.id}"
        aria-labelledby="phase-heading-${phase.id}"
      >
        <p class="lesson-phase__number">Fase ${String(index + 1).padStart(2, '0')}</p>
        <h2 id="phase-heading-${phase.id}" class="lesson-phase__title">${phase.label}</h2>
        <div class="lesson-phase__content">
          ${_renderPhaseContent(phase, lesson, mod)}
        </div>
      </section>
    `;
  }).join('');
};

/**
 * Renderiza o conteudo de uma fase especifica.
 * Placeholder para conteudo real — substituir com dados de lessons.json.
 * @param {object} phase
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderPhaseContent = (phase, lesson, mod) => {
  switch (phase.id) {
    case 'fenomeno':
      return `
        <p>${lesson.phenomenon}</p>
        <p style="color: var(--color-text-secondary); margin-top: 1rem; font-size: var(--text-sm);">
          Esta e a questao central desta licao. Ao longo das proximas fases, voce vai
          construir a resposta a partir da estrutura, do processo e das relacoes biologicas.
        </p>
      `;

    case 'visualizacao':
      return `
        <div class="diagram-container" id="diagram-${lesson.id}">
          <p class="diagram-container__title">Diagrama — ${lesson.title}</p>
          <div
            class="diagram-container__svg"
            style="min-height: 240px; display: flex; align-items: center; justify-content: center;
                   background: var(--color-surface-alt); border-radius: var(--radius-md);"
          >
            <p style="color: var(--color-text-muted); font-size: var(--text-sm); font-family: var(--font-mono);">
              Diagrama interativo: ${lesson.title}
            </p>
          </div>
          <div class="concept-diagram__legend">
            ${mod.scales.map(s => `<span class="tag">${s}</span>`).join('')}
          </div>
        </div>
      `;

    case 'processo':
      return `
        <p style="color: var(--color-text-secondary);">
          Descricao mecanistica do processo biologico — como ele ocorre, em que
          sequencia e por que. Conteudo especifico sera carregado do modulo de dados.
        </p>
        <div class="callout callout--info" style="margin-top: 1.5rem;">
          <p class="callout__title">Processo central</p>
          <p>Licao: ${lesson.title} — Modulo: ${mod.title}</p>
        </div>
      `;

    case 'relacao':
      return `
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
          Este processo nao existe isolado. Veja como ele se conecta a outros niveis da vida:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${mod.scales.map(s => `
            <a href="#/escala/${s}" class="badge badge--neutral" style="text-decoration: none;">${s}</a>
          `).join('')}
          ${mod.keyConceptLinks.map(id => `
            <a href="#/modulo/${id}" class="badge badge--org" style="text-decoration: none;">${id}</a>
          `).join('')}
        </div>
      `;

    case 'aplicacao':
      return `
        <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
          Onde este processo aparece no mundo real:
        </p>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${mod.applications.map(app => `
            <a href="#/aplicacao/${app}" class="tag" style="text-decoration: none;">${app}</a>
          `).join('')}
        </div>
      `;

    case 'atividade':
      return `
        <div class="exercise" id="exercise-${lesson.id}">
          <div class="exercise__header">
            <span class="exercise__type">Atividade final</span>
          </div>
          <div class="exercise__body">
            <p class="exercise__question">
              Relacione o que voce aprendeu nesta licao com o fenomeno inicial:
              ${lesson.phenomenon}
            </p>
            <p style="color: var(--color-text-secondary); font-size: var(--text-sm); margin-top: 1rem;">
              Exercicios interativos serao carregados do banco de dados de exercicios.
            </p>
          </div>
          <div class="exercise__footer">
            <button class="btn btn--ghost btn--sm" aria-label="Ver dica">Dica</button>
            <button class="btn btn--primary btn--sm">Continuar</button>
          </div>
        </div>
      `;

    default:
      return `<p>${phase.description}</p>`;
  }
};

/**
 * Renderiza a navegacao entre licoes.
 * @param {object} mod
 * @param {object} currentLesson
 * @returns {string} HTML
 */
const _renderLessonNavigation = (mod, currentLesson) => {
  const sorted  = [...mod.lessons].sort((a, b) => a.order - b.order);
  const idx     = sorted.findIndex(l => l.id === currentLesson.id);
  const prev    = idx > 0 ? sorted[idx - 1] : null;
  const next    = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return `
    <nav aria-label="Navegacao de licoes"
         style="display: flex; justify-content: space-between; margin-top: var(--space-16);
                padding-top: var(--space-8); border-top: 1px solid var(--color-border);">
      <div>
        ${prev ? `<a href="#/modulo/${mod.slug}/${prev.id}" class="btn btn--ghost">
          Anterior: ${prev.title}
        </a>` : ''}
      </div>
      <div>
        ${next ? `<a href="#/modulo/${mod.slug}/${next.id}" class="btn btn--secondary">
          Proxima: ${next.title}
        </a>` : `<a href="#/modulo/${mod.slug}" class="btn btn--primary">
          Concluir modulo
        </a>`}
      </div>
    </nav>
  `;
};

/**
 * Inicializa as interacoes da pagina de licao.
 * @param {HTMLElement} container
 */
const _initLessonInteractions = (container) => {
  // Expandir/colapsar fases ao clicar no titulo
  container.querySelectorAll('.lesson-phase h2').forEach(heading => {
    heading.style.cursor = 'default';
  });

  // Botao de dica
  container.querySelectorAll('[aria-label="Ver dica"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const exercise = btn.closest('.exercise');
      const hint     = exercise?.querySelector('.hint');
      if (hint) {
        hint.classList.toggle('hint--hidden');
      }
    });
  });
};

/**
 * Renderiza a view de um processo biologico especifico.
 * @param {HTMLElement} container
 * @param {string} processId
 */
const _renderProcess = (container, processId) => {
  const processesData = State.getValue('data.processes');
  const process = processesData?.processes.find(p => p.id === processId);

  if (!process) {
    container.innerHTML = `
      <div class="container" style="padding-top: 3rem;">
        <p class="section-label">Processo nao encontrado</p>
        <a href="#/" class="btn btn--secondary" style="margin-top: 1rem;">Voltar</a>
      </div>
    `;
    return;
  }

  const axisColorMap = {
    organization: 'var(--color-axis-org)',
    information:  'var(--color-axis-info)',
    energy:       'var(--color-axis-energy)',
    evolution:    'var(--color-axis-evo)',
  };
  const axisColor = axisColorMap[process.axis] ?? 'var(--color-primary)';

  container.innerHTML = `
    <div class="container" style="padding-top: var(--space-12);">
      <span class="section-label" style="color: ${axisColor};">Processo biologico</span>
      <h1 style="font-family: var(--font-serif); font-size: var(--text-2xl); font-weight: 700;
                 margin-bottom: var(--space-4); letter-spacing: -0.02em;">
        ${process.label}
      </h1>
      <p style="color: var(--color-text-secondary); max-width: 60ch; margin-bottom: var(--space-8);">
        ${process.description}
      </p>

      <section style="margin-bottom: var(--space-8);">
        <h2 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-4);">
          Escalas envolvidas
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${process.scales.map(s => `
            <a href="#/escala/${s}" class="badge badge--neutral">${s}</a>
          `).join('')}
        </div>
      </section>

      <section style="margin-bottom: var(--space-8);">
        <h2 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-4);">
          Exemplos
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${process.examples.map(ex => `<span class="tag">${ex}</span>`).join('')}
        </div>
      </section>

      <section>
        <h2 style="font-size: var(--text-md); font-weight: 600; margin-bottom: var(--space-4);">
          Modulos relacionados
        </h2>
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem;">
          ${process.modules.map(id => `
            <a href="#/modulo/${id}" class="btn btn--ghost btn--sm">${id}</a>
          `).join('')}
        </div>
      </section>
    </div>
  `;
};

const ProcessEngine = { render, getLessonData, LESSON_PHASES };

export default ProcessEngine;
export { render };
