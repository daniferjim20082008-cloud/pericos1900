'use strict';
(() => {
 const repo='daniferjim20082008-cloud/pericos1900';
 const issuesURL=`https://github.com/${repo}/issues`;
 const $=id=>document.getElementById(id);
 let questions=[], answers=[], step=0;
 function issueLink(title,body){return `${issuesURL}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;}
 async function getJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('No disponible');return r.json();}
 function showQuestion(){
  const q=questions[step]; $('quiz-progress').textContent=`Pregunta ${step+1} de ${questions.length}`;
  $('quiz-meter').value=step+1; $('quiz-question').textContent=q.q;
  $('quiz-options').replaceChildren();
  q.options.forEach((option,i)=>{const label=document.createElement('label');label.className='quiz-option';
   const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=String(i);radio.checked=answers[step]===i;
   radio.addEventListener('change',()=>{answers[step]=i;$('quiz-next').disabled=false;});
   label.append(radio,document.createTextNode(option));$('quiz-options').append(label);
  });
  $('quiz-back').disabled=step===0;$('quiz-next').disabled=answers[step]===undefined;
  $('quiz-next').textContent=step===questions.length-1?'Preparar envío':'Siguiente →';
  $('quiz-question').focus();
 }
 $('quiz-start').addEventListener('click',()=>{if(!questions.length)return;$('quiz-intro').hidden=true;$('quiz-game').hidden=false;showQuestion();});
 $('quiz-back').addEventListener('click',()=>{if(step>0){step--;showQuestion();}});
 $('quiz-next').addEventListener('click',()=>{
  if(answers[step]===undefined)return;
  if(step<questions.length-1){step++;showQuestion();return;}
  const body='Participación en el Quiz Pericos 1900. Mi usuario y resultado serán públicos.\n\n```pericos-quiz-v1\n'+JSON.stringify({version:1,answers})+'\n```\n\nConfirmo el envío para corregir mi partida e incluir mi mejor resultado en el ranking.';
  $('quiz-submit').href=issueLink('[Quiz Pericos 1900] Mi participación',body);
  $('quiz-game').hidden=true;$('quiz-finish').hidden=false;$('quiz-finish').focus();
 });
 $('quiz-edit').addEventListener('click',()=>{$('quiz-finish').hidden=true;$('quiz-game').hidden=false;showQuestion();});
 getJSON('questions.json').then(data=>{questions=data;answers=Array(data.length);$('quiz-start').disabled=false;$('quiz-load').textContent='10 preguntas · 10 puntos por acierto · sin límite de tiempo';}).catch(()=>{$('quiz-load').textContent='No se pudo cargar el cuestionario. Recarga la página para intentarlo de nuevo.';});
 async function loadRanking(){
  $('ranking-status').textContent='Cargando clasificación…';
  try{
   const data=await getJSON(`https://raw.githubusercontent.com/${repo}/main/ranking.json`);
   $('ranking-body').replaceChildren();
   data.players.forEach((p,i)=>{const row=document.createElement('tr');[i+1,p.login,`${p.score} / 100`,p.attempts].forEach(value=>{const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);});$('ranking-body').append(row);});
   $('ranking-status').textContent=data.players.length?`${data.players.length} participantes · Última corrección: ${new Date(data.updated).toLocaleString('es-ES')}`:'Todavía no hay partidas corregidas. ¡Estrena el ranking!';
  }catch{$('ranking-status').textContent='No se pudo cargar el ranking. Prueba de nuevo en unos minutos.';}
 }
 $('ranking-refresh').addEventListener('click',loadRanking);loadRanking();
 $('review-form').addEventListener('submit',e=>{
  e.preventDefault();
  const kind=$('review-kind').value;const title=$('review-title').value.trim();const message=$('review-message').value.trim();
  if(!title||!message)return;
  const body=`Tipo: ${kind}\nValoración: ${$('review-rating').value}/5\n\n${message}\n\nEnviado desde Pericos 1900. Este comentario es público.`;
  $('review-send').href=issueLink(`[Pericos web] ${title}`,body);$('review-confirm').hidden=false;$('review-send').focus();
 });
 async function loadReviews(){
  try{
   const data=await getJSON(`https://api.github.com/repos/${repo}/issues?state=all&sort=created&direction=desc&per_page=100`);
   const reviews=data.filter(x=>!x.pull_request&&x.title.startsWith('[Pericos web]')).slice(0,8);
   $('review-list').replaceChildren();
   reviews.forEach(r=>{const article=document.createElement('article');article.className='review-item';const a=document.createElement('a');a.href=r.html_url;a.target='_blank';a.rel='noopener';a.textContent=r.title.replace('[Pericos web] ','');const meta=document.createElement('p');meta.textContent=`@${r.user.login} · ${new Date(r.created_at).toLocaleDateString('es-ES')} · ${r.state==='open'?'Abierta':'Cerrada'}`;article.append(a,meta);$('review-list').append(article);});
   $('review-status').textContent=reviews.length?'Últimas reseñas y propuestas recibidas.':'Aún no hay reseñas en los envíos recientes. Puedes consultar el historial completo en GitHub.';
  }catch{$('review-status').textContent='No se pudieron cargar los comentarios. Puedes verlos o escribir uno en GitHub.';}
 }
 loadReviews();
})();
