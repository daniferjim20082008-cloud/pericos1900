const teamImage='https://img.sofascore.com/api/v1/team/2814/image';
const official='https://www.rcdespanyol.com/es/equipos/rcd-espanyol/1';
const players=[
 {n:1,name:'Àngel Fortuño',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/angel-fortuno/1082734',photo:'https://img.sofascore.com/api/v1/player/1082734/image'},
 {n:13,name:'Dmitrović',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/marko-dmitrovic/94527',photo:'https://img.sofascore.com/api/v1/player/94527/image'},
 {n:2,name:'Gorosabel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/andoni-gorosabel/866810',photo:'https://img.sofascore.com/api/v1/player/866810/image'},
 {n:3,name:'Quilindschy',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/quilindschy-hartman/1392044',photo:'https://img.sofascore.com/api/v1/player/1392044/image'},
 {n:5,name:'Riedel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/clemens-riedel/1129360',photo:'https://img.sofascore.com/api/v1/player/1129360/image'},
 {n:6,name:'Cabrera',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/leandro-cabrera/81992',photo:'https://img.sofascore.com/api/v1/player/81992/image'},
 {n:14,name:'Nuñez',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/unai-nunez/892521',photo:'https://img.sofascore.com/api/v1/player/892521/image'},
 {n:16,name:'Drkušić',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/vanja-drkusic/908617',photo:'https://img.sofascore.com/api/v1/player/908617/image'},
 {n:21,name:'Hinojo',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/roger-hinojo/2065347',photo:'https://img.sofascore.com/api/v1/player/2065347/image'},
 {n:23,name:'El Hilali',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/omar-el-hilali/1064026',photo:'https://img.sofascore.com/api/v1/player/1064026/image'},
 {n:4,name:'Urko',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/urko-gonzalez/1064009',photo:'https://img.sofascore.com/api/v1/player/1064009/image'},
 {n:8,name:'Edu Expósito',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/edu-exposito/877262',photo:'https://img.sofascore.com/api/v1/player/877262/image'},
 {n:10,name:'Pol Lozano',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/pol-lozano/826010',photo:'https://img.sofascore.com/api/v1/player/826010/image'},
 {n:20,name:'Moscardo',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/gabriel-moscardo/1485309',photo:'https://img.sofascore.com/api/v1/player/1485309/image'},
 {n:22,name:'Cala',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/alex-calatrava/1136863',photo:'https://img.sofascore.com/api/v1/player/1136863/image'},
 {n:26,name:'Bauza',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/rafael-bauza/1841365',photo:'https://img.sofascore.com/api/v1/player/1841365/image'},
 {n:28,name:'Javi Hdez.',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/hernandez-javier/1514913',photo:'https://img.sofascore.com/api/v1/player/1514913/image'},
 {n:7,name:'Puado',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/javi-puado/891511',photo:'https://img.sofascore.com/api/v1/player/891511/image'},
 {n:9,name:'Roberto',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/roberto-fernandez/1392592',photo:'https://img.sofascore.com/api/v1/player/1392592/image'},
 {n:11,name:'Pere Milla',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/pere-milla/175185',photo:'https://img.sofascore.com/api/v1/player/175185/image'},
 {n:15,name:'Bryan',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/bryan-zaragoza/1084730',photo:'https://img.sofascore.com/api/v1/player/1084730/image'},
 {n:17,name:'Jofre',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/jofre/1019236',photo:'https://img.sofascore.com/api/v1/player/1019236/image'},
 {n:18,name:'Marcos',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/marcos-fernandez/1183542',photo:'https://img.sofascore.com/api/v1/player/1183542/image'},
 {n:19,name:'Kike G.',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/kike-garcia/84972',photo:'https://img.sofascore.com/api/v1/player/84972/image'},
 {n:24,name:'Dolan',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/tyrhys-dolan/1063015',photo:'https://img.sofascore.com/api/v1/player/1063015/image'}
];
let currentFilter='Todos';
const grid=document.getElementById('playerGrid');
const search=document.getElementById('searchPlayer');
function playerCard(p){
  const safeName=p.name.replaceAll('"','&quot;');
  const escapedName=p.name.replaceAll("'","\\'");
  return `<article class="player" data-name="${safeName}"><div class="num">${p.n}</div><div class="player-head"><img class="player-photo" src="${p.photo||teamImage}" alt="Foto de ${p.name}" loading="lazy" onerror="this.src='${teamImage}'"><div class="player-copy"><span class="role">${p.pos}</span><h3>${p.name}</h3><p class="mini">Dorsal ${p.n} · plantilla oficial</p></div></div><div class="player-actions"><button class="tiny" onclick="openPlayer('${escapedName}')">Ver ficha</button><a class="tiny" href="${p.sofa}" target="_blank" rel="noopener">Datos ↗</a></div></article>`;
}
function render(){
 const q=search.value.trim().toLowerCase();
 const list=players.filter(p=>(currentFilter==='Todos'||p.pos===currentFilter)&&p.name.toLowerCase().includes(q));
 grid.innerHTML=list.map(playerCard).join('');
 if(!list.length) grid.innerHTML='<p style="color:#6c7d95">No hay jugadores que coincidan con la búsqueda.</p>';
}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;render()}));
search.addEventListener('input',render);
const modal=document.getElementById('playerModal');
function openPlayer(name){
 const p=players.find(x=>x.name===name);if(!p)return;
 document.getElementById('mName').textContent=p.name;
 document.getElementById('mRole').textContent=p.pos;
 document.getElementById('mMeta').textContent=`Dorsal ${p.n} · Primer equipo 2026/27`;
 document.getElementById('mNumber').textContent=p.n;
 document.getElementById('mPosition').textContent=p.pos;
 document.getElementById('mOfficial').href=official;
 document.getElementById('mSofa').href=p.sofa;
 let photo=document.getElementById('mPhoto');
 if(!photo){photo=document.createElement('img');photo.id='mPhoto';photo.className='modal-photo';const top=modal.querySelector('.modal-top');top.insertAdjacentElement('afterend',photo)}
 photo.src=p.photo||teamImage;
 photo.alt=`Foto de ${p.name}`;
 photo.onerror=()=>{photo.onerror=null;photo.src=teamImage};
 modal.classList.add('open');
 modal.setAttribute('aria-hidden','false');
}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.getElementById('closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
render();

function injectPlayerImages(){
 const st=document.createElement('style');
 st.textContent=`.player-head{display:flex;gap:14px;align-items:center;position:relative;z-index:1;margin-bottom:8px}.player-copy{min-width:0}.player-photo{width:68px;height:68px;border-radius:18px;object-fit:cover;object-position:center top;border:1px solid #d6e3f3;background:#eef5ff;box-shadow:0 8px 18px rgba(10,85,199,.10)}.profile-photo{width:100%;height:220px;object-fit:cover;object-position:center top;border-radius:18px;border:1px solid var(--line);margin-bottom:16px;background:#eef5ff}.modal-photo{width:150px;height:150px;border-radius:22px;object-fit:cover;object-position:center top;background:#eef5ff;border:1px solid var(--line);margin:0 18px 18px 0;float:left}@media(max-width:620px){.modal-photo{width:115px;height:115px}}`;
 document.head.appendChild(st);
 const featured=[['Javi Puado','891511'],['Edu Expósito','877262'],['Roberto Fernández','1392592'],['Marko Dmitrović','94527']];
 document.querySelectorAll('.profile').forEach(card=>{
   const name=card.querySelector('h3')?.textContent?.trim();
   const data=featured.find(x=>x[0]===name);
   if(data&&!card.querySelector('.profile-photo')){
     const img=document.createElement('img');img.className='profile-photo';img.src=`https://img.sofascore.com/api/v1/player/${data[1]}/image`;img.alt=`Foto de ${name}`;img.loading='lazy';card.prepend(img);
   }
 });
 const featuredSection=document.querySelector('.featured');
 if(featuredSection){featuredSection.id='galeria';const tag=featuredSection.querySelector('.tag');if(tag)tag.textContent='El equipo en imágenes';}
 const nav=document.querySelector('.navlinks');
 if(nav&&!nav.querySelector('a[href="#galeria"]')){const a=document.createElement('a');a.href='#galeria';a.textContent='Galería';nav.appendChild(a)}
}
injectPlayerImages();

const radarData={
 updated:'8 OCT 2026',
 record:'1V · 1E · 3D',
 goals:'6 GF · 8 GC',
 streak:'2 derrotas seguidas',
 next:'Málaga CF — RCD Espanyol',
 nextMeta:'9 OCT · 21:00 · La Rosaleda',
 results:[
  {r:'D',score:'Real Sociedad 2–1 Espanyol'},
  {r:'E',score:'Espanyol 1–1 Sevilla'},
  {r:'V',score:'Osasuna 0–2 Espanyol'},
  {r:'D',score:'Rayo Vallecano 2–1 Espanyol'},
  {r:'D',score:'Espanyol 1–3 Elche'}
 ]
};
function injectRadar(){
 const squad=document.querySelector('.squad');
 if(!squad||document.getElementById('radar'))return;
 const section=document.createElement('section');
 section.id='radar';section.className='radar-section';
 section.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="tag">Radar perico · ${radarData.updated}</span><h2>Así llega el Espanyol</h2></div><p>Forma reciente, racha y próximo reto. Esta sección se actualiza con los datos más recientes contrastados.</p></div><div class="radar-grid"><div class="radar-card"><span>Últimos 5</span><strong>${radarData.record}</strong><small>${radarData.goals}</small></div><div class="radar-card"><span>Racha actual</span><strong>${radarData.streak}</strong><small>Últimos resultados oficiales</small></div><div class="radar-card radar-next"><span>Próximo partido</span><strong>${radarData.next}</strong><small>${radarData.nextMeta}</small></div></div><div class="form-strip">${radarData.results.map(x=>`<div class="form-item ${x.r==='V'?'win':x.r==='E'?'draw':'loss'}"><b>${x.r}</b><span>${x.score}</span></div>`).join('')}</div><div class="radar-links"><a class="btn ghost" href="https://www.laliga.com/clubes/rcd-espanyol/resultados" target="_blank" rel="noopener">Resultados LALIGA ↗</a><a class="btn ghost" href="https://www.sofascore.com/es/football/team/espanyol/2814" target="_blank" rel="noopener">Seguir en Sofascore ↗</a></div></div>`;
 squad.parentNode.insertBefore(section,squad);
 const nav=document.querySelector('.navlinks');if(nav&&!nav.querySelector('a[href="#radar"]')){const a=document.createElement('a');a.href='#radar';a.textContent='Radar';nav.appendChild(a)}
 const st=document.createElement('style');st.textContent=`.radar-section{background:linear-gradient(135deg,#f8fbff,#eaf3ff)}.radar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.radar-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;box-shadow:0 12px 32px rgba(8,35,78,.07)}.radar-card span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:var(--blue)}.radar-card strong{display:block;font-size:25px;line-height:1.12;color:var(--navy);margin:8px 0}.radar-card small{color:var(--muted)}.radar-next{border-color:#9fc5ff}.form-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}.form-item{background:#fff;border:1px solid var(--line);border-radius:17px;padding:13px;display:flex;gap:10px;align-items:center}.form-item b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;flex:0 0 auto}.form-item span{font-size:12px;font-weight:750}.form-item.win b{background:#159a62}.form-item.draw b{background:#d98b09}.form-item.loss b{background:#c83b4a}.radar-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}@media(max-width:900px){.radar-grid{grid-template-columns:1fr}.form-strip{grid-template-columns:1fr 1fr}}@media(max-width:560px){.form-strip{grid-template-columns:1fr}}`;
 document.head.appendChild(st);
}
injectRadar();
