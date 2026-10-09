const official='https://www.rcdespanyol.com/es/equipos/rcd-espanyol/1';
const players=[
 {n:1,name:'Àngel Fortuño',full:'Àngel Fortuño',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/angel-fortuno/1082734'},
 {n:13,name:'Dmitrović',full:'Marko Dmitrović',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/marko-dmitrovic/94527'},
 {n:2,name:'Gorosabel',full:'Andoni Gorosabel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/andoni-gorosabel/866810'},
 {n:3,name:'Quilindschy',full:'Quilindschy Hartman',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/quilindschy-hartman/1392044'},
 {n:5,name:'Riedel',full:'Clemens Riedel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/clemens-riedel/1129360'},
 {n:6,name:'Cabrera',full:'Leandro Cabrera',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/leandro-cabrera/81992'},
 {n:14,name:'Nuñez',full:'Unai Núñez',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/unai-nunez/892521'},
 {n:16,name:'Drkušić',full:'Vanja Drkušić',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/vanja-drkusic/908617'},
 {n:21,name:'Hinojo',full:'Roger Hinojo',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/roger-hinojo/2065347'},
 {n:23,name:'El Hilali',full:'Omar El Hilali',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/omar-el-hilali/1064026'},
 {n:4,name:'Urko',full:'Urko González de Zárate',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/urko-gonzalez/1064009'},
 {n:8,name:'Edu Expósito',full:'Edu Expósito',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/edu-exposito/877262'},
 {n:10,name:'Pol Lozano',full:'Pol Lozano',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/pol-lozano/826010'},
 {n:20,name:'Moscardo',full:'Gabriel Moscardo',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/gabriel-moscardo/1485309'},
 {n:22,name:'Cala',full:'Álex Calatrava',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/alex-calatrava/1136863'},
 {n:26,name:'Bauza',full:'Rafael Bauza',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/rafael-bauza/1841365'},
 {n:28,name:'Javi Hdez.',full:'Javier Hernández',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/hernandez-javier/1514913'},
 {n:7,name:'Puado',full:'Javi Puado',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/javi-puado/891511'},
 {n:9,name:'Roberto',full:'Roberto Fernández Jaén',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/roberto-fernandez/1392592'},
 {n:11,name:'Pere Milla',full:'Pere Milla',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/pere-milla/175185'},
 {n:15,name:'Bryan',full:'Bryan Zaragoza',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/bryan-zaragoza/1084730'},
 {n:17,name:'Jofre',full:'Jofre Carreras',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/jofre/1019236'},
 {n:18,name:'Marcos',full:'Marcos Fernández Sánchez',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/marcos-fernandez/1183542'},
 {n:19,name:'Kike G.',full:'Kike García',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/kike-garcia/84972'},
 {n:24,name:'Dolan',full:'Tyrhys Dolan',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/tyrhys-dolan/1063015'}
];

let currentFilter='Todos';
const grid=document.getElementById('playerGrid');
const search=document.getElementById('searchPlayer');
function card(p){
 const safe=p.name.replaceAll('"','&quot;');
 const escaped=p.name.replaceAll("'","\\'");
 return `<article class="player" data-name="${safe}"><div class="num">${p.n}</div><div class="player-head"><div class="portrait-frame"><img class="player-photo" data-player="${safe}" src="${playerAvatar(p)}" alt="Figura ilustrada con el dorsal ${p.n} de ${p.full}" loading="lazy" decoding="async"><span class="portrait-number">${p.n}</span></div><div class="player-copy"><span class="role">${p.pos}</span><h3>${p.name}</h3><p class="mini">Dorsal ${p.n} · plantilla oficial</p></div></div><div class="player-actions"><button class="tiny" onclick="openPlayer('${escaped}')">Ver ficha</button><a class="tiny" href="${p.sofa}" target="_blank" rel="noopener">Datos ↗</a></div></article>`;
}
function render(){
 const q=search.value.trim().toLowerCase();
 const list=players.filter(p=>(currentFilter==='Todos'||p.pos===currentFilter)&&p.name.toLowerCase().includes(q));
 grid.innerHTML=list.map(card).join('');
 if(!list.length) grid.innerHTML='<p style="color:#6c7d95">No hay jugadores que coincidan con la búsqueda.</p>';

}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;render()}));
search.addEventListener('input',render);

const modal=document.getElementById('playerModal');
async function openPlayer(name){
 const p=players.find(x=>x.name===name);if(!p)return;
 document.getElementById('mName').textContent=p.full;
 document.getElementById('mRole').textContent=p.pos;
 document.getElementById('mMeta').textContent=`Dorsal ${p.n} · Primer equipo 2026/27`;
 document.getElementById('mNumber').textContent=p.n;
 document.getElementById('mPosition').textContent=p.pos;
 document.getElementById('mOfficial').href=official;
 document.getElementById('mSofa').href=p.sofa;
 let photo=document.getElementById('mPhoto');
 if(!photo){photo=document.createElement('img');photo.id='mPhoto';photo.className='modal-photo';modal.querySelector('.modal-top').insertAdjacentElement('afterend',photo)}
 photo.src=playerAvatar(p); photo.alt=`Figura ilustrada con el dorsal ${p.n} de ${p.full}`;
 modal.classList.add('open');modal.setAttribute('aria-hidden','false');

}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.getElementById('closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

function injectStyles(){
 const st=document.createElement('style');
 st.textContent=`.player-head{display:flex;gap:14px;align-items:center;position:relative;z-index:1;margin-bottom:8px}.player-copy{min-width:0}.player-photo{width:68px;height:68px;border-radius:18px;object-fit:cover;object-position:center top;border:1px solid #d6e3f3;background:#eef5ff;box-shadow:0 8px 18px rgba(10,85,199,.10)}.profile-photo{width:100%;height:220px;object-fit:cover;object-position:center top;border-radius:18px;border:1px solid var(--line);margin-bottom:16px;background:#eef5ff}.modal-photo{width:150px;height:150px;border-radius:22px;object-fit:cover;object-position:center top;background:#eef5ff;border:1px solid var(--line);margin:0 18px 18px 0;float:left}@media(max-width:620px){.modal-photo{width:115px;height:115px}}`;
 document.head.appendChild(st);
}
async function injectFeaturedPhotos(){
 const map={'Javi Puado':'Javi Puado','Edu Expósito':'Edu Expósito','Roberto Fernández':'Roberto Fernández Jaén','Marko Dmitrović':'Marko Dmitrović'};
 document.querySelectorAll('.profile').forEach(async card=>{
  const name=card.querySelector('h3')?.textContent?.trim(); const full=map[name]; if(!full||card.querySelector('.profile-photo'))return;
  const img=document.createElement('img');img.className='profile-photo';img.decoding='async';img.src=playerAvatar(players.find(p=>p.full===full));img.alt=`Figura ilustrada de ${full}`;img.loading='lazy';card.prepend(img);

 });
 const featured=document.querySelector('.featured');
 if(featured){featured.id='galeria';const tag=featured.querySelector('.tag');if(tag)tag.textContent='Figuras blanquiazules';}
 const nav=document.querySelector('.navlinks');if(nav&&!nav.querySelector('a[href="#galeria"]')){const a=document.createElement('a');a.href='#galeria';a.textContent='Galería';nav.appendChild(a)}
}

const radarData={updated:'8 OCT 2026',record:'1V · 1E · 3D',goals:'6 GF · 8 GC',streak:'2 derrotas seguidas',next:'Málaga CF — RCD Espanyol',nextMeta:'9 OCT · 21:00 · La Rosaleda',results:[{r:'D',score:'Real Sociedad 2–1 Espanyol'},{r:'E',score:'Espanyol 1–1 Sevilla'},{r:'V',score:'Osasuna 0–2 Espanyol'},{r:'D',score:'Rayo Vallecano 2–1 Espanyol'},{r:'D',score:'Espanyol 1–3 Elche'}]};
function injectRadar(){
 const squad=document.querySelector('.squad');if(!squad||document.getElementById('radar'))return;
 const section=document.createElement('section');section.id='radar';section.className='radar-section';
 section.innerHTML=`<div class="wrap"><div class="section-head"><div><span class="tag">Radar perico · ${radarData.updated}</span><h2>Así llega el Espanyol</h2></div><p>Forma reciente, racha y próximo reto. Esta sección se actualiza con los datos más recientes contrastados.</p></div><div class="radar-grid"><div class="radar-card"><span>Últimos 5</span><strong>${radarData.record}</strong><small>${radarData.goals}</small></div><div class="radar-card"><span>Racha actual</span><strong>${radarData.streak}</strong><small>Últimos resultados oficiales</small></div><div class="radar-card radar-next"><span>Próximo partido</span><strong>${radarData.next}</strong><small>${radarData.nextMeta}</small></div></div><div class="form-strip">${radarData.results.map(x=>`<div class="form-item ${x.r==='V'?'win':x.r==='E'?'draw':'loss'}"><b>${x.r}</b><span>${x.score}</span></div>`).join('')}</div><div class="radar-links"><a class="btn ghost" href="https://www.laliga.com/clubes/rcd-espanyol/resultados" target="_blank" rel="noopener">Resultados LALIGA ↗</a><a class="btn ghost" href="https://www.sofascore.com/es/football/team/espanyol/2814" target="_blank" rel="noopener">Seguir en Sofascore ↗</a></div></div>`;
 squad.parentNode.insertBefore(section,squad);
 const nav=document.querySelector('.navlinks');if(nav&&!nav.querySelector('a[href="#radar"]')){const a=document.createElement('a');a.href='#radar';a.textContent='Radar';nav.appendChild(a)}
 const st=document.createElement('style');st.textContent=`.radar-section{background:linear-gradient(135deg,#f8fbff,#eaf3ff)}.radar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.radar-card{background:#fff;border:1px solid var(--line);border-radius:22px;padding:22px;box-shadow:0 12px 32px rgba(8,35,78,.07)}.radar-card span{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.08em;font-weight:900;color:var(--blue)}.radar-card strong{display:block;font-size:25px;line-height:1.12;color:var(--navy);margin:8px 0}.radar-card small{color:var(--muted)}.radar-next{border-color:#9fc5ff}.form-strip{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:14px}.form-item{background:#fff;border:1px solid var(--line);border-radius:17px;padding:13px;display:flex;gap:10px;align-items:center}.form-item b{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;flex:0 0 auto}.form-item span{font-size:12px;font-weight:750}.form-item.win b{background:#159a62}.form-item.draw b{background:#d98b09}.form-item.loss b{background:#c83b4a}.radar-links{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}@media(max-width:900px){.radar-grid{grid-template-columns:1fr}.form-strip{grid-template-columns:1fr 1fr}}@media(max-width:560px){.form-strip{grid-template-columns:1fr}}`;document.head.appendChild(st);
}

injectStyles();render();injectFeaturedPhotos();injectRadar();

// Navegación móvil accesible y control de foco del diálogo.
(function enhanceUX(){
 const nav=document.querySelector('.navlinks');const bar=document.querySelector('.nav');
 if(nav&&bar){const toggle=document.createElement('button');toggle.className='menu-toggle';toggle.type='button';toggle.textContent='Menú ☰';toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls','main-navigation');nav.id='main-navigation';bar.insertBefore(toggle,nav);toggle.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Cerrar ×':'Menú ☰'});nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menú ☰'}})}
 const dialog=document.querySelector('.modal-card');if(dialog){dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','mName')}
 const oldOpen=openPlayer;openPlayer=async function(name){await oldOpen(name);document.getElementById('closeModal').focus()};
})();

