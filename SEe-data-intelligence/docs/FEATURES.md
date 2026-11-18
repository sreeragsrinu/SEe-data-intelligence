# Feature implementation notes

## 1. Autonomous Analyst
Runs reproducible SQL checks against the active DuckDB table: record count, type-aware metric discovery, NULL counts, top segment ranking, monthly aggregation where date fields are available, and a high-cardinality heuristic that flags potential identifiers. Each finding includes the computed evidence used to produce it.

## 2. Dashboard Intelligence
A selected business objective is retained as dashboard context. The builder selects a likely measure, time field and category using column names and SQL types; it generates KPI cards, monthly trend and segment ranking. The segment chart has an interactive segment selector. It is intentionally transparent about missing compatible fields.

## 3. Business Decision Intelligence
Displays observed signals with evidence and proposes follow-up checks. It does not assert a cause for an observed decline. It prompts validation of definitions, sample size, data freshness, one-off events and record counts.

## Planned next engineering steps
- Let users explicitly map metric, date and dimension fields rather than relying only on heuristics.
- Add cross-filtering so all KPI and chart components respond to filters.
- Add date range and multiple dimension filters.
- Expand statistical checks (distribution shifts, outliers, cohort/retention analysis) with sample-size safeguards.
- Add exportable dashboard/report and saved local workspaces.
- Add a test dataset suite and browser-based integration tests.
