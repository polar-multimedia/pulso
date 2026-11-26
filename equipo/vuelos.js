/* Vuelos y traslados de los foráneos en modo consulta (consola de Vero). Mismo diseño que la consola de Blanca, sin botones de acción. */
(function(){
const IATA={'durango':['DGO','Durango'],'tampico':['TAM','Tampico'],'tapachula':['TAP','Tapachula'],'guadalajara':['GDL','Guadalajara'],'mexicali':['MXL','Mexicali'],'oaxaca':['OAX','Oaxaca'],'zacatecas':['ZCL','Zacatecas'],'juárez':['CJS','Cd. Juárez'],'juarez':['CJS','Cd. Juárez'],'mochis':['LMM','Los Mochis'],'monterrey':['MTY','Monterrey'],'mérida':['MID','Mérida'],'merida':['MID','Mérida'],'tijuana':['TIJ','Tijuana'],'culiacán':['CUL','Culiacán'],'culiacan':['CUL','Culiacán'],'hermosillo':['HMO','Hermosillo'],'chihuahua':['CUU','Chihuahua'],'veracruz':['VER','Veracruz'],'villahermosa':['VSA','Villahermosa'],'cancún':['CUN','Cancún'],'cancun':['CUN','Cancún'],'torreón':['TRC','Torreón'],'torreon':['TRC','Torreón']};
const iata=c=>{const k=Object.keys(IATA).find(x=>String(c||'').toLowerCase().includes(x));return k?IATA[k]:[String(c||'').slice(0,3).toUpperCase(),c]};
const AIR={AM:['AM','Aeroméxico',''],Y4:['Y4','Volaris','y4'],VB:['VB','Viva Aerobus','vb']};
const airline=f=>{const k=String(f||'').replace(/\s+/g,'').slice(0,2).toUpperCase();return AIR[k]||[k,k,'']};
const PLANE='<svg viewBox="0 0 24 24"><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" transform="rotate(90 12 12)"/></svg>';
const CAR='<svg viewBox="0 0 24 24" width="22" height="22" fill="#fff"><path d="M5 11l1.5-4.5A2 2 0 0 1 8.4 5h7.2a2 2 0 0 1 1.9 1.5L19 11a2 2 0 0 1 2 2v4h-2v1.5a1.5 1.5 0 0 1-3 0V17H8v1.5a1.5 1.5 0 0 1-3 0V17H3v-4a2 2 0 0 1 2-2zm2.1 0h9.8l-1.1-3.5H8.2zM6.5 15a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4zm11 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z"/></svg>';
const EST=[['prog','Programado'],['air','En vuelo'],['delay','Retrasado'],['land','Aterrizó'],['pick','Con el chofer'],['done','Entregado'],['cancel','Cancelado']];
const toMin=t=>{const m=String(t||'').match(/(\d{1,2}):(\d{2})/);return m?+m[1]*60+ +m[2]:0};
const fmt=m=>{m=((m%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
const nowMin=()=>{const d=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Mexico_City'}));return d.getHours()*60+d.getMinutes()};
const eta=p=>toMin(p.land)+(p.s==='delay'?(+p.d||0):0);
const pickup=p=>p.s==='delay'?Math.max(toMin(p.pick),eta(p)+30):toMin(p.pick);
const chip=p=>{const e=EST.find(x=>x[0]===p.s)||EST[0];return `<span class="chip c-${p.s}">${e[1]}${p.s==='delay'?' +'+p.d+' min':''}</span>`};
function progress(p){if(['land','pick','done'].includes(p.s))return 100;if(p.s!=='air'&&p.s!=='delay')return 0;const now=nowMin(),arr=eta(p),dep=p.off?toMin(p.off):arr-120;return Math.max(5,Math.min(95,Math.round((now-dep)/Math.max(30,arr-dep)*100)))}
function falta(p){if(['land','pick','done'].includes(p.s))return 'Ya llegó';if(p.s==='cancel')return '—';const t=Date.parse('2026-11-26T'+fmt(eta(p))+':00-06:00'),m=Math.round((t-Date.now())/60000);if(m<=0)return m>-30?'Llegando':'Ya debió llegar';if(m<60)return m+' min';const h=Math.floor(m/60);return h+' h '+String(m%60).padStart(2,'0')}
const OPEN={};
document.addEventListener('toggle',e=>{const d=e.target;if(d.matches&&d.matches('details.fx[data-vopen]'))OPEN[d.dataset.vopen]=d.open},true);
function avion(B){const T=(B.traslados||[]).filter(p=>p.flight);if(!T.length)return '<div class="card"><p>No hay vuelos capturados.</p></div>';
 const ord={cancel:0,delay:1,air:2,land:3,pick:4,prog:5,done:6};
 return T.slice().sort((a,b)=>(ord[a.s]??5)-(ord[b.s]??5)||eta(a)-eta(b)).map(p=>{const o=iata(p.from),a=airline(p.flight),pr=progress(p),al=p.s==='delay'&&p.d>=20,op=OPEN[p.key]!=null?OPEN[p.key]:['air','delay','land','cancel'].includes(p.s);
  return `<details class="fx ${al?'alert':''}" data-vopen="${p.key}" ${op?'open':''}><summary><span class="al ${a[2]}">${esc(a[0])}</span><div class="who"><div class="nm">${esc(p.trato+' '+p.name)}</div><div class="meta">${esc(o[0])} → MEX · ${esc(p.flight)}</div></div><div class="t"><b>${fmt(eta(p))}</b><small>${esc(p.arrived?'En PULSO':falta(p))}</small></div>${chip(p)}</summary><div class="fl ${al?'alert':''} ${p.s==='cancel'?'cancel':''}">
   <div class="route"><div class="ap"><b>${esc(o[0])}</b><span>${esc(o[1])}</span></div><div class="track"><i style="width:${pr}%"></i><span style="position:absolute;left:${pr}%">${PLANE}</span></div><div class="ap r"><b>MEX</b><span>CDMX · T${esc(p.terminal||'2')}</span></div></div>
   <div class="facts">${p.off?`<div><small>Despegó</small><b>${esc(p.off)}</b></div>`:`<div><small>Llega en</small><b>${esc(falta(p))}</b></div>`}<div><small>Hora estimada</small><b>${fmt(eta(p))}</b></div><div><small>Terminal</small><b>${esc(p.terminal||'2')}</b></div><div><small>Puerta</small><b>${esc(p.gate||'—')}</b></div></div>
   <div class="pickup"><div><span>Recogida → ${p.to==='hotel'?'hotel':'InSpace'}</span><br><b>${fmt(pickup(p))}</b></div><span>${esc(a[1])}</span></div>
   ${p.at?`<div class="by">Último cambio: ${esc(p.by||'')} · ${new Date(p.at).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit',hour12:false})}${p.src==='Automático'?' (rastreo automático)':''}</div>`:''}</div></details>`}).join('')}
function tierra(B){const G=(B.traslados||[]).filter(p=>!p.flight&&p.s!=='cancel');if(!G.length)return '<div class="card"><p>Nadie viaja por tierra.</p></div>';
 return G.map(p=>{const pl=String(p.blockType||'').split(' · ');const lbl=p.arrived?'Ya está en PULSO':p.s==='prog'?'Por llegar':p.s==='pick'?'En camino':'Ya llegó';
  return `<div class="fx" style="padding:10px 12px"><div style="display:flex;align-items:center;gap:10px"><span class="al" style="width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,#1F6F78,#4ECBCA)">${CAR}</span><div class="who" style="flex:1;min-width:0"><div class="nm" style="font-size:14.5px">${esc(p.trato+' '+p.name)}</div><div class="meta">${esc(p.from)} → ${p.to==='hotel'?'hotel':'InSpace'} · ${esc(pl[0]||'')}</div></div><span class="chip ${p.s==='prog'?'':p.s==='pick'?'c-air':'c-done'}">${esc(lbl)}</span></div>${pl.length>1?`<div class="note" style="margin-top:8px">${pl.slice(1).map(esc).join('<br>')}</div>`:''}</div>`}).join('')}
window.VUELOS={avion,tierra,alertas:B=>(B.traslados||[]).some(p=>p.flight&&(p.s==='cancel'||(p.s==='delay'&&p.d>=20)))};
})();
