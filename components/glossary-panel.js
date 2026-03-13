/**
 * glossary-panel.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Re-exporta o render do ConceptEngine para o sistema de roteamento.
 * O ConceptEngine e o responsavel real pela logica — este arquivo e apenas
 * o ponto de entrada esperado pelo router para a view 'glossary'.
 */

import ConceptEngine from '../engine/concept-engine.js';

const render = (container, params) => {
  ConceptEngine.render(container, params);
};

export { render };
export default { render };
