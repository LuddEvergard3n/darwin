/**
 * comparison-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Motor responsavel por:
 *  - Comparar processos biologicos entre si
 *  - Comparar estruturas em diferentes escalas
 *  - Gerar tabelas e diagramas de comparacao
 */

import State from '../js/state.js';

/**
 * Compara dois processos e retorna um objeto estruturado com as diferencas e similitudes.
 * @param {string} processIdA
 * @param {string} processIdB
 * @returns {{ a: object, b: object, shared: object, different: object } | null}
 */
const compareProcesses = (processIdA, processIdB) => {
  const data = State.getValue('data.processes');
  if (!data) return null;

  const a = data.processes.find(p => p.id === processIdA);
  const b = data.processes.find(p => p.id === processIdB);

  if (!a || !b) return null;

  const sharedScales  = a.scales.filter(s => b.scales.includes(s));
  const sharedModules = a.modules.filter(m => b.modules.includes(m));

  return {
    a,
    b,
    shared: { scales: sharedScales, modules: sharedModules },
    different: {
      scalesA:  a.scales.filter(s => !b.scales.includes(s)),
      scalesB:  b.scales.filter(s => !a.scales.includes(s)),
    },
  };
};

/**
 * Compara dois modulos e retorna estrutura comparativa.
 * @param {string} moduleIdA
 * @param {string} moduleIdB
 * @returns {object|null}
 */
const compareModules = (moduleIdA, moduleIdB) => {
  const data = State.getValue('data.modules');
  if (!data) return null;

  const a = data.modules.find(m => m.id === moduleIdA);
  const b = data.modules.find(m => m.id === moduleIdB);

  if (!a || !b) return null;

  const sharedScales       = a.scales.filter(s => b.scales.includes(s));
  const sharedApplications = a.applications.filter(ap => b.applications.includes(ap));

  return { a, b, shared: { scales: sharedScales, applications: sharedApplications } };
};

/**
 * Renderiza uma tabela de comparacao entre dois processos.
 * @param {HTMLElement} container
 * @param {string} processIdA
 * @param {string} processIdB
 */
const renderProcessComparison = (container, processIdA, processIdB) => {
  const comparison = compareProcesses(processIdA, processIdB);
  if (!comparison) {
    container.innerHTML = `<p style="color: var(--color-text-muted);">Comparação não disponível.</p>`;
    return;
  }

  const { a, b, shared } = comparison;

  container.innerHTML = `
    <div class="concept-diagram">
      <div class="concept-diagram__canvas" style="padding: var(--space-6);">
        <p class="diagram-container__title">Comparação de processos</p>
        <table style="
          width: 100%;
          border-collapse: collapse;
          font-size: var(--text-sm);
        ">
          <thead>
            <tr>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border);
                         font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted);
                         font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;">
                Aspecto
              </th>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border);
                         font-family: var(--font-serif); font-size: var(--text-sm);">
                ${a.label}
              </th>
              <th style="padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--color-border);
                         font-family: var(--font-serif); font-size: var(--text-sm);">
                ${b.label}
              </th>
            </tr>
          </thead>
          <tbody>
            ${_comparisonRow('Eixo',    a.axis,                              b.axis)}
            ${_comparisonRow('Escalas', a.scales.join(', '),                 b.scales.join(', '))}
            ${_comparisonRow('Modulos', a.modules.join(', '),                b.modules.join(', '))}
            ${_comparisonRow('Exemplos', a.examples.slice(0,2).join(', '),   b.examples.slice(0,2).join(', '))}
          </tbody>
        </table>

        ${shared.scales.length > 0 ? `
          <div class="callout callout--info" >
            <p class="callout__title">Escalas em comum</p>
            <div class="related-modules-row">
              ${shared.scales.map(s => `<span class="tag">${s}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
};

/**
 * Gera uma linha de comparacao.
 * @param {string} label
 * @param {string} valueA
 * @param {string} valueB
 * @returns {string} HTML
 */
const _comparisonRow = (label, valueA, valueB) => `
  <tr>
    <td style="padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--color-border);
               font-family: var(--font-mono); font-size: var(--text-xs); color: var(--color-text-muted);
               font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
      ${label}
    </td>
    <td style="padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--color-border); vertical-align: top;">
      ${valueA}
    </td>
    <td style="padding: 0.625rem 0.75rem; border-bottom: 1px solid var(--color-border); vertical-align: top;">
      ${valueB}
    </td>
  </tr>
`;

const ComparisonEngine = { compareProcesses, compareModules, renderProcessComparison };

export default ComparisonEngine;
