# Sistema Visual — Darwin

Atlas dos Processos da Vida  
Versao: 1.0.0

---

## Conceito visual

**Natural systems interface.**

Sensacao: viva, clara, cientifica, organizada, elegante.
Nem clinica, nem infantil.

Formula: 70% clareza estrutural + 30% organicidade visual.

---

## O que nao fazer

- Nao imitar site hospitalar
- Nao imitar plataforma escolar infantil
- Nao imitar dashboard corporativo
- Nao usar glassmorphism
- Nao usar gradientes saturados
- Nao usar sombras excessivas
- Nao usar icones genericos de clipart
- Nao usar fundos coloridos solidos em grandes areas

---

## Paleta de cores

Todos os tokens sao CSS custom properties definidos em `css/base.css`.

### Superficies e texto

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#F4F7F2` | Fundo principal da pagina |
| `--color-surface` | `#FAFBF8` | Cards, paineis, superficies elevadas |
| `--color-surface-alt` | `#EEF3EC` | Fundos secundarios, hover, inputs |
| `--color-text` | `#233128` | Texto principal |
| `--color-text-secondary` | `#5D6B61` | Texto de suporte, descricoes |
| `--color-text-muted` | `#7A877E` | Metadados, labels discretos |

### Cores de acao e destaque

| Token | Valor | Uso |
|---|---|---|
| `--color-primary` | `#3F6B4B` | Cor primaria, links, botoes principais |
| `--color-secondary` | `#3F6470` | Cor secundaria, variacao de eixo |
| `--color-accent` | `#B08A4A` | Destaque, modo professor, callouts |
| `--color-accent-rare` | `#7A4D58` | Destaque raro, erros, alertas criticos |

### Bordas

| Token | Valor |
|---|---|
| `--color-border` | `#D9E1D8` |
| `--color-border-strong` | `#C9D3C8` |

### Identidade dos eixos biologicos

| Eixo | Token | Valor |
|---|---|---|
| Organizacao da Vida | `--color-axis-org` | `#3F6B4B` |
| Informacao e Hereditariedade | `--color-axis-info` | `#3F6470` |
| Energia e Funcao | `--color-axis-energy` | `#B08A4A` |
| Evolucao e Ecologia | `--color-axis-evo` | `#5A7A4A` |

As cores de eixo aparecem em:
- Linha lateral esquerda de `axis-card`
- Label de eixo (`section-label`)
- Badges de eixo
- Indicadores de escala no diagrama SVG

**Nunca usar como fundo solido de grandes areas.**

---

## Tipografia

### Famílias

| Variavel | Familia | Uso |
|---|---|---|
| `--font-serif` | Source Serif 4 | Titulos, headings, fenomenos de licao |
| `--font-sans` | Source Sans 3 | Corpo de texto, UI, botoes |
| `--font-mono` | DM Mono | Metadados, labels tecnicos, tags, escalas |

### Escala tipografica (Major Third — 1.25)

| Token | Valor | Uso tipico |
|---|---|---|
| `--text-xs` | 0.64rem | Metadados ultra-discretos |
| `--text-sm` | 0.80rem | Labels, legendas |
| `--text-base` | 1.00rem | Corpo de texto |
| `--text-md` | 1.25rem | Descricoes de destaque |
| `--text-lg` | 1.56rem | Subtitulos de secao |
| `--text-xl` | 1.95rem | Titulos de secao |
| `--text-2xl` | 2.44rem | Titulos de pagina |
| `--text-3xl` | 3.05rem | Hero |

### Regras

- Titulos: sempre `font-family: var(--font-serif)`
- Corpo: sempre `font-family: var(--font-sans)`
- Mono: apenas para metadados, tags, labels tecnicos, numeros de modulo/licao
- Largura de leitura de texto corrido: `max-width: var(--measure)` (72ch)

---

## Espacamento

Escala de espacamento definida em `css/base.css`:

| Token | Valor |
|---|---|
| `--space-1` | 0.25rem |
| `--space-2` | 0.50rem |
| `--space-3` | 0.75rem |
| `--space-4` | 1.00rem |
| `--space-6` | 1.50rem |
| `--space-8` | 2.00rem |
| `--space-12` | 3.00rem |
| `--space-16` | 4.00rem |

Seccoes usam `padding-block: var(--space-16)`.
Gaps entre cards: `var(--space-6)`.

---

## Grid

- **Desktop:** 12 colunas, `max-width: 1200px`, `padding-inline: clamp(1rem, 3vw, 2rem)`
- **Tablet:** 8 colunas
- **Mobile:** 4 colunas

---

## Componentes visuais

### Cards
Os cards do Darwin devem parecer **atlas plates** — placas de atlas cientifico.
Nao widgets de software.

- Fundo `var(--color-surface)`
- Borda `var(--color-border)` com `border-radius: var(--radius-lg)`
- Sombra apenas no hover (`--shadow-md`)
- `axis-card` tem linha lateral de 4px na cor do eixo

### Badges e tags
- `badge`: pílula arredondada com cor de eixo, fonte mono, tamanho xs
- `tag`: retangulo com fundo `surface-alt`, fonte mono, para labels simples

### Secao de escala
A progressao de escalas deve parecer **conceitual**, nao apenas um menu.
Use circulos com tamanho crescente (menor = molecular, maior = ecossistema).

### Diagramas SVG
- Fundo `var(--color-surface-alt)`
- Linhas de conexao: `--color-border`, traçado com `stroke-dasharray`
- Nos: `fill: #FAFBF8`, `stroke` na cor do eixo
- Texto: `fill: #5D6B61`, fonte sans

---

## Hierarquia visual de metadados

Metadados (numero de modulo, escala, tempo estimado) sao **subordinados**
ao conteudo principal.

Regra: se e metadata, use `--font-mono`, `--text-xs`, `--color-text-muted`.
Nunca competir com o titulo ou a descricao em peso visual.

---

## Responsividade

- **Mobile-first:** todo layout deve funcionar em 375px
- Hero: empilha verticalmente no mobile
- Cards: `auto-fill, minmax(280px, 1fr)` — quebram naturalmente
- Escalas: carrossel horizontal ou grid reduzido no mobile
- Nav: colapsa em hamburger menu abaixo de 768px
