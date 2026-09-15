export const uid = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
export const minutes = ms => Math.max(0, Math.round(ms / 60000));
export function durationLabel(mins) { const h=Math.floor(mins/60), m=mins%60; return h ? `${h} ч ${m ? `${m} мин` : ''}`.trim() : `${m} мин`; }
export const dayKey = d => { const x=new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
export const startOfDay = d => { const x=new Date(d); x.setHours(0,0,0,0); return x; };
export function sleepMinutes(event, now=Date.now()) {
  const end=event.end ? new Date(event.end).getTime() : now;
  const wake=(event.awakenings||[]).reduce((sum,w)=>sum + Math.max(0,(new Date(w.end||now)-new Date(w.start))/60000),0);
  return Math.max(0, Math.round((end-new Date(event.start))/60000-wake));
}
export function overlapMinutes(event, from, to) {
  const a=Math.max(new Date(event.start),new Date(from)); const b=Math.min(new Date(event.end||Date.now()),new Date(to));
  if(b<=a) return 0;
  let mins=(b-a)/60000;
  for(const w of event.awakenings||[]) { const wa=Math.max(new Date(w.start),a), wb=Math.min(new Date(w.end||Date.now()),b); if(wb>wa) mins-=(wb-wa)/60000; }
  return Math.max(0,Math.round(mins));
}
export function periodStats(events, from, to) {
  const relevant=events.filter(e=>new Date(e.start)<to && new Date(e.end||Date.now())>from);
  const total=relevant.reduce((n,e)=>n+overlapMinutes(e,from,to),0);
  const day=relevant.filter(e=>e.sleepType==='day').reduce((n,e)=>n+overlapMinutes(e,from,to),0);
  return { total, day, night:total-day, count:relevant.length, average:relevant.length?Math.round(total/relevant.length):0,
    awakenings:relevant.reduce((n,e)=>n+(e.awakenings?.length||0),0) };
}
export function wakeWindows(events, now=Date.now()) {
  const done=events.filter(e=>e.end).sort((a,b)=>new Date(a.start)-new Date(b.start)); const result=[];
  for(let i=1;i<done.length;i++){ const gap=minutes(new Date(done[i].start)-new Date(done[i-1].end)); if(gap>10&&gap<16*60) result.push(gap); }
  if(done.length){ const gap=minutes(now-new Date(done.at(-1).end)); if(gap>0&&gap<16*60) result.push(gap); }
  return result;
}
export function correctedAgeMonths(child, now=new Date()) {
  const base=new Date(child.birthDate); let months=(now-base)/2629800000;
  if(child.expectedDate && new Date(child.expectedDate)>base) months-=(new Date(child.expectedDate)-base)/2629800000;
  return Math.max(0,months);
}
export function prediction(child, events, now=Date.now()) {
  const active=events.find(e=>!e.end); if(active) return null;
  const ended=events.filter(e=>e.end).sort((a,b)=>new Date(a.end)-new Date(b.end)); if(!ended.length) return {label:'Добавьте первый сон', confidence:'мало данных'};
  const age=correctedAgeMonths(child,new Date(now));
  const guide=age<3?75:age<6?120:age<9?165:age<13?210:age<19?270:330;
  const windows=wakeWindows(ended,now).slice(-10,-1).sort((a,b)=>a-b);
  const personal=windows.length ? windows[Math.floor(windows.length/2)] : guide;
  const target=Math.round(guide*.35+personal*.65), last=new Date(ended.at(-1).end).getTime();
  const low=new Date(last+(target-15)*60000), high=new Date(last+(target+15)*60000);
  const fmt=d=>d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'});
  return {label:`${fmt(low)}–${fmt(high)}`, confidence:windows.length>=5?'по вашей истории':'предварительно', target};
}
