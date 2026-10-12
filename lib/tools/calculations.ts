export const deviceTypes = [
  { name: "Laptop", rate: 25, life: 5 },
  { name: "Television", rate: 18, life: 8 },
  { name: "Smartphone", rate: 30, life: 4 },
  { name: "Refrigerator", rate: 10, life: 13 },
  { name: "Washer", rate: 12, life: 10 },
  { name: "Dryer", rate: 12, life: 13 },
  { name: "Dishwasher", rate: 12, life: 10 },
  { name: "Gaming console", rate: 20, life: 6 },
  { name: "Smart home device", rate: 20, life: 5 },
] as const;
export function ageInYears(purchase: string, today: string) {
  const start = Date.parse(purchase + "T12:00:00Z");
  const end = Date.parse(today + "T12:00:00Z");
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) return null;
  return (end - start) / (365.25 * 86400000);
}
export function depreciatedValue(price: number, rate: number, age: number, condition: number) {
  if (![price, rate, age, condition].every(Number.isFinite) || price < 0 || rate < 0 || rate > 100 || age < 0 || condition < 0 || condition > 1) return null;
  return price * Math.pow(1 - rate / 100, age) * condition;
}
export function addMonths(date: string, months: number) {
  const [year, month, day] = date.split("-").map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const last = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(day, last));
  return target.toISOString().slice(0, 10);
}
export const maintenanceTasks = [
  { system: "HVAC", task: "Inspect HVAC filter; clean or replace as needed", months: 1, note: "Follow the filter label; pets, dust and heavy use may require more frequent care." },
  { system: "HVAC", task: "Schedule professional HVAC maintenance", months: 12, note: "Schedule ahead of the heating or cooling season." },
  { system: "Smoke / CO alarms", task: "Test smoke and carbon monoxide alarms", months: 1, note: "Use the test button and follow the alarm manufacturer's replacement guidance." },
  { system: "Dryer", task: "Inspect and clean dryer exhaust vent", months: 12, note: "Clean the lint screen after every load; arrange earlier vent cleaning if drying slows." },
  { system: "Refrigerator", task: "Check refrigerator coils and door seals", months: 6, note: "Clean only accessible coils as directed by the manual; some models need no coil cleaning." },
  { system: "Dishwasher", task: "Check and clean dishwasher filter", months: 1, note: "Only if your model has a user-cleanable filter; follow its manual." },
  { system: "Washer", task: "Run washer cleaning cycle and inspect hoses", months: 1, note: "Use the cleaning method specified by your manufacturer." },
  { system: "Water heater", task: "Arrange water heater inspection and maintenance", months: 12, note: "Ask a qualified technician whether flushing applies to your model and water conditions." },
  { system: "Gutters", task: "Inspect gutters and downspouts", months: 6, note: "Recheck after storms or heavy leaf fall; use a professional for work at height." },
  { system: "Garage door", task: "Arrange garage door inspection", months: 12, note: "Follow your manual; leave spring and tension adjustments to a professional." },
] as const;
export const homeownerTools = [
  { slug: "home-maintenance-planner", title: "Home Maintenance Frequency Planner", short: "A little care. A clearer calendar.", description: "Choose your home's systems and create a practical maintenance schedule with editable dates and intervals." },
  { slug: "appliance-lifespan-calculator", title: "Appliance Lifespan Calculator", short: "Plan ahead for what comes next.", description: "Compare appliance age with an adjustable expected lifespan to help plan your replacement budget." },
  { slug: "electronics-depreciation-calculator", title: "Home Electronics Depreciation Calculator", short: "Put a number to what you own.", description: "Estimate current value using purchase price, age, condition and an adjustable annual depreciation rate." },
] as const;
