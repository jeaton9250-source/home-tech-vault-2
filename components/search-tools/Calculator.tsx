"use client";
import { useState } from 'react';
import type { SearchTool } from '@/lib/search-tools';
import { calculate, calendarDate } from '@/lib/tool-math';
import styles from './SearchTools.module.css';
export default function Calculator({tool}: {tool: SearchTool}) {
  const defaults=Object.fromEntries(tool.fields.map(f=>[f.key,String(f.value)]));
  const [values,setValues]=useState<Record<string,string>>(defaults);
  const [submitted,setSubmitted]=useState(false);
  const valid=tool.fields.every(f=> f.type==='date' ? calendarDate(values[f.key])!==null : values[f.key].trim()!=='' && Number.isFinite(Number(values[f.key])) && Number(values[f.key]) >= (f.min??0) && Number(values[f.key]) <= (f.max??Infinity));
  const result=submitted && valid ? calculate(tool.kind,values) : null;
  return <div className={styles.calculator}>
    <form className={styles.panel} onSubmit={e=>{e.preventDefault();setSubmitted(true);}}>
      <h2>Your inputs</h2><p>Adjust the assumptions to match your situation.</p>
      {tool.fields.map(f=><label className={styles.field} key={f.key}>{f.label}<input type={f.type==='date'?'date':'number'} required min={f.min} max={f.max} step={f.type==='date'?undefined:'any'} value={values[f.key]} onChange={e=>{setValues(v=>({...v,[f.key]:e.target.value}));setSubmitted(false);}} /></label>)}
      <button type="submit">Calculate</button> <button className={styles.secondary} type="button" onClick={()=>{setValues(defaults);setSubmitted(false);}}>Reset</button>
      <p className={styles.small}>Inputs stay in this page. They are not sent to an account or saved by this calculator.</p>
    </form>
    <section className={`${styles.panel} ${styles.results}`} aria-live="polite" aria-atomic="true"><p className={styles.eyebrow}>Your result</p>
      {result ? <><dl>{result.map((r,i)=><div key={r.label}><dt>{r.label}</dt><dd className={i===0?styles.primaryResult:undefined}>{typeof r.value==='number' ? r.value.toLocaleString('en-US',r.money?{style:'currency',currency:'USD',maximumFractionDigits:2}:{maximumFractionDigits:2}):r.value} {r.unit??''}</dd></div>)}</dl><button type="button" onClick={()=>window.print()}>Print / save PDF</button></> : <><h2>{submitted?'Check your inputs':'Make the estimate yours.'}</h2><p>{submitted?'Enter valid values. Task lengths and savings timelines must be greater than zero; warranty terms and savings months must be whole months.':'Enter your details and select Calculate. No login or payment required.'}</p></>}
      <p className={styles.small}>{tool.note}</p>
    </section>
  </div>;
}
