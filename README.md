# Darwin

![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript&logoColor=111111)
![SVG](https://img.shields.io/badge/SVG-Scientific_Diagrams-FFB13B?logo=svg&logoColor=111111)
![Status](https://img.shields.io/badge/Status-Work_in_Progress-D97706)

Work-in-progress biology atlas connecting living processes across molecular, cellular, organismal, population, and ecosystem scales.

## Purpose

Darwin is not organized as a conventional encyclopedia. It presents biology as a network of processes operating at different scales. Learners can navigate through three complementary paths:

- Biological scale, from molecules to ecosystems.
- Biological process, including structure, information, metabolism, regulation, and adaptation.
- Real-world application, including health, genetics, epidemics, biotechnology, and the environment.

## Technology

- Semantic HTML5 and responsive CSS3.
- Native JavaScript ES2022 modules.
- Inline SVG scientific diagrams.
- JSON as the content source of truth.
- Hash-based client-side routing.
- No framework, bundler, backend, or required external dependency.

## Run locally

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080`. Native modules require an HTTP server.

## Tests

```bash
node tests/test-runner.js
```

The current test runner is still under development; a clean Node.js execution is required before the project should be presented as complete.

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

## Project status

Darwin is intentionally labeled as a work in progress. Content breadth, diagram coverage, and the automated test runner still need validation before a stable release.

## Live version

[luddevergard3n.github.io/darwin](https://luddevergard3n.github.io/darwin/)

## License

See [LICENSE](LICENSE).
