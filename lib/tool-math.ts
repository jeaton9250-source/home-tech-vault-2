export type ToolResult = { label: string; value: number | string; unit?: string; money?: boolean };
export function calendarDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.getUTCFullYear() >= 1000 && date.toISOString().slice(0, 10) === value ? date : null;
}
export function warrantyEnd(start: string, months: number): string | null {
  const date = calendarDate(start);
  if (!date || !Number.isInteger(months) || months <= 0 || months > 1200) return null;
  const target = new Date(date);
  target.setUTCDate(1);
  target.setUTCMonth(target.getUTCMonth() + months);
  if (target.getUTCFullYear() > 9999) return null;
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), last));
  return target.toISOString().slice(0, 10);
}
export function calculate(kind: string, values: Record<string, string>): ToolResult[] | null {
  const n = Object.fromEntries(Object.entries(values).filter(([k]) => k !== 'start' && k !== 'asof').map(([k,v]) => [k, v.trim() === '' ? NaN : Number(v)]));
  if (Object.values(n).some(v => !Number.isFinite(v) || v < 0)) return null;
  if (kind === 'meeting') {
    const cost = n.people * n.minutes / 60 * n.rate;
    return [{label:'Cost per meeting',value:cost,money:true},{label:'Weekly time cost',value:cost*n.frequency,money:true},{label:'Annual time cost',value:cost*n.frequency*n.weeks,money:true}];
  }
  if (kind === 'email') {
    const weekly = n.emails*n.minutes*n.days/60;
    return [{label:'Hours per week',value:weekly,unit:'hours'},{label:'Average hours per month',value:weekly*n.weeks/12,unit:'hours'},{label:'Hours per working year',value:weekly*n.weeks,unit:'hours'}];
  }
  if (kind === 'capacity') {
    if (n.task <= 0) return null;
    const available=n.hours*60-n.meetings-n.admin-n.breaks;
    return [{label:'Available task time',value:Math.max(0,available)/60,unit:'hours'},{label:'Complete task blocks',value:Math.floor(Math.max(0,available)/n.task)},{label:available<0?'Overbooked by':'Unallocated minutes after full task blocks',value:available<0?-available:available%n.task,unit:'minutes'}];
  }
  if (kind === 'warranty') {
    const end=warrantyEnd(values.start,n.months), asof=calendarDate(values.asof);
    if (!end || !asof) return null;
    const days=Math.round((calendarDate(end)!.getTime()-asof.getTime())/86400000);
    return [{label:'Planning end date',value:end},{label:days<0?'Days past planning end date':days===0?'Planning end date is today':'Days until planning end date',value:Math.abs(days),unit:'days'}];
  }
  if (kind === 'energy') {
    const daily=n.watts/1000*n.hours;
    return [{label:'Monthly electricity cost',value:daily*n.days*n.rate,money:true},{label:'Monthly energy use',value:daily*n.days,unit:'kWh'},{label:'Annual electricity cost (365 days)',value:daily*365*n.rate,money:true}];
  }
  if (kind === 'savings') {
    if (n.months<=0 || !Number.isInteger(n.months)) return null;
    const gap=Math.max(0,n.cost-n.saved);
    return [{label:'Monthly savings target',value:gap/n.months,money:true},{label:'Amount still to save',value:gap,money:true},{label:'Already funded',value:Math.min(n.saved,n.cost),money:true}];
  }
  return null;
}
