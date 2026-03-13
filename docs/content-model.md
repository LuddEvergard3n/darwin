# Modelo de Conteudo — Darwin

Atlas dos Processos da Vida  
Versao: 1.0.0

---

## Arquivos de dados

Todos os arquivos de conteudo sao JSON estaticos em `/data/`.

| Arquivo | Conteudo |
|---|---|
| `axes.json` | 4 eixos tematicos |
| `modules.json` | 6 modulos com licoes |
| `scales.json` | 7 escalas biologicas |
| `processes.json` | Processos biologicos indexados |
| `applications.json` | Aplicacoes reais com modulos relacionados |
| `glossary.json` | Glossario de conceitos com relacoes |
| `exercises.json` | Banco de exercicios por modulo e licao |

---

## Schema: scales.json

```json
{
  "id": "molecular | cellular | tissue | system | organism | population | ecosystem",
  "order": "number (1-7)",
  "label": "string",
  "sublabel": "string (ordem de grandeza, ex: 10⁻¹⁰ m)",
  "description": "string",
  "examples": ["string", ...],
  "relatedModules": ["moduleId", ...],
  "relatedProcesses": ["processId", ...],
  "icon": "string",
  "color": "hex"
}
```

---

## Schema: processes.json

```json
{
  "id": "string",
  "label": "string",
  "description": "string",
  "axis": "organization | information | energy | evolution",
  "scales": ["scaleId", ...],
  "modules": ["moduleId", ...],
  "examples": ["string", ...]
}
```

---

## Schema: glossary.json

```json
{
  "id": "string",
  "term": "string",
  "definition": "string",
  "axis": "organization | information | energy | evolution",
  "scale": "scaleId",
  "relatedTerms": ["conceptId", ...],
  "modules": ["moduleId", ...]
}
```

`relatedTerms` deve referenciar apenas IDs que existem no mesmo arquivo.
`modules` deve referenciar apenas IDs que existem em `modules.json`.

---

## Schema: exercises.json

```json
{
  "id": "string",
  "module": "moduleId",
  "lesson": "lessonId",
  "type": "analysis | ordering | comparison | association | flow",
  "title": "string",
  "question": "string",
  "teacherGuide": {
    "objective": "string",
    "centralConcept": "string",
    "scaleRelation": "string",
    "mediationSuggestion": "string (opcional)",
    "estimatedMinutes": "number"
  }
}
```

Cada tipo de exercicio tem campos adicionais especificos.
Ver `engine/feedback-engine.js` para o schema completo de cada tipo.

---

## Regras de conteudo

1. Fenomenos devem ser perguntas ou observacoes concretas, nao definicoes
2. Definicoes no glossario devem ter no minimo 2 frases
3. `relatedTerms` deve ter no minimo 2 entradas por conceito
4. Exercicios de analise devem ter exatamente 1 opcao correta
5. Exercicios de ordenacao devem ter no minimo 4 passos
6. O campo `teacherGuide` e obrigatorio em todos os exercicios
