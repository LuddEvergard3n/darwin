/**
 * concept-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsável por:
 *  - Glossário contextual de conceitos
 *  - Relações entre conceitos
 *  - Ligações conceito <-> módulo <-> escala
 *  - Renderização da view de glossário
 */

import State from '../js/state.js';

/** Metadados de cada eixo para exibição no glossário. */
const AXIS_META = {
  organization: { label: 'Organização da Vida',          colorClass: 'badge--org' },
  information:  { label: 'Informação e Hereditariedade', colorClass: 'badge--info' },
  energy:       { label: 'Energia e Função',             colorClass: 'badge--energy' },
  evolution:    { label: 'Evolução e Ecologia',          colorClass: 'badge--evo' },
};

/**
 * Retorna um conceito pelo ID.
 * @param {string} conceptId
 * @returns {object|null}
 */
const getConcept = (conceptId) => {
  const data = State.getValue('data.glossary');
  if (!data) return null;
  return data.glossary.find(c => c.id === conceptId) ?? null;
};

/**
 * Retorna conceitos relacionados a um conceito.
 * @param {string} conceptId
 * @returns {Array}
 */
const getRelated = (conceptId) => {
  const concept = getConcept(conceptId);
  if (!concept) return [];
  const data = State.getValue('data.glossary');
  if (!data) return [];
  return concept.relatedTerms
    .map(id => data.glossary.find(c => c.id === id))
    .filter(Boolean);
};

/**
 * Retorna conceitos filtrados por eixo.
 * @param {string} axisId
 * @returns {Array}
 */
const getByAxis = (axisId) => {
  const data = State.getValue('data.glossary');
  if (!data) return [];
  return data.glossary.filter(c => c.axis === axisId);
};

/**
 * Busca conceitos por termo (case-insensitive, busca parcial).
 * @param {string} query
 * @returns {Array}
 */
const search = (query) => {
  if (!query || query.length < 2) return [];
  const data = State.getValue('data.glossary');
  if (!data) return [];
  const normalized = query.toLowerCase();
  return data.glossary.filter(c =>
    c.term.toLowerCase().includes(normalized) ||
    c.definition.toLowerCase().includes(normalized)
  );
};

/**
 * Renderiza a view completa do glossário.
 * @param {HTMLElement} container
 * @param {object} params
 */
const render = (container, params) => {
  const data = State.getValue('data.glossary');
  if (!data) {
    container.innerHTML = `<div class="container page-body"><p>Dados do glossário não carregados.</p></div>`;
    return;
  }

  const groupedByAxis = _groupByAxis(data.glossary);

  container.innerHTML = `
    <div class="container page-body">
      <header class="page-header">
        <span class="section-label">Glossário</span>
        <h1 class="page-header__title">Conceitos biológicos</h1>
        <p class="page-header__description">
          Termos organizados por eixo temático. Cada conceito está conectado aos
          módulos e escalas em que aparece.
        </p>
      </header>

      <div class="search-bar">
        <label for="glossary-search" class="sr-only">Buscar conceitos</label>
        <input
          id="glossary-search"
          type="search"
          placeholder="Buscar conceito..."
          aria-label="Buscar no glossário"
          class="search-bar__input"
        />
        <div id="glossary-search-results" style="display: none;"></div>
      </div>

      <div class="stack stack--xl" id="glossary-content">
        ${Object.entries(groupedByAxis).map(([axisId, concepts]) =>
          _renderAxisSection(axisId, concepts)
        ).join('')}
      </div>
    </div>
  `;

  _initGlossaryInteractions(container);
};

/**
 * Agrupa conceitos por eixo.
 * @param {Array} concepts
 * @returns {object}
 */
const _groupByAxis = (concepts) =>
  concepts.reduce((acc, concept) => {
    if (!acc[concept.axis]) acc[concept.axis] = [];
    acc[concept.axis].push(concept);
    return acc;
  }, {});

/**
 * Renderiza uma seção de eixo no glossário.
 * @param {string} axisId
 * @param {Array} concepts
 * @returns {string} HTML
 */
const _renderAxisSection = (axisId, concepts) => {
  const meta = AXIS_META[axisId] ?? { label: axisId, colorClass: 'badge--neutral' };
  return `
    <section aria-labelledby="axis-heading-${axisId}">
      <div class="axis-section-header">
        <h2 id="axis-heading-${axisId}" class="axis-section-header__title">
          ${meta.label}
        </h2>
        <span class="badge ${meta.colorClass}">${concepts.length} conceitos</span>
      </div>
      <div class="glossary-panel">
        <ul class="glossary-panel__list" role="list">
          ${concepts.map(c => _renderGlossaryItem(c)).join('')}
        </ul>
      </div>
    </section>
  `;
};

/**
 * Renderiza um item do glossário.
 * @param {object} concept
 * @returns {string} HTML
 */
const _renderGlossaryItem = (concept) => `
  <li class="glossary-panel__item"
      role="button"
      tabindex="0"
      aria-expanded="false"
      data-concept-id="${concept.id}">
    <p class="glossary-panel__term">${concept.term}</p>
    <div class="glossary-panel__definition">
      <p class="glossary-definition">${concept.definition}</p>
      ${concept.relatedTerms.length > 0 ? `
        <div class="concept-links">
          <span class="concept-links__label">Relacionados:</span>
          ${concept.relatedTerms.map(id => `
            <button class="tag" data-concept-link="${id}"
                    style="cursor: pointer; border: none; background: var(--color-surface-alt);">
              ${id}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${concept.modules.length > 0 ? `
        <div class="concept-links">
          <span class="concept-links__label">Módulos:</span>
          ${concept.modules.map(id => `
            <a href="#/modulo/${id}" class="badge badge--neutral"
               style="text-decoration: none;">${id}</a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </li>
`;

/**
 * Inicializa as interações do glossário.
 * @param {HTMLElement} container
 */
const _initGlossaryInteractions = (container) => {
  // Expandir/colapsar items
  container.querySelectorAll('.glossary-panel__item').forEach(item => {
    const toggle = () => {
      const isOpen = item.classList.toggle('is-open');
      item.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    };
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });

  // Busca live
  const searchInput    = container.querySelector('#glossary-search');
  const searchResults  = container.querySelector('#glossary-search-results');
  const glossaryContent = container.querySelector('#glossary-content');

  if (!searchInput || !searchResults || !glossaryContent) return;

  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();

    if (query.length < 2) {
      searchResults.style.display  = 'none';
      glossaryContent.style.display = '';
      return;
    }

    const results = search(query);
    glossaryContent.style.display = 'none';
    searchResults.style.display   = '';

    if (results.length === 0) {
      searchResults.innerHTML = `
        <p class="empty-state__text">Nenhum conceito encontrado para &ldquo;${query}&rdquo;.</p>
      `;
    } else {
      searchResults.innerHTML = `
        <div class="glossary-panel">
          <ul class="glossary-panel__list" role="list">
            ${results.map(c => _renderGlossaryItem(c)).join('')}
          </ul>
        </div>
      `;
      // Re-inicializar toggle nos resultados dinâmicos
      searchResults.querySelectorAll('.glossary-panel__item').forEach(item => {
        item.addEventListener('click', () => item.classList.toggle('is-open'));
      });
    }
  });
};

const ConceptEngine = { render, getConcept, getRelated, getByAxis, search };

export default ConceptEngine;
export { render };
