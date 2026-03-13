/**
 * concept-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsavel por:
 *  - Glossario contextual de conceitos
 *  - Relacoes entre conceitos
 *  - Ligacoes conceito <-> modulo <-> escala
 *  - Renderizacao da view de glossario
 */

import State from '../js/state.js';

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
 * Renderiza a view completa do glossario.
 * @param {HTMLElement} container
 * @param {object} params
 */
const render = (container, params) => {
  const data = State.getValue('data.glossary');
  if (!data) {
    container.innerHTML = `<div class="container"><p>Dados do glossario nao carregados.</p></div>`;
    return;
  }

  const groupedByAxis = _groupByAxis(data.glossary);

  container.innerHTML = `
    <div class="container" style="padding-block: var(--space-12);">
      <header style="margin-bottom: var(--space-12);">
        <span class="section-label">Glossario</span>
        <h1 style="font-family: var(--font-serif); font-size: var(--text-2xl); font-weight: 700;
                   letter-spacing: -0.02em; margin-bottom: var(--space-4);">
          Conceitos biologicos
        </h1>
        <p style="color: var(--color-text-secondary); max-width: 60ch;">
          Termos organizados por eixo tematico. Cada conceito esta conectado aos
          modulos e escalas em que aparece.
        </p>
      </header>

      <!-- Busca -->
      <div style="margin-bottom: var(--space-8);">
        <label for="glossary-search" class="sr-only">Buscar conceitos</label>
        <input
          id="glossary-search"
          type="search"
          placeholder="Buscar conceito..."
          aria-label="Buscar no glossario"
          style="
            width: 100%;
            max-width: 400px;
            padding: 0.625rem 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--radius-md);
            background: var(--color-surface);
            font-family: var(--font-sans);
            font-size: var(--text-sm);
            color: var(--color-text);
          "
        />
        <div id="glossary-search-results" style="margin-top: 1rem; display: none;"></div>
      </div>

      <!-- Conceitos por eixo -->
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
const _groupByAxis = (concepts) => {
  return concepts.reduce((acc, concept) => {
    if (!acc[concept.axis]) acc[concept.axis] = [];
    acc[concept.axis].push(concept);
    return acc;
  }, {});
};

const AXIS_META = {
  organization: { label: 'Organizacao da Vida',          colorClass: 'badge--org' },
  information:  { label: 'Informacao e Hereditariedade', colorClass: 'badge--info' },
  energy:       { label: 'Energia e Funcao',             colorClass: 'badge--energy' },
  evolution:    { label: 'Evolucao e Ecologia',          colorClass: 'badge--evo' },
};

/**
 * Renderiza uma secao de eixo no glossario.
 * @param {string} axisId
 * @param {Array} concepts
 * @returns {string} HTML
 */
const _renderAxisSection = (axisId, concepts) => {
  const meta = AXIS_META[axisId] ?? { label: axisId, colorClass: 'badge--neutral' };
  return `
    <section aria-labelledby="axis-heading-${axisId}">
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: var(--space-6);">
        <h2 id="axis-heading-${axisId}"
            style="font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 600;">
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
 * Renderiza um item do glossario.
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
      <p style="margin-bottom: 0.75rem;">${concept.definition}</p>
      ${concept.relatedTerms.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
          <span style="font-size: var(--text-xs); color: var(--color-text-muted); font-family: var(--font-mono);">
            Relacionados:
          </span>
          ${concept.relatedTerms.map(id => `
            <button class="tag" data-concept-link="${id}" style="cursor: pointer; border: none; background: var(--color-surface-alt);">
              ${id}
            </button>
          `).join('')}
        </div>
      ` : ''}
      ${concept.modules.length > 0 ? `
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
          <span style="font-size: var(--text-xs); color: var(--color-text-muted); font-family: var(--font-mono);">
            Modulos:
          </span>
          ${concept.modules.map(id => `
            <a href="#/modulo/${id}" class="badge badge--neutral" style="text-decoration: none;">${id}</a>
          `).join('')}
        </div>
      ` : ''}
    </div>
  </li>
`;

/**
 * Inicializa as interacoes do glossario.
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

  // Busca
  const searchInput = container.querySelector('#glossary-search');
  const searchResults = container.querySelector('#glossary-search-results');
  const glossaryContent = container.querySelector('#glossary-content');

  if (searchInput && searchResults && glossaryContent) {
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (query.length < 2) {
        searchResults.style.display = 'none';
        glossaryContent.style.display = '';
        return;
      }

      const results = search(query);
      glossaryContent.style.display = 'none';
      searchResults.style.display = '';

      if (results.length === 0) {
        searchResults.innerHTML = `
          <p style="color: var(--color-text-muted); font-size: var(--text-sm);">
            Nenhum conceito encontrado para "${query}".
          </p>
        `;
      } else {
        searchResults.innerHTML = `
          <div class="glossary-panel">
            <ul class="glossary-panel__list" role="list">
              ${results.map(c => _renderGlossaryItem(c)).join('')}
            </ul>
          </div>
        `;
        // Re-inicializar interacoes nos resultados
        searchResults.querySelectorAll('.glossary-panel__item').forEach(item => {
          item.addEventListener('click', () => {
            item.classList.toggle('is-open');
          });
        });
      }
    });
  }
};

const ConceptEngine = { render, getConcept, getRelated, getByAxis, search };

export default ConceptEngine;
export { render };
