'use client';
/* eslint-disable */

import { useEffect, useMemo, useRef, useState } from 'react';
import { buildDoc, derive } from './buildDoc';
import { SECTIONS, EXAMPLE, BLANK_DEFAULTS } from './fields';

type Data = Record<string, any>;
type Field = { id: string; label: string; type?: string; req?: number; hint?: string; wide?: number; list?: string[]; options?: string[]; min?: number; max?: number; step?: number };

const ASSETS = '/vendor-agreement';
const FONT_FILES = ['Carlito-Regular', 'Carlito-Bold', 'Carlito-Italic', 'Carlito-BoldItalic', 'Caladea-Regular', 'Caladea-Bold'];
const FIELDS: Field[] = SECTIONS.flatMap((s) => s[1] as Field[]);
const DRAFT_KEY = 'uaq-vendor-agreement-draft';
const EXAMPLE_NOTE = "Example loaded from the Nay Phone Mobile agreement. Replace it with the new vendor's details.";

function blank(): Data {
  const d: Data = {};
  FIELDS.forEach((f) => { d[f.id] = f.type === 'checkbox' ? false : ''; });
  return { ...d, ...BLANK_DEFAULTS };
}

function clean(raw: Data): Data {
  const d: Data = {};
  FIELDS.forEach((f) => {
    d[f.id] = f.type === 'checkbox' ? !!raw[f.id] : String(raw[f.id] ?? '').trim().replace(/\s+/g, ' ');
  });
  ['bizDesc', 'productsDef'].forEach((k) => { d[k] = d[k].replace(/[.;,]+$/, ''); });
  return d;
}

function findErrors(d: Data): string[] {
  const bad: string[] = [];
  FIELDS.forEach((f) => {
    const v = d[f.id];
    let isBad = !!f.req && (v === '' || v == null);
    if (!isBad && f.type === 'number' && v !== '') {
      const n = Number(v);
      isBad = !isFinite(n) || n < (f.min ?? 0) || (f.max != null && n > f.max);
    }
    if (!isBad && f.type === 'email' && v && !/^\S+@\S+\.\S+$/.test(v)) isBad = true;
    if (isBad) bad.push(f.id);
  });
  if (d.vIssue && d.vExpiry && d.vExpiry <= d.vIssue && !bad.includes('vExpiry')) bad.push('vExpiry');
  return bad;
}

async function toBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Missing asset: ' + url);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

let enginePromise: Promise<{ pdfMake: any; logo: string }> | null = null;
function loadEngine() {
  if (!enginePromise) {
    enginePromise = (async () => {
      // pdfmake is served from /public so the storefront needs no extra npm dependency.
      const pdfMake: any = await new Promise((resolve, reject) => {
        const w = window as any;
        if (w.pdfMake) return resolve(w.pdfMake);
        const s = document.createElement('script');
        s.src = `${ASSETS}/pdfmake.min.js`;
        s.onload = () => (w.pdfMake ? resolve(w.pdfMake) : reject(new Error('PDF engine failed to start')));
        s.onerror = () => reject(new Error('Could not load the PDF engine'));
        document.head.appendChild(s);
      });
      const [fonts, logo] = await Promise.all([
        Promise.all(FONT_FILES.map((f) => toBase64(`${ASSETS}/fonts/${f}.ttf`))),
        toBase64(`${ASSETS}/logo.png`),
      ]);
      const vfs: Record<string, string> = {};
      FONT_FILES.forEach((f, i) => { vfs[f + '.ttf'] = fonts[i]; });
      pdfMake.vfs = vfs;
      pdfMake.fonts = {
        Carlito: { normal: 'Carlito-Regular.ttf', bold: 'Carlito-Bold.ttf', italics: 'Carlito-Italic.ttf', bolditalics: 'Carlito-BoldItalic.ttf' },
        Caladea: { normal: 'Caladea-Regular.ttf', bold: 'Caladea-Bold.ttf', italics: 'Caladea-Regular.ttf', bolditalics: 'Caladea-Bold.ttf' },
      };
      return { pdfMake, logo: 'data:image/png;base64,' + logo };
    })().catch((e) => { enginePromise = null; throw e; });
  }
  return enginePromise;
}

export default function VendorAgreementForm() {
  const [data, setData] = useState<Data>(EXAMPLE);
  const [note, setNote] = useState(EXAMPLE_NOTE);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<{ msg: string; kind: '' | 'bad' | 'ok' }>({ msg: '', kind: '' });
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    try {
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
      if (draft && draft.vName) {
        setData({ ...blank(), ...draft });
        setNote('Restored your last draft. Edit the details, then generate the PDF.');
      }
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const d = useMemo(() => clean(data), [data]);
  const x = useMemo(() => derive(d), [d]);

  const set = (id: string, value: any) => setData((prev) => ({ ...prev, [id]: value }));

  async function generate() {
    const bad = findErrors(d);
    setErrors(bad);
    if (bad.length) {
      const f = FIELDS.find((fl) => fl.id === bad[0])!;
      setStatus({ msg: `Check "${f.label}" before generating.`, kind: 'bad' });
      (formRef.current?.querySelector('#va-' + f.id) as HTMLElement | null)?.focus();
      return;
    }
    setBusy(true);
    setStatus({ msg: 'Building the agreement…', kind: '' });
    try {
      const { pdfMake, logo } = await loadEngine();
      const name = 'UAQ Deals Vendor Agreement - ' + d.vName.replace(/[^\w\s.&-]/g, '').replace(/\.+$/, '').trim() + '.pdf';
      await new Promise<void>((resolve) => pdfMake.createPdf(buildDoc(d, logo)).download(name, resolve));
      setStatus({ msg: 'Downloaded ' + name, kind: 'ok' });
    } catch (e: any) {
      setStatus({ msg: 'Could not generate the PDF: ' + (e?.message || e), kind: 'bad' });
    } finally {
      setBusy(false);
    }
  }

  function input(f: Field) {
    const id = 'va-' + f.id;
    const common = { id, name: f.id };
    if (f.type === 'select') {
      return (
        <select {...common} value={data[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)}>
          {f.options!.map((o) => <option key={o} value={o}>{o || '(none)'}</option>)}
        </select>
      );
    }
    if (f.type === 'textarea') {
      return <textarea {...common} rows={2} value={data[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)} />;
    }
    return (
      <>
        <input {...common} type={f.type || 'text'} min={f.min} max={f.max} step={f.step} list={f.list ? id + '-list' : undefined}
          value={data[f.id] ?? ''} onChange={(e) => set(f.id, e.target.value)} />
        {f.list && <datalist id={id + '-list'}>{f.list.map((o) => <option key={o} value={o} />)}</datalist>}
      </>
    );
  }

  const derivedBits: [string, string][] = [
    ['Dated', x.dateClause || '—'],
    ['Fee', d.fee !== '' ? x.feeText : '—'],
    ['Commission', d.commission !== '' ? x.commissionText : '—'],
    ['Settlement', d.settleDays !== '' ? 'every ' + x.settleText : '—'],
  ];

  return (
    <div className="va-page">
      <div className="va-wrap">
        <header className="va-top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${ASSETS}/logo.png`} alt="UAQ Deals" />
          <div>
            <h1>Vendor Partnership Agreement</h1>
            <p className="va-sub">{note}</p>
          </div>
          <div className="va-tools">
            <button type="button" onClick={() => { setData(EXAMPLE); setErrors([]); setStatus({ msg: '', kind: '' }); setNote(EXAMPLE_NOTE); }}>Load example</button>
            <button type="button" onClick={() => { setData(blank()); setErrors([]); setStatus({ msg: '', kind: '' }); setNote("Fill in the vendor's details, then generate the PDF."); }}>Clear form</button>
          </div>
        </header>

        <form ref={formRef} noValidate onSubmit={(e) => { e.preventDefault(); generate(); }}>
          {SECTIONS.map(([title, fields]) => (
            <section key={title}>
              <h2>{title}</h2>
              <div className="va-grid">
                {(fields as Field[]).map((f) => {
                  const err = errors.includes(f.id) ? ' va-err' : '';
                  if (f.type === 'checkbox') {
                    return (
                      <div key={f.id} className={'va-f va-wide' + err}>
                        <div className="va-check">
                          <input id={'va-' + f.id} type="checkbox" checked={!!data[f.id]} onChange={(e) => set(f.id, e.target.checked)} />
                          <label htmlFor={'va-' + f.id}>{f.label}</label>
                        </div>
                        {f.hint && <span className="va-hint">{f.hint}</span>}
                      </div>
                    );
                  }
                  return (
                    <div key={f.id} className={'va-f' + (f.wide ? ' va-wide' : '') + err}>
                      <label htmlFor={'va-' + f.id}>{f.label}{!f.req && <span className="va-opt">  optional</span>}</label>
                      {input(f)}
                      {f.hint && <span className="va-hint">{f.hint}</span>}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </form>

        <div className="va-bar">
          <div className="va-derived">
            {derivedBits.map(([k, v], i) => (
              <span key={k}>{i > 0 && '  ·  '}{k}: <b>{v}</b></span>
            ))}
          </div>
          <button type="button" className="va-primary" disabled={busy} onClick={generate}>{busy ? 'Generating…' : 'Generate PDF'}</button>
          <div className={'va-status' + (status.kind ? ' va-' + status.kind : '')} role="status">{status.msg}</div>
        </div>
      </div>
    </div>
  );
}
