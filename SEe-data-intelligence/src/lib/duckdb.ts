import * as XLSX from 'xlsx';
import * as duckdb from '@duckdb/duckdb-wasm';

let dbPromise: Promise<duckdb.AsyncDuckDB> | null = null;
let connection: duckdb.AsyncDuckDBConnection | null = null;

export async function getConnection() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const bundles = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(bundles);
      const workerUrl = URL.createObjectURL(new Blob([`importScripts("${bundle.mainWorker}");`], { type: 'text/javascript' }));
      const worker = new Worker(workerUrl);
      const logger = new duckdb.ConsoleLogger(duckdb.LogLevel.WARNING);
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(workerUrl);
      return db;
    })().catch((e) => { dbPromise = null; connection = null; throw new Error('Could not start the in-browser DuckDB engine. Check your internet connection (engine files load from jsDelivr) and try again. ' + (e instanceof Error ? e.message : '')); });
  }
  const db = await dbPromise;
  if (!connection) connection = await db.connect();
  return { db, connection };
}

export async function loadFile(file: File, tableName = 'uploaded_data') {
  const { db, connection } = await getConnection();
  const safeName = tableName.replace(/[^a-zA-Z0-9_]/g, '_');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const registered = `source_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9_.]/g, '_')}`;
  await db.registerFileBuffer(registered, bytes);
  const ext = file.name.split('.').pop()?.toLowerCase();
  let reader = '';
  if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(bytes, { type: 'array', cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!sheet) throw new Error('The workbook has no visible worksheet.');
    const records = XLSX.utils.sheet_to_json(sheet, { defval: null, raw: true });
    const jsonName = `${registered}.json`;
    await db.registerFileText(jsonName, JSON.stringify(records));
    reader = `read_json_auto('${jsonName.replace(/'/g, "''")}')`;
  }
  else if (ext === 'csv' || ext === 'tsv') reader = `read_csv_auto('${registered.replace(/'/g,"''")}', header=true, delim='${ext === 'tsv' ? '\\t' : ','}')`;
  else if (ext === 'json' || ext === 'jsonl' || ext === 'ndjson') reader = `read_json_auto('${registered.replace(/'/g,"''")}')`;
  else if (ext === 'parquet') reader = `read_parquet('${registered.replace(/'/g,"''")}')`;
  else throw new Error('Unsupported file type. Use CSV, TSV, JSON, JSONL, Parquet, XLSX or XLS.');
  await connection.query(`DROP TABLE IF EXISTS ${safeName}`);
  await connection.query(`CREATE TABLE ${safeName} AS SELECT * FROM ${reader}`);
  const schema = await connection.query(`DESCRIBE ${safeName}`);
  const columns = schema.toArray().map((r: any) => ({ name: String(r.column_name), type: String(r.column_type) }));
  const count = await connection.query(`SELECT COUNT(*) AS row_count FROM ${safeName}`);
  const rowCount = Number(count.toArray()[0]?.row_count ?? 0);
  const preview = await connection.query(`SELECT * FROM ${safeName} LIMIT 30`);
  return { tableName: safeName, columns, rowCount, preview: tidyRows(preview) };
}

function decimalToNumber(v: any, scale: number) {
  if (!v || typeof v.length !== 'number') return v;
  let n = 0n;
  for (let i = v.length - 1; i >= 0; i--) n = (n << 32n) | BigInt(v[i] >>> 0);
  if (v.length && (v[v.length - 1] | 0) < 0) n -= 1n << BigInt(32 * v.length);
  return Number(n) / 10 ** scale;
}
function tidyRows(result: any): Record<string, any>[] {
  const kinds = new Map<string, { type: string; scale: number }>(result.schema.fields.map((f: any) => [f.name, { type: String(f.type), scale: Number(f.type?.scale ?? 0) }]));
  return result.toArray().map((row: any) => {
    const out: Record<string, unknown> = { ...row };
    for (const [k, v] of Object.entries(out)) {
      const t = kinds.get(k)?.type ?? '';
      if (v === null || v === undefined) continue;
      if (/^Timestamp/.test(t) && typeof v === 'number') out[k] = new Date(v).toISOString().replace('T', ' ').slice(0, 19);
      else if (/^Date/.test(t) && typeof v === 'number') out[k] = new Date(v).toISOString().slice(0, 10);
      else if (/^Decimal/.test(t)) out[k] = decimalToNumber(v, kinds.get(k)!.scale);
      else if (typeof v === 'bigint') out[k] = Number.isSafeInteger(Number(v)) ? Number(v) : v.toString();
    }
    return out;
  });
}
export async function runQuery(sql: string) {
  const { connection } = await getConnection();
  return tidyRows(await connection.query(sql));
}
