const sofaTeam='https://www.sofascore.com/es/football/team/espanyol/2814';
const official='https://www.rcdespanyol.com/es/equipos/rcd-espanyol/1';
const players=[
 {n:1,name:'Àngel Fortuño',pos:'Portero'}, {n:13,name:'Dmitrović',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/marko-dmitrovic/94527'},
 {n:2,name:'Gorosabel',pos:'Defensa'}, {n:3,name:'Quilindschy',pos:'Defensa'}, {n:5,name:'Riedel',pos:'Defensa'}, {n:6,name:'Cabrera',pos:'Defensa'}, {n:14,name:'Nuñez',pos:'Defensa'}, {n:16,name:'Drkušić',pos:'Defensa'}, {n:21,name:'Hinojo',pos:'Defensa'}, {n:23,name:'El Hilali',pos:'Defensa'},
 {n:4,name:'Urko',pos:'Centrocampista'}, {n:8,name:'Edu Expósito',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/edu-exposito/877262'}, {n:10,name:'Pol Lozano',pos:'Centrocampista'}, {n:20,name:'Moscardo',pos:'Centrocampista'}, {n:22,name:'Cala',pos:'Centrocampista'}, {n:26,name:'Bauza',pos:'Centrocampista'}, {n:28,name:'Javi Hdez.',pos:'Centrocampista'},
 {n:7,name:'Puado',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/javi-puado/891511'}, {n:9,name:'Roberto',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/roberto-fernandez/1392592'}, {n:11,name:'Pere Milla',pos:'Delantero'}, {n:15,name:'Bryan',pos:'Delantero'}, {n:17,name:'Jofre',pos:'Delantero'}, {n:18,name:'Marcos',pos:'Delantero'}, {n:19,name:'Kike G.',pos:'Delantero'}, {n:24,name:'Dolan',pos:'Delantero'}
];
let currentFilter='Todos';
const grid=document.getElementById('playerGrid');
const search=document.getElementById('searchPlayer');
function render(){
 const q=search.value.trim().toLowerCase();
 const list=players.filter(p=>(currentFilter==='Todos'||p.pos===currentFilter)&&p.name.toLowerCase().includes(q));
 grid.innerHTML=list.map((p,i)=>`<article class="player" data-name="${p.name.replaceAll('"','&quot;')}"><div class="num">${p.n}</div><span class="role">${p.pos}</span><h3>${p.name}</h3><p class="mini">Dorsal ${p.n} · plantilla oficial</p><div class="player-actions"><button class="tiny" onclick="openPlayer('${p.name.replaceAll("'","\\'")}')">Ver ficha</button><a class="tiny" href="${p.sofa||sofaTeam}" target="_blank" rel="noopener">Datos ↗</a></div></article>`).join('');
 if(!list.length) grid.innerHTML='<p style="color:#6c7d95">No hay jugadores que coincidan con la búsqueda.</p>';
}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;render()}));
search.addEventListener('input',render);
const modal=document.getElementById('playerModal');
function openPlayer(name){const p=players.find(x=>x.name===name);if(!p)return;document.getElementById('mName').textContent=p.name;document.getElementById('mRole').textContent=p.pos;document.getElementById('mMeta').textContent=`Dorsal ${p.n} · Primer equipo 2026/27`;document.getElementById('mNumber').textContent=p.n;document.getElementById('mPosition').textContent=p.pos;document.getElementById('mOfficial').href=official;document.getElementById('mSofa').href=p.sofa||sofaTeam;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.getElementById('closeModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
render();