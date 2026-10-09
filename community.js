'use strict';
(() => {
 const repo='daniferjim20082008-cloud/pericos1900';
 const issuesURL=`https://github.com/${repo}/issues`;
 const $=id=>document.getElementById(id), core=globalThis.PericosQuiz;
 let bank=[], questions=[], answers=[], step=0, rankings=null, mode='general';
 function issueLink(title,body){return `${issuesURL}/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;}
 async function getJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('No disponible');return r.json();}
 function start(){
  if(!bank.length)return;questions=core.draw(bank);answers=Array(questions.length);step=0;
  $('quiz-intro').hidden=true;$('quiz-finish').hidden=true;$('quiz-game').hidden=false;showQuestion();
 }
 function showQuestion(){
  const q=questions[step]; $('quiz-progress').textContent=`Pregunta ${step+1} de ${questions.length}`;
  $('quiz-meter').value=step+1; $('quiz-question').textContent=q.q;$('quiz-options').replaceChildren();
  q.options.forEach((option,i)=>{const label=document.createElement('label');label.className='quiz-option';
   const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=String(i);radio.checked=answers[step]===i;
   radio.addEventListener('change',()=>{answers[step]=i;$('quiz-next').disabled=false;});
   label.append(radio,document.createTextNode(option));$('quiz-options').append(label);
  });
  $('quiz-back').disabled=step===0;$('quiz-next').disabled=answers[step]===undefined;
  $('quiz-next').textContent=step===questions.length-1?'Ver mi resultado':'Siguiente →';$('quiz-question').focus();
 }
 function finish(){
  const score=core.score(questions,answers);
  $('quiz-score').textContent=`${score} / 100`;$('quiz-badge').textContent=core.badge(score);
  $('quiz-summary').textContent=`Has acertado ${score/10} de 10 preguntas.`;
  $('quiz-explanations').replaceChildren();
  questions.forEach((q,i)=>{
   const correct=answers[i]===q.answer;const item=document.createElement('details');item.className='quiz-explanation';
   const summary=document.createElement('summary');summary.textContent=`${correct?'✓ Acierto':'✗ Error'} · ${i+1}. ${q.q}`;
   const chosen=document.createElement('p');chosen.textContent=`Tu respuesta: ${q.options[answers[i]]}`;
   const answer=document.createElement('p');answer.textContent=`Respuesta correcta: ${q.options[q.answer]}. ${q.explanation}`;
   const source=document.createElement('a');source.href=q.source;source.target='_blank';source.rel='noopener';source.textContent='Consultar fuente oficial ↗';
   item.append(summary,chosen,answer,source);$('quiz-explanations').append(item);
  });
  const body='Partida del Quiz Pericos 1900. Mi usuario y respuestas serán públicos.\n\n```pericos-quiz-v2\n'+JSON.stringify({version:2,questionIds:questions.map(q=>q.id),answers})+'\n```\n\nConfirmo el envío para incluir mi mejor resultado en el ranking.';
  $('quiz-submit').href=issueLink('[Quiz Pericos 1900] Mi participación',body);
  $('quiz-game').hidden=true;$('quiz-finish').hidden=false;$('quiz-finish').focus();
 }
 $('quiz-start').addEventListener('click',start);$('quiz-retry').addEventListener('click',start);
 $('quiz-back').addEventListener('click',()=>{if(step>0){step--;showQuestion();}});
 $('quiz-next').addEventListener('click',()=>{if(answers[step]===undefined)return;if(step<questions.length-1){step++;showQuestion();}else finish();});
 getJSON('questions.json').then(data=>{bank=data;$('quiz-start').disabled=false;$('quiz-load').textContent=`10 preguntas aleatorias de un banco de ${data.length} · Resultado inmediato`;}).catch(()=>{$('quiz-load').textContent='No se pudo cargar el cuestionario. Recarga la página para intentarlo de nuevo.';});
 function renderRanking(){
  if(!rankings)return;
  const week=core.weekKey();const players=mode==='general'?rankings.players:(rankings.weeks?.[week]||[]);
  $('ranking-period').textContent=mode==='general'?'Todas las partidas · Mejor puntuación por cuenta':`Semana del ${new Date(week+'T12:00:00Z').toLocaleDateString('es-ES')} · Lunes a domingo, hora de Madrid`;
  $('ranking-body').replaceChildren();
  players.forEach((p,i)=>{const row=document.createElement('tr');[i+1,p.login,`${p.score} / 100`,p.badge||core.badge(p.score),p.attempts].forEach(value=>{const cell=document.createElement('td');cell.textContent=String(value);row.append(cell);});$('ranking-body').append(row);});
  $('ranking-status').textContent=players.length?`${players.length} participantes · Última corrección: ${new Date(rankings.updated).toLocaleString('es-ES')}`:mode==='general'?'Todavía no hay partidas registradas. ¡Estrena el ranking!':'Todavía no hay partidas registradas esta semana. ¡Sé el primero!';
 }
 async function loadRanking(){
  $('ranking-refresh').disabled=true;$('ranking-status').textContent='Cargando clasificación…';
  try{rankings=await getJSON(`https://raw.githubusercontent.com/${repo}/main/ranking.json`);renderRanking();}
  catch{$('ranking-status').textContent='No se pudo actualizar el ranking. Prueba de nuevo en unos minutos.';}
  finally{$('ranking-refresh').disabled=false;}
 }
 document.querySelectorAll('[data-ranking]').forEach(button=>button.addEventListener('click',()=>{
  mode=button.dataset.ranking;document.querySelectorAll('[data-ranking]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderRanking();
 }));
 $('ranking-refresh').addEventListener('click',loadRanking);loadRanking();
 $('review-form').addEventListener('submit',e=>{
  e.preventDefault();const kind=$('review-kind').value,title=$('review-title').value.trim(),message=$('review-message').value.trim();if(!title||!message)return;
  const body=`Tipo: ${kind}\nValoración: ${$('review-rating').value}/5\n\n${message}\n\nEnviado desde Pericos 1900. Este comentario es público.`;
  $('review-send').href=issueLink(`[Pericos web] ${title}`,body);$('review-confirm').hidden=false;$('review-send').focus();
 });
 $('review-form').addEventListener('input',()=>{$('review-confirm').hidden=true;});
 async function loadReviews(){
  try{
   const [data,statusResult]=await Promise.all([
    getJSON(`https://api.github.com/repos/${repo}/issues?state=all&sort=created&direction=desc&per_page=100`),
    getJSON(`https://raw.githubusercontent.com/${repo}/main/review-status.json`).then(value=>({value})).catch(()=>({error:true}))
   ]);
   const reviews=data.filter(x=>!x.pull_request&&x.title.startsWith('[Pericos web]')).slice(0,8);$('review-list').replaceChildren();
   const labels={'recibida':'Recibida','en-revision':'En revisión','aplicada':'Aplicada'};
   reviews.forEach(r=>{
    const article=document.createElement('article');article.className='review-item';const a=document.createElement('a');a.href=r.html_url;a.target='_blank';a.rel='noopener';a.textContent=r.title.replace('[Pericos web] ','');
    const meta=document.createElement('p');meta.textContent=`@${r.user.login} · ${new Date(r.created_at).toLocaleDateString('es-ES')}`;
    const entry=statusResult.value?.reviews?.[r.number],state=core.reviewStatus(entry);const status=document.createElement('span');status.className=`review-state ${statusResult.error?'unknown':state}`;status.textContent=statusResult.error?'Estado no disponible':labels[state];
    article.append(status,a,meta);
    if(entry?.note){const note=document.createElement('p');note.textContent=entry.note;article.append(note);}
    $('review-list').append(article);
   });
   $('review-status').textContent=reviews.length?'Últimas reseñas y propuestas recibidas.':'Todavía no hay reseñas entre los envíos recientes. Consulta el historial completo en GitHub.';
  }catch{$('review-status').textContent='No se pudieron cargar los comentarios. Puedes verlos o escribir uno en GitHub.';}
 }
 loadReviews();
})();
