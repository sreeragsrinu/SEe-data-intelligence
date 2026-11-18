# SEE 0.3.0 — Analytics refinement

## Added
- Monthly trend visualisation now uses a gradient-filled area chart.
- Numeric relationship explorer (scatter plot) appears only when the schema contains at least two numeric fields and at least eight valid paired records.
- Relationship sample is capped at 250 valid pairs to keep the browser dashboard responsive.
- Date inference recognises common date/time field names even when imported as VARCHAR.

## Improved
- Default categorical dimension selection excludes common ID, UUID, email, phone, URL and postal-code fields.
- Refined premium dashboard surfaces and hover states while preserving Ghost White and Persian Indigo branding.

## Guardrails
- Scatter plot is explicitly descriptive; no causal claim is made.
- No synthetic records or fabricated business insights are introduced.
- Data processing remains in-browser through DuckDB-WASM.
