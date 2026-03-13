/**
 * module-card.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a página de detalhe de um módulo.
 * Exibe: cabeçalho, lista de lições, conexões, sidebar com processos/escalas/aplicações.
 */

import State from '../js/state.js';

/** Mapeamento de eixo para cor CSS. */
const AXIS_COLORS = {
  organization: 'var(--color-axis-org)',
  information:  'var(--color-axis-info)',
  energy:       'var(--color-axis-energy)',
  evolution:    'var(--color-axis-evo)',
};

/** Mapeamento de eixo para rótulo em português. */
const AXIS_LABELS = {
  organization: 'Organização da Vida',
  information:  'Informação e Hereditariedade',
  energy:       'Energia e Função',
  evolution:    'Evolução e Ecologia',
};

/**
 * Ponto de entrada do componente.
 * @param {HTMLElement} container
 * @param {{ moduleId: string }} params
 */
const render = (container, params) => {
  const { moduleId } = params;
  const data = State.getValue('data.modules');

  if (!data) {
    container.innerHTML = `<div class="container page-body"><p>Dados não carregados.</p></div>`;
    return;
  }

  const mod = data.modules.find(m => m.slug === moduleId || m.id === moduleId);

  if (!mod) {
    container.innerHTML = `
      <div class="container page-body">
        <p class="section-label" style="color: var(--color-accent-rare);">Módulo não encontrado</p>
        <a href="#/" class="btn btn--secondary" class="error-action">Voltar ao início</a>
      </div>
    `;
    return;
  }

  const axisColor = AXIS_COLORS[mod.axis] ?? 'var(--color-primary)';
  const axisLabel = AXIS_LABELS[mod.axis] ?? mod.axis;

  container.innerHTML = `
    <div class="container page-body">

      <nav aria-label="Localização" class="page-breadcrumb">
        <ol class="breadcrumb">
          <li><a href="#/">Início</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${mod.title}</li>
        </ol>
      </nav>

      <header class="module-header">
        <p class="module-header__axis" style="color: ${axisColor};">
          ${axisLabel} &mdash; Módulo ${mod.number}
        </p>
        <h1 class="module-header__title">${mod.title}</h1>
        <p class="module-header__description">${mod.description}</p>
        <div class="module-header__meta">
          <span class="module-header__meta-item">${mod.estimatedTime}</span>
          <span class="module-header__meta-item">${mod.lessons.length} lições</span>
          <span class="module-header__meta-item">${mod.scales.join(' / ')}</span>
        </div>
      </header>

      <div class="layout-with-sidebar">

        <main>
          <section aria-labelledby="lessons-heading" class="module-section">
            <h2 id="lessons-heading" class="section-heading">Lições</h2>
            <ol class="lesson-list">
              ${mod.lessons.map(lesson => _renderLessonItem(lesson, mod)).join('')}
            </ol>
          </section>

          ${mod.keyConceptLinks.length > 0 ? `
            <section aria-labelledby="related-heading" class="module-section">
              <h2 id="related-heading" class="section-heading">Conexões com outros módulos</h2>
              <div class="related-modules-row">
                ${mod.keyConceptLinks.map(id => _renderRelatedModuleCard(id, data.modules)).join('')}
              </div>
            </section>
          ` : ''}
        </main>

        <aside class="sidebar">
          <div class="sidebar-block">
            <h3 class="sidebar-block__title">Processos</h3>
            <div class="sidebar-block__items">
              ${mod.processes.map(p => `
                <a href="#/processo/${p}" class="tag">${_formatSlug(p)}</a>
              `).join('')}
            </div>
          </div>

          <div class="sidebar-block">
            <h3 class="sidebar-block__title">Escalas</h3>
            <div class="sidebar-block__items">
              ${mod.scales.map(s => `
                <a href="#/escala/${s}" class="badge badge--neutral">${_formatSlug(s)}</a>
              `).join('')}
            </div>
          </div>

          <div class="sidebar-block">
            <h3 class="sidebar-block__title">Aplicações</h3>
            <div class="sidebar-block__items">
              ${mod.applications.map(app => `
                <a href="#/aplicacao/${app}" class="tag">${_formatSlug(app)}</a>
              `).join('')}
            </div>
          </div>
        </aside>

      </div>
    </div>
  `;
};

/**
 * Formata um slug para exibição (troca hífens por espaço, capitaliza).
 * @param {string} slug
 * @returns {string}
 */
const _formatSlug = (slug) =>
  slug.replace(/-/g, ' ').replace(/^\w/, c => c.toUpperCase());

/**
 * Renderiza um item de lição na lista.
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderLessonItem = (lesson, mod) => `
  <li>
    <a href="#/modulo/${mod.slug}/${lesson.id}" class="lesson-item">
      <span class="lesson-item__number">${String(lesson.order).padStart(2, '0')}</span>
      <div class="lesson-item__body">
        <p class="lesson-item__title">${lesson.title}</p>
        <p class="lesson-item__phenomenon">${lesson.phenomenon}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true"
           class="lesson-item__arrow">
        <path d="M9 18 L15 12 L9 6"/>
      </svg>
    </a>
  </li>
`;

/**
 * Renderiza link compacto de módulo relacionado.
 * @param {string} id
 * @param {Array} allModules
 * @returns {string} HTML
 */
const _renderRelatedModuleCard = (id, allModules) => {
  const related = allModules.find(m => m.id === id);
  if (!related) return '';
  return `
    <a href="#/modulo/${related.slug}" class="related-module-link">
      <span class="related-module-link__number">${related.number}</span>
      <span>${related.title}</span>
    </a>
  `;
};

export { render };
export default { render };
