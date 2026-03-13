# Darwin

**Atlas dos Processos da Vida**

Sistema educacional de Biologia. Parte do ecossistema educacional composto por
Herodoto (Historia), Euclides (Matematica), Lavoisier (Quimica), Humboldt
(Geografia), Archimedes (Fisica), entre outros.

---

## Sobre o projeto

Darwin nao e uma enciclopedia escolar. E um sistema navegavel dos processos
vivos: da molecula ao ecossistema. O objetivo e mostrar que a Biologia e uma
rede de processos em escalas diferentes, nao uma lista de topicos isolados.

O aluno pode entrar pelo sistema por tres caminhos:
- Por escala biologica (molecular, celular, tecido, sistema, organismo, populacao, ecossistema)
- Por processo biologico (estrutura, informacao, metabolismo, regulacao, adaptacao...)
- Por aplicacao real (saude, genetica, epidemias, biotecnologia, ambiente...)

---

## Tecnologia

- HTML5, CSS3, JavaScript ES2022 modular
- Sem frameworks, sem bundler, sem backend
- ES Modules nativos (`type="module"`)
- SVG inline para diagramas e visualizacoes
- JSON como unica fonte de dados
- Compativel com GitHub Pages sem configuracao

---

## Estrutura

```
darwin/
  index.html
  css/              tokens, layout, componentes, tema, mobile
  js/               bootstrap, router, state, ui, acessibilidade
  engine/           motores: escala, processo, conceito, comparacao, exercicio, dicas
  components/       home, modulo, aplicacao, glossario
  data/             JSONs: eixos, modulos, escalas, processos, aplicacoes, glossario, exercicios
  tests/            test-runner.js (Node.js)
  docs/             arquitetura, pedagogia, sistema visual, modulos, conteudo, guia de dev
  CHANGELOG.md
  README.md
```

---

## Rodar localmente

Requer servidor HTTP (ES Modules nao funcionam via `file://`):

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Acesse `http://localhost:8080`.

**Modo Professor:** adicionar `?teacher=1` na URL.

---

## Testes

```bash
node tests/test-runner.js
```

Valida integridade dos JSONs, consistencia de referencias cruzadas e
existencia de arquivos obrigatorios.

---

## Conteudo V1

Seis modulos cobrem o nucleo da Biologia:

| # | Modulo | Eixo | Licoes |
|---|---|---|---|
| 01 | Celula | Organizacao da Vida | 5 |
| 02 | DNA e Hereditariedade | Informacao e Hereditariedade | 5 |
| 03 | Respiracao e Fotossintese | Energia e Funcao | 5 |
| 04 | Sistemas do Corpo Humano | Energia e Funcao | 6 |
| 05 | Ecologia | Evolucao e Ecologia | 5 |
| 06 | Evolucao | Evolucao e Ecologia | 5 |

Cada licao segue a sequencia pedagogica:
**fenomeno > visualizacao > processo > relacao de escala > aplicacao real > atividade**

---

## Documentacao

| Arquivo | Conteudo |
|---|---|
| `docs/architecture.md` | Arquitetura tecnica, roteamento, fluxo de boot |
| `docs/pedagogy.md` | Filosofia pedagogica, estrutura de licao |
| `docs/visual-system.md` | Tokens de cor, tipografia, componentes |
| `docs/module-system.md` | Schema de modulos, como adicionar conteudo |
| `docs/content-model.md` | Schema de todos os arquivos JSON |
| `docs/development-guide.md` | Deploy, testes, convencoes de codigo |

---

## Deploy

GitHub Pages: Settings > Pages > Source: `main / (root)`.

Nenhuma configuracao adicional. O roteamento hash nao requer
redirecionamentos de servidor.

---

## Versao

`1.0.0` — Ver [CHANGELOG.md](CHANGELOG.md) para historico completo.
