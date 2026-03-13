/**
 * application-card.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a página de detalhe de uma aplicação real.
 * Conecta o contexto concreto aos módulos e processos relevantes.
 */

import State from '../js/state.js';

/** Mapeamento de eixo para cor CSS. */
const AXIS_COLORS = {
  organization: 'var(--color-axis-org)',
  information:  'var(--color-axis-info)',
  energy:       'var(--color-axis-energy)',
  evolution:    'var(--color-axis-evo)',
};

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
    container.innerHTML = `<div class="container page-body"><p>Dados não carregados.</p></div>`;
    return;
  }

  const app = appData.applications.find(
    a => a.slug === applicationId || a.id === applicationId
  );

  if (!app) {
    container.innerHTML = `
      <div class="container page-error">
        <p class="section-label" style="color: var(--color-accent-rare);">Aplicação não encontrada</p>
        <a href="#/" class="btn btn--secondary error-action">Voltar ao início</a>
      </div>
    `;
    return;
  }

  const relatedModules = modulesData.modules.filter(m =>
    app.relatedModules.includes(m.id)
  );

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
        <span class="section-label">Aplicação real</span>
        <h1 class="page-header__title">${app.label}</h1>
        <p class="page-header__description">${app.description}</p>
      </header>

      <section aria-labelledby="related-modules-heading" class="module-section">
        <h2 id="related-modules-heading" class="section-heading">Módulos relacionados</h2>
        <div class="card-grid">
          ${relatedModules.map(mod => _renderModuleCard(mod)).join('')}
        </div>
      </section>

      <div class="callout callout--insight">
        <p class="callout__title">Como navegar</p>
        <p>
          Esta aplicação é uma entrada no sistema. Cada módulo listado acima cobre
          os processos biológicos que explicam o fenômeno de <strong>${app.label}</strong>.
          Escolha um módulo para começar.
        </p>
      </div>

    </div>
  `;
};

/**
 * Renderiza card de módulo compacto.
 * @param {object} mod
 * @returns {string} HTML
 */
const _renderModuleCard = (mod) => {
  const accentColor = AXIS_COLORS[mod.axis] ?? 'var(--color-primary)';
  return `
    <a href="#/modulo/${mod.slug}" class="module-card">
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
