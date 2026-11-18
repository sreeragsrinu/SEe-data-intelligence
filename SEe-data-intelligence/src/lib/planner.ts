export type Column = { name: string; type: string };
export type Plan = { sql: string; explanation: string; chart: 'bar'|'line'|'table' };
const quote = (s: string) => '"' + s.replace(/"/g, '""') + '"';
const isNumeric = (type: string) => /INT|DOUBLE|FLOAT|DECIMAL|NUMERIC|REAL|HUGEINT|BIGINT/i.test(type);
const isDate = (type: string) => /DATE|TIME/i.test(type);

// Deterministic planner intentionally supports a transparent, testable subset before local LLM is enabled.
export function planQuestion(question: string, table: string, columns: Column[]): Plan {
  const q = question.toLowerCase();
  const tableSql = `"${table.replace(/"/g, '""')}"`;
  const numeric = columns.filter(c => isNumeric(c.type));
  const dates = columns.filter(c => isDate(c.type));
  const dimension = columns.find(c => !isNumeric(c.type) && !isDate(c.type));
  const metric = numeric.find(c => q.includes(c.name.toLowerCase().replaceAll('_',' '))) ?? numeric[0];
  const mentionedDate = dates.find(c => q.includes(c.name.toLowerCase().replaceAll('_',' '))) ?? dates[0];
  const topMatch = q.match(/top\s+(\d+)/);
  const limit = Math.min(100, Math.max(1, Number(topMatch?.[1] ?? 10)));
  if (/how many rows|row count|number of rows|count rows/.test(q)) return { sql:`SELECT COUNT(*) AS row_count FROM ${tableSql}`, explanation:'Count the records in the uploaded dataset.', chart:'table' };
  if (/missing|null|blank|empty/.test(q)) return { sql:`SELECT ${columns.map(c=>`COUNT(*) FILTER (WHERE ${quote(c.name)} IS NULL) AS ${quote(c.name)}`).join(', ')} FROM ${tableSql}`, explanation:'Count missing values by column. Empty strings are not yet normalized as NULL.', chart:'table' };
  if (/top|highest|largest|best|most/.test(q) && dimension && metric) return { sql:`SELECT ${quote(dimension.name)}, SUM(${quote(metric.name)}) AS total_${metric.name.replace(/[^a-z0-9_]/gi,'_')} FROM ${tableSql} GROUP BY 1 ORDER BY 2 DESC LIMIT ${limit}`, explanation:`Rank ${dimension.name} by total ${metric.name}.`, chart:'bar' };
  if (/trend|over time|monthly|month by month/.test(q) && mentionedDate && metric) return { sql:`SELECT DATE_TRUNC('month', TRY_CAST(${quote(mentionedDate.name)} AS TIMESTAMP)) AS period, SUM(${quote(metric.name)}) AS total FROM ${tableSql} GROUP BY 1 ORDER BY 1`, explanation:`Aggregate ${metric.name} by month using ${mentionedDate.name}.`, chart:'line' };
  if (/average|avg|mean/.test(q) && metric) return { sql:`SELECT AVG(${quote(metric.name)}) AS average_${metric.name.replace(/[^a-z0-9_]/gi,'_')} FROM ${tableSql}`, explanation:`Calculate the average of ${metric.name}.`, chart:'table' };
  if (/total|sum|revenue|sales|profit/.test(q) && metric) return { sql:`SELECT SUM(${quote(metric.name)}) AS total_${metric.name.replace(/[^a-z0-9_]/gi,'_')} FROM ${tableSql}`, explanation:`Calculate the total of ${metric.name}.`, chart:'table' };
  return { sql:`SELECT * FROM ${tableSql} LIMIT 20`, explanation:'I could not confidently map that request to a supported operation yet. Here is a sample of the dataset; refine the question or use SQL mode.', chart:'table' };
}

export function validateReadOnlySql(sql: string, table: string) {
  const normalized = sql.trim().replace(/;\s*$/, '');
  if (!/^SELECT\b/i.test(normalized)) throw new Error('Only SELECT queries are allowed in AI-generated SQL.');
  if (/[;]|--|\/\*|\*\//.test(normalized)) throw new Error('Multiple statements and SQL comments are blocked.');
  if (/\b(ATTACH|COPY|INSTALL|LOAD|EXPORT|IMPORT|CREATE|DROP|DELETE|UPDATE|INSERT|ALTER|CALL|PRAGMA|SET|RESET|UNLOAD)\b/i.test(normalized)) throw new Error('This SQL contains a blocked operation.');
  if (/\b(read_\w+|glob|scan_\w+|duckdb_\w+|pragma_\w+|sniff_csv)\s*\(/i.test(normalized)) throw new Error('File and system table functions are blocked. Query the active dataset instead.');
  if (!normalized.toLowerCase().includes(table.toLowerCase())) throw new Error('Query must reference the active dataset.');
  return normalized;
}
