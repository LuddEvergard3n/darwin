# Modelo de Conteúdo — Darwin

## Estrutura de dados

Todo o conteúdo do Darwin é declarativo e vive em arquivos JSON dentro de `data/`. Nenhum conteúdo está hardcoded nos engines ou componentes.

---

## modules.json

Contém os 6 módulos e as 31 lições.

### Campos do módulo

| Campo            | Tipo       | Descrição                                              |
|------------------|------------|--------------------------------------------------------|
| `id`             | string     | Identificador único do módulo (`cell`, `genetics`…)    |
| `slug`           | string     | Slug de URL em português (`celula`, `evolucao`…)       |
| `number`         | string     | Número de exibição (`"01"`…`"06"`)                     |
| `axis`           | string     | Eixo temático (`organization`, `information`, `energy`, `evolution`) |
| `title`          | string     | Título do módulo                                       |
| `subtitle`       | string     | Subtítulo descritivo                                   |
| `description`    | string     | Parágrafo de apresentação do módulo                    |
| `scales`         | string[]   | IDs de escalas relevantes (ver `scales.json`)          |
| `processes`      | string[]   | IDs de processos biológicos (ver `processes.json`)     |
| `estimatedTime`  | string     | Tempo estimado de estudo                               |
| `lessons`        | Lesson[]   | Lista de lições ordenadas                              |
| `keyConceptLinks`| string[]   | IDs de módulos relacionados                            |
| `applications`   | string[]   | IDs de aplicações reais (ver `applications.json`)      |
| `status`         | string     | `"available"` ou `"coming-soon"`                       |

### Campos da lição

| Campo                | Tipo     | Descrição                                                  |
|----------------------|----------|------------------------------------------------------------|
| `id`                 | string   | Identificador único (`cell-what-is-life`, `gen-expression`…)|
| `order`              | number   | Ordem de exibição dentro do módulo                         |
| `title`              | string   | Título da lição                                            |
| `phenomenon`         | string   | Pergunta-fenômeno: o ponto de partida da lição             |
| `processDescription` | string   | Explicação mecanística do processo biológico central       |
| `relationText`       | string   | Conexão com outras escalas e módulos                       |
| `applicationText`    | string   | Aplicações concretas no mundo real                         |
| `phases`             | string[] | Fases presentes (sempre as 6: fenomeno…atividade)          |

Os campos `processDescription`, `relationText` e `applicationText` alimentam diretamente as fases `processo`, `relacao` e `aplicacao` no `process-engine.js`. Se ausentes, a fase exibe uma mensagem de conteúdo em desenvolvimento.

---

## exercises.json

31 exercícios — um por lição, um por módulo distribuídos uniformemente.

### Campos comuns

| Campo         | Tipo   | Descrição                                         |
|---------------|--------|---------------------------------------------------|
| `id`          | string | Identificador único (`ex-cell-01`…)               |
| `module`      | string | ID do módulo pai                                  |
| `lesson`      | string | ID da lição onde o exercício aparece              |
| `type`        | string | Tipo do exercício (ver abaixo)                    |
| `title`       | string | Título do exercício                               |
| `question`    | string | Enunciado                                         |
| `teacherGuide`| object | `objective`, `centralConcept`, `scaleRelation`, `estimatedMinutes`, `mediationSuggestion?` |

### Tipos de exercício

| Tipo          | Campos específicos                                      | Descrição                          |
|---------------|---------------------------------------------------------|------------------------------------|
| `association` | `items[]`, `matches[]`                                  | Associar pares (coluna A / coluna B)|
| `ordering`    | `steps[]` (cada item tem `order`)                       | Ordenar sequência de eventos        |
| `analysis`    | `options[]` (cada item tem `isCorrect`, `feedback`)     | Múltipla escolha com feedback       |
| `comparison`  | `items[]` (cada item tem `answer`, `explanation`)       | Classificar em categorias           |
| `flow`        | `nodes[]`, `correctFlow[]`, `processNames[]`            | Montar diagrama de fluxo            |

### Cobertura atual

| Módulo      | Exercícios | Tipos                                        |
|-------------|-----------|----------------------------------------------|
| `cell`      | 5         | association, ordering, analysis, ordering, association |
| `genetics`  | 5         | flow, analysis, ordering, analysis, comparison |
| `metabolism`| 5         | comparison, ordering, analysis, association, ordering |
| `systems`   | 6         | analysis, ordering, association, ordering, ordering, analysis |
| `ecology`   | 5         | ordering, analysis, association, comparison, analysis |
| `evolution` | 5         | analysis, comparison, association, analysis, association |

---

## glossary.json

31 termos cobrindo os conceitos fundamentais de todos os módulos.

### Campos

| Campo          | Tipo     | Descrição                                         |
|----------------|----------|---------------------------------------------------|
| `id`           | string   | Identificador único (usado em `relatedTerms`)     |
| `term`         | string   | Nome do conceito                                  |
| `definition`   | string   | Definição precisa e concisa                       |
| `axis`         | string   | Eixo temático (`organization`, `information`, `energy`, `evolution`) |
| `scale`        | string   | Escala principal onde o conceito opera            |
| `relatedTerms` | string[] | IDs de termos relacionados                        |
| `modules`      | string[] | IDs dos módulos onde o conceito é usado           |

---

## Outros arquivos de dados

| Arquivo            | Conteúdo                                    |
|--------------------|---------------------------------------------|
| `axes.json`        | 4 eixos temáticos com cores e descrições    |
| `scales.json`      | 7 escalas biológicas (molecular → ecossistema) |
| `processes.json`   | 7 processos biológicos fundamentais         |
| `applications.json`| 9 aplicações reais do conhecimento biológico|

---

## Regras para criação de conteúdo

1. Todo ID deve ser único dentro de seu arquivo JSON.
2. Referências cruzadas (ex: `modules[].scales`) devem corresponder a IDs válidos no arquivo referenciado.
3. `processDescription`, `relationText` e `applicationText` devem ser parágrafos completos (não bullets).
4. `phenomenon` deve ser sempre uma pergunta aberta que instiga curiosidade.
5. O `teacherGuide` de cada exercício é visível apenas no modo `?teacher=1`.
6. Acentuação: todos os campos de texto devem usar caracteres Unicode diretamente (UTF-8). Não usar entidades HTML nos JSONs.
