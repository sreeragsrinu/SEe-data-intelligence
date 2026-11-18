# Audit of the uploaded `retail-intelligence-360.zip`

Inspected the Library archive `retail-intelligence-360.zip` (17,420 bytes). It is a separate Python/SQL/Power BI portfolio project, not a downloaded copy of the four AI analyst GitHub repositories.

## Contents observed

- `src/run_analysis.py` — pandas/numpy/matplotlib pipeline for Superstore-style CSVs.
- `sql/01_create_schema.sql`, `sql/02_analysis_queries.sql`, `sql/03_data_quality_checks.sql` — MariaDB schema, analytical queries and data-quality checks.
- `tests/test_analysis_helpers.py` — three unit tests for header normalization, type preparation and missing required columns.
- `docs/DATA_DICTIONARY.md`, `docs/FINDINGS_TEMPLATE.md`, `docs/POWER_BI_PLAN.md`.
- `requirements.txt` — pandas, numpy and matplotlib.

## Good practices worth carrying into Nexa

1. It normalizes column names and maps common aliases.
2. It validates required fields and parses numeric/date fields conservatively.
3. It flags duplicate rows instead of silently deleting them.
4. It records missingness and negative/zero value checks.
5. It separates descriptive association from causal claims in discount analysis.
6. It asks analysts to reconcile SQL and Python totals before publication.
7. It explicitly documents unsupported questions (returns, inventory, causal promotion impact) rather than inventing conclusions.

## Limitations of the uploaded archive

- It is not a browser app and cannot be deployed as-is to Netlify.
- It requires Python/pandas and a local CSV file.
- It contains no raw Superstore dataset; raw and processed folders contain only `.gitkeep` files.
- The Power BI deliverable is a plan, not a `.pbix` file.
- It has only a small starter test suite and no model/chat/dashboard frontend.

## How Nexa uses these lessons

Nexa keeps the uploaded project intact and treats its analytical-integrity rules as product requirements: report quality flags, preserve source data, label assumptions, avoid causal language, and require calculations to be executed before displaying numeric insights. The Python pipeline itself is not copied into the browser app.
