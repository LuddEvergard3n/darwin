/**
 * scale-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsavel pela navegacao entre escalas biologicas.
 * Gerencia:
 *  - Transicoes entre niveis de escala
 *  - Relacoes entre escalas
 *  - Renderizacao da view de escala
 *  - Diagrama SVG das escalas
 */

import State from '../js/state.js';
import Router from '../js/router.js';

/** Ordem das escalas biologicas. */
const SCALE_ORDER = [
  'molecular',
  'cellular',
  'tissue',
  'system',
  'organism',
  'population',
  'ecosystem',
];

/**
 * Retorna a escala anterior a uma dada escala.
 * @param {string} scaleId
 * @returns {string|null}
 */
const getPrev = (scaleId) => {
  const idx = SCALE_ORDER.indexOf(scaleId);
  return idx > 0 ? SCALE_ORDER[idx - 1] : null;
};

/**
 * Retorna a escala seguinte a uma dada escala.
 * @param {string} scaleId
 * @returns {string|null}
 */
const getNext = (scaleId) => {
  const idx = SCALE_ORDER.indexOf(scaleId);
  return idx !== -1 && idx < SCALE_ORDER.length - 1 ? SCALE_ORDER[idx + 1] : null;
};

/**
 * Retorna os dados de uma escala pelo ID.
 * @param {string} scaleId
 * @returns {object|null}
 */
const getScaleData = (scaleId) => {
  const scales = State.getValue('data.scales');
  if (!scales) return null;
  return scales.scales.find(s => s.id === scaleId) ?? null;
};

/**
 * Retorna todos os modulos relacionados a uma escala.
 * @param {string} scaleId
 * @returns {Array}
 */
const getRelatedModules = (scaleId) => {
  const scale = getScaleData(scaleId);
  if (!scale) return [];
  const modules = State.getValue('data.modules');
  if (!modules) return [];
  return modules.modules.filter(m => scale.relatedModules.includes(m.id));
};

/**
 * Renderiza a view de uma escala especifica.
 * @param {HTMLElement} container
 * @param {{ scaleId: string }} params
 */
const render = (container, params) => {
  const { scaleId } = params;
  const scaleData = getScaleData(scaleId);

  if (!scaleData) {
    container.innerHTML = `
      <div class="container">
        <p class="section-label">Escala não encontrada</p>
        <a href="#/" class="btn btn--secondary" class="error-action">Voltar</a>
      </div>
    `;
    return;
  }

  const prev = getPrev(scaleId);
  const next = getNext(scaleId);
  const relatedModules = getRelatedModules(scaleId);

  container.innerHTML = `
    <div class="container page-body">
      <nav aria-label="Escalas" class="page-breadcrumb">
        <ol class="breadcrumb">
          <li><a href="#/">Início</a></li>
          <li class="breadcrumb__sep" aria-hidden="true">/</li>
          <li aria-current="page">Escala ${scaleData.label}</li>
        </ol>
      </nav>

      <header class="module-header">
        <span class="module-header__axis" style="color: ${scaleData.color};">
          Escala ${String(scaleData.order).padStart(2, '0')}
        </span>
        <h1 class="module-header__title">${scaleData.label}</h1>
        <p class="module-header__description">${scaleData.description}</p>
        <div class="module-header__meta">
          <span class="module-header__meta-item">
            Ordem de grandeza: ${scaleData.sublabel}
          </span>
          <span class="module-header__meta-item">
            ${scaleData.examples.length} exemplos
          </span>
        </div>
      </header>

      <!-- Navegacao entre escalas vizinhas -->
      <nav aria-label="Navegação de escala" class="scale-page-nav">
        ${prev ? `<a href="#/escala/${prev}" class="btn btn--ghost">
          Escala anterior: ${_capitalize(prev)}
        </a>` : ''}
        ${next ? `<a href="#/escala/${next}" class="btn btn--secondary">
          Próxima escala: ${_capitalize(next)}
        </a>` : ''}
      </nav>

      <section aria-labelledby="examples-heading" class="module-section">
        <h2 id="examples-heading" class="section-heading">Exemplos nesta escala</h2>
        <div class="tag-row">
          ${scaleData.examples.map(ex => `<span class="tag">${ex}</span>`).join('')}
        </div>
      </section>

      <section aria-labelledby="processes-heading" class="module-section">
        <h2 id="processes-heading" class="section-heading">Processos nesta escala</h2>
        <div class="tag-row">
          ${scaleData.relatedProcesses.map(p => `
            <a href="#/processo/${p}" class="badge badge--neutral">${p}</a>
          `).join('')}
        </div>
      </section>

      ${relatedModules.length > 0 ? `
        <section aria-labelledby="modules-heading" class="module-section">
          <h2 id="modules-heading" class="section-heading">Módulos que cobrem esta escala</h2>
          <div class="card-grid card-grid--3">
            ${relatedModules.map(m => _renderModuleCard(m)).join('')}
          </div>
        </section>
      ` : ''}

    </div>
  `;
};

/**
 * Constroi o SVG do diagrama de escalas para o hero.
 * Retorna o elemento SVG.
 * @param {Array} scales - array de objetos de escala
 * @returns {SVGElement}
 */
const buildHeroDiagram = (scales) => {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 480 400');
  svg.setAttribute('aria-label', 'Diagrama das escalas biológicas, de molecular a ecossistema');
  svg.setAttribute('role', 'img');
  svg.classList.add('hero-diagram');

  const sortedScales = [...scales].sort((a, b) => a.order - b.order);
  const totalScales  = sortedScales.length;
  const centerX      = 240;
  const startY       = 40;
  const stepY        = 50;
  const maxRadius    = 36;
  const minRadius    = 8;

  sortedScales.forEach((scale, i) => {
    const y      = startY + i * stepY;
    // Raio cresce com a ordem (molecular menor, ecosistema maior)
    const ratio  = i / (totalScales - 1);
    const radius = minRadius + ratio * (maxRadius - minRadius);

    const g = document.createElementNS(ns, 'g');
    g.classList.add('scale-node');
    g.setAttribute('role', 'link');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `Escala ${scale.label}: ${scale.sublabel}`);
    g.setAttribute('data-scale', scale.id);

    // Linha de conexao (exceto no ultimo)
    if (i < totalScales - 1) {
      const line = document.createElementNS(ns, 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', y + radius);
      line.setAttribute('x2', centerX);
      line.setAttribute('y2', y + stepY - minRadius - (i + 1) / (totalScales - 1) * (maxRadius - minRadius));
      line.setAttribute('stroke', '#D9E1D8');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4 3');
      svg.appendChild(line);
    }

    // Circulo da escala
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', '#FAFBF8');
    circle.setAttribute('stroke', scale.color);
    circle.setAttribute('stroke-width', '1.5');
    g.appendChild(circle);

    // Label da escala (direita)
    const labelX = centerX + radius + 12;
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', labelX);
    text.setAttribute('y', y + 4);
    text.setAttribute('font-family', 'var(--font-sans, system-ui)');
    text.setAttribute('font-size', '12');
    text.setAttribute('font-weight', '500');
    text.setAttribute('fill', '#5D6B61');
    text.textContent = scale.label;
    g.appendChild(text);

    // Sublabel (ordem de grandeza)
    const sublabel = document.createElementNS(ns, 'text');
    sublabel.setAttribute('x', labelX);
    sublabel.setAttribute('y', y + 17);
    sublabel.setAttribute('font-family', 'var(--font-mono, monospace)');
    sublabel.setAttribute('font-size', '9');
    sublabel.setAttribute('fill', '#7A877E');
    sublabel.textContent = scale.sublabel;
    g.appendChild(sublabel);

    // Interatividade
    g.addEventListener('click', () => Router.push(`#/escala/${scale.id}`));
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        Router.push(`#/escala/${scale.id}`);
      }
    });

    svg.appendChild(g);
  });

  return svg;
};

/** Renderiza um card de modulo compacto. */
const _renderModuleCard = (m) => `
  <a href="#/modulo/${m.slug}" class="module-card">
    <span class="module-card__number">Módulo ${m.number}</span>
    <span class="module-card__title">${m.title}</span>
    <span class="module-card__description">${m.subtitle}</span>
  </a>
`;

/** Capitaliza a primeira letra. */
const _capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const ScaleEngine = { render, buildHeroDiagram, getPrev, getNext, getScaleData, getRelatedModules, SCALE_ORDER };

export default ScaleEngine;
export { render };
