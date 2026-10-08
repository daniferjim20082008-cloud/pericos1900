const official='https://www.rcdespanyol.com/es/equipos/rcd-espanyol/1';
const players=[
 {n:1,name:'Àngel Fortuño',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/angel-fortuno/1082734'},
 {n:13,name:'Dmitrović',pos:'Portero',sofa:'https://www.sofascore.com/es/football/player/marko-dmitrovic/94527'},
 {n:2,name:'Gorosabel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/andoni-gorosabel/866810'},
 {n:3,name:'Quilindschy',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/quilindschy-hartman/1392044'},
 {n:5,name:'Riedel',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/clemens-riedel/1129360'},
 {n:6,name:'Cabrera',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/leandro-cabrera/81992'},
 {n:14,name:'Nuñez',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/unai-nunez/892521'},
 {n:16,name:'Drkušić',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/vanja-drkusic/908617'},
 {n:21,name:'Hinojo',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/roger-hinojo/2065347'},
 {n:23,name:'El Hilali',pos:'Defensa',sofa:'https://www.sofascore.com/es/football/player/omar-el-hilali/1064026'},
 {n:4,name:'Urko',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/urko-gonzalez/1064009'},
 {n:8,name:'Edu Expósito',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/edu-exposito/877262'},
 {n:10,name:'Pol Lozano',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/pol-lozano/826010'},
 {n:20,name:'Moscardo',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/gabriel-moscardo/1485309'},
 {n:22,name:'Cala',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/alex-calatrava/1136863'},
 {n:26,name:'Bauza',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/rafael-bauza/1841365'},
 {n:28,name:'Javi Hdez.',pos:'Centrocampista',sofa:'https://www.sofascore.com/es/football/player/hernandez-javier/1514913'},
 {n:7,name:'Puado',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/javi-puado/891511'},
 {n:9,name:'Roberto',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/roberto-fernandez/1392592'},
 {n:11,name:'Pere Milla',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/pere-milla/175185'},
 {n:15,name:'Bryan',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/bryan-zaragoza/1084730'},
 {n:17,name:'Jofre',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/jofre/1019236'},
 {n:18,name:'Marcos',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/marcos-fernandez/1183542'},
 {n:19,name:'Kike G.',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/kike-garcia/84972'},
 {n:24,name:'Dolan',pos:'Delantero',sofa:'https://www.sofascore.com/es/football/player/tyrhys-dolan/1063015'}
];
let currentFilter='Todos';
const grid=document.getElementById('playerGrid');
const search=document.getElementById('searchPlayer');
function render(){
 const q=search.value.trim().toLowerCase();
 const list=players.filter(p=>(currentFilter==='Todos'||p.pos===currentFilter)&&p.name.toLowerCase().includes(q));
 grid.innerHTML=list.map((p,i)=>`<article class="player" data-name="${p.name.replaceAll('"','&quot;')}"><div class="num">${p.n}</div><span class="role">${p.pos}</span><h3>${p.name}</h3><p class="mini">Dorsal ${p.n} · plantilla oficial</p><div class="player-actions"><button class="tiny" onclick="openPlayer('${p.name.replaceAll("'","\\'")}')">Ver ficha</button><a class="tiny" href="${p.sofa}" target="_blank" rel="noopener">Datos ↗</a></div></article>`).join('');
 if(!list.length) grid.innerHTML='<p style="color:#6c7d95">No hay jugadores que coincidan con la búsqueda.</p>';
}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');currentFilter=b.dataset.filter;render()}));
search.addEventListener('input',render);
const modal=document.getElementById('playerModal');
function openPlayer(name){const p=players.find(x=>x.name===name);if(!p)return;document.getElementById('mName').textContent=p.name;document.getElementById('mRole').textContent=p.pos;document.getElementById('mMeta').textContent=`Dorsal ${p.n} · Primer equipo 2026/27`;document.getElementById('mNumber').textContent=p.n;document.getElementById('mPosition').textContent=p.pos;document.getElementById('mOfficial').href=official;document.getElementById('mSofa').href=p.sofa;modal.classList.add('open');modal.setAttribute('aria-hidden','false')}
function closeModal(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true')}
document.getElementById('closeModal').addEventListener('click',closeModal);modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
render();