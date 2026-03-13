/**
 * test-runner.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Runner de testes automatizados via Node.js.
 * Executa: data-tests, module-tests, consistency-tests.
 *
 * Uso: node tests/test-runner.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/* ============================================================
   UTILITARIOS DE TESTE
   ============================================================ */

let _passed = 0;
let _failed = 0;
const _results = [];

/**
 * Registra um teste.
 * @param {string} name
 * @param {function} fn - funcao que lanca excecao em falha
 */
const test = (name, fn) => {
  try {
    fn();
    _passed++;
    _results.push({ status: 'PASS', name });
    process.stdout.write('.');
  } catch (err) {
    _failed++;
    _results.push({ status: 'FAIL', name, error: err.message });
    process.stdout.write('F');
  }
};

/**
 * Asserções basicas.
 */
const assert = {
  ok: (value, msg) => {
    if (!value) throw new Error(msg ?? `Esperado valor truthy, recebeu: ${value}`);
  },
  equal: (a, b, msg) => {
    if (a !== b) throw new Error(msg ?? `Esperado ${b}, recebeu ${a}`);
  },
  isArray: (value, msg) => {
    if (!Array.isArray(value)) throw new Error(msg ?? `Esperado array, recebeu ${typeof value}`);
  },
  hasKey: (obj, key, msg) => {
    if (!(key in obj)) throw new Error(msg ?? `Chave ausente: ${key}`);
  },
  notEmpty: (arr, msg) => {
    if (!Array.isArray(arr) || arr.length === 0) throw new Error(msg ?? 'Array vazio ou nao-array');
  },
};

/* ============================================================
   CARREGAMENTO DE JSON
   ============================================================ */

/**
 * Carrega e parseia um arquivo JSON do projeto.
 * @param {string} relativePath - relativo a raiz do projeto
 * @returns {object}
 */
const loadJSON = (relativePath) => {
  const fullPath = resolve(__dirname, '..', relativePath);
  const raw = readFileSync(fullPath, 'utf-8');
  return JSON.parse(raw);
};

/* ============================================================
   SUITE: INTEGRIDADE DOS JSONs
   ============================================================ */

const runDataTests = () => {
  console.log('\n\n[Suite] Integridade dos JSONs');

  // axes.json
  test('axes.json: carrega sem erros', () => {
    const data = loadJSON('data/axes.json');
    assert.hasKey(data, 'axes');
    assert.isArray(data.axes);
    assert.notEmpty(data.axes);
  });

  test('axes.json: cada eixo tem campos obrigatorios', () => {
    const { axes } = loadJSON('data/axes.json');
    const required = ['id', 'slug', 'title', 'description', 'color', 'modules'];
    axes.forEach(axis => {
      required.forEach(field => {
        assert.hasKey(axis, field, `Eixo ${axis.id ?? '?'} sem campo: ${field}`);
      });
    });
  });

  test('axes.json: exatamente 4 eixos', () => {
    const { axes } = loadJSON('data/axes.json');
    assert.equal(axes.length, 4, `Esperado 4 eixos, encontrado ${axes.length}`);
  });

  // modules.json
  test('modules.json: carrega sem erros', () => {
    const data = loadJSON('data/modules.json');
    assert.hasKey(data, 'modules');
    assert.isArray(data.modules);
    assert.notEmpty(data.modules);
  });

  test('modules.json: cada modulo tem campos obrigatorios', () => {
    const { modules } = loadJSON('data/modules.json');
    const required = ['id', 'slug', 'number', 'axis', 'title', 'subtitle', 'description', 'lessons'];
    modules.forEach(mod => {
      required.forEach(field => {
        assert.hasKey(mod, field, `Modulo ${mod.id ?? '?'} sem campo: ${field}`);
      });
    });
  });

  test('modules.json: exatamente 6 modulos V1', () => {
    const { modules } = loadJSON('data/modules.json');
    assert.equal(modules.length, 6, `Esperado 6 modulos, encontrado ${modules.length}`);
  });

  test('modules.json: cada modulo tem pelo menos 1 licao', () => {
    const { modules } = loadJSON('data/modules.json');
    modules.forEach(mod => {
      assert.ok(mod.lessons.length > 0, `Modulo ${mod.id} sem licoes`);
    });
  });

  test('modules.json: cada licao tem fenomeno definido', () => {
    const { modules } = loadJSON('data/modules.json');
    modules.forEach(mod => {
      mod.lessons.forEach(lesson => {
        assert.ok(lesson.phenomenon && lesson.phenomenon.length > 10,
          `Licao ${lesson.id} sem fenomeno adequado`);
      });
    });
  });

  // scales.json
  test('scales.json: carrega sem erros', () => {
    const data = loadJSON('data/scales.json');
    assert.hasKey(data, 'scales');
    assert.isArray(data.scales);
  });

  test('scales.json: exatamente 7 escalas', () => {
    const { scales } = loadJSON('data/scales.json');
    assert.equal(scales.length, 7, `Esperado 7 escalas, encontrado ${scales.length}`);
  });

  test('scales.json: escalas ordenadas por campo order', () => {
    const { scales } = loadJSON('data/scales.json');
    const sorted = [...scales].sort((a, b) => a.order - b.order);
    sorted.forEach((s, i) => {
      assert.equal(s.order, i + 1, `Escala ${s.id} com order incorreto`);
    });
  });

  // glossary.json
  test('glossary.json: carrega sem erros', () => {
    const data = loadJSON('data/glossary.json');
    assert.hasKey(data, 'glossary');
    assert.isArray(data.glossary);
    assert.notEmpty(data.glossary);
  });

  test('glossary.json: cada conceito tem id, term e definition', () => {
    const { glossary } = loadJSON('data/glossary.json');
    glossary.forEach(concept => {
      assert.hasKey(concept, 'id',         `Conceito sem id`);
      assert.hasKey(concept, 'term',       `Conceito ${concept.id} sem term`);
      assert.hasKey(concept, 'definition', `Conceito ${concept.id} sem definition`);
    });
  });

  // exercises.json
  test('exercises.json: carrega sem erros', () => {
    const data = loadJSON('data/exercises.json');
    assert.hasKey(data, 'exercises');
    assert.isArray(data.exercises);
    assert.notEmpty(data.exercises);
  });

  test('exercises.json: cada exercicio referencia um modulo existente', () => {
    const exercisesData = loadJSON('data/exercises.json');
    const modulesData   = loadJSON('data/modules.json');
    const moduleIds     = new Set(modulesData.modules.map(m => m.id));

    exercisesData.exercises.forEach(ex => {
      assert.ok(moduleIds.has(ex.module),
        `Exercicio ${ex.id} referencia modulo inexistente: ${ex.module}`);
    });
  });

  // applications.json
  test('applications.json: carrega sem erros', () => {
    const data = loadJSON('data/applications.json');
    assert.hasKey(data, 'applications');
    assert.isArray(data.applications);
    assert.notEmpty(data.applications);
  });

  // processes.json
  test('processes.json: carrega sem erros', () => {
    const data = loadJSON('data/processes.json');
    assert.hasKey(data, 'processes');
    assert.isArray(data.processes);
    assert.notEmpty(data.processes);
  });
};

/* ============================================================
   SUITE: CONSISTENCIA ENTRE ARQUIVOS
   ============================================================ */

const runConsistencyTests = () => {
  console.log('\n\n[Suite] Consistencia entre arquivos');

  const axesData    = loadJSON('data/axes.json');
  const modulesData = loadJSON('data/modules.json');
  const scalesData  = loadJSON('data/scales.json');
  const glossaryData = loadJSON('data/glossary.json');

  const axisIds    = new Set(axesData.axes.map(a => a.id));
  const moduleIds  = new Set(modulesData.modules.map(m => m.id));
  const scaleIds   = new Set(scalesData.scales.map(s => s.id));

  test('Todos os modulos referenciam eixos existentes', () => {
    modulesData.modules.forEach(mod => {
      assert.ok(axisIds.has(mod.axis),
        `Modulo ${mod.id} referencia eixo inexistente: ${mod.axis}`);
    });
  });

  test('Todos os modulos referenciam escalas existentes', () => {
    modulesData.modules.forEach(mod => {
      mod.scales.forEach(scaleId => {
        assert.ok(scaleIds.has(scaleId),
          `Modulo ${mod.id} referencia escala inexistente: ${scaleId}`);
      });
    });
  });

  test('Todos os keyConceptLinks de modulos existem', () => {
    modulesData.modules.forEach(mod => {
      mod.keyConceptLinks.forEach(id => {
        assert.ok(moduleIds.has(id),
          `Modulo ${mod.id} referencia modulo inexistente em keyConceptLinks: ${id}`);
      });
    });
  });

  test('Eixos referenciam modulos existentes', () => {
    axesData.axes.forEach(axis => {
      axis.modules.forEach(id => {
        assert.ok(moduleIds.has(id),
          `Eixo ${axis.id} referencia modulo inexistente: ${id}`);
      });
    });
  });

  test('Glossario: relatedTerms referenciam ids existentes no glossario', () => {
    const glossaryIds = new Set(glossaryData.glossary.map(c => c.id));
    glossaryData.glossary.forEach(concept => {
      concept.relatedTerms.forEach(id => {
        assert.ok(glossaryIds.has(id),
          `Conceito ${concept.id} referencia termo inexistente: ${id}`);
      });
    });
  });

  test('Glossario: modulos referenciam ids existentes', () => {
    glossaryData.glossary.forEach(concept => {
      concept.modules.forEach(id => {
        assert.ok(moduleIds.has(id),
          `Conceito ${concept.id} referencia modulo inexistente: ${id}`);
      });
    });
  });

  test('Glossario: axis referencia eixos existentes', () => {
    glossaryData.glossary.forEach(concept => {
      assert.ok(axisIds.has(concept.axis),
        `Conceito ${concept.id} referencia eixo inexistente: ${concept.axis}`);
    });
  });

  test('Escalas: relatedModules referenciam ids existentes', () => {
    scalesData.scales.forEach(scale => {
      scale.relatedModules.forEach(id => {
        assert.ok(moduleIds.has(id),
          `Escala ${scale.id} referencia modulo inexistente: ${id}`);
      });
    });
  });
};

/* ============================================================
   SUITE: ESTRUTURA DE ARQUIVOS
   ============================================================ */

const runStructureTests = () => {
  console.log('\n\n[Suite] Estrutura de arquivos');
  import { existsSync } from 'fs';

  const requiredFiles = [
    'index.html',
    'css/base.css',
    'css/layout.css',
    'css/components.css',
    'css/theme.css',
    'css/mobile.css',
    'js/main.js',
    'js/router.js',
    'js/state.js',
    'js/ui.js',
    'js/accessibility.js',
    'engine/scale-engine.js',
    'engine/process-engine.js',
    'engine/concept-engine.js',
    'engine/comparison-engine.js',
    'engine/feedback-engine.js',
    'engine/hint-system.js',
    'components/home-hero.js',
    'components/module-card.js',
    'components/application-card.js',
    'components/glossary-panel.js',
    'data/axes.json',
    'data/modules.json',
    'data/scales.json',
    'data/processes.json',
    'data/applications.json',
    'data/glossary.json',
    'data/exercises.json',
    'docs/architecture.md',
    'docs/pedagogy.md',
    'docs/visual-system.md',
    'docs/module-system.md',
    'docs/content-model.md',
    'docs/development-guide.md',
    'CHANGELOG.md',
    'README.md',
  ];

  requiredFiles.forEach(file => {
    test(`Arquivo existe: ${file}`, () => {
      const fullPath = resolve(__dirname, '..', file);
      assert.ok(existsSync(fullPath), `Arquivo nao encontrado: ${file}`);
    });
  });
};

/* ============================================================
   RELATORIO FINAL
   ============================================================ */

const printReport = () => {
  console.log('\n\n' + '='.repeat(60));
  console.log('RELATORIO DE TESTES — Darwin');
  console.log('='.repeat(60));

  const failures = _results.filter(r => r.status === 'FAIL');
  if (failures.length > 0) {
    console.log('\nFalhas:');
    failures.forEach(f => {
      console.log(`  FAIL  ${f.name}`);
      console.log(`        ${f.error}`);
    });
  }

  console.log(`\nResultado: ${_passed} passaram, ${_failed} falharam`);
  console.log('='.repeat(60));

  process.exit(_failed > 0 ? 1 : 0);
};

/* ============================================================
   EXECUCAO
   ============================================================ */

console.log('Darwin — Test Runner');
console.log('Executando suites...');

runDataTests();
runConsistencyTests();

// Estrutura requer existsSync importado dinamicamente no Node ESM
// Executamos separado para isolar o import
import('fs').then(({ existsSync }) => {
  // Patch local para o teste de estrutura
  global._existsSync = existsSync;

  // Redefine para usar o existsSync disponivel
  const requiredFiles = [
    'index.html', 'css/base.css', 'css/layout.css', 'css/components.css',
    'css/theme.css', 'css/mobile.css', 'js/main.js', 'js/router.js',
    'js/state.js', 'js/ui.js', 'js/accessibility.js',
    'engine/scale-engine.js', 'engine/process-engine.js',
    'engine/concept-engine.js', 'engine/comparison-engine.js',
    'engine/feedback-engine.js', 'engine/hint-system.js',
    'components/home-hero.js', 'components/module-card.js',
    'components/application-card.js', 'components/glossary-panel.js',
    'data/axes.json', 'data/modules.json', 'data/scales.json',
    'data/processes.json', 'data/applications.json',
    'data/glossary.json', 'data/exercises.json',
    'CHANGELOG.md', 'README.md',
  ];

  console.log('\n\n[Suite] Estrutura de arquivos');
  requiredFiles.forEach(file => {
    test(`Arquivo existe: ${file}`, () => {
      const fullPath = resolve(__dirname, '..', file);
      assert.ok(existsSync(fullPath), `Arquivo nao encontrado: ${file}`);
    });
  });

  printReport();
});
