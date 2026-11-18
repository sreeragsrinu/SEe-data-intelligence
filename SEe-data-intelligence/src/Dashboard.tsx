import type { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from 'recharts';
import type { DashboardData } from './lib/intelligence';
import { ColumnBars, DonutChart, TopBars, TrendChart } from './charts';

/* Chart colour system. Line: teal main / blue comparison. Bar: teal default, blue + amber for comparison.
   Donut: all six. Scatter: blue points, teal trend line. Indicators: green / coral-red / slate grey. */
const P = { crimson: '#E61E32', crimsonSoft: '#F4A3AB', indigo: '#7B4DFF', indigoSoft: '#9188D0', green: '#076C45', ink: '#FFFFFF', positive: '#076C45', negative: '#E61E32', neutral: '#6B7280', grid: 'rgba(255,255,255,.22)', text: '#9AA3B2', card: 'rgba(10,8,24,.95)' };
export const PALETTES = { dark: P, light: P };
type Palette = typeof PALETTES.dark;

const compact = (n: number) => Math.abs(n) >= 1000 ? Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : Number(n.toFixed(2)).toLocaleString();
const short = (s: unknown, n = 10) => { const t = String(s); return t.length > n ? t.slice(0, n - 1) + '…' : t; };
const KPI_TONE = { positive: '#3DD68C', negative: '#FF6B76', neutral: '#C9D1D9' };

type Props = {
  dashboard: DashboardData; objective: string; datasetName: string; rowCount: number; columnCount: number; dark: boolean; busy: boolean;
  selectedSegment: string; segmentOptions: { name: string; value: number }[]; onSegment: (v: string) => void; onRefresh: () => void; findings: ReactNode;
};

export default function Dashboard({ dashboard: d, objective, datasetName, rowCount, columnCount, dark, busy, selectedSegment, segmentOptions, onSegment, onRefresh, findings }: Props) {
  const C: Palette = dark ? PALETTES.dark : PALETTES.light;
  const metric = (d.metric || 'value').replaceAll('_', ' ');
  const dim = (d.dimension || 'category').replaceAll('_', ' ');
  const axis = { tick: { fontSize: 11, fill: C.text }, axisLine: { stroke: C.grid }, tickLine: false as const };
  const tip = { contentStyle: { background: C.card, border: `1px solid ${C.grid}`, borderRadius: 8, fontSize: 12, color: C.text }, labelStyle: { color: '#fff' }, itemStyle: { color: '#C9D1D9' }, cursor: { fill: 'rgba(255,255,255,.07)' } };
  const cat = { ...axis, interval: 0 as const };
  const grid = <CartesianGrid stroke={C.grid} strokeDasharray="3 3" vertical={false} />;
  const empty = (msg: string) => <div className="chart-empty">{msg}</div>;
  const mean = d.averages.length ? d.averages.reduce((a, x) => a + x.value, 0) / d.averages.length : 0;
  const totalRecords = d.categoryCounts.reduce((a, x) => a + x.value, 0);
  const regression = (() => {
    const p = d.relationship; if (p.length < 8) return [];
    const n = p.length, mx = p.reduce((a, q) => a + q.x, 0) / n, my = p.reduce((a, q) => a + q.y, 0) / n;
    const sxx = p.reduce((a, q) => a + (q.x - mx) ** 2, 0); if (!sxx) return [];
    const b = p.reduce((a, q) => a + (q.x - mx) * (q.y - my), 0) / sxx, a0 = my - b * mx;
    const xs = p.map(q => q.x), lo = Math.min(...xs), hi = Math.max(...xs);
    return [{ x: lo, y: a0 + b * lo }, { x: hi, y: a0 + b * hi }];
  })();

  return <div className="dash">
    <div className="dash-head">
      <div><h2>Business performance dashboard</h2>
        <p className="dash-note">{datasetName}: {rowCount.toLocaleString()} rows and {columnCount} fields. Measure: {metric}. Grouped by: {dim}. Goal: {objective.toLowerCase()}. Figures are computed locally and describe patterns, not causes.</p></div>
      <button className="secondary" onClick={onRefresh} disabled={busy}><RefreshCw size={14} /> Refresh</button>
    </div>

    <div className="kpi-row">{d.kpis.map(k => <div className="kpi" key={k.label}>
      <div><span>{k.label}</span><strong>{k.value}</strong><small style={{ color: KPI_TONE[k.tone] }}>{k.detail}</small></div></div>)}</div>

    <div className="row r2">
      <section className="chart-card dark"><h4>Monthly {metric} trend</h4>
        {d.movingAvg.length > 1 ? <TrendChart data={d.movingAvg} metric={metric} /> : empty('Needs a date field and a numeric field with at least two months of data.')}</section>

      <section className="chart-card dark"><h4>Records by {dim}</h4>
        {d.categoryCounts.length ? <DonutChart data={d.categoryCounts} /> : empty('No suitable categorical field found.')}</section>

      <section className="chart-card dark"><div className="chart-heading"><h4>Total {metric} by {dim}</h4>
        <select aria-label="Segment filter" value={selectedSegment} onChange={e => onSegment(e.target.value)}><option value="All">All</option>{segmentOptions.map(x => <option key={x.name} value={x.name}>{short(x.name, 18)}</option>)}</select></div>
        {d.segments.length ? <ColumnBars data={d.segments.slice(0, 6)} label={`Total ${metric}`} /> : empty('Needs a category and a numeric measure.')}</section>

      <section className="chart-card dark"><h4>Records by day of week</h4>
        {d.weekdays.length ? <ColumnBars data={d.weekdays} label="Records" maxBarSize={36} trunc={10} height={330} /> : empty('Needs a date field.')}</section>
    </div>

    <div className="row r2">
      <section className="chart-card dark"><h4>Average {metric} by {dim}</h4>
        {d.averages.length ? <><ColumnBars data={d.averages.slice(0, 6)} label={`Average ${metric}`} mean={mean} height={300} maxBarSize={40} />
          <p className="legend-note"><i style={{ background: '#FF4B5C' }} />At or above group mean <i style={{ background: '#F4A3AB' }} />Below <i className="dash-key" style={{ borderColor: C.ink }} />Mean of groups</p></> : empty('Needs a category and a numeric measure.')}</section>

      <section className="chart-card dark"><h4>{(d.relationshipX || 'Numeric field').replaceAll('_', ' ')} vs {metric}</h4>
        {d.relationship.length >= 8 ? <><ResponsiveContainer width="100%" height={300}><ScatterChart margin={{ top: 6, right: 10, bottom: 0, left: 0 }}><CartesianGrid stroke={C.grid} strokeDasharray="3 3" /><XAxis type="number" dataKey="x" name={d.relationshipX} {...axis} tickFormatter={compact} /><YAxis type="number" dataKey="y" name={d.relationshipY} {...axis} tickFormatter={compact} width={44} /><ZAxis range={[36, 36]} /><Tooltip {...tip} cursor={{ strokeDasharray: '3 3', stroke: C.grid }} formatter={(v) => compact(Number(v))} />
          <Scatter name="Records" data={d.relationship} fill={C.crimson} fillOpacity={0.75} /><Scatter name="Trend" data={regression} line={{ stroke: C.indigo, strokeWidth: 2.8 }} lineType="joint" shape={() => <g />} legendType="none" isAnimationActive={false} /></ScatterChart></ResponsiveContainer>
          <p className="legend-note">{d.correlation === null ? 'Correlation not available.' : `Correlation r = ${d.correlation.toFixed(2)}. Association only, not cause.`}</p></> : empty('Needs two numeric fields and 8 valid pairs.')}</section>

    </div>
    <div className="row r1">
      <section className="chart-card dark"><h4>Top 10 {dim} by total {metric}</h4>
        {d.topSegments.length ? <TopBars data={d.topSegments} label={metric} /> : empty('Needs a category and a numeric measure.')}</section>
    </div>
    <h4 className="subheading">Automated observations</h4>{findings}
  </div>;
}
