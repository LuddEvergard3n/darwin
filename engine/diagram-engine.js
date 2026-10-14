/**
 * diagram-engine.js
 * Darwin — Atlas dos Processos da Vida
 *
 * Gera diagramas SVG educativos para a fase de visualização de cada lição.
 * Cada diagrama é específico para o conteúdo da lição.
 *
 * Tipos de diagrama disponíveis:
 *   flow      — cadeia horizontal de etapas (processos sequenciais)
 *   cascade   — cadeia vertical com dados (cadeias tróficas, hierarquias)
 *   cycle     — fluxo circular (ciclos biogeoquímicos, homeostase)
 *   structure — estrutura com partes identificadas (célula, gene, membrana)
 *   compare   — duas colunas lado a lado
 *   branch    — nó central com ramificações
 */

/* ============================================================
   PALETA DE CORES
   SVG não herda CSS custom properties — valores inline.
   ============================================================ */

const C = {
  surface:    '#FAFBF8',
  surfaceAlt: '#EEF3EC',
  border:     '#D9E1D8',
  borderStr:  '#C9D3C8',
  text:       '#233128',
  textSec:    '#5D6B61',
  textMuted:  '#7A877E',
  primary:    '#3F6B4B',
  info:       '#3F6470',
  energy:     '#B08A4A',
  evo:        '#5A7A4A',
  rare:       '#7A4D58',
  white:      '#FFFFFF',
};

const W = 680;
const H = 360;

/* ============================================================
   HELPERS SVG
   ============================================================ */

/** Bloco de defs: marcadores de seta. */
const _defs = () => `
  <defs>
    <marker id="a" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="${C.textMuted}"/>
    </marker>
    <marker id="ap" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="${C.primary}"/>
    </marker>
    <marker id="ai" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="${C.info}"/>
    </marker>
    <marker id="ae" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="${C.energy}"/>
    </marker>
    <marker id="av" viewBox="0 0 10 10" refX="9" refY="5"
      markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 9 5 L 0 9 Z" fill="${C.evo}"/>
    </marker>
  </defs>`;

/** Retângulo arredondado. */
const rect = (x, y, w, h, {
  fill = C.surface, stroke = C.border, rx = 8, sw = 1.5,
} = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"
   fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

/** Círculo. */
const circle = (cx, cy, r, { fill = C.surface, stroke = C.border, sw = 1.5 } = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;

/** Texto SVG. */
const text = (x, y, str, {
  size = 12, fill = C.text, anchor = 'middle',
  weight = 'normal', mono = false, serif = false,
} = {}) => {
  const ff = mono
    ? `'DM Mono', 'Courier New', monospace`
    : serif
      ? `'Source Serif 4', Georgia, serif`
      : `'Source Sans 3', system-ui, sans-serif`;
  return `<text x="${x}" y="${y}" font-family="${ff}"
    font-size="${size}" font-weight="${weight}" fill="${fill}"
    text-anchor="${anchor}" dominant-baseline="central">${str}</text>`;
};

/** Linha com seta. */
const arrow = (x1, y1, x2, y2, {
  color = C.textMuted, marker = 'a', dashed = false, sw = 1.5,
} = {}) => {
  const dash = dashed ? `stroke-dasharray="5 4"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
    stroke="${color}" stroke-width="${sw}" ${dash}
    marker-end="url(#${marker})"/>`;
};

/** Path curvo com seta. */
const arrowPath = (d, { color = C.textMuted, marker = 'a', dashed = false } = {}) => {
  const dash = dashed ? `stroke-dasharray="5 4"` : '';
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="1.5"
    ${dash} marker-end="url(#${marker})"/>`;
};

/** Nó de caixa (box) com título e sublabel opcional. */
const node = (cx, cy, w, h, title, sub = '', {
  fill = C.surface, stroke = C.border,
  titleColor = C.text, subColor = C.textMuted,
  titleSize = 12, subSize = 10, serif = false,
} = {}) => {
  const x = cx - w / 2;
  const y = cy - h / 2;
  const ty = sub ? cy - 7 : cy;
  return [
    rect(x, y, w, h, { fill, stroke, rx: 8 }),
    text(cx, ty, title, { size: titleSize, fill: titleColor, weight: '600', serif }),
    sub ? text(cx, cy + 10, sub, { size: subSize, fill: subColor, mono: true }) : '',
  ].join('');
};

/** Etiqueta lateral com linha pontilhada. */
const callout = (x1, y1, x2, y2, label, { color = C.textMuted } = {}) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
    stroke="${C.border}" stroke-width="1" stroke-dasharray="3 3"/>
  ${text(x2 + (x2 > x1 ? 6 : -6), y2, label, {
    size: 10, fill: color,
    anchor: x2 > x1 ? 'start' : 'end',
  })}`;

/** Wrapper SVG completo. */
const svg = (inner, { title = '', bg = true } = {}) => `
  <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    role="img" aria-label="${title}" class="diagram-svg">
    ${bg ? rect(0, 0, W, H, { fill: C.surface, stroke: C.border, rx: 12, sw: 1 }) : ''}
    ${_defs()}
    ${inner}
  </svg>`;

/* ============================================================
   DIAGRAMA TIPO: FLOW (horizontal)
   ============================================================ */

/**
 * Cadeia horizontal de etapas.
 * @param {Array<{label, sub?, fill?, stroke?, accent?}>} steps
 * @param {object} opts
 */
const flowH = (steps, { title = '', arrowColor = C.textMuted, arrowMarker = 'a', stepW = 110, stepH = 52, y = 175 } = {}) => {
  const n   = steps.length;
  const gap = 36;
  const totalW = n * stepW + (n - 1) * gap;
  const startX = (W - totalW) / 2 + stepW / 2;

  const nodes = steps.map((s, i) => {
    const cx = startX + i * (stepW + gap);
    return node(cx, y, stepW, stepH, s.label, s.sub || '', {
      fill:       s.fill   || C.surface,
      stroke:     s.stroke || C.border,
      titleColor: s.accent || C.text,
      titleSize:  11,
      subSize:    9,
    });
  });

  const arrows = steps.slice(0, -1).map((_, i) => {
    const cx1 = startX + i * (stepW + gap) + stepW / 2;
    const cx2 = startX + (i + 1) * (stepW + gap) - stepW / 2;
    return arrow(cx1, y, cx2, y, { color: arrowColor, marker: arrowMarker });
  });

  const titleEl = title
    ? text(W / 2, 30, title, { size: 11, fill: C.textMuted, weight: '500', mono: true })
    : '';

  return svg([titleEl, ...arrows, ...nodes].join(''), { title });
};

/* ============================================================
   DIAGRAMA TIPO: CASCADE (vertical)
   ============================================================ */

const cascadeV = (steps, { title = '', arrowColor = C.textMuted, arrowMarker = 'a', stepW = 200, stepH = 48 } = {}) => {
  const n     = steps.length;
  const gap   = 28;
  const totalH = n * stepH + (n - 1) * gap;
  const startY = (H - totalH) / 2 + stepH / 2;
  const cx    = W / 2;

  const nodes = steps.map((s, i) => {
    const cy = startY + i * (stepH + gap);
    return node(cx, cy, stepW, stepH, s.label, s.sub || '', {
      fill:       s.fill   || C.surface,
      stroke:     s.stroke || C.border,
      titleColor: s.accent || C.text,
      titleSize:  12,
    });
  });

  const arrows = steps.slice(0, -1).map((_, i) => {
    const cy1 = startY + i * (stepH + gap) + stepH / 2;
    const cy2 = startY + (i + 1) * (stepH + gap) - stepH / 2;
    return arrow(cx, cy1, cx, cy2, { color: arrowColor, marker: arrowMarker });
  });

  const titleEl = title
    ? text(W / 2, 30, title, { size: 11, fill: C.textMuted, weight: '500', mono: true })
    : '';

  return svg([titleEl, ...arrows, ...nodes].join(''), { title });
};

/* ============================================================
   DIAGRAMAS ESPECÍFICOS POR LIÇÃO
   ============================================================ */

const DIAGRAMS = {

  /* ---- MÓDULO: CÉLULA ---- */

  'cell-what-is-life': () => {
    const steps = [
      { label: 'Ferimento',     sub: 'Ruptura tecidual',    fill: '#FFF8F5', stroke: C.rare,    accent: C.rare },
      { label: 'Plaquetas',     sub: 'Sinal químico',       fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Coagulação',    sub: 'Cascata proteica',    fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Fibroblastos',  sub: 'Síntese de colágeno', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Cicatrização',  sub: 'Tecido restaurado',   fill: '#F4FAF6', stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'RESPOSTA CELULAR AO DANO',
      arrowColor: C.primary,
      arrowMarker: 'ap',
      stepW: 108,
      stepH: 54,
      y: 185,
    });
  },

  'cell-types': () => {
    // Comparison: neurônio vs hemácia
    const colW = 240;
    const lx = W / 2 - colW / 2 - 20;
    const rx = W / 2 + colW / 2 + 20;
    const rows = [
      ['Forma',       'Axônio longo',       'Bicôncava'],
      ['Núcleo',      'Presente',           'Ausente (madura)'],
      ['Função',      'Transmissão elétrica','Transporte de O₂'],
      ['Divisão',     'Pós-natal limitada', 'Não se divide'],
    ];

    const header = [
      rect(lx - colW / 2, 42, colW, 44, { fill: '#F4FAF6', stroke: C.primary, rx: 8 }),
      text(lx, 64, 'Neurônio', { size: 13, fill: C.primary, weight: '700', serif: true }),
      rect(rx - colW / 2, 42, colW, 44, { fill: '#F5F8FC', stroke: C.info, rx: 8 }),
      text(rx, 64, 'Hemácia', { size: 13, fill: C.info, weight: '700', serif: true }),
    ];

    const divider = `<line x1="${W / 2}" y1="42" x2="${W / 2}" y2="${H - 30}"
      stroke="${C.border}" stroke-width="1" stroke-dasharray="4 3"/>`;

    const rowEls = rows.flatMap(([attr, left, right], i) => {
      const y = 110 + i * 58;
      return [
        rect(lx - colW / 2 + 8, y - 22, colW - 16, 48, { fill: C.surfaceAlt, stroke: C.border }),
        text(lx, y - 5, left,  { size: 11, fill: C.text }),
        text(lx, y + 10, attr, { size: 9, fill: C.textMuted, mono: true }),
        rect(rx - colW / 2 + 8, y - 22, colW - 16, 48, { fill: C.surfaceAlt, stroke: C.border }),
        text(rx, y - 5, right, { size: 11, fill: C.text }),
      ];
    });

    const titleEl = text(W / 2, 20, 'DIFERENCIAÇÃO CELULAR — MESMO DNA, FENÓTIPOS DISTINTOS',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, divider, ...header, ...rowEls].join(''));
  },

  'cell-membrane': () => {
    // Bicamada lipídica com proteínas de transporte
    const midY = H / 2;
    const t1 = midY - 30;  // top leaflet
    const t2 = midY + 30;  // bottom leaflet

    // Extracellular / intracellular labels
    const labels = [
      text(80, t1 - 50, 'Meio extracelular', { size: 11, fill: C.textMuted }),
      text(80, t2 + 50, 'Citoplasma', { size: 11, fill: C.textMuted }),
      `<line x1="40" y1="${t1 - 20}" x2="${W - 40}" y2="${t1 - 20}"
        stroke="${C.border}" stroke-width="1" stroke-dasharray="6 4"/>`,
      `<line x1="40" y1="${t2 + 20}" x2="${W - 40}" y2="${t2 + 20}"
        stroke="${C.border}" stroke-width="1" stroke-dasharray="6 4"/>`,
    ];

    // Lipid heads (circles) and tails (lines)
    const lipidCount = 22;
    const lipidSpacing = (W - 120) / (lipidCount - 1);
    const lipids = Array.from({ length: lipidCount }, (_, i) => {
      const x = 60 + i * lipidSpacing;
      const headR = 8;
      const tailL = 18;
      const c1Fill = (i % 3 === 0) ? C.primary : (i % 3 === 1) ? C.info : C.evo;
      return [
        // top leaflet
        circle(x, t1 - headR, headR, { fill: c1Fill + '30', stroke: c1Fill, sw: 1.5 }),
        `<line x1="${x}" y1="${t1}" x2="${x}" y2="${t1 + tailL}"
          stroke="${C.borderStr}" stroke-width="1.5"/>`,
        // bottom leaflet
        `<line x1="${x}" y1="${t2 - tailL}" x2="${x}" y2="${t2}"
          stroke="${C.borderStr}" stroke-width="1.5"/>`,
        circle(x, t2 + headR, headR, { fill: c1Fill + '30', stroke: c1Fill, sw: 1.5 }),
      ].join('');
    });

    // Protein channel (center)
    const pCx = W / 2;
    const protH = 80;
    const protW = 52;
    const protEl = [
      rect(pCx - protW / 2, midY - protH / 2 - 8, protW, protH + 16,
        { fill: `${C.energy}20`, stroke: C.energy, rx: 10 }),
      `<path d="M ${pCx - 10} ${midY - 14} L ${pCx - 10} ${midY + 14}
        M ${pCx + 10} ${midY - 14} L ${pCx + 10} ${midY + 14}"
        stroke="${C.energy}" stroke-width="2" fill="none"/>`,
      text(pCx, midY, 'canal', { size: 9, fill: C.energy, mono: true }),
    ];

    // Phospholipid label
    const callouts = [
      callout(200, t1 - 8, 150, t1 - 55, 'cabeça hidrofílica', { color: C.primary }),
      callout(200, t1 + 18, 150, t1 + 55, 'cauda hidrofóbica', { color: C.textMuted }),
      callout(pCx + protW / 2, midY, pCx + 120, midY, 'proteína transportadora', { color: C.energy }),
    ];

    const titleEl = text(W / 2, 22, 'BICAMADA LIPÍDICA — MODELO DE MOSAICO FLUIDO',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...labels, ...lipids, ...protEl, ...callouts].join(''));
  },

  'cell-nucleus': () => {
    // Hierarchy: DNA → Nucleosome → Chromatin fiber → Chromosome
    const levels = [
      { label: 'Dupla hélice', sub: '2 nm', cx: 100, cy: 180, r: 20, fill: `${C.info}15`, stroke: C.info },
      { label: 'Nucleossomo',  sub: '11 nm', cx: 230, cy: 180, r: 32, fill: `${C.info}20`, stroke: C.info },
      { label: 'Fibra 30 nm', sub: '30 nm', cx: 380, cy: 180, r: 46, fill: `${C.info}28`, stroke: C.info },
      { label: 'Cromossomo',  sub: '700 nm', cx: 560, cy: 180, r: 68, fill: `${C.info}35`, stroke: C.info },
    ];

    const circles = levels.map(l =>
      circle(l.cx, l.cy, l.r, { fill: l.fill, stroke: l.stroke, sw: 2 }));
    const labels = levels.map(l => [
      text(l.cx, l.cy - l.r - 18, l.label, { size: 11, fill: C.text, weight: '600' }),
      text(l.cx, l.cy - l.r - 6, l.sub, { size: 9, fill: l.stroke, mono: true }),
    ].join(''));

    const arrows = levels.slice(0, -1).map((l, i) => {
      const x1 = l.cx + l.r + 4;
      const x2 = levels[i + 1].cx - levels[i + 1].r - 4;
      return arrow(x1, l.cy, x2, l.cy, { color: C.info, marker: 'ai' });
    });

    const scaleLabel = text(W / 2, H - 28, 'Nível de compactação aumenta →',
      { size: 10, fill: C.textMuted });
    const titleEl = text(W / 2, 28, 'COMPACTAÇÃO DO DNA — DA DUPLA HÉLICE AO CROMOSSOMO',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...arrows, ...circles, ...labels, scaleLabel].join(''));
  },

  'cell-organelas': () => {
    // Cell cross-section with 6 labeled organelles
    const cx = W / 2;
    const cy = H / 2 + 10;

    // Outer cell membrane
    const cellEl = [
      `<ellipse cx="${cx}" cy="${cy}" rx="280" ry="155" fill="${C.surfaceAlt}" stroke="${C.primary}" stroke-width="2.5"/>`,
      // Nucleus
      `<ellipse cx="${cx - 60}" cy="${cy - 20}" rx="70" ry="55" fill="${C.info}15" stroke="${C.info}" stroke-width="2"/>`,
      text(cx - 60, cy - 20, 'Núcleo', { size: 10, fill: C.info, weight: '600' }),
      // Mitochondria
      `<ellipse cx="${cx + 120}" cy="${cy - 45}" rx="42" ry="22" fill="${C.energy}20" stroke="${C.energy}" stroke-width="1.5"/>`,
      `<path d="M ${cx + 100} ${cy - 45} Q ${cx + 120} ${cy - 58} ${cx + 140} ${cy - 45}
               Q ${cx + 120} ${cy - 32} ${cx + 100} ${cy - 45}" fill="${C.energy}25" stroke="${C.energy}" stroke-width="1"/>`,
      text(cx + 120, cy - 45, 'Mitocôndria', { size: 9, fill: C.energy, weight: '600' }),
      // ER rough
      `<path d="M ${cx + 40} ${cy + 30} Q ${cx + 80} ${cy + 10} ${cx + 100} ${cy + 50}
               Q ${cx + 120} ${cy + 70} ${cx + 60} ${cy + 80}"
        fill="none" stroke="${C.evo}" stroke-width="3"/>`,
      text(cx + 80, cy + 65, 'Ret. endoplasmático', { size: 9, fill: C.evo }),
      // Golgi
      `<path d="M ${cx - 130} ${cy + 40} Q ${cx - 100} ${cy + 35} ${cx - 100} ${cy + 55}
               Q ${cx - 100} ${cy + 75} ${cx - 130} ${cy + 70}" fill="none" stroke="${C.primary}" stroke-width="2.5"/>`,
      `<path d="M ${cx - 140} ${cy + 35} Q ${cx - 108} ${cy + 30} ${cx - 108} ${cy + 55}
               Q ${cx - 108} ${cy + 80} ${cx - 140} ${cy + 75}" fill="none" stroke="${C.primary}" stroke-width="2"/>`,
      text(cx - 120, cy + 92, 'Ap. de Golgi', { size: 9, fill: C.primary }),
      // Lysosome
      circle(cx + 170, cy + 55, 18, { fill: `${C.rare}20`, stroke: C.rare, sw: 1.5 }),
      text(cx + 170, cy + 55, 'Lis', { size: 9, fill: C.rare }),
      // Ribosome dots
      ...Array.from({ length: 8 }, (_, i) => {
        const bx = cx - 40 + (i % 4) * 14;
        const by = cy + 20 + Math.floor(i / 4) * 14;
        return circle(bx, by, 4, { fill: C.textMuted, stroke: C.textMuted, sw: 1 });
      }),
      text(cx - 20, cy + 50, 'Ribossomos', { size: 9, fill: C.textMuted }),
    ];

    const titleEl = text(W / 2, 22, 'COMPARTIMENTALIZAÇÃO CELULAR — DIVISÃO DO TRABALHO',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...cellEl].join(''));
  },

  /* ---- MÓDULO: GENÉTICA ---- */

  'gen-dna-structure': () => {
    // DNA double helix schematic
    const steps = [
      { label: 'Nucleotídeo', sub: 'base + açúcar + fosfato', fill: `${C.info}15`, stroke: C.info },
      { label: 'Dupla hélice', sub: '2 nm / A-T  G-C',       fill: `${C.info}20`, stroke: C.info },
      { label: 'Nucleossomo', sub: '+ histonas / 11 nm',      fill: `${C.info}28`, stroke: C.info },
      { label: 'Cromossomo',  sub: '× 10.000 / visível ao MO', fill: `${C.info}35`, stroke: C.info, accent: C.info },
    ];
    return flowH(steps, {
      title: 'DA MOLÉCULA AO CROMOSSOMO — COMPACTAÇÃO HIERÁRQUICA',
      arrowColor: C.info,
      arrowMarker: 'ai',
      stepW: 130,
      stepH: 56,
      y: 185,
    });
  },

  'gen-genes': () => {
    // Gene anatomy diagram
    const gy = 165;
    const geneW = 560;
    const gx = (W - geneW) / 2;

    // Chromosome backbone
    const backbone = [
      rect(gx - 20, gy - 14, geneW + 40, 28, { fill: `${C.info}12`, stroke: C.info, rx: 14 }),
      text(W / 2, gy, 'DNA cromossômico', { size: 10, fill: C.info }),
    ];

    // Gene segments
    const regions = [
      { label: 'Promotor', x: gx + 20, w: 90, fill: `${C.primary}25`, stroke: C.primary },
      { label: 'Éxon 1',   x: gx + 130, w: 70, fill: `${C.info}30`, stroke: C.info },
      { label: 'Íntron',   x: gx + 210, w: 80, fill: `${C.border}`, stroke: C.borderStr, dashed: true },
      { label: 'Éxon 2',   x: gx + 300, w: 70, fill: `${C.info}30`, stroke: C.info },
      { label: 'Íntron 2', x: gx + 380, w: 70, fill: `${C.border}`, stroke: C.borderStr, dashed: true },
      { label: 'Éxon 3',   x: gx + 460, w: 70, fill: `${C.info}30`, stroke: C.info },
    ];

    const segEls = regions.map(s => [
      `<rect x="${s.x}" y="${gy - 18}" width="${s.w}" height="36" rx="4"
        fill="${s.fill}" stroke="${s.stroke}" stroke-width="1.5"
        ${s.dashed ? 'stroke-dasharray="4 3"' : ''}/>`,
      text(s.x + s.w / 2, gy, s.label, { size: 10, fill: C.text, weight: '600' }),
    ].join(''));

    // Arrow indicating transcription direction
    const arrEl = arrow(gx, gy - 44, gx + geneW, gy - 44, { color: C.primary, marker: 'ap' });
    const arrLabel = text(W / 2, gy - 58, 'direção da transcrição', { size: 9, fill: C.primary, mono: true });

    // Labels below
    const notes = [
      text(gx + 65, gy + 45, 'Onde RNA polimerase\nse liga', { size: 9, fill: C.primary }),
      text(gx + 300, gy + 45, 'Éxons: codificantes  |  Íntrons: removidos no splicing', { size: 9, fill: C.textMuted }),
    ];

    const titleEl = text(W / 2, 25, 'ANATOMIA DO GENE — PROMOTOR, ÉXONS E ÍNTRONS',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...backbone, ...segEls, arrEl, arrLabel, ...notes].join(''));
  },

  'gen-expression': () => {
    const steps = [
      { label: 'DNA',          sub: 'no núcleo',           fill: `${C.info}15`, stroke: C.info,    accent: C.info },
      { label: 'pré-mRNA',     sub: 'transcrição',         fill: C.surfaceAlt,  stroke: C.borderStr },
      { label: 'mRNA maduro',  sub: 'splicing + processamento', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Proteína',     sub: 'tradução (ribossomo)', fill: `${C.primary}15`, stroke: C.primary },
      { label: 'Função',       sub: 'catálise / estrutura', fill: `${C.primary}25`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'DOGMA CENTRAL DA BIOLOGIA MOLECULAR',
      arrowColor: C.primary,
      arrowMarker: 'ap',
      stepW: 106,
      stepH: 54,
      y: 185,
    });
  },

  'gen-inheritance': () => {
    // Meiosis simplified
    const steps = [
      { label: 'Célula diploide', sub: '2n = 46 (humanos)', fill: `${C.info}18`, stroke: C.info },
      { label: 'Meiose I',        sub: 'Crossing-over / segregação', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Meiose II',       sub: 'Divisão celular',   fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Gameta',          sub: 'n = 23 / haploides', fill: `${C.evo}18`, stroke: C.evo, accent: C.evo },
    ];
    return flowH(steps, {
      title: 'MEIOSE — ORIGEM DOS GAMETAS GENETICAMENTE ÚNICOS',
      arrowColor: C.evo,
      arrowMarker: 'av',
      stepW: 130,
      stepH: 56,
      y: 185,
    });
  },

  'gen-mutation': () => {
    // Two columns: normal vs mutated
    const colW = 250;
    const lx = 160;
    const rx = W - 160;

    const leftItems = [
      'ATG — Met',
      'GGC — Gly',
      'AAA — Lys',
      'TTC — Phe',
    ];
    const rightItems_point = [
      'ATG — Met',
      'GAC — Asp  ← missense',
      'AAA — Lys',
      'TTC — Phe',
    ];
    const rightItems_frame = [
      'ATG — Met',
      'GCA — Ala  ← frameshift',
      'AAT — Asn',
      'TCF — ???',
    ];

    const header = [
      rect(lx - colW / 2, 42, colW, 38, { fill: `${C.primary}12`, stroke: C.primary }),
      text(lx, 61, 'Sequência normal', { size: 12, fill: C.primary, weight: '700' }),
      rect(rx - colW / 2, 42, colW, 38, { fill: `${C.rare}12`, stroke: C.rare }),
      text(rx, 61, 'Mutação pontual (missense)', { size: 11, fill: C.rare, weight: '700' }),
    ];

    const normal = leftItems.map((item, i) => [
      rect(lx - colW / 2 + 10, 95 + i * 46, colW - 20, 38, { fill: C.surfaceAlt, stroke: C.border }),
      text(lx, 114 + i * 46, item, { size: 11, fill: C.text, mono: true }),
    ].join(''));

    const mutated = rightItems_point.map((item, i) => [
      rect(rx - colW / 2 + 10, 95 + i * 46, colW - 20, 38, {
        fill: i === 1 ? `${C.rare}15` : C.surfaceAlt,
        stroke: i === 1 ? C.rare : C.border,
      }),
      text(rx, 114 + i * 46, item, { size: 11, fill: i === 1 ? C.rare : C.text, mono: true }),
    ].join(''));

    const divider = `<line x1="${W / 2}" y1="42" x2="${W / 2}" y2="${H - 40}"
      stroke="${C.border}" stroke-width="1" stroke-dasharray="4 3"/>`;

    const note = text(W / 2, H - 22,
      'Mutação frameshift: inserção/deleção altera todos os códons seguintes',
      { size: 9, fill: C.textMuted });

    const titleEl = text(W / 2, 22, 'TIPOS DE MUTAÇÃO E CONSEQUÊNCIAS NA PROTEÍNA',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, divider, ...header, ...normal, ...mutated, note].join(''));
  },

  /* ---- MÓDULO: METABOLISMO ---- */

  'met-energy': () => {
    const steps = [
      { label: 'Alimento',      sub: 'carboidratos / lipídios', fill: `${C.energy}15`, stroke: C.energy },
      { label: 'Digestão',      sub: 'quebra em monômeros',     fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Glicose',       sub: 'C₆H₁₂O₆',                fill: `${C.energy}20`, stroke: C.energy },
      { label: 'ATP',           sub: '~30 mol por mol glicose', fill: `${C.primary}20`, stroke: C.primary },
      { label: 'Trabalho cel.', sub: 'síntese / movimento',     fill: `${C.primary}30`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'FLUXO DE ENERGIA — DO ALIMENTO AO TRABALHO CELULAR',
      arrowColor: C.energy,
      arrowMarker: 'ae',
      stepW: 106,
      stepH: 54,
      y: 185,
    });
  },

  'met-atp': () => {
    // ATP molecule + hydrolysis
    const cy = H / 2;
    const cx = W / 2 - 60;

    // ATP structure
    const atpEl = [
      // Adenine
      rect(cx - 180, cy - 40, 100, 80, { fill: `${C.info}20`, stroke: C.info, rx: 8 }),
      text(cx - 130, cy - 10, 'Adenina', { size: 11, fill: C.info, weight: '600' }),
      text(cx - 130, cy + 8, '(base nitrogenada)', { size: 8, fill: C.textMuted }),
      // Sugar
      circle(cx - 60, cy, 32, { fill: `${C.evo}18`, stroke: C.evo }),
      text(cx - 60, cy - 6, 'Ribose', { size: 10, fill: C.evo, weight: '600' }),
      text(cx - 60, cy + 8, '(açúcar)', { size: 8, fill: C.textMuted }),
      // Phosphates
      circle(cx + 10, cy, 22, { fill: `${C.energy}25`, stroke: C.energy }),
      text(cx + 10, cy - 4, 'P', { size: 11, fill: C.energy, weight: '700' }),
      text(cx + 10, cy + 8, 'α', { size: 8, fill: C.energy }),
      circle(cx + 56, cy, 22, { fill: `${C.energy}35`, stroke: C.energy }),
      text(cx + 56, cy - 4, 'P', { size: 11, fill: C.energy, weight: '700' }),
      text(cx + 56, cy + 8, 'β', { size: 8, fill: C.energy }),
      circle(cx + 102, cy, 22, { fill: `${C.energy}50`, stroke: C.energy, sw: 2 }),
      text(cx + 102, cy - 4, 'P', { size: 11, fill: C.energy, weight: '700' }),
      text(cx + 102, cy + 8, 'γ', { size: 8, fill: C.energy }),
      // Hydrolysis arrow
      `<path d="M ${cx + 124} ${cy} Q ${cx + 160} ${cy - 40} ${cx + 200} ${cy - 10}"
        fill="none" stroke="${C.primary}" stroke-width="1.5" marker-end="url(#ap)"/>`,
      text(cx + 175, cy - 50, '+H₂O', { size: 10, fill: C.textMuted }),
      text(cx + 240, cy - 10, 'ADP + Pi', { size: 11, fill: C.primary, weight: '600' }),
      text(cx + 240, cy + 8, '+30,5 kJ/mol', { size: 9, fill: C.primary, mono: true }),
      // Bond label
      `<path d="M ${cx + 78} ${cy - 22} L ${cx + 78} ${cy - 50}" stroke="${C.energy}" stroke-width="1" stroke-dasharray="3 2"/>`,
      text(cx + 78, cy - 58, 'ligação de alta energia', { size: 9, fill: C.energy }),
    ];

    // Link Adenine to ribose
    const linker = [
      `<line x1="${cx - 80}" y1="${cy}" x2="${cx - 92}" y2="${cy}" stroke="${C.borderStr}" stroke-width="1.5"/>`,
    ];

    const titleEl = text(W / 2, 25, 'ATP — MOEDA ENERGÉTICA UNIVERSAL DA CÉLULA',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...atpEl, ...linker].join(''));
  },

  'met-respiration': () => {
    const steps = [
      { label: 'Glicose',      sub: 'C₆H₁₂O₆',         fill: `${C.energy}15`, stroke: C.energy },
      { label: 'Glicólise',    sub: 'citoplasma / 2 ATP', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Ciclo de Krebs', sub: 'mitocôndria / NADH', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Cadeia resp.', sub: 'membrana interna',   fill: C.surfaceAlt, stroke: C.borderStr },
      { label: '~30 ATP',      sub: '+ CO₂ + H₂O',       fill: `${C.primary}25`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'RESPIRAÇÃO CELULAR AERÓBICA — TRÊS ETAPAS',
      arrowColor: C.energy,
      arrowMarker: 'ae',
      stepW: 108,
      stepH: 54,
      y: 175,
    });
  },

  'met-photosynthesis': () => {
    const steps = [
      { label: 'Luz solar',    sub: 'fótons',              fill: `${C.energy}20`, stroke: C.energy, accent: C.energy },
      { label: 'Fotossistemas', sub: 'PS II + PS I',       fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'ATP + NADPH',  sub: 'fotólise da água / O₂', fill: `${C.primary}15`, stroke: C.primary },
      { label: 'Ciclo de Calvin', sub: 'fixação do CO₂ / estroma', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Glicose (G3P)', sub: 'matéria orgânica',   fill: `${C.evo}20`, stroke: C.evo, accent: C.evo },
    ];
    return flowH(steps, {
      title: 'FOTOSSÍNTESE — LUZ EM MATÉRIA ORGÂNICA',
      arrowColor: C.evo,
      arrowMarker: 'av',
      stepW: 108,
      stepH: 54,
      y: 185,
    });
  },

  'met-comparison': () => {
    // Comparison: photosynthesis vs respiration
    const colW = 235;
    const lx = 165;
    const rx = W - 165;

    const rows = [
      ['Local',        'Cloroplastos',     'Mitocôndrias'],
      ['Entradas',     'CO₂ + H₂O + luz',  'O₂ + glicose'],
      ['Saídas',       'O₂ + glicose',     'CO₂ + H₂O + ATP'],
      ['Função',       'Capturar energia', 'Liberar energia'],
    ];

    const header = [
      rect(lx - colW / 2, 40, colW, 42, { fill: `${C.evo}15`, stroke: C.evo, rx: 8 }),
      text(lx, 61, 'Fotossíntese', { size: 13, fill: C.evo, weight: '700', serif: true }),
      rect(rx - colW / 2, 40, colW, 42, { fill: `${C.energy}15`, stroke: C.energy, rx: 8 }),
      text(rx, 61, 'Respiração celular', { size: 13, fill: C.energy, weight: '700', serif: true }),
    ];

    const divider = `<line x1="${W / 2}" y1="40" x2="${W / 2}" y2="${H - 30}"
      stroke="${C.border}" stroke-width="1.5" stroke-dasharray="5 4"/>`;

    const rowEls = rows.flatMap(([attr, left, right], i) => {
      const y = 102 + i * 56;
      return [
        rect(lx - colW / 2 + 8, y, colW - 16, 46, { fill: C.surfaceAlt, stroke: C.border }),
        text(lx, y + 16, left,  { size: 11, fill: C.text }),
        text(lx, y + 32, attr, { size: 9, fill: C.textMuted, mono: true }),
        rect(rx - colW / 2 + 8, y, colW - 16, 46, { fill: C.surfaceAlt, stroke: C.border }),
        text(rx, y + 16, right, { size: 11, fill: C.text }),
      ];
    });

    const note = text(W / 2, H - 20, 'Ambos usam cadeias de transporte de elétrons em membranas',
      { size: 9, fill: C.textMuted });

    const titleEl = text(W / 2, 20, 'FOTOSSÍNTESE vs RESPIRAÇÃO — PAR COMPLEMENTAR',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, divider, ...header, ...rowEls, note].join(''));
  },

  /* ---- MÓDULO: SISTEMAS DO CORPO ---- */

  'sys-homeostasis': () => {
    // Feedback loop (circular)
    const cx = W / 2;
    const cy = H / 2 + 10;
    const r  = 115;

    // Nodes at 4 cardinal positions
    const nodes_pos = [
      { angle: -90, label: 'Estímulo',    sub: 'desvio do set point', fill: `${C.rare}15`, stroke: C.rare },
      { angle:   0, label: 'Receptor',    sub: 'termorreceptor, etc.', fill: C.surfaceAlt, stroke: C.borderStr },
      { angle:  90, label: 'Centro integrador', sub: 'hipotálamo / SNC', fill: `${C.primary}15`, stroke: C.primary },
      { angle: 180, label: 'Efetor',      sub: 'músculo / glândula',    fill: C.surfaceAlt, stroke: C.borderStr },
    ];

    const toRad = d => (d * Math.PI) / 180;
    const nW = 130;
    const nH = 50;

    const nodeEls = nodes_pos.map(n => {
      const nx = cx + r * Math.cos(toRad(n.angle));
      const ny = cy + r * Math.sin(toRad(n.angle));
      return node(nx, ny, nW, nH, n.label, n.sub, { fill: n.fill, stroke: n.stroke, titleSize: 11 });
    });

    // Arrows between nodes (clockwise)
    const arcArrows = nodes_pos.map((n, i) => {
      const next = nodes_pos[(i + 1) % nodes_pos.length];
      const a1 = toRad(n.angle);
      const a2 = toRad(next.angle);
      const x1 = cx + (r + 10) * Math.cos(a1);
      const y1 = cy + (r + 10) * Math.sin(a1);
      const x2 = cx + (r + 10) * Math.cos(a2);
      const y2 = cy + (r + 10) * Math.sin(a2);
      const mx = cx + (r + 45) * Math.cos((a1 + a2) / 2);
      const my = cy + (r + 45) * Math.sin((a1 + a2) / 2);
      return arrowPath(`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        { color: C.primary, marker: 'ap' });
    });

    // Center label
    const center = [
      circle(cx, cy, 38, { fill: `${C.primary}10`, stroke: C.primary }),
      text(cx, cy - 6, 'Feedback', { size: 11, fill: C.primary, weight: '700' }),
      text(cx, cy + 8, 'negativo', { size: 11, fill: C.primary, weight: '700' }),
    ];

    const titleEl = text(W / 2, 22, 'HOMEOSTASE — CICLO DE FEEDBACK NEGATIVO',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...arcArrows, ...nodeEls, ...center].join(''));
  },

  'sys-digestive': () => {
    const steps = [
      { label: 'Boca',           sub: 'amilase salivar',       fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Estômago',       sub: 'HCl + pepsina / pH 2',  fill: `${C.rare}12`, stroke: C.rare },
      { label: 'Int. delgado',   sub: 'enzimas pancreáticas',   fill: `${C.energy}15`, stroke: C.energy },
      { label: 'Absorção',       sub: 'microvilosidades',       fill: `${C.primary}15`, stroke: C.primary },
      { label: 'Sangue portal',  sub: '→ fígado → células',    fill: `${C.primary}25`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'DIGESTÃO — DO AMIDO AO NUTRIENTE ABSORVÍVEL',
      arrowColor: C.energy,
      arrowMarker: 'ae',
      stepW: 106,
      stepH: 54,
      y: 185,
    });
  },

  'sys-circulatory': () => {
    // Double circulation loop
    const lCx = W / 2 - 140;
    const rCx = W / 2 + 140;
    const heartCx = W / 2;
    const heartCy = H / 2;

    const nodes_c = [
      { cx: heartCx, cy: heartCy,     label: 'Coração',  sub: '4 câmaras', fill: `${C.rare}20`, stroke: C.rare, w: 110, h: 56 },
      { cx: lCx,     cy: heartCy - 80, label: 'Pulmões', sub: 'troca O₂/CO₂', fill: `${C.info}18`, stroke: C.info, w: 110, h: 48 },
      { cx: rCx,     cy: heartCy + 80, label: 'Tecidos', sub: 'consumo de O₂', fill: `${C.evo}18`, stroke: C.evo, w: 110, h: 48 },
    ];

    const nodeEls = nodes_c.map(n =>
      node(n.cx, n.cy, n.w, n.h, n.label, n.sub, { fill: n.fill, stroke: n.stroke, titleSize: 12 }));

    // Pulmonary circulation
    const pulm = [
      arrowPath(`M ${heartCx - 40} ${heartCy - 28} Q ${heartCx - 120} ${heartCy - 60} ${lCx + 55} ${heartCy - 80}`,
        { color: C.info, marker: 'ai' }),
      arrowPath(`M ${lCx + 55} ${heartCy - 80} Q ${heartCx + 60} ${heartCy - 90} ${heartCx + 30} ${heartCy - 28}`,
        { color: C.info, marker: 'ai' }),
      text(heartCx - 80, heartCy - 88, 'venoso', { size: 9, fill: C.info, mono: true }),
      text(heartCx + 78, heartCy - 88, 'arterial', { size: 9, fill: C.info, mono: true }),
    ];

    // Systemic circulation
    const syst = [
      arrowPath(`M ${heartCx + 40} ${heartCy + 28} Q ${heartCx + 130} ${heartCy + 50} ${rCx - 55} ${heartCy + 80}`,
        { color: C.evo, marker: 'av' }),
      arrowPath(`M ${rCx - 55} ${heartCy + 80} Q ${heartCx - 70} ${heartCy + 100} ${heartCx - 40} ${heartCy + 28}`,
        { color: C.evo, marker: 'av' }),
      text(heartCx + 120, heartCy + 40, 'com O₂', { size: 9, fill: C.evo, mono: true }),
      text(heartCx - 110, heartCy + 100, 'sem O₂', { size: 9, fill: C.evo, mono: true }),
    ];

    // Labels
    const circ_labels = [
      text(heartCx - 140, heartCy - 140, 'Circulação pulmonar (pequena)', { size: 10, fill: C.info }),
      text(heartCx + 50,  heartCy + 140, 'Circulação sistêmica (grande)', { size: 10, fill: C.evo }),
    ];

    const titleEl = text(W / 2, 22, 'DUPLA CIRCULAÇÃO — PULMONAR E SISTÊMICA',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...pulm, ...syst, ...nodeEls, ...circ_labels].join(''));
  },

  'sys-respiratory': () => {
    // Alveolus cross-section with gas exchange
    const avCx = W / 2;
    const avCy = H / 2 + 20;
    const avR  = 110;

    const alveolus = [
      // Alveolar air space
      `<ellipse cx="${avCx}" cy="${avCy}" rx="${avR}" ry="${avR * 0.85}"
        fill="${C.surfaceAlt}" stroke="${C.border}" stroke-width="2"/>`,
      text(avCx, avCy, 'Espaço alveolar', { size: 12, fill: C.textMuted }),
      text(avCx, avCy + 16, '(ar inspirado)', { size: 10, fill: C.textMuted }),
      // Alveolar wall
      `<ellipse cx="${avCx}" cy="${avCy}" rx="${avR + 18}" ry="${avR * 0.85 + 18}"
        fill="none" stroke="${C.primary}80" stroke-width="10"/>`,
      text(avCx - avR - 28, avCy - 30, 'parede', { size: 9, fill: C.primary }),
      text(avCx - avR - 28, avCy - 18, 'alveolar', { size: 9, fill: C.primary }),
      // Capillary
      `<path d="M ${avCx - avR - 50} ${avCy + 70} Q ${avCx} ${avCy + avR * 0.85 + 50} ${avCx + avR + 50} ${avCy + 70}"
        fill="none" stroke="${C.rare}" stroke-width="16" stroke-opacity="0.4"/>`,
      `<path d="M ${avCx - avR - 50} ${avCy + 70} Q ${avCx} ${avCy + avR * 0.85 + 50} ${avCx + avR + 50} ${avCy + 70}"
        fill="none" stroke="${C.rare}" stroke-width="2"/>`,
      text(avCx, avCy + avR * 0.85 + 62, 'capilar pulmonar', { size: 10, fill: C.rare }),
    ];

    // Gas exchange arrows
    const gasEx = [
      // O2 entering blood
      arrow(avCx - 40, avCy + avR * 0.6, avCx - 40, avCy + avR * 0.85 + 40,
        { color: C.primary, marker: 'ap' }),
      text(avCx - 55, avCy + avR * 0.75, 'O₂', { size: 14, fill: C.primary, weight: '700' }),
      // CO2 leaving blood
      arrow(avCx + 40, avCy + avR * 0.85 + 40, avCx + 40, avCy + avR * 0.6,
        { color: C.energy, marker: 'ae' }),
      text(avCx + 58, avCy + avR * 0.75, 'CO₂', { size: 14, fill: C.energy, weight: '700' }),
      // pO2 and pCO2 labels
      text(avCx - 70, avCy - 60, 'pO₂ alta no alvéolo', { size: 9, fill: C.primary }),
      text(avCx + 30, avCy - 60, 'pCO₂ alta no sangue venoso', { size: 9, fill: C.energy }),
    ];

    const note = text(W / 2, H - 20, 'Difusão passiva — guiada por gradiente de pressão parcial',
      { size: 9, fill: C.textMuted });

    const titleEl = text(W / 2, 22, 'HEMATOSE — TROCA GASOSA NO ALVÉOLO PULMONAR',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...alveolus, ...gasEx, note].join(''));
  },

  'sys-nervous': () => {
    // Reflex arc
    const steps = [
      { label: 'Estímulo',      sub: 'nociceptor / pele',      fill: `${C.rare}15`,    stroke: C.rare },
      { label: 'Neurônio aferente', sub: '→ medula espinhal',  fill: C.surfaceAlt,    stroke: C.borderStr },
      { label: 'Interneurônio', sub: 'medula / sem córtex',    fill: `${C.info}18`,   stroke: C.info },
      { label: 'Neurônio motor', sub: '→ músculo',             fill: C.surfaceAlt,    stroke: C.borderStr },
      { label: 'Contração',     sub: 'retirada do membro',     fill: `${C.primary}20`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'ARCO REFLEXO — RESPOSTA SEM PROCESSAMENTO CORTICAL',
      arrowColor: C.info,
      arrowMarker: 'ai',
      stepW: 106,
      stepH: 54,
      y: 185,
    });
  },

  'sys-integration': () => {
    const steps = [
      { label: 'Percepção',   sub: 'amígdala / ameaça',       fill: `${C.rare}15`, stroke: C.rare },
      { label: 'Hipotálamo',  sub: 'CRH / ativação simpática', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Hipófise',    sub: 'ACTH / catecolaminas',    fill: C.surfaceAlt, stroke: C.borderStr },
      { label: 'Gl. adrenal', sub: 'cortisol + adrenalina',   fill: `${C.energy}18`, stroke: C.energy },
      { label: 'Resposta',    sub: '↑ FC / ↓ digestão / ↑ glicose', fill: `${C.energy}28`, stroke: C.energy, accent: C.energy },
    ];
    return flowH(steps, {
      title: 'EIXO NEUROENDÓCRINO — RESPOSTA INTEGRADA AO ESTRESSE',
      arrowColor: C.energy,
      arrowMarker: 'ae',
      stepW: 106,
      stepH: 56,
      y: 185,
    });
  },

  /* ---- MÓDULO: ECOLOGIA ---- */

  'eco-ecosystem': () => {
    // Trophic cascade: wolf → elk → vegetation → river
    const steps = [
      { label: 'Lobo (ausente)',      sub: 'predador de topo',         fill: `${C.rare}18`, stroke: C.rare,    accent: C.rare },
      { label: '↑ Alce',             sub: 'sem controle / superpastejo', fill: C.surfaceAlt, stroke: C.borderStr },
      { label: '↓ Vegetação ribeirinha', sub: 'margem instável',       fill: `${C.evo}15`, stroke: C.evo },
      { label: 'Erosão do solo',      sub: 'curso do rio alterado',    fill: `${C.energy}18`, stroke: C.energy },
      { label: 'Colapso do ecossistema', sub: 'Yellowstone 1926–1995', fill: `${C.rare}25`, stroke: C.rare, accent: C.rare },
    ];
    return flowH(steps, {
      title: 'CASCATA TRÓFICA — ESPÉCIE-CHAVE E EFEITOS EM CASCATA',
      arrowColor: C.rare,
      arrowMarker: 'a',
      stepW: 106,
      stepH: 56,
      y: 185,
    });
  },

  'eco-food-chains': () => {
    // Vertical energy pyramid
    const levels = [
      { label: 'Sol',            sub: 'energia solar', energy: '100%', w: 560, fill: `${C.energy}20`, stroke: C.energy },
      { label: 'Produtores (N1)', sub: 'capim / plantas', energy: '10%', w: 420, fill: `${C.evo}22`, stroke: C.evo },
      { label: 'Herbívoros (N2)', sub: 'gafanhoto',      energy: '1%',  w: 290, fill: `${C.primary}22`, stroke: C.primary },
      { label: 'Carnívoros (N3)', sub: 'sapo / serpente', energy: '0.1%', w: 170, fill: `${C.info}25`, stroke: C.info },
      { label: 'Topo (N4)',      sub: 'gavião',          energy: '0.01%', w: 80, fill: `${C.rare}25`, stroke: C.rare },
    ];

    const totalH = levels.length * 50 + (levels.length - 1) * 8;
    const startY = (H - totalH) / 2 + 30;
    const cx = W / 2;

    const bars = levels.map((l, i) => {
      const y = startY + i * 58;
      const x = cx - l.w / 2;
      return [
        rect(x, y, l.w, 44, { fill: l.fill, stroke: l.stroke, rx: 6 }),
        text(cx, y + 15, l.label, { size: 11, fill: C.text, weight: '600' }),
        text(cx, y + 30, l.sub, { size: 9, fill: C.textMuted }),
        text(cx + l.w / 2 + 12, y + 22, l.energy, { size: 10, fill: l.stroke, weight: '700', anchor: 'start', mono: true }),
      ].join('');
    });

    // Arrow on right showing energy loss
    const arrY1 = startY + 22;
    const arrY2 = startY + totalH - 22;
    const arrX  = W - 60;
    const energyArrow = [
      arrow(arrX, arrY1, arrX, arrY2, { color: C.energy, marker: 'ae' }),
      text(arrX + 16, (arrY1 + arrY2) / 2, '~90%', { size: 10, fill: C.energy, anchor: 'start' }),
      text(arrX + 16, (arrY1 + arrY2) / 2 + 14, 'perdido', { size: 9, fill: C.textMuted, anchor: 'start' }),
      text(arrX + 16, (arrY1 + arrY2) / 2 + 26, 'como calor', { size: 9, fill: C.textMuted, anchor: 'start' }),
    ];

    const titleEl = text(W / 2, 22, 'PIRÂMIDE DE ENERGIA — REGRA DOS 10%',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...bars, ...energyArrow].join(''));
  },

  'eco-relations': () => {
    // Central organism with 5 relation types
    const cx = W / 2;
    const cy = H / 2 + 10;
    const r  = 125;

    const center = node(cx, cy, 120, 50, 'Organismo A', 'espécie focal',
      { fill: `${C.primary}18`, stroke: C.primary, titleSize: 12 });

    const relations = [
      { angle: -90, label: 'Organismo B', sub: 'mutualismo (+/+)', color: C.evo,    rel: '+/+' },
      { angle:  -20, label: 'Organismo C', sub: 'parasitismo (+/−)', color: C.rare,  rel: '+/−' },
      { angle:   60, label: 'Organismo D', sub: 'competição (−/−)', color: C.energy, rel: '−/−' },
      { angle:  145, label: 'Organismo E', sub: 'predação (+/−)',    color: C.rare,   rel: '+/−' },
      { angle:  220, label: 'Organismo F', sub: 'comensalismo (+/0)', color: C.info, rel: '+/0' },
    ];

    const toRad = d => (d * Math.PI) / 180;
    const nodeW = 120;
    const nodeH = 48;

    const relEls = relations.flatMap(n => {
      const nx = cx + r * Math.cos(toRad(n.angle));
      const ny = cy + r * Math.sin(toRad(n.angle));
      // Direction of arrow from center to node
      const dx = nx - cx;
      const dy = ny - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const x1 = cx + (dx / dist) * 62;
      const y1 = cy + (dy / dist) * 28;
      const x2 = nx - (dx / dist) * (nodeW / 2 + 2);
      const y2 = ny - (dy / dist) * (nodeH / 2 + 2);
      return [
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${n.color}" stroke-width="1.5" marker-end="url(#a)" opacity="0.7"/>`,
        node(nx, ny, nodeW, nodeH, n.label, n.sub,
          { fill: `${n.color}15`, stroke: n.color, titleSize: 11 }),
      ];
    });

    const titleEl = text(W / 2, 22, 'INTERAÇÕES ECOLÓGICAS — EFEITOS SOBRE CADA ESPÉCIE',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...relEls, center].join(''));
  },

  'eco-cycles': () => {
    // Carbon cycle
    const nodes_cy = [
      { angle: -90, label: 'Atmosfera',   sub: 'CO₂ (428 ppm)',       fill: `${C.info}20`,    stroke: C.info },
      { angle:   0, label: 'Produtores',  sub: 'fotossíntese',         fill: `${C.evo}22`,     stroke: C.evo },
      { angle:  72, label: 'Consumidores', sub: 'respiração',          fill: `${C.primary}18`, stroke: C.primary },
      { angle: 144, label: 'Decompositores', sub: 'mineralização',     fill: `${C.energy}20`,  stroke: C.energy },
      { angle: 216, label: 'Solo / Água', sub: 'reservatório',         fill: C.surfaceAlt,     stroke: C.borderStr },
    ];

    const cx = W / 2;
    const cy = H / 2 + 10;
    const r  = 120;
    const toRad = d => (d * Math.PI) / 180;
    const nW = 128;
    const nH = 50;

    const nodeEls = nodes_cy.map(n => {
      const nx = cx + r * Math.cos(toRad(n.angle));
      const ny = cy + r * Math.sin(toRad(n.angle));
      return node(nx, ny, nW, nH, n.label, n.sub,
        { fill: n.fill, stroke: n.stroke, titleSize: 11 });
    });

    const arcArr = nodes_cy.map((n, i) => {
      const next = nodes_cy[(i + 1) % nodes_cy.length];
      const a1 = toRad(n.angle);
      const a2 = toRad(next.angle);
      const x1 = cx + (r + 12) * Math.cos(a1);
      const y1 = cy + (r + 12) * Math.sin(a1);
      const x2 = cx + (r + 12) * Math.cos(a2);
      const y2 = cy + (r + 12) * Math.sin(a2);
      const mx = cx + (r + 48) * Math.cos((a1 + a2) / 2);
      const my = cy + (r + 48) * Math.sin((a1 + a2) / 2);
      return arrowPath(`M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`,
        { color: C.evo, marker: 'av' });
    });

    const centerLabel = text(cx, cy, 'Ciclo', { size: 11, fill: C.textMuted });
    const centerLabel2 = text(cx, cy + 14, 'do carbono', { size: 11, fill: C.textMuted });

    const titleEl = text(W / 2, 22, 'CICLO DO CARBONO — MATÉRIA RECICLADA NO ECOSSISTEMA',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...arcArr, ...nodeEls, centerLabel, centerLabel2].join(''));
  },

  'eco-human-impact': () => {
    const steps = [
      { label: 'Ação humana',        sub: 'desmate / superexploração', fill: `${C.rare}18`, stroke: C.rare, accent: C.rare },
      { label: 'Fragmentação',       sub: 'habitat reduzido',          fill: `${C.rare}14`, stroke: C.rare },
      { label: 'Extinção local',     sub: 'espécie-chave perdida',     fill: `${C.rare}20`, stroke: C.rare },
      { label: 'Cascata trófica',    sub: 'desequilíbrio da teia',     fill: `${C.energy}18`, stroke: C.energy },
      { label: 'Colapso de serviços', sub: 'polinização / pesca / água', fill: `${C.energy}28`, stroke: C.energy, accent: C.energy },
    ];
    return flowH(steps, {
      title: 'IMPACTO HUMANO — CADEIA DE CONSEQUÊNCIAS ECOLÓGICAS',
      arrowColor: C.rare,
      arrowMarker: 'a',
      stepW: 106,
      stepH: 56,
      y: 185,
    });
  },

  /* ---- MÓDULO: EVOLUÇÃO ---- */

  'evo-natural-selection': () => {
    const steps = [
      { label: 'Variação',      sub: 'resistência preexistente',  fill: `${C.evo}18`,    stroke: C.evo },
      { label: 'Seleção',       sub: 'antibiótico / pressão',     fill: `${C.rare}18`,   stroke: C.rare },
      { label: '99% morrem',    sub: 'suscetíveis eliminados',    fill: `${C.rare}25`,   stroke: C.rare, accent: C.rare },
      { label: '1% sobrevive',  sub: 'resistentes se reproduzem', fill: `${C.primary}18`, stroke: C.primary },
      { label: 'Nova população', sub: 'toda resistente',          fill: `${C.primary}28`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'SELEÇÃO NATURAL — VARIAÇÃO PREEXISTENTE, NÃO CRIADA',
      arrowColor: C.evo,
      arrowMarker: 'av',
      stepW: 106,
      stepH: 56,
      y: 185,
    });
  },

  'evo-variation': () => {
    // Branch: three sources of variation → population diversity
    const cx = W / 2;
    const sources = [
      { cx: cx - 210, cy: 150, label: 'Mutação',      sub: 'alelos novos', fill: `${C.info}20`, stroke: C.info },
      { cx: cx,       cy: 120, label: 'Recombinação',  sub: 'crossing-over / meiose', fill: `${C.evo}20`, stroke: C.evo },
      { cx: cx + 210, cy: 150, label: 'Deriva genética', sub: 'populações pequenas', fill: `${C.energy}20`, stroke: C.energy },
    ];
    const target = { cx, cy: 270, label: 'Variação genética', sub: 'matéria-prima da evolução', fill: `${C.primary}22`, stroke: C.primary };

    const sourceEls = sources.map(s =>
      node(s.cx, s.cy, 150, 52, s.label, s.sub,
        { fill: s.fill, stroke: s.stroke, titleSize: 12 }));

    const arrows = sources.map(s =>
      arrowPath(`M ${s.cx} ${s.cy + 26} Q ${s.cx + (cx - s.cx) * 0.5} ${s.cy + 80} ${target.cx} ${target.cy - 26}`,
        { color: C.primary, marker: 'ap' }));

    const targetEl = node(target.cx, target.cy, 200, 52, target.label, target.sub,
      { fill: target.fill, stroke: target.stroke, titleSize: 13 });

    const titleEl = text(W / 2, 28, 'FONTES DE VARIAÇÃO GENÉTICA NAS POPULAÇÕES',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...arrows, ...sourceEls, targetEl].join(''));
  },

  'evo-adaptation': () => {
    // Homologous structures comparison
    const colW = 130;
    const positions = [
      { cx: 110,  label: 'Braço humano',    sub: 'preensão',    color: C.primary },
      { cx: 255,  label: 'Asa de baleia',   sub: 'nado',        color: C.info },
      { cx: 400,  label: 'Pata dianteira',  sub: 'corrida',     color: C.energy },
      { cx: 545,  label: 'Asa de morcego',  sub: 'voo',         color: C.evo },
    ];

    // Shared bone structure (simplified)
    const bones = ['Úmero', 'Rádio/Ulna', 'Carpos', 'Falanges'];
    const boneColors = [C.primary, C.info, C.energy, C.evo];

    const cols = positions.map(p => {
      const els = bones.map((b, i) => {
        const by = 70 + i * 52;
        const bh = i === 0 ? 46 : i === 3 ? 36 : 40;
        const bw = colW - 20;
        return [
          rect(p.cx - bw / 2, by, bw, bh, { fill: `${boneColors[i]}25`, stroke: boneColors[i], rx: 6 }),
          text(p.cx, by + bh / 2, b, { size: 9, fill: boneColors[i], weight: '600' }),
        ].join('');
      });
      return [
        rect(p.cx - colW / 2, 42, colW, 40, { fill: `${p.color}18`, stroke: p.color, rx: 8 }),
        text(p.cx, 55, p.label, { size: 11, fill: p.color, weight: '700' }),
        text(p.cx, 68, p.sub, { size: 8, fill: C.textMuted, mono: true }),
        ...els,
      ].join('');
    });

    // Vertical dividers
    const dividers = [1, 2, 3].map(i =>
      `<line x1="${110 + i * 145 + 60}" y1="40" x2="${110 + i * 145 + 60}" y2="${H - 30}"
        stroke="${C.border}" stroke-width="1" stroke-dasharray="3 3"/>`);

    const homologNote = text(W / 2, H - 18,
      'Estruturas homólogas — mesmo ancestral, funções diferentes (convergência vs divergência)',
      { size: 9, fill: C.textMuted });

    const titleEl = text(W / 2, 22, 'HOMOLOGIA — EVIDÊNCIA DE ANCESTRALIDADE COMUM',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...dividers, ...cols, homologNote].join(''));
  },

  'evo-speciation': () => {
    const steps = [
      { label: 'Uma população', sub: 'gene flow livre',           fill: `${C.evo}18`,    stroke: C.evo },
      { label: 'Barreira geog.', sub: 'montanha / oceano',        fill: C.surfaceAlt,   stroke: C.borderStr },
      { label: 'Isolamento',    sub: 'mutações distintas acumulam', fill: `${C.info}18`, stroke: C.info },
      { label: 'Divergência',   sub: 'seleção diferente em cada ilha', fill: `${C.info}25`, stroke: C.info },
      { label: 'Duas espécies', sub: 'isolamento reprodutivo',    fill: `${C.primary}25`, stroke: C.primary, accent: C.primary },
    ];
    return flowH(steps, {
      title: 'ESPECIAÇÃO ALOPÁTRICA — ISOLAMENTO + TEMPO + SELEÇÃO',
      arrowColor: C.evo,
      arrowMarker: 'av',
      stepW: 106,
      stepH: 56,
      y: 185,
    });
  },

  'evo-integrator': () => {
    // Universal genetic code - same codon in different organisms
    const cx = W / 2;
    const cy = H / 2;

    const center = [
      circle(cx, cy, 65, { fill: `${C.primary}15`, stroke: C.primary, sw: 2 }),
      text(cx, cy - 10, 'Código', { size: 13, fill: C.primary, weight: '700', serif: true }),
      text(cx, cy + 8, 'Genético', { size: 13, fill: C.primary, weight: '700', serif: true }),
      text(cx, cy + 24, 'Universal', { size: 10, fill: C.primary, mono: true }),
    ];

    const organisms = [
      { angle: -90, label: 'Bactéria',         sub: 'ATG → Met', color: C.info },
      { angle:  -18, label: 'Levedura',          sub: 'ATG → Met', color: C.evo },
      { angle:   54, label: 'Planta',            sub: 'ATG → Met', color: C.evo },
      { angle:  126, label: 'Camundongo',        sub: 'ATG → Met', color: C.energy },
      { angle:  198, label: 'Homo sapiens',      sub: 'ATG → Met', color: C.primary },
    ];

    const r = 140;
    const toRad = d => (d * Math.PI) / 180;

    const orgs = organisms.flatMap(o => {
      const nx = cx + r * Math.cos(toRad(o.angle));
      const ny = cy + r * Math.sin(toRad(o.angle));
      const dx = nx - cx;
      const dy = ny - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const x1 = cx + (dx / dist) * 68;
      const y1 = cy + (dy / dist) * 68;
      const x2 = nx - (dx / dist) * 66;
      const y2 = ny - (dy / dist) * 26;
      return [
        `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
          stroke="${o.color}60" stroke-width="1.5" stroke-dasharray="4 3"/>`,
        node(nx, ny, 130, 48, o.label, o.sub,
          { fill: `${o.color}18`, stroke: o.color, titleSize: 11 }),
      ];
    });

    const titleEl = text(W / 2, 22,
      'EVIDÊNCIA DE ANCESTRALIDADE COMUM — O MESMO CÓDIGO EM TODAS AS ESPÉCIES',
      { size: 10, fill: C.textMuted, mono: true });

    return svg([titleEl, ...orgs, ...center].join(''));
  },
};

/* ============================================================
   API PÚBLICA
   ============================================================ */

/**
 * Renderiza o diagrama de uma lição no container fornecido.
 * @param {HTMLElement} container
 * @param {string} lessonId
 */
const render = (container, lessonId) => {
  const diagramFn = DIAGRAMS[lessonId];
  if (!diagramFn) {
    const steps = [
      { x: 95, label: 'OBSERVAÇÃO' }, { x: 265, label: 'MECANISMO' },
      { x: 435, label: 'EVIDÊNCIA' }, { x: 605, label: 'LIMITE' },
    ];
    const arrows = steps.slice(0, -1).map((step, index) => arrow(step.x + 56, 180, steps[index + 1].x - 56, 180, { color: C.accent, sw: 2 }));
    const nodes = steps.map(step => [circle(step.x, 180, 42, { fill: C.surfaceAlt, stroke: C.accent, sw: 2 }), text(step.x, 185, String(steps.indexOf(step) + 1), { anchor: 'middle', size: 20, fill: C.accent, weight: 700 }), text(step.x, 250, step.label, { anchor: 'middle', size: 11, fill: C.textMuted, mono: true })].join(''));
    container.innerHTML = svg([
      text(350, 82, 'UM MODELO É UMA PERGUNTA ORGANIZADA', { anchor: 'middle', size: 14, fill: C.text, weight: 700 }),
      text(350, 112, 'Use a lição para conectar o que se observa, a explicação e seus limites.', { anchor: 'middle', size: 13, fill: C.textMuted }),
      ...arrows, ...nodes,
    ].join(''), { title: 'Modelo de leitura: observação, mecanismo, evidência e limite.' });
    return;
  }
  container.innerHTML = diagramFn();
};

/**
 * Retorna o número de diagramas disponíveis.
 * @returns {number}
 */
const count = () => Object.keys(DIAGRAMS).length;

const DiagramEngine = { render, count };
export default DiagramEngine;
export { render };
