# Arquitetura — Darwin

Atlas dos Processos da Vida  
Versao: 1.0.0

---

## Visao geral

Darwin e uma SPA (Single Page Application) estatica, sem framework, sem bundler
obrigatorio. Roda diretamente no browser via ES Modules nativos e e compativel
com GitHub Pages sem configuracao adicional.

---

## Decisoes de arquitetura

### Roteamento via hash

```
#/                          home
#/modulo/:slug              pagina do modulo
#/modulo/:slug/:licaoId     pagina da licao
#/escala/:id                view de escala biologica
#/processo/:id              view de processo biologico
#/aplicacao/:slug           aplicacao real
#/glossario                 glossario de conceitos
```

**Motivo:** compativel com GitHub Pages sem configuracao de servidor.
O `router.js` escuta `hashchange` e despacha views via `ui.js`.

### State centralizado

`js/state.js` e a unica fonte de verdade. Todos os dados carregados e estado
de UI passam por ele. Mutacoes sao feitas via `State.set(path, value)`.
Listeners sao registrados por caminho de ponto — granularidade sem overhead.

### Dados como JSON estatico

Nenhum backend. Todo o conteudo esta em `/data/*.json`.
O `main.js` carrega todos os JSONs em paralelo via `Promise.allSettled` antes
de inicializar o router.

### Motores como modulos isolados

Cada motor tem responsabilidade unica:

| Motor | Responsabilidade |
|---|---|
| `scale-engine.js` | Navegacao e representacao de escalas biologicas |
| `process-engine.js` | Representacao de processos e renderizacao de licoes |
| `concept-engine.js` | Glossario, busca e relacoes entre conceitos |
| `comparison-engine.js` | Comparacao entre processos, modulos e estruturas |
| `feedback-engine.js` | Exercicios, validacao de respostas, modo professor |
| `hint-system.js` | Dicas contextuais visuais |

---

## Estrutura de arquivos

```
darwin/
  index.html              ponto de entrada HTML

  css/
    base.css              tokens, reset, tipografia base
    layout.css            grid, containers, nav, rodape
    components.css        todos os componentes reutilizaveis
    theme.css             estilos tematicos, hero, diagramas SVG
    mobile.css            ajustes mobile-first e print

  js/
    main.js               bootstrap: carrega dados e inicializa modulos
    router.js             roteamento hash-based
    state.js              estado global com pub/sub
    ui.js                 orquestracao de views
    accessibility.js      teclado, focus, aria-live

  engine/
    scale-engine.js       escalas biologicas
    process-engine.js     processos e licoes
    concept-engine.js     glossario e conceitos
    comparison-engine.js  comparacoes
    feedback-engine.js    exercicios e feedback
    hint-system.js        dicas contextuais

  components/
    home-hero.js          pagina inicial completa
    module-card.js        pagina de modulo
    application-card.js   pagina de aplicacao
    glossary-panel.js     re-exporta concept-engine

  data/
    axes.json             4 eixos tematicos
    modules.json          6 modulos V1 com licoes
    scales.json           7 escalas biologicas
    processes.json        processos biologicos
    applications.json     aplicacoes reais
    glossary.json         glossario de conceitos
    exercises.json        banco de exercicios

  tests/
    test-runner.js        suite Node.js de testes automatizados

  docs/
    architecture.md       este arquivo
    pedagogy.md
    visual-system.md
    module-system.md
    content-model.md
    development-guide.md
```

---

## Fluxo de inicializacao

```
DOMContentLoaded
  └── bootstrap() [main.js]
        ├── Accessibility.init()
        ├── UI.init(#main-content)
        ├── initMobileNav()
        ├── initNavHighlight()
        ├── loadAllData()          <- paralelo, todos os JSONs
        │     └── State.loadData()
        └── Router.init()
              └── hashchange listener
                    └── _navigate()
                          ├── State.setMany(route.*)
                          └── UI._dispatch(view, params)
                                └── import(viewModule)
                                      └── mod.render(container, params)
```

---

## Convencoes de nomenclatura

- **Arquivos JS:** `kebab-case.js`
- **Classes CSS:** `BEM-like`: `.component__element--modifier`
- **IDs HTML:** `kebab-case`
- **Variaveis JS:** `camelCase`
- **Constantes:** `SCREAMING_SNAKE_CASE`
- **Exportacoes default:** objeto com metodos nomeados
- **Exportacoes named:** funcoes individuais para tree-shaking

---

## Dependencias externas

| Dependencia | Uso | Versao |
|---|---|---|
| Google Fonts | Source Serif 4, Source Sans 3, DM Mono | CDN |

Nenhuma dependencia JS externa. Nenhum bundler. Nenhum framework.

---

## Compatibilidade

- Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- ES Modules nativos: `type="module"` no `<script>`
- GitHub Pages: estatico, sem configuracao de rotas
- Sem CORS issues: todos os assets sao same-origin

---

## Escalabilidade

Para adicionar um novo modulo:
1. Adicionar entrada em `data/modules.json`
2. Adicionar licoes com os 6 campos obrigatorios
3. Adicionar exercicios em `data/exercises.json`
4. Opcional: criar arquivo em `modules/:id/` para conteudo extendido
5. Rodar `node tests/test-runner.js` para validar consistencia

Para adicionar uma nova view:
1. Registrar rota em `js/router.js` (ROUTES array)
2. Criar componente em `components/` com export `render(container, params)`
3. Registrar em `VIEW_MODULES` no `js/ui.js`
