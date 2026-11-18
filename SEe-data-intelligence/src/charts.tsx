import { useId, useMemo, useState } from 'react';
import { Area, Bar, BarChart, Brush, CartesianGrid, Cell, ComposedChart, LabelList, Line, Pie, PieChart, ReferenceLine, ResponsiveContainer, Sector, Tooltip, XAxis, YAxis } from 'recharts';

const compact = (n: number) => Math.abs(n) >= 1000 ? Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n) : Number(n.toFixed(2)).toLocaleString();
const short = (s: unknown, n = 10) => { const t = String(s); return t.length > n ? t.slice(0, n - 1) + '…' : t; };

export const DARK = { tick: '#9AA3B2', grid: 'rgba(255,255,255,.22)', axis: 'rgba(255,255,255,.25)', text: '#fff' };
const darkTip = { background: 'rgba(10,8,24,.95)', border: '1px solid rgba(255,255,255,.2)', borderRadius: 8, fontSize: 12, color: '#C9D1D9' };
const tickProps = { fontSize: 11, fill: DARK.tick };

/* ------------------------------------------------------------------ */
/* Donut: thick ring, green and red slices, hover / click / legend    */
/* ------------------------------------------------------------------ */
const DONUT_COLOURS = ['#0A7A4B', '#E61E32', '#2FA877', '#B3121F', '#6CCB9F', '#F0566A'];

export function DonutChart({ data, unit = 'records' }: { data: { name: string; value: number }[]; unit?: string }) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const all = data.slice(0, 6);
  const visible = all.map((d, i) => ({ ...d, colour: DONUT_COLOURS[i % DONUT_COLOURS.length] })).filter(d => !hidden.includes(d.name));
  const total = visible.reduce((a, x) => a + x.value, 0);
  const active = hover ?? pinned;
  const sel = active !== null ? visible[active] : undefined;
  const toggle = (name: string) => { setPinned(null); setHover(null); setHidden(h => h.includes(name) ? h.filter(x => x !== name) : h.length < all.length - 1 ? [...h, name] : h); };

  const renderActive = (p: any) => <Sector cx={p.cx} cy={p.cy} innerRadius={p.innerRadius} outerRadius={p.outerRadius + 8} startAngle={p.startAngle} endAngle={p.endAngle} fill={p.fill} />;

  return <div className="donut-wrap">
    <div className="donut">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={visible} dataKey="value" nameKey="name" innerRadius="64%" outerRadius="88%" paddingAngle={1.5} stroke="none" startAngle={90} endAngle={-270}
            activeIndex={active ?? undefined} activeShape={renderActive} animationDuration={700}
            onMouseEnter={(_, i) => setHover(i)} onMouseLeave={() => setHover(null)} onClick={(_, i) => setPinned(p => p === i ? null : i)} style={{ cursor: 'pointer', outline: 'none' }}>
            {visible.map((d, i) => <Cell key={d.name} fill={d.colour} fillOpacity={active === null || active === i ? 1 : 0.45} />)}
          </Pie>
          <Tooltip content={() => null} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-centre">
        {sel ? <><small>{short(sel.name, 16)}</small><b>{compact(sel.value)}</b><span>{total ? ((sel.value / total) * 100).toFixed(1) : '0'}% of {unit}</span></>
          : <><b>{compact(total)}</b><span>{unit}</span></>}
      </div>
    </div>
    <div className="donut-legend" role="list">
      {all.map((d, i) => { const off = hidden.includes(d.name); const vi = visible.findIndex(v => v.name === d.name);
        return <button key={d.name} role="listitem" className={'chip' + (off ? ' off' : '')} onClick={() => toggle(d.name)}
          onMouseEnter={() => !off && setHover(vi)} onMouseLeave={() => setHover(null)} title={off ? 'Click to show' : 'Click to hide'}>
          <i style={{ background: DONUT_COLOURS[i % DONUT_COLOURS.length] }} />{short(d.name, 14)}</button>; })}
    </div>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Top-N horizontal bars: red gradient per bar, vertical scrollbar    */
/* ------------------------------------------------------------------ */
const ROW_H = 54;
const redStops = (i: number) => ({ from: `hsl(352,82%,${26 + i * 1.6}%)`, to: `hsl(352,92%,${50 + i * 2.2}%)` });

export function TopBars({ data, label, tickWidth = 96 }: { data: { name: string; value: number }[]; label: string; tickWidth?: number }) {
  const rows = data.slice(0, 10);
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const active = hover ?? pinned;
  const height = Math.max(rows.length * ROW_H + 34, 200);
  return <div>
    <div className="scroll-bars" tabIndex={0} aria-label={`Top ${rows.length} list, scroll to see all`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={rows} layout="vertical" margin={{ left: 8, right: 56, top: 4, bottom: 0 }} onMouseLeave={() => setHover(null)}>
          <defs>{rows.map((_, i) => { const s = redStops(i); return <linearGradient key={i} id={`redbar-${i}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={s.from} /><stop offset="100%" stopColor={s.to} /></linearGradient>; })}</defs>
          <CartesianGrid stroke={DARK.grid} strokeDasharray="1 6" horizontal={false} />
          <XAxis type="number" tick={tickProps} axisLine={{ stroke: DARK.axis }} tickLine={false} tickFormatter={compact} />
          <YAxis type="category" dataKey="name" width={tickWidth} interval={0} tick={tickProps} axisLine={{ stroke: DARK.axis }} tickLine={false} tickFormatter={s => short(s, 14)} />
          <Tooltip cursor={{ fill: 'rgba(255,255,255,.07)' }} contentStyle={darkTip} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#C9D1D9' }} formatter={(v) => [compact(Number(v)), `Total ${label}`]} />
          <Bar dataKey="value" name={`Total ${label}`} radius={[0, 6, 6, 0]} barSize={24} animationDuration={700} style={{ cursor: 'pointer' }}
            onMouseEnter={(_, i) => setHover(i)} onClick={(_, i) => setPinned(p => p === i ? null : i)}>
            {rows.map((_, i) => <Cell key={i} fill={`url(#redbar-${i})`} fillOpacity={active === null || active === i ? 1 : 0.4} stroke={pinned === i ? '#fff' : 'none'} strokeWidth={pinned === i ? 1.5 : 0} />)}
            <LabelList dataKey="value" position="right" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 11, fill: '#fff', fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bars-foot">Showing top {rows.length}{rows.length > 5 ? ' · scroll to see all' : ''}</div>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Dark neon trend chart with gradient areas and dashed projections   */
/* ------------------------------------------------------------------ */
type Pt = { period: string; value: number; avg: number };
const SERIES = [
  { key: 'value', pkey: 'valueP', name: 'Monthly total', colour: '#1EA7FF' },
  { key: 'avg', pkey: 'avgP', name: '3-month average', colour: '#FF2BA6' },
  { key: 'trend', pkey: 'trendP', name: 'Linear trend', colour: '#7B4DFF' },
] as const;
const PROJECT = 3;

const addMonths = (p: string, n: number) => { const m = /^(\d{4})-(\d{2})/.exec(p); if (!m) return ''; const t = Number(m[1]) * 12 + Number(m[2]) - 1 + n; return `${Math.floor(t / 12)}-${String((t % 12) + 1).padStart(2, '0')}`; };
const fit = (ys: number[]) => { const n = ys.length, mx = (n - 1) / 2, my = ys.reduce((a, y) => a + y, 0) / n; let sxx = 0, sxy = 0; ys.forEach((y, i) => { sxx += (i - mx) ** 2; sxy += (i - mx) * (y - my); }); const b = sxx ? sxy / sxx : 0; return { b, a: my - b * mx }; };

export function TrendChart({ data, metric }: { data: Pt[]; metric: string }) {
  const [off, setOff] = useState<string[]>([]);
  const rows = useMemo(() => {
    const n = data.length; if (!n) return [];
    const canProject = n >= 3 && !!addMonths(data[n - 1].period, 1);
    const nonNeg = data.every(d => d.value >= 0);
    const all = fit(data.map(d => d.value));
    const k = Math.min(6, n), recent = fit(data.slice(-k).map(d => d.value));
    const out: Record<string, number | string | null | boolean>[] = data.map((d, i) => ({
      period: d.period, value: d.value, avg: d.avg, trend: all.a + all.b * i,
      valueP: null, avgP: null, trendP: null, projected: false,
    }));
    if (canProject) {
      const last = out[n - 1]; last.valueP = last.value; last.avgP = last.avg; last.trendP = last.trend;
      const seq = data.map(d => d.value);
      for (let j = 1; j <= PROJECT; j++) {
        let v = recent.a + recent.b * (k - 1 + j); if (nonNeg) v = Math.max(0, v);
        seq.push(v);
        const w = seq.slice(-3);
        let t = all.a + all.b * (n - 1 + j); if (nonNeg) t = Math.max(0, t);
        out.push({ period: addMonths(data[n - 1].period, j), value: null, avg: null, trend: null, valueP: v, avgP: w.reduce((a, x) => a + x, 0) / w.length, trendP: t, projected: true });
      }
    }
    return out;
  }, [data]);
  const toggle = (k: string) => setOff(o => o.includes(k) ? o.filter(x => x !== k) : o.length < SERIES.length - 1 ? [...o, k] : o);
  const hasProj = rows.some(r => r.projected);

  const tip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload; const proj = !!row.projected;
    return <div className="neon-tip"><b>{label}{proj ? ' · projected' : ''}</b>
      {SERIES.filter(s => !off.includes(s.key)).map(s => { const v = proj ? row[s.pkey] : row[s.key]; return v == null ? null : <div key={s.key}><i style={{ background: s.colour }} />{s.name}<span>{compact(Number(v))}</span></div>; })}
    </div>;
  };

  return <div className="neon">
    <div className="neon-legend">
      {SERIES.map(s => <button key={s.key} className={'chip' + (off.includes(s.key) ? ' off' : '')} onClick={() => toggle(s.key)} title="Click to show or hide"><i style={{ background: s.colour, boxShadow: `0 0 8px ${s.colour}` }} />{s.name}</button>)}
      {hasProj && <span className="neon-note">Dashed = simple linear projection, next {PROJECT} months</span>}
    </div>
    <ResponsiveContainer width="100%" height={rows.length > 12 ? 360 : 330}>
      <ComposedChart data={rows} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
        <defs>{SERIES.map(s => <linearGradient key={s.key} id={`neon-${s.key}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={s.colour} stopOpacity={0.55} /><stop offset="100%" stopColor={s.colour} stopOpacity={0.02} /></linearGradient>)}</defs>
        <CartesianGrid stroke="rgba(255,255,255,.22)" strokeDasharray="1 6" vertical={false} />
        <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#9AA3B2' }} axisLine={false} tickLine={false} minTickGap={28} tickFormatter={p => String(p).slice(2)} />
        <YAxis tick={{ fontSize: 11, fill: '#9AA3B2' }} axisLine={false} tickLine={false} tickFormatter={compact} width={44} />
        <Tooltip content={tip} cursor={{ stroke: 'rgba(255,255,255,.35)', strokeDasharray: '3 3' }} />
        {SERIES.filter(s => !off.includes(s.key)).map(s => <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.colour} strokeWidth={2.4} fill={`url(#neon-${s.key})`} animationDuration={900}
          dot={{ r: 3.5, fill: s.colour, stroke: s.colour }} activeDot={{ r: 6, fill: '#fff', stroke: s.colour, strokeWidth: 2 }} isAnimationActive />)}
        {hasProj && SERIES.filter(s => !off.includes(s.key)).map(s => <Line key={s.pkey} type="monotone" dataKey={s.pkey} name={`${s.name} (projected)`} stroke={s.colour} strokeWidth={2.2} strokeDasharray="4 5"
          dot={{ r: 3.5, fill: '#000', stroke: s.colour, strokeWidth: 2 }} activeDot={{ r: 6, fill: '#fff', stroke: s.colour, strokeWidth: 2 }} connectNulls={false} />)}
        {rows.length > 12 && <Brush dataKey="period" height={22} travellerWidth={8} stroke="#7B4DFF" fill="#05050C" tickFormatter={p => String(p).slice(2)} />}
      </ComposedChart>
    </ResponsiveContainer>
    <span className="sr-only">{metric} monthly trend</span>
  </div>;
}

/* ------------------------------------------------------------------ */
/* Interactive column chart: red gradient, hover / click, dark theme   */
/* ------------------------------------------------------------------ */
export function ColumnBars({ data, label, mean, height = 320, maxBarSize = 46, trunc = 6 }: { data: { name: string; value: number }[]; label: string; mean?: number; height?: number; maxBarSize?: number; trunc?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(null);
  const active = hover ?? pinned;
  const strong = (v: number) => mean === undefined || v >= mean;
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 22, right: 8, left: 0, bottom: 0 }} onMouseLeave={() => setHover(null)}>
      <defs>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF4B5C" /><stop offset="100%" stopColor="#7A0A18" /></linearGradient>
        <linearGradient id={`${uid}w`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#F4A3AB" /><stop offset="100%" stopColor="#8E4A52" /></linearGradient>
      </defs>
      <CartesianGrid stroke={DARK.grid} strokeDasharray="1 6" vertical={false} />
      <XAxis dataKey="name" interval={0} tick={tickProps} axisLine={{ stroke: DARK.axis }} tickLine={false} tickFormatter={s => short(s, trunc)} />
      <YAxis tick={tickProps} axisLine={false} tickLine={false} tickFormatter={compact} width={44} />
      <Tooltip cursor={{ fill: 'rgba(255,255,255,.07)' }} contentStyle={darkTip} labelStyle={{ color: '#fff' }} itemStyle={{ color: '#C9D1D9' }} formatter={(v) => [compact(Number(v)), label]} />
      {mean !== undefined && <ReferenceLine y={mean} stroke="#fff" strokeDasharray="5 4" strokeWidth={1.5} />}
      <Bar dataKey="value" name={label} radius={[6, 6, 0, 0]} maxBarSize={maxBarSize} animationDuration={700} style={{ cursor: 'pointer' }}
        onMouseEnter={(_, i) => setHover(i)} onClick={(_, i) => setPinned(p => p === i ? null : i)}>
        {data.map((d, i) => <Cell key={i} fill={`url(#${uid}${strong(d.value) ? 's' : 'w'})`} fillOpacity={active === null || active === i ? 1 : 0.4} stroke={pinned === i ? '#fff' : 'none'} strokeWidth={pinned === i ? 1.5 : 0} />)}
        <LabelList dataKey="value" position="top" formatter={(v: unknown) => compact(Number(v))} style={{ fontSize: 11, fill: '#fff', fontWeight: 600 }} />
      </Bar>
    </BarChart>
  </ResponsiveContainer>;
}
