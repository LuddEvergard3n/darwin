/**
 * application-card.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a pagina de detalhe de uma aplicacao real.
 * Conecta o contexto concreto aos modulos e processos relevantes.
 */

import State from '../js/state.js';

/**
 * Ponto de entrada do componente.
 * @param {HTMLElement} container
 * @param {{ applicationId: string }} params
 */
const render = (container, params) => {
  const { applicationId } = params;
  const appData     = State.getValue('data.applications');
  const modulesData = State.getValue('data.modules');

  if (!appData || !modulesData) {
    container.innerHTML = `<div class="container"><p>Dados nao carregados.</p></div>`;
    return;
  }

  const app = appData.applications.find(
    a => a.slug === applicationId || a.id === applicationId
  );

  if (!app) {
    container.innerHTML = `
      <div class="container" style="padding-top: 3rem;">
        <p class="section-label" style="color: var(--color-accent-rare);">Aplicacao nao encontrada</p>
        <a href="#/" class="btn btn--secondary" style="margin-top: 1rem;">Voltar ao inicio</a>
      </div>
    `;
    return;
  }

  const relatedModules = modulesData.modules.filter(m =>
    app.relatedModules.includes(m.id)
  );

  container.innerHTML = `
    <div class="container" style="padding-block: var(--space-12);">

      <nav aria-label="Localizacao" style="margin-bottom: var(--space-8);">
        <ol class="breadcrumb">
          <li><a href="#/">Inicio</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li>Aplicacoes</li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">${app.label}</li>
        </ol>
      </nav>

      <header style="margin-bottom: var(--space-12);">
        <span class="section-label">Aplicacao real</span>
        <h1 style="
          font-family: var(--font-serif);
          font-size: var(--text-2xl);
          font-weight: 700;
          letter-spacing: -0.02em;
          margin-bottom: var(--space-4);
          line-height: 1.15;
        ">${app.label}</h1>
        <p style="
          font-size: var(--text-md);
          color: var(--color-text-secondary);
          max-width: 60ch;
          line-height: 1.65;
        ">${app.description}</p>
      </header>

      <section aria-labelledby="related-modules-heading" style="margin-bottom: var(--space-12);">
        <h2 id="related-modules-heading"
            style="font-family: var(--font-serif); font-size: var(--text-xl);
                   font-weight: 600; margin-bottom: var(--space-6);">
          Modulos relacionados
        </h2>
        <div class="card-grid">
          ${relatedModules.map(mod => _renderModuleCard(mod)).join('')}
        </div>
      </section>

      <div class="callout callout--insight">
        <p class="callout__title">Como navegar</p>
        <p>
          Esta aplicacao e uma entrada no sistema. Cada modulo listado acima cobre
          os processos biologicos que explicam o fenomeno de <strong>${app.label}</strong>.
          Escolha um modulo para comecar.
        </p>
      </div>

    </div>
  `;
};

/**
 * Renderiza card de modulo compacto.
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderModuleCard = (mod) => {
  const axisColorMap = {
    organization: 'var(--color-axis-org)',
    information:  'var(--color-axis-info)',
    energy:       'var(--color-axis-energy)',
    evolution:    'var(--color-axis-evo)',
  };
  const accentColor = axisColorMap[mod.axis] ?? 'var(--color-primary)';

  return `
    <a href="#/modulo/${mod.slug}" class="module-card">
      <span class="module-card__number" style="color: ${accentColor};">
        ${mod.number} — ${mod.title.toUpperCase()}
      </span>
      <h3 class="module-card__title">${mod.title}</h3>
      <p class="module-card__description">${mod.subtitle}</p>
      <div class="module-card__meta">
        <span>${mod.estimatedTime}</span>
        <span>${mod.lessons.length} licoes</span>
      </div>
    </a>
  `;
};

export { render };
export default { render };
