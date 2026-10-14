# Darwin

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111111)
![SVG](https://img.shields.io/badge/SVG-Scientific_Diagrams-FFB13B?logo=svg&logoColor=111111)
![Status](https://img.shields.io/badge/Status-Work_in_Progress-D97706)

Work-in-progress biology atlas connecting living processes across molecular, cellular, organismal, population, and ecosystem scales.

## Purpose

Darwin is not organized as a conventional encyclopedia. It presents biology as a network of processes operating at different scales. Learners can navigate through three complementary paths across twelve modules:

- Biological scale, from molecules to ecosystems.
- Biological process, including structure, information, metabolism, regulation, and adaptation.
- Real-world application, including health, genetics, epidemics, biotechnology, and the environment.

## Technology

- Semantic HTML5 and responsive CSS3.
- Native JavaScript ES2022 modules.
- Inline SVG scientific diagrams.
- JSON as the content source of truth.
- Hash-based client-side routing.
- Local progress storage and an installable offline shell.
- No framework, bundler, backend, or required external dependency.

## Run locally

```bash
npm run serve
```

Open `http://127.0.0.1:8082/`. Native modules, the Service Worker, and data requests require an HTTP server; opening `index.html` directly is not supported.

## Tests

```bash
npm test
```

The test runner validates data integrity, cross-file references, exercise contracts, editorial source references, required runtime files, and deterministic ordering logic. It is not a substitute for browser, accessibility, or scientific peer review.

## Structure

```text
css/          Design tokens, layout, components, themes, and mobile rules
js/           Bootstrap, router, state, UI, and accessibility
engine/       Scale, process, comparison, exercise, and diagram engines
components/   Modules, applications, glossary, and home views
data/         Axes, modules, scales, processes, applications, and exercises
tests/        Data and engine checks
docs/         Pedagogy, content model, module system, and visual system
```

## Editorial status

`data/editorial.json` records the shared sources used to begin traceability. The six expansion modules are stored separately in `data/content-expansion.json` so the original catalog remains auditable and rollback is contained. Existing lessons are marked as pending until each claim, diagram, activity, and quantitative statement has been reviewed against a specific source. The project does not present that pending work as a completed scientific review.

## Offline use

The first visit must happen online. The application shell and essential local data are cached for later use; content that has not been cached can show an offline-unavailable response instead of a broken page. Progress remains in browser local storage and is not sent to a service.

## Live version

[luddevergard3n.github.io/darwin](https://luddevergard3n.github.io/darwin/)

## License

See [LICENSE](LICENSE).
