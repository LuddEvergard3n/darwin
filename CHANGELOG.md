# CHANGELOG — Darwin

Atlas dos Processos da Vida

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.0.0] — 2025-03-12

### Adicionado

**Arquitetura**
- SPA estatica com roteamento hash-based (`js/router.js`)
- Estado global centralizado com pub/sub (`js/state.js`)
- Sistema de UI com despacho de views por rota (`js/ui.js`)
- Modulo de acessibilidade: navegacao por teclado, aria-live, focus trap (`js/accessibility.js`)
- Bootstrap com carregamento paralelo de todos os JSONs (`js/main.js`)

**Motores**
- `engine/scale-engine.js`: navegacao entre escalas biologicas, diagrama SVG do hero
- `engine/process-engine.js`: renderizacao de licoes com as 6 fases pedagogicas obrigatorias
- `engine/concept-engine.js`: glossario, busca de conceitos, agrupamento por eixo
- `engine/comparison-engine.js`: comparacao de processos e modulos
- `engine/feedback-engine.js`: 4 tipos de exercicio (analise, ordenacao, comparacao, associacao)
- `engine/hint-system.js`: dicas contextuais visuais nao-resolutivas

**Componentes**
- `components/home-hero.js`: pagina inicial com hero, eixos, escalas, aplicacoes, modulos
- `components/module-card.js`: pagina de detalhe do modulo com lista de licoes e sidebar
- `components/application-card.js`: pagina de aplicacao real com modulos relacionados
- `components/glossary-panel.js`: re-exporta concept-engine para o router

**Dados**
- `data/axes.json`: 4 eixos tematicos com metadados completos
- `data/modules.json`: 6 modulos V1 com 31 licoes no total
- `data/scales.json`: 7 escalas biologicas com ordem de grandeza e exemplos
- `data/processes.json`: 7 processos biologicos indexados por eixo e escala
- `data/applications.json`: 9 aplicacoes reais com modulos relacionados
- `data/glossary.json`: 14 conceitos fundamentais com relacoes entre si
- `data/exercises.json`: 6 exercicios cobrindo os 6 modulos V1

**CSS**
- `css/base.css`: tokens completos de design, reset, tipografia base
- `css/layout.css`: grid 12 colunas, containers, nav, rodape, sidebar
- `css/components.css`: todos os componentes reutilizaveis
- `css/theme.css`: estilos tematicos, hero, diagramas, paginas de modulo
- `css/mobile.css`: ajustes mobile-first, print, landscape

**Documentacao**
- `docs/architecture.md`: arquitetura tecnica, fluxo de boot, convencoes
- `docs/pedagogy.md`: filosofia pedagogica, estrutura de licao, tipos de exercicio
- `docs/visual-system.md`: tokens de cor, tipografia, componentes visuais
- `docs/module-system.md`: schema de modulos, conexoes, como adicionar
- `docs/content-model.md`: schema de todos os arquivos JSON
- `docs/development-guide.md`: como rodar, testar, fazer deploy, contribuir

**Testes**
- `tests/test-runner.js`: suite Node.js com testes de integridade de dados,
  consistencia entre arquivos e existencia de arquivos obrigatorios

**Identidade**
- `index.html`: estrutura semantica completa com nav, main, footer
- Tipografia: Source Serif 4, Source Sans 3, DM Mono via Google Fonts
- Paleta: verde-biologico como cor primaria, tokens por eixo
- Modo Professor via `?teacher=1`

### Modulos V1

| Modulo | Licoes |
|---|---|
| 01 — Celula | 5 |
| 02 — DNA e Hereditariedade | 5 |
| 03 — Respiracao e Fotossintese | 5 |
| 04 — Sistemas do Corpo Humano | 6 |
| 05 — Ecologia | 5 |
| 06 — Evolucao | 5 |

**Total: 31 licoes, 6 exercicios completos**
