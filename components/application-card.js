/**
 * application-card.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a página de detalhe de uma aplicação real.
 * Conecta o contexto concreto aos módulos e processos relevantes.
 */

import State from '../js/state.js';

const AXIS_COLORS = {
  organization: 'var(--color-axis-org)',
  information:  'var(--color-axis-info)',
  energy:       'var(--color-axis-energy)',
  evolution:    'var(--color-axis-evo)',
};

const render = (container, params) => {
  const { applicationId } = params;
  const appData     = State.getValue('data.applications');
  const modulesData = State.getValue('data.modules');
  const processData = State.getValue('data.processes');

  if (!appData || !modulesData) {
    container.innerHTML = `<div class="container page-body"><p>Dados não carregados.</p></div>`;
    return;
  }

  const app = appData.applications.find(
    a => a.slug === applicationId || a.id === applicationId
  );

  if (!app) {
    container.innerHTML = `
      <div class="container page-error">
        <p style="color: var(--color-accent-rare);">Aplicação não encontrada</p>
        <a href="#/" class="btn btn--secondary error-action">Voltar ao início</a>
      </div>
    `;
    return;
  }

  const relatedModules   = modulesData.modules.filter(m => (app.relatedModules ?? []).includes(m.id));
  const relatedProcesses = (app.relatedProcesses ?? []).map(pid => {
    const p = processData?.processes?.find(x => x.id === pid);
    return p ?? { id: pid, label: pid };
  });

  container.innerHTML = `
    <div class="container page-body">

      <nav aria-label="Localização" class="page-breadcrumb">
        <ol class="breadcrumb">
          <li><a href="#/">Início</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li>Aplicações</li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${app.label}</li>
        </ol>
      </nav>

      <header class="page-header">
        <span style="font-family: var(--font-mono); font-size: var(--text-xs);
          text-transform: uppercase; letter-spacing: 0.1em;
          color: var(--color-primary); font-weight: 600; display: block;
          margin-bottom: var(--space-3);">Aplicação real</span>
        <h1 class="page-header__title">${app.label}</h1>
        <p class="page-header__description">${app.description}</p>
      </header>

      <div class="layout-with-sidebar">

        <main>
          ${app.summary ? `
            <section class="module-section" aria-labelledby="summary-heading">
              <h2 id="summary-heading" class="section-heading">Contexto</h2>
              <div class="prose"><p>${app.summary}</p></div>
            </section>
          ` : ''}

          ${app.examples?.length ? `
            <section class="module-section" aria-labelledby="examples-heading">
              <h2 id="examples-heading" class="section-heading">Exemplos concretos</h2>
              <ul class="example-list">
                ${app.examples.map(ex => `
                  <li class="example-list__item">
                    <span class="example-list__bullet" aria-hidden="true">→</span>
                    <span>${ex}</span>
                  </li>
                `).join('')}
              </ul>
            </section>
          ` : ''}

          ${relatedModules.length ? `
            <section class="module-section" aria-labelledby="related-modules-heading">
              <h2 id="related-modules-heading" class="section-heading">Módulos que explicam esta aplicação</h2>
              <div class="card-grid">
                ${relatedModules.map(_renderModuleCard).join('')}
              </div>
            </section>
          ` : ''}
        </main>

        <aside class="sidebar">
          ${relatedProcesses.length ? `
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">Processos biológicos</h3>
              <div class="sidebar-block__items">
                ${relatedProcesses.map(p => `<a href="#/processo/${p.id}" class="tag">${p.label}</a>`).join('')}
              </div>
            </div>
          ` : ''}

          ${relatedModules.length ? `
            <div class="sidebar-block">
              <h3 class="sidebar-block__title">Módulos</h3>
              <div class="sidebar-block__items">
                ${relatedModules.map(m => `<a href="#/modulo/${m.slug}" class="badge badge--neutral">${m.title}</a>`).join('')}
              </div>
            </div>
          ` : ''}

          <div class="sidebar-block">
            <p style="font-size: var(--text-sm); color: var(--color-text-secondary); line-height: 1.65;">
              Esta aplicação é uma entrada no sistema. Os módulos acima cobrem
              os processos que explicam <strong>${app.label}</strong>.
            </p>
          </div>
        </aside>

      </div>
    </div>
  `;
};

const _renderModuleCard = (mod) => {
  const accentColor = AXIS_COLORS[mod.axis] ?? 'var(--color-primary)';
  return `
    <a href="#/modulo/${mod.slug}" class="module-card"
       aria-label="Módulo ${mod.number}: ${mod.title}">
      <span class="module-card__number" style="color: ${accentColor};">
        ${mod.number} — ${mod.title.toUpperCase()}
      </span>
      <h3 class="module-card__title">${mod.title}</h3>
      <p class="module-card__description">${mod.subtitle}</p>
      <div class="module-card__meta">
        <span>${mod.estimatedTime}</span>
        <span>${mod.lessons.length} lições</span>
      </div>
    </a>
  `;
};

export { render };
export default { render };
