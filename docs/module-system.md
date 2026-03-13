# Sistema de Modulos — Darwin

Atlas dos Processos da Vida  
Versao: 1.0.0

---

## Estrutura de um modulo

Cada modulo em `data/modules.json` segue este schema:

```json
{
  "id": "string",
  "slug": "string",
  "number": "string (2 digitos)",
  "axis": "organization | information | energy | evolution",
  "title": "string",
  "subtitle": "string",
  "description": "string",
  "scales": ["molecular", "cellular", ...],
  "processes": ["string", ...],
  "estimatedTime": "string (ex: 3h)",
  "lessons": [ ... ],
  "keyConceptLinks": ["moduleId", ...],
  "applications": ["slug-de-aplicacao", ...],
  "status": "available | coming-soon"
}
```

---

## Estrutura de uma licao

```json
{
  "id": "string",
  "order": "number",
  "title": "string",
  "phenomenon": "string (pergunta ou observacao concreta)",
  "phases": ["fenomeno", "visualizacao", "processo", "relacao", "aplicacao", "atividade"]
}
```

O campo `phases` e declarativo — lista quais fases a licao implementa.
Na V1, todas as licoes implementam todas as 6 fases.

---

## Seis modulos da V1

| ID | Eixo | Titulo |
|---|---|---|
| `cell` | organization | Celula |
| `genetics` | information | DNA e Hereditariedade |
| `metabolism` | energy | Respiracao e Fotossintese |
| `systems` | energy | Sistemas do Corpo Humano |
| `ecology` | evolution | Ecologia |
| `evolution` | evolution | Evolucao |

---

## Adicionar um novo modulo

1. Adicionar entrada em `data/modules.json` seguindo o schema acima
2. Adicionar licoes com todos os campos obrigatorios
3. Adicionar exercicios correspondentes em `data/exercises.json`
4. Adicionar conceitos novos em `data/glossary.json` se necessario
5. Verificar que o eixo em `data/axes.json` lista o novo modulo
6. Rodar `node tests/test-runner.js` para validar consistencia

---

## Relacao entre modulos

O campo `keyConceptLinks` define conexoes explicitas entre modulos.
Essas conexoes aparecem na pagina do modulo como "Conexoes com outros modulos".

O grafo de conexoes V1:
```
cell <-> genetics
cell <-> metabolism
genetics <-> evolution
metabolism <-> ecology
evolution <-> ecology
```
