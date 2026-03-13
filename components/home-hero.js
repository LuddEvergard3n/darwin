/**
 * home-hero.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Renderiza a página inicial completa:
 *  1. Hero com diagrama SVG de escalas
 *  2. Seção dos 4 eixos
 *  3. Progressão de escalas biológicas
 *  4. Aplicações reais
 *  5. Módulos da V1
 */

import State       from '../js/state.js';
import ScaleEngine from '../engine/scale-engine.js';

/**
 * Ponto de entrada do componente.
 * @param {HTMLElement} container
 * @param {object} params
 */
const render = (container, params) => {
  const data = State.get().data;

  if (!data.axes || !data.modules || !data.scales || !data.applications) {
    container.innerHTML = `
      <div class="container" class="page-error">
        <p class="section-label" style="color: var(--color-accent-rare);">Carregando dados...</p>
      </div>
    `;
    return;
  }

  const axes         = data.axes.axes;
  const modules      = data.modules.modules;
  const scales       = data.scales.scales;
  const applications = data.applications.applications;

  container.innerHTML = `
    ${_renderHero(scales)}
    ${_renderAxesSection(axes)}
    ${_renderScalesSection(scales)}
    ${_renderApplicationsSection(applications)}
    ${_renderModulesSection(modules)}
  `;

  _initHeroSVG(container, scales);
  _initInteractions(container);
};

/* ============================================================
   SEÇÕES DA HOME
   ============================================================ */

const _renderHero = (scales) => `
  <section class="home-hero" aria-labelledby="hero-title">
    <div class="container">
      <div class="hero-layout">

        <div>
          <span class="home-hero__eyebrow">Sistema de Biologia</span>
          <h1 id="hero-title" class="home-hero__title">
            Darwin<br>
            <em>Atlas dos Processos da Vida</em>
          </h1>
          <p class="home-hero__subtitle">
            Da molécula ao ecossistema: compreender a vida como sistema.
            Não uma enciclopédia — uma rede navegável de processos, escalas e relações.
          </p>
          <div class="home-hero__actions">
            <a href="#/modulo/celula" class="btn btn--primary btn--lg">
              Começar pela célula
            </a>
            <a href="#/glossario" class="btn btn--ghost btn--lg">
              Explorar conceitos
            </a>
          </div>
        </div>

        <div id="hero-diagram-container" aria-hidden="true"></div>

      </div>
    </div>
  </section>
`;

const _renderAxesSection = (axes) => `
  <section class="axes-section" aria-labelledby="axes-title">
    <div class="container">
      <header class="section-header">
        <span class="section-label">Quatro eixos</span>
        <h2 id="axes-title" class="section-heading">
          A estrutura do conhecimento biológico
        </h2>
        <p class="section-intro">
          A Biologia não é uma lista de tópicos. São quatro eixos que se cruzam:
          organização, informação, energia e evolução.
        </p>
      </header>

      <div class="axes-grid">
        ${axes.map(axis => _renderAxisCard(axis)).join('')}
      </div>
    </div>
  </section>
`;

const _renderAxisCard = (axis) => {
  const clsMap = {
    organization: 'axis-card--org',
    information:  'axis-card--info',
    energy:       'axis-card--energy',
    evolution:    'axis-card--evo',
  };
  const badgeMap = {
    organization: 'badge--org',
    information:  'badge--info',
    energy:       'badge--energy',
    evolution:    'badge--evo',
  };
  const cls        = clsMap[axis.id]   ?? '';
  const badgeClass = badgeMap[axis.id] ?? 'badge--neutral';

  return `
    <article class="axis-card ${cls}" aria-label="${axis.title}">
      <p class="axis-card__label">${axis.label}</p>
      <h3 class="axis-card__title">${axis.title}</h3>
      <p class="axis-card__description">${axis.description}</p>
      <div class="axis-card__modules">
        ${axis.modules.map(id => `
          <a href="#/modulo/${id}" class="badge ${badgeClass}"
             style="text-decoration: none;">${id}</a>
        `).join('')}
      </div>
    </article>
  `;
};

const _renderScalesSection = (scales) => `
  <section class="scales-section" aria-labelledby="scales-title">
    <div class="container">
      <header class="section-header section-header--centered">
        <span class="section-label">Sete escalas</span>
        <h2 id="scales-title" class="section-heading">Navegue pela escala da vida</h2>
        <p class="section-intro section-intro--centered">
          Do átomo ao ecossistema. Cada escala tem processos próprios e se conecta
          às escalas adjacentes.
        </p>
      </header>

      <nav aria-label="Escalas biológicas" class="scale-progression">
        ${[...scales].sort((a, b) => a.order - b.order).map(scale => `
          <a href="#/escala/${scale.id}"
             class="scale-step"
             aria-label="Escala ${scale.label}: ${scale.description.substring(0, 80)}">
            <div class="scale-step__circle">
              <svg class="scale-step__icon" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                ${_scaleIcon(scale.icon)}
              </svg>
            </div>
            <span class="scale-step__label">${scale.label}</span>
            <span class="scale-step__sublabel">${scale.sublabel}</span>
          </a>
        `).join('')}
      </nav>
    </div>
  </section>
`;

const _renderApplicationsSection = (applications) => `
  <section class="section" aria-labelledby="applications-title">
    <div class="container">
      <header class="section-header">
        <span class="section-label">Aplicações</span>
        <h2 id="applications-title" class="section-heading">Onde a biologia aparece</h2>
        <p class="section-intro">
          Entre por um contexto concreto. Cada aplicação conecta você aos
          processos e módulos relevantes.
        </p>
      </header>

      <div class="card-grid card-grid--3">
        ${applications.map(app => `
          <a href="#/aplicacao/${app.slug}" class="application-card">
            <div class="application-card__icon">
              <svg viewBox="0 0 32 32" fill="none" stroke="currentColor"
                   stroke-width="1.5" aria-hidden="true">
                ${_applicationIcon(app.icon)}
              </svg>
            </div>
            <h3 class="application-card__title">${app.label}</h3>
            <p class="application-card__description">${app.description}</p>
          </a>
        `).join('')}
      </div>
    </div>
  </section>
`;

const _renderModulesSection = (modules) => `
  <section class="section section--alt" aria-labelledby="modules-title">
    <div class="container">
      <header class="section-header">
        <span class="section-label">V1 — Seis módulos</span>
        <h2 id="modules-title" class="section-heading">Núcleo do Darwin</h2>
        <p class="section-intro">
          A primeira versão cobre os processos fundamentais. Cada módulo é uma
          entrada no sistema, não um capítulo isolado.
        </p>
      </header>

      <div class="card-grid">
        ${modules.map(mod => _renderModuleCard(mod)).join('')}
      </div>
    </div>
  </section>
`;

/* ============================================================
   CARDS
   ============================================================ */

const _renderModuleCard = (mod) => {
  const axisColorMap = {
    organization: 'var(--color-axis-org)',
    information:  'var(--color-axis-info)',
    energy:       'var(--color-axis-energy)',
    evolution:    'var(--color-axis-evo)',
  };
  const accentColor = axisColorMap[mod.axis] ?? 'var(--color-primary)';

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

/* ============================================================
   SVG E INTERAÇÕES
   ============================================================ */

/**
 * Insere o diagrama SVG de escalas no hero.
 * @param {HTMLElement} container
 * @param {Array} scales
 */
const _initHeroSVG = (container, scales) => {
  const diagramContainer = container.querySelector('#hero-diagram-container');
  if (!diagramContainer) return;
  const sorted = [...scales].sort((a, b) => a.order - b.order);
  const svg    = ScaleEngine.buildHeroDiagram(sorted);
  diagramContainer.appendChild(svg);
};

/**
 * Inicializa interações da home (hover states).
 * @param {HTMLElement} container
 */
const _initInteractions = (container) => {
  container.querySelectorAll('.scale-step').forEach(step => {
    step.addEventListener('mouseenter', () => step.classList.add('is-active'));
    step.addEventListener('mouseleave', () => step.classList.remove('is-active'));
  });
};

/* ============================================================
   ÍCONES SVG INLINE
   ============================================================ */

const _scaleIcon = (icon) => {
  const icons = {
    molecule:   `<circle cx="8" cy="12" r="3"/><circle cx="16" cy="8" r="2"/><circle cx="16" cy="16" r="2"/><line x1="10.5" y1="10.5" x2="14.5" y2="9"/><line x1="10.5" y1="13.5" x2="14.5" y2="15"/>`,
    cell:       `<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3 Q 15 8 12 12 Q 9 16 12 21"/>`,
    tissue:     `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
    system:     `<circle cx="12" cy="5" r="2"/><circle cx="5" cy="17" r="2"/><circle cx="19" cy="17" r="2"/><path d="M12 7 L5 15 M12 7 L19 15 M7 17 L17 17"/>`,
    organism:   `<path d="M12 2 C 6 2 3 7 3 12 C 3 17 6 22 12 22 C 18 22 21 17 21 12 C 21 7 18 2 12 2"/><path d="M7 12 Q 12 8 17 12 Q 12 16 7 12"/>`,
    population: `<circle cx="8" cy="10" r="3"/><circle cx="16" cy="10" r="3"/><circle cx="12" cy="16" r="3"/><circle cx="4" cy="16" r="2"/><circle cx="20" cy="16" r="2"/>`,
    ecosystem:  `<path d="M3 20 Q 12 4 21 20"/><path d="M3 20 L21 20"/><circle cx="8" cy="14" r="1.5"/><circle cx="16" cy="10" r="1.5"/>`,
    dna:        `<path d="M8 3 C 10 8 14 8 16 13 C 14 18 10 18 8 21"/><path d="M16 3 C 14 8 10 8 8 13 C 10 18 14 18 16 21"/><line x1="9.5" y1="7.5" x2="14.5" y2="7.5"/><line x1="9.5" y1="16.5" x2="14.5" y2="16.5"/>`,
    tree:       `<path d="M12 22 L12 12"/><path d="M12 12 L6 6 L12 2 L18 6 Z"/><path d="M12 17 L7 12 L12 8 L17 12 Z"/>`,
    energy:     `<path d="M13 2 L4.5 13.5 L10 13.5 L11 22 L19.5 10.5 L14 10.5 Z"/>`,
  };
  return icons[icon] ?? icons.cell;
};

const _applicationIcon = (icon) => {
  const icons = {
    health:     `<path d="M16 4 L16 12 L24 12 L24 20 L16 20 L16 28 L8 28 L8 20 L0 20 L0 12 L8 12 L8 4 Z"/>`,
    food:       `<circle cx="16" cy="14" r="10"/><path d="M16 4 Q 24 10 24 18"/><path d="M8 10 Q 10 6 16 4"/>`,
    dna:        `<path d="M8 4 C 12 10 20 10 24 16 C 20 22 12 22 8 28"/><path d="M24 4 C 20 10 12 10 8 16 C 12 22 20 22 24 28"/>`,
    disease:    `<circle cx="16" cy="16" r="12"/><line x1="16" y1="8" x2="16" y2="24"/><line x1="8" y1="16" x2="24" y2="16"/>`,
    environment:`<path d="M4 28 Q 16 4 28 28 Z"/><circle cx="16" cy="16" r="4"/>`,
    agriculture:`<path d="M16 28 L16 8"/><path d="M8 16 Q 16 4 24 16"/><path d="M10 20 Q 16 8 22 20"/>`,
    antibiotics:`<circle cx="16" cy="16" r="6"/><path d="M16 10 L16 4 M16 28 L16 22 M10 16 L4 16 M28 16 L22 16"/>`,
    epidemics:  `<circle cx="16" cy="10" r="4"/><circle cx="8" cy="22" r="3"/><circle cx="24" cy="22" r="3"/><path d="M16 14 L10 19 M16 14 L22 19"/>`,
    biotech:    `<path d="M6 16 L10 8 L14 16 L18 8 L22 16 L26 10"/><circle cx="16" cy="24" r="4"/>`,
  };
  return icons[icon] ?? icons.health;
};

export { render };
export default { render };
