# Sistema de Módulos — Darwin

## Visão geral

O Darwin organiza a biologia em **6 módulos** distribuídos em **4 eixos temáticos**. Cada módulo contém entre 5 e 6 lições, e cada lição segue exatamente a mesma estrutura de 6 fases.

---

## Módulos

| # | ID          | Título                     | Eixo          | Lições | Tempo |
|---|-------------|----------------------------|---------------|--------|-------|
| 01 | `cell`     | Célula                     | Organização   | 5      | 3h    |
| 02 | `genetics` | DNA e Hereditariedade      | Informação    | 5      | 4h    |
| 03 | `metabolism`| Respiração e Fotossíntese | Energia       | 5      | 4h    |
| 04 | `systems`  | Sistemas do Corpo Humano   | Energia       | 6      | 5h    |
| 05 | `ecology`  | Ecologia                   | Evolução      | 5      | 4h    |
| 06 | `evolution`| Evolução                   | Evolução      | 5      | 4h    |

**Total:** 31 lições, 31 exercícios, ~24h de conteúdo estimado.

---

## Eixos temáticos

| Eixo           | ID             | Cor token                  | Módulos                  |
|----------------|----------------|----------------------------|--------------------------|
| Organização    | `organization` | `--color-axis-org`         | Célula                   |
| Informação     | `information`  | `--color-axis-info`        | DNA e Hereditariedade    |
| Energia        | `energy`       | `--color-axis-energy`      | Respiração, Sistemas     |
| Evolução       | `evolution`    | `--color-axis-evo`         | Ecologia, Evolução       |

---

## Estrutura de uma lição

Toda lição percorre obrigatoriamente 6 fases na seguinte ordem:

| Fase         | ID            | Conteúdo                                                   |
|--------------|---------------|------------------------------------------------------------|
| Fenômeno     | `fenomeno`    | Pergunta-problema que ancora a lição no cotidiano          |
| Visualização | `visualizacao`| Placeholder para diagrama ou representação visual          |
| Processo     | `processo`    | Explicação mecanística — como e por quê o processo ocorre  |
| Relação      | `relacao`     | Conexão com outras escalas e módulos                       |
| Aplicação    | `aplicacao`   | Implicações concretas em saúde, tecnologia, ambiente       |
| Atividade    | `atividade`   | Exercício interativo específico para a lição               |

As fases `processo`, `relacao` e `aplicacao` são alimentadas pelos campos `processDescription`, `relationText` e `applicationText` de cada lição em `modules.json`. A fase `atividade` busca o exercício correspondente em `exercises.json` pelo campo `lesson`.

---

## Conexões entre módulos

O Darwin é concebido como um sistema interconectado, não uma sequência linear. Cada módulo declara `keyConceptLinks` — IDs de módulos com alto grau de interdependência conceitual:

```
cell        ←→ genetics    (diferenciação, expressão gênica)
cell        ←→ metabolism  (organelas, ATP)
genetics    ←→ evolution   (variação, mutação, seleção)
metabolism  ←→ ecology     (fotossíntese, cadeia alimentar)
ecology     ←→ evolution   (pressões seletivas, coevolução)
```

O módulo `evolution` (06) é o integrador: conecta-se a todos os outros e é o último a ser cursado por design pedagógico.

---

## Navegação

O roteador resolve URLs no formato:

| URL                          | View renderizada                              |
|------------------------------|-----------------------------------------------|
| `#/`                         | Home com hero e grid de módulos               |
| `#/modulo/:slug`             | Página do módulo (lista de lições + sidebar)  |
| `#/modulo/:slug/:lessonId`   | Página da lição com as 6 fases                |
| `#/escala/:id`               | Página de escala biológica                    |
| `#/aplicacao/:id`            | Página de aplicação real                      |
| `#/conceitos`                | Glossário interativo com busca                |
| `#/comparar`                 | Comparação entre módulos                      |

---

## Adicionando conteúdo

Para adicionar um novo módulo:

1. Adicionar entrada em `modules.json` com todos os campos obrigatórios.
2. Adicionar exercícios em `exercises.json` (um por lição).
3. Garantir que todos os IDs de `scales`, `processes` e `applications` existam nos respectivos arquivos JSON.
4. Atualizar `CHANGELOG.md` com a versão.

Para adicionar uma lição a um módulo existente:

1. Adicionar a lição no array `lessons` do módulo em `modules.json`.
2. Adicionar o exercício correspondente em `exercises.json`.
3. Garantir que `order` está correto e sequencial.
