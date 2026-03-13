/**
 * module-card.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a pagina de detalhe de um modulo.
 * Exibe: cabecalho, lista de licoes, conceitos-chave, exercicios disponiveis.
 */

import State from '../js/state.js';

/**
 * Ponto de entrada do componente.
 * @param {HTMLElement} container
 * @param {{ moduleId: string }} params
 */
const render = (container, params) => {
  const { moduleId } = params;
  const data = State.getValue('data.modules');

  if (!data) {
    container.innerHTML = `<div class="container"><p>Dados nao carregados.</p></div>`;
    return;
  }

  const mod = data.modules.find(m => m.slug === moduleId || m.id === moduleId);

  if (!mod) {
    container.innerHTML = `
      <div class="container" style="padding-top: 3rem;">
        <p class="section-label" style="color: var(--color-accent-rare);">Modulo nao encontrado</p>
        <a href="#/" class="btn btn--secondary" style="margin-top: 1rem;">Voltar ao inicio</a>
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
  const axisLabelMap = {
    organization: 'Organizacao da Vida',
    information:  'Informacao e Hereditariedade',
    energy:       'Energia e Funcao',
    evolution:    'Evolucao e Ecologia',
  };

  const axisColor = axisColorMap[mod.axis] ?? 'var(--color-primary)';
  const axisLabel = axisLabelMap[mod.axis] ?? mod.axis;

  container.innerHTML = `
    <div class="container">

      <nav aria-label="Localizacao" style="padding-top: var(--space-8); margin-bottom: var(--space-6);">
        <ol class="breadcrumb">
          <li><a href="#/">Inicio</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${mod.title}</li>
        </ol>
      </nav>

      <header class="module-header">
        <p class="module-header__axis" style="color: ${axisColor};">
          ${axisLabel} &mdash; Modulo ${mod.number}
        </p>
        <h1 class="module-header__title">${mod.title}</h1>
        <p class="module-header__description">${mod.description}</p>
        <div class="module-header__meta">
          <span class="module-header__meta-item">${mod.estimatedTime}</span>
          <span class="module-header__meta-item">${mod.lessons.length} licoes</span>
          <span class="module-header__meta-item">${mod.scales.join(' / ')}</span>
        </div>
      </header>

      <div class="layout-with-sidebar">

        <main>
          <section aria-labelledby="lessons-heading" style="margin-bottom: var(--space-12);">
            <h2 id="lessons-heading"
                style="font-family: var(--font-serif); font-size: var(--text-xl);
                       font-weight: 600; margin-bottom: var(--space-6);">
              Licoes
            </h2>
            <ol class="stack stack--md" style="list-style: none; padding: 0;">
              ${mod.lessons.map(lesson => _renderLessonItem(lesson, mod)).join('')}
            </ol>
          </section>

          ${mod.keyConceptLinks.length > 0 ? `
            <section aria-labelledby="related-heading" style="margin-bottom: var(--space-12);">
              <h2 id="related-heading"
                  style="font-family: var(--font-serif); font-size: var(--text-xl);
                         font-weight: 600; margin-bottom: var(--space-6);">
                Conexoes com outros modulos
              </h2>
              <div style="display: flex; flex-wrap: wrap; gap: var(--space-4);">
                ${mod.keyConceptLinks.map(id => _renderRelatedModuleCard(id, data.modules)).join('')}
              </div>
            </section>
          ` : ''}
        </main>

        <aside class="sidebar">
          <div class="card" style="margin-bottom: var(--space-6);">
            <h3 style="font-family: var(--font-serif); font-size: var(--text-md);
                       font-weight: 600; margin-bottom: var(--space-4);">
              Processos
            </h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${mod.processes.map(p => `
                <a href="#/processo/${p}" class="tag" style="display: inline-block; text-decoration: none;">
                  ${p}
                </a>
              `).join('')}
            </div>
          </div>

          <div class="card" style="margin-bottom: var(--space-6);">
            <h3 style="font-family: var(--font-serif); font-size: var(--text-md);
                       font-weight: 600; margin-bottom: var(--space-4);">
              Escalas
            </h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${mod.scales.map(s => `
                <a href="#/escala/${s}" class="badge badge--neutral" style="text-decoration: none;">
                  ${s}
                </a>
              `).join('')}
            </div>
          </div>

          <div class="card">
            <h3 style="font-family: var(--font-serif); font-size: var(--text-md);
                       font-weight: 600; margin-bottom: var(--space-4);">
              Aplicacoes
            </h3>
            <div style="display: flex; flex-direction: column; gap: var(--space-2);">
              ${mod.applications.map(app => `
                <a href="#/aplicacao/${app}" class="tag" style="display: inline-block; text-decoration: none;">
                  ${app}
                </a>
              `).join('')}
            </div>
          </div>
        </aside>

      </div>
    </div>
  `;
};

/**
 * Renderiza um item de licao na lista.
 * @param {object} lesson
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderLessonItem = (lesson, mod) => `
  <li>
    <a href="#/modulo/${mod.slug}/${lesson.id}"
       style="
         display: flex;
         align-items: flex-start;
         gap: var(--space-4);
         padding: var(--space-5) var(--space-6);
         background: var(--color-surface);
         border: 1px solid var(--color-border);
         border-radius: var(--radius-lg);
         text-decoration: none;
         color: inherit;
         transition: box-shadow var(--transition-base), transform var(--transition-base);
       "
       onmouseenter="this.style.boxShadow='var(--shadow-md)'; this.style.transform='translateY(-1px)'"
       onmouseleave="this.style.boxShadow=''; this.style.transform=''">
      <span style="
        font-family: var(--font-mono);
        font-size: var(--text-xs);
        color: var(--color-text-muted);
        min-width: 28px;
        padding-top: 3px;
        letter-spacing: 0.04em;
      ">${String(lesson.order).padStart(2, '0')}</span>
      <div style="flex: 1;">
        <p style="
          font-family: var(--font-serif);
          font-size: var(--text-md);
          font-weight: 600;
          line-height: 1.25;
          margin-bottom: var(--space-2);
        ">${lesson.title}</p>
        <p style="
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          font-style: italic;
          line-height: 1.5;
        ">${lesson.phenomenon}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2" aria-hidden="true"
           style="flex-shrink: 0; margin-top: 4px; color: var(--color-text-muted);">
        <path d="M9 18 L15 12 L9 6"/>
      </svg>
    </a>
  </li>
`;

/**
 * Renderiza card compacto de modulo relacionado.
 * @param {string} id
 * @param {Array} allModules
 * @returns {string} HTML
 */
const _renderRelatedModuleCard = (id, allModules) => {
  const related = allModules.find(m => m.id === id);
  if (!related) return '';
  return `
    <a href="#/modulo/${related.slug}"
       style="
         display: flex;
         align-items: center;
         gap: var(--space-3);
         padding: var(--space-3) var(--space-5);
         background: var(--color-surface);
         border: 1px solid var(--color-border);
         border-radius: var(--radius-md);
         text-decoration: none;
         color: var(--color-text-secondary);
         font-size: var(--text-sm);
         transition: background var(--transition-fast);
       "
       onmouseenter="this.style.background='var(--color-surface-alt)'"
       onmouseleave="this.style.background='var(--color-surface)'">
      <span style="font-family: var(--font-mono); font-size: var(--text-xs);">${related.number}</span>
      <span>${related.title}</span>
    </a>
  `;
};

export { render };
export default { render };
