# Guia de Desenvolvimento — Darwin

Atlas dos Processos da Vida  
Versao: 1.0.0

---

## Requisitos

- Node.js 18+ (apenas para testes — o site nao precisa de Node em producao)
- Servidor HTTP local para desenvolvimento (qualquer um serve)
- Nenhum bundler, nenhum npm install necessario para rodar o site

---

## Rodar localmente

### Opcao 1: Python (ja instalado na maioria dos sistemas)

```bash
cd darwin
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

### Opcao 2: Node.js

```bash
cd darwin
npx serve .
# Acesse: http://localhost:3000
```

### Opcao 3: VS Code Live Server

Instalar extensao Live Server e clicar em "Go Live".

**Atencao:** ES Modules nativos requerem servidor HTTP.
Abrir `index.html` diretamente via `file://` nao funciona por restricoes de CORS.

---

## Rodar os testes

```bash
cd darwin
node tests/test-runner.js
```

Os testes validam:
- Integridade dos JSONs (campos obrigatorios, tipos)
- Consistencia entre arquivos (referencias cruzadas)
- Existencia de todos os arquivos obrigatorios

**Sempre rodar os testes antes de um commit.**

---

## Deploy no GitHub Pages

1. Fazer push do repositorio para o GitHub
2. Ir em Settings > Pages
3. Source: Deploy from a branch
4. Branch: `main`, pasta: `/ (root)`
5. Salvar

O site estara disponivel em `https://usuario.github.io/darwin/`.

Nenhuma configuracao adicional necessaria — o roteamento hash nao requer
redirecionamentos de servidor.

---

## Adicionar conteudo

### Nova licao em modulo existente

1. Abrir `data/modules.json`
2. Localizar o modulo desejado
3. Adicionar objeto na array `lessons`:

```json
{
  "id": "modulo-tema",
  "order": 6,
  "title": "Titulo da licao",
  "phenomenon": "Pergunta ou observacao concreta que motiva a licao?",
  "phases": ["fenomeno", "visualizacao", "processo", "relacao", "aplicacao", "atividade"]
}
```

4. Adicionar exercicio correspondente em `data/exercises.json`
5. Rodar `node tests/test-runner.js`

### Novo conceito no glossario

1. Abrir `data/glossary.json`
2. Adicionar objeto na array `glossary`:

```json
{
  "id": "slug-do-conceito",
  "term": "Nome do conceito",
  "definition": "Definicao clara em pelo menos 2 frases.",
  "axis": "organization",
  "scale": "cellular",
  "relatedTerms": ["id-de-conceito-1", "id-de-conceito-2"],
  "modules": ["moduleId"]
}
```

3. Verificar que os `relatedTerms` e `modules` existem
4. Rodar testes

---

## Convencoes de codigo

### JavaScript

- ES2022 modular — sem CommonJS
- Sem `var` — usar `const` e `let`
- Funcoes exportadas documentadas com JSDoc
- Funcoes privadas prefixadas com `_` (convencao, sem enforcement)
- Nenhum arquivo acima de 400 linhas — dividir se necessario
- Um arquivo = uma responsabilidade

### CSS

- Todos os valores de cor via tokens (`var(--color-*)`)
- Nenhum valor hardcoded de cor fora de `base.css`
- Componentes em `components.css`, layout em `layout.css`, tema em `theme.css`
- Nenhuma classe CSS criada sem uso

### HTML

- Semantica correta (`header`, `main`, `footer`, `nav`, `section`, `article`)
- Todos os elementos interativos com `aria-label` quando necessario
- Imagens com `alt` descritivo
- SVG decorativo com `aria-hidden="true"`

---

## Changelog

Todo commit significativo deve ter entrada no `CHANGELOG.md`.

Formato:
```
## [versao] — YYYY-MM-DD

### Adicionado
- Descricao do que foi adicionado

### Corrigido
- Descricao do que foi corrigido

### Modificado
- Descricao do que foi alterado
```

---

## Estrutura do ecossistema educacional

Darwin e o sistema de Biologia dentro de:

| Sistema | Disciplina |
|---|---|
| Herodoto | Historia |
| Euclides | Matematica |
| Quintiliano | Lingua Portuguesa e Literatura |
| Johnson English | Lingua Inglesa |
| Lavoisier | Quimica |
| Humboldt | Geografia |
| Aristoteles | Filosofia |
| Archimedes | Fisica |
| Alberti | Arte |
| **Darwin** | **Biologia** |

Cada sistema e independente mas segue convencoes visuais e pedagogicas comuns.
