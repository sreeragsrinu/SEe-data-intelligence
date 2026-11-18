# Repository comparison — 10 November 2026

This is a source/README-level architecture review of the four repositories discussed in the conversation. It is not a full security audit or benchmark run.

| Repository | What it is genuinely strong at | Gaps against the target product | License / deployment notes | Decision |
|---|---|---|---|---|
| `caioricciuti/duck-ui` | Browser DuckDB workbench; SQL editor; SQL/Python/Markdown notebooks; charts; dashboards; import formats; query history; local WebLLM option; static hosting/offline modes. | Svelte rather than React; its product is a general SQL workbench rather than an opinionated analyst workflow; optional cloud providers exist and must remain disabled. | README/package metadata state MIT. Package scripts use Bun; README also documents static hosting. Test a Netlify build and worker/WASM paths. | Strongest feature reference and optional base to fork if preserving MIT notices and keeping scope manageable. Nexa instead starts with original React code. |
| `remotemerge/data-canvas` | Strong typed domain model; one action dispatcher; DuckDB-WASM; multi-file relationships; linked chart/table filtering; undo/redo; validation; tests; PWA/offline caching. | README explicitly says there is no built-in LLM. WebMCP agent access is browser-dependent and requires origin-trial configuration on a deployed origin. | MIT. Current package metadata specifies Bun >=1.4, Vite 8, React 19, DuckDB-WASM. | Borrow architectural ideas only: validated actions, bounded results, revisions/history, join fan-out checks. |
| `rpbouman/huey` | Mature lightweight browser OLAP; DuckDB-WASM; CSV/Parquet/JSON/XLSX; query builder; pivots; subtotals; temporal attributes; export. | No built-in LLM or chat-based analysis; less app-like workflow; README says desktop-focused and phone UX is not a goal. | MIT. Static web app/PWA; README documents WASM memory/thread limits and external CDN assets in local-folder mode. | Borrow OLAP/pivot interaction, data profiling and realistic WASM limitation disclosures. |
| `aadithya-vimal/pith-analytics` | React + TypeScript + DuckDB-WASM + WebLLM + Vega-Lite; local model selection and text-to-SQL concept. | README claims broad functionality, but package is an early `0.0.0` app; no stars/forks were returned in the current repository search; README states AGPL-3.0. No full runtime verification performed. | README states AGPL-3.0, which is materially more restrictive for a hosted modified derivative than MIT. Review the actual licence file and legal obligations before reuse. | Do not copy source into a proprietary/commercial codebase without understanding AGPL. Use as a design reference only. |

## Important corrections to earlier chat

- The earlier numeric ratings were subjective and were not supported by a reproducible benchmark.
- The earlier claim that Pith was the best overall was too confident. Its README is a feature description, not proof that all advertised features are robust in production.
- Data Canvas is not a local LLM product by itself; its README says it has no built-in LLM. A connected external agent may process returned data outside the browser.
- Duck-UI is the most complete match among these four for the requested no-key, browser-local AI + analytics workflow, but it is a Svelte app and uses optional AI providers. The local WebLLM mode must be explicitly selected.

## Sources

- https://github.com/caioricciuti/duck-ui
- https://github.com/remotemerge/data-canvas
- https://github.com/rpbouman/huey
- https://github.com/aadithya-vimal/pith-analytics
