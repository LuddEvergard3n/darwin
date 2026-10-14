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
 * Retorna o elemento SVG com círculos proporcionais, ícones e rótulos.
 * @param {Array} scales - array de objetos de escala
 * @returns {SVGElement}
 */
const buildHeroDiagram = (scales) => {
  const ns     = 'http://www.w3.org/2000/svg';
  const W      = 420;
  const H      = 540;
  const svg    = document.createElementNS(ns, 'svg');

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('aria-label', 'Diagrama das escalas biológicas, de molecular a ecossistema');
  svg.setAttribute('role', 'img');
  svg.classList.add('hero-diagram');

  const sorted   = [...scales].sort((a, b) => a.order - b.order);
  const total    = sorted.length;
  const centerX  = 155;
  const startY   = 50;
  const minR     = 8;
  const maxR     = 44;
  const stepY    = (H - maxR - 10 - startY) / (total - 1);

  // Defs: marcador de seta
  const defs   = document.createElementNS(ns, 'defs');
  const marker = document.createElementNS(ns, 'marker');
  marker.setAttribute('id', 'hero-arrow');
  marker.setAttribute('viewBox', '0 0 8 8');
  marker.setAttribute('refX', '7');
  marker.setAttribute('refY', '4');
  marker.setAttribute('markerWidth', '5');
  marker.setAttribute('markerHeight', '5');
  marker.setAttribute('orient', 'auto-start-reverse');
  const mp = document.createElementNS(ns, 'path');
  mp.setAttribute('d', 'M 0 1 L 7 4 L 0 7 Z');
  mp.setAttribute('fill', '#C9D3C8');
  marker.appendChild(mp);
  defs.appendChild(marker);
  svg.appendChild(defs);

  sorted.forEach((scale, i) => {
    const y     = startY + i * stepY;
    const ratio = i / (total - 1);
    const r     = Math.round(minR + ratio * (maxR - minR));

    const g = document.createElementNS(ns, 'g');
    g.classList.add('scale-node');
    g.setAttribute('role', 'link');
    g.setAttribute('tabindex', '0');
    g.setAttribute('aria-label', `Escala ${scale.label}`);
    g.setAttribute('data-scale', scale.id);
    g.style.cursor = 'pointer';

    // Linha de conexão
    if (i < total - 1) {
      const nextR = Math.round(minR + ((i + 1) / (total - 1)) * (maxR - minR));
      const nextY = startY + (i + 1) * stepY;
      const line  = document.createElementNS(ns, 'line');
      line.setAttribute('x1', centerX);
      line.setAttribute('y1', y + r + 3);
      line.setAttribute('x2', centerX);
      line.setAttribute('y2', nextY - nextR - 3);
      line.setAttribute('stroke', '#D9E1D8');
      line.setAttribute('stroke-width', '1.5');
      line.setAttribute('stroke-dasharray', '4 3');
      line.setAttribute('marker-end', 'url(#hero-arrow)');
      svg.appendChild(line);
    }

    // Halo
    const halo = document.createElementNS(ns, 'circle');
    halo.setAttribute('cx', centerX);
    halo.setAttribute('cy', y);
    halo.setAttribute('r', r + 6);
    halo.setAttribute('fill', `${scale.color}18`);
    halo.setAttribute('stroke', 'none');
    g.appendChild(halo);

    // Círculo principal
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', centerX);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', r);
    circle.setAttribute('fill', '#FAFBF8');
    circle.setAttribute('stroke', scale.color);
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    // Ícone SVG inline dentro do círculo
    const iconPaths = {
      molecule:   'M4 10 a3 3 0 1 1 6 0 a3 3 0 1 1-6 0 M13 6 a2 2 0 1 1 4 0 a2 2 0 1 1-4 0 M13 14 a2 2 0 1 1 4 0 a2 2 0 1 1-4 0 M10 10 L14 7 M10 10 L14 14',
      cell:       'M10 10 m-8 0 a8 8 0 1 1 16 0 a8 8 0 1 1-16 0 M10 10 m-3.5 0 a3.5 3.5 0 1 1 7 0 a3.5 3.5 0 1 1-7 0',
      tissue:     'M2 2 h6 v6 h-6Z M12 2 h6 v6 h-6Z M2 12 h6 v6 h-6Z M12 12 h6 v6 h-6Z',
      system:     'M10 2 v16 M2 10 h16 M5 5 Q10 2 15 5 M5 15 Q10 18 15 15',
      organism:   'M10 1 C4 1 1 6 1 10 C1 15 4 19 10 19 C16 19 19 15 19 10 C19 6 16 1 10 1 M4 10 Q10 6 16 10 Q10 14 4 10',
      population: 'M5 7 a3 3 0 1 1 .01 0 M15 7 a3 3 0 1 1 .01 0 M10 14 a3 3 0 1 1 .01 0 M2 17 a2 2 0 1 1 .01 0 M18 17 a2 2 0 1 1 .01 0',
      ecosystem:  'M1 18 Q10 2 19 18 M1 18 L19 18 M6 13 a1.5 1.5 0 1 1 .01 0 M14 9 a1.5 1.5 0 1 1 .01 0',
    };
    const iconSize = Math.max(12, Math.min(r * 1.1, 20));
    const iconOff  = iconSize / 2;
    const iconG    = document.createElementNS(ns, 'g');
    iconG.setAttribute('transform', `translate(${centerX - iconOff}, ${y - iconOff})`);
    iconG.setAttribute('stroke', scale.color);
    iconG.setAttribute('stroke-width', '1.5');
    iconG.setAttribute('fill', 'none');
    // Scale icon path to actual icon size
    const iconSvg = document.createElementNS(ns, 'svg');
    iconSvg.setAttribute('width', String(iconSize));
    iconSvg.setAttribute('height', String(iconSize));
    iconSvg.setAttribute('viewBox', '0 0 20 20');
    const iconPath = document.createElementNS(ns, 'path');
    iconPath.setAttribute('d', iconPaths[scale.icon] ?? iconPaths.cell);
    iconSvg.appendChild(iconPath);
    iconG.appendChild(iconSvg);
    g.appendChild(iconG);

    // Label e sublabel à direita
    const lx = centerX + r + 14;

    const labelEl = document.createElementNS(ns, 'text');
    labelEl.setAttribute('x', lx);
    labelEl.setAttribute('y', y - (scale.sublabel ? 6 : 0));
    labelEl.setAttribute('font-family', "'Source Sans 3', system-ui, sans-serif");
    labelEl.setAttribute('font-size', '13');
    labelEl.setAttribute('font-weight', '600');
    labelEl.setAttribute('fill', '#233128');
    labelEl.setAttribute('dominant-baseline', 'central');
    labelEl.textContent = scale.label;
    g.appendChild(labelEl);

    const subEl = document.createElementNS(ns, 'text');
    subEl.setAttribute('x', lx);
    subEl.setAttribute('y', y + 10);
    subEl.setAttribute('font-family', "'DM Mono', monospace");
    subEl.setAttribute('font-size', '10');
    subEl.setAttribute('fill', scale.color);
    subEl.setAttribute('dominant-baseline', 'central');
    subEl.textContent = scale.sublabel ?? '';
    g.appendChild(subEl);

    // Exemplo (primeiro da lista)
    if (scale.examples?.[0] && r >= 18) {
      const exEl = document.createElementNS(ns, 'text');
      exEl.setAttribute('x', lx);
      exEl.setAttribute('y', y + 25);
      exEl.setAttribute('font-family', "'Source Sans 3', system-ui, sans-serif");
      exEl.setAttribute('font-size', '10');
      exEl.setAttribute('fill', '#7A877E');
      exEl.setAttribute('dominant-baseline', 'central');
      exEl.textContent = scale.examples[0];
      g.appendChild(exEl);
    }

    // Hover
    g.addEventListener('mouseenter', () => {
      circle.setAttribute('fill', `${scale.color}12`);
      circle.setAttribute('stroke-width', '2.5');
    });
    g.addEventListener('mouseleave', () => {
      circle.setAttribute('fill', '#FAFBF8');
      circle.setAttribute('stroke-width', '2');
    });

    // Navegação
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
