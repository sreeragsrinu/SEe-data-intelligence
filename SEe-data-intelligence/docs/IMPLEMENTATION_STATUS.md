# Implementation status — 0.2.0

| Area | Included now | Current limitation |
|---|---|---|
| Autonomous Analyst | SQL-based dataset profiling, missing-value checks, top segment, monthly trend, identifier heuristic | Heuristic field selection; not a general-purpose autonomous agent that invents and runs arbitrary multi-step analyses |
| Dashboard Intelligence | KPI cards, monthly line chart, segment bar chart, business objective context, segment chart filter | Filter currently affects the segment chart only; no drag-and-drop chart editor or multi-filter cross-highlighting |
| Decision Intelligence | Evidence cards, suggested validation/monitoring steps, explicit non-causal wording | Recommendations are rule-based prompts, not causal inference or an optimization engine |
| Natural language | Rule-based query planner and optional local WebLLM SQL generation | Planner covers a limited set of common analytical questions; local model requires WebGPU and model download |
| Data import | CSV, TSV, JSON, JSONL/NDJSON, Parquet, XLSX, XLS | Excel imports first worksheet only; browser memory limits apply |

A production `npm run build` was not verified in this environment because dependency installation timed out. Run `npm install`, `npm run typecheck`, `npm test`, and `npm run build` before deploying. Do not represent this archive as production-tested until those checks pass.
