# Nexa architecture

```text
Browser UI (React)
  ├── Upload / Dataset workspace
  ├── Analyst chat
  ├── Data quality & profiling
  ├── SQL Lab
  └── Dashboard / Reports (roadmap)
          │
          ▼
Validated application services
  ├── Natural-language planner (deterministic baseline)
  ├── Local LLM adapter (WebLLM / WebGPU, optional)
  ├── SQL policy validator (baseline; strengthen before production)
  └── Result interpretation layer
          │
          ▼
DuckDB-WASM in browser worker
  ├── Local file registration
  ├── SQL execution
  ├── Schema discovery
  └── Bounded result retrieval
          │
          ▼
Charts / tables / insight cards
```

## Design principles

- A language model proposes intent or SQL; DuckDB computes the result.
- Every result is tied to the active dataset and executed SQL.
- The deterministic planner remains available when WebGPU is missing.
- No arbitrary generated code is evaluated.
- Future transformations must be represented as typed operations, previewed, and undoable.
- Future dashboards should store chart specifications and SQL definitions, not duplicate raw data.
- Raw uploaded files should remain in browser memory/OPFS/IndexedDB only with explicit persistence controls.

## Production gates before calling this secure or production-ready

- Replace regex-only SQL filtering with an AST/parser allowlist and bind parameters.
- Enforce query timeouts, memory/result caps, cancellation and worker termination.
- Test DuckDB worker/WASM asset paths on Netlify production and preview deployments.
- Add Content Security Policy and dependency review.
- Decide whether external model-weight downloads are permitted; self-host model artifacts for controlled deployments.
- Add privacy UX distinguishing local model execution from first-time model download traffic.
- Add accessibility, browser compatibility and performance tests.
