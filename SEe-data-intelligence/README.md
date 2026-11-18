# SEE

A local-first, browser-based data analysis workspace. Upload a file, investigate the data, generate a dashboard, and explore evidence-backed business questions without configuring a hosted AI API key.

## Brand and visual system

SEE uses an ocean-inspired identity: deep marine navy, ocean teal, sea-glass surfaces and mist backgrounds. Charts use a distinct palette of ocean teal (`#16A6A1`), clear blue (`#3B82F6`), amber (`#F29E4C`), violet (`#8B7CE8`), coral (`#E56F91`) and seafoam (`#65BFA8`) so different measures remain easy to distinguish. The wave mark represents the sea and the idea of discovering signals beneath the surface.

## Included in this build

- **Autonomous Analyst:** deterministic DuckDB profiling, NULL checks, high-cardinality identifier hints, monthly comparisons when date and numeric fields are available, and segment ranking.
- **Dashboard Intelligence:** business-objective selector, KPI cards, monthly trend, segment chart, and a segment filter.
- **Business Decision Intelligence:** evidence cards and cautious follow-up actions. It distinguishes descriptive observations from causal explanations; it does not claim that correlation proves cause.
- **Analyst chat:** a transparent rule-based question planner and optional WebLLM local model. All generated SQL is restricted to a single read-only SELECT and executed by DuckDB-WASM.
- **SQL Lab, data preview, CSV export, dark/light appearance.**
- **File formats:** CSV, TSV, JSON, JSONL/NDJSON, Parquet, XLSX and XLS (first worksheet).

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Deploy to Netlify

The repository includes `netlify.toml`. Connect the Git repository to Netlify or run `npm run build` and publish the `dist` directory. No server-side API keys are required.

## Privacy and model behaviour

- Uploaded data is loaded into DuckDB-WASM in the browser; this project does not upload it to an application backend.
- The optional WebLLM model runs in the browser via WebGPU. Model weights are downloaded from the configured model distribution on first use. This is not a hosted inference API, but it does require an internet connection for model download and compatible browser/WebGPU hardware.
- Local AI is optional. The core deterministic analysis works without downloading a language model.
- Netlify hosts the static application; it does not host or run the language model.

## Important analytical limits

This is an MVP, not a certified financial reporting system. Automatic field selection is heuristic. The dashboard picks a likely numeric metric, date and category based on names/types; verify those choices against your data dictionary. Missing-value checks currently count SQL NULLs (not every possible blank-string convention). Trend comparisons are descriptive, not causal. Decision cards suggest what to investigate, not what action is guaranteed to work. Excel import uses the first worksheet. Very large files and browser memory limits depend on the user's device.

## Security notes

Generated natural-language SQL is validated as a single SELECT statement referencing the active table. The SQL Lab is intended for trusted user-authored queries. Do not treat a browser-only app as a secure multi-user data governance boundary.

## Tech stack

React, TypeScript, Vite, DuckDB-WASM, PapaParse, SheetJS, Recharts, WebLLM, Lucide.

## Visual theme

The default interface uses the requested **Ghost White** (`#F7F7FF`) and **Persian Indigo** (`#27187E`) palette. A dark appearance remains available from the sidebar. The primary palette pair has an approximately **12.98:1** contrast ratio, exceeding the WCAG AA 4.5:1 minimum for normal text when used as foreground/background.

## Premium analytics update

The current dashboard builds on the uploaded dataset schema rather than assuming a fixed business domain. It now includes:

- A filled monthly trend view when compatible date and numeric fields are available.
- A numeric relationship explorer using up to 250 valid paired observations when at least two numeric fields are present.
- Date-field inference from common field names as well as database date/time types, helping datasets whose dates were imported as text.
- Cleaner category detection that avoids common identifier/contact fields as default business dimensions.
- Refined KPI, chart, finding and table surfaces using the Ghost White `#F7F7FF` / Persian Indigo `#27187E` visual system.

All observations remain descriptive and data-backed. The relationship chart is an exploratory association view, not a causal or predictive model.

## v0.6.0 (SEe)

- Renamed the wordmark to **SEa**. Dark theme is the default; light theme remains.
- Topographic contour background (vector trace of the supplied image, `public/topo.svg`).
- Dashboard rebuilt to the reference layout: title and note, six KPI cards, four charts, then a row with a wide Top 10 chart (`src/Dashboard.tsx`).
- Chart colours: line = teal main / blue comparison; bars = teal default with blue and amber for comparison; donut = all six colours; scatter = blue points with a teal trend line. Indicators: green positive, coral/red negative, slate grey neutral.
- Fixes: XLSX numbers no longer import as text; DuckDB dates, DECIMAL and BIGINT values display correctly; a failed engine start can be retried; ID columns are no longer picked as the metric; the dimension must have 2 to 60 distinct values; SQL guard blocks file/system table functions.

### v0.6.0 changes
- Name is now **SEe**, with the supplied wave logo and `SEe.jpg` background.
- Side tab is a drawer opened from the three-dot button (top left).
- Dashboard charts are larger, two per row, Top 10 full width.
- Chart colours: bars/scatter points crimson `#E61E32`, donut greens (`#076C45` family), lines Persian indigo `#27187E`. Everything else black and white.
- "Developed by SREERAG" credit, bottom right.
