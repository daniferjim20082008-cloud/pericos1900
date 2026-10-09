/* Funciones compartidas por la interfaz y sus pruebas. */
(function(root){
 const api={
  draw(bank,count=10,random=Math.random){
   const copy=bank.slice();
   for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}
   return copy.slice(0,count);
  },
  score(questions,answers){return questions.reduce((sum,q,i)=>sum+(q.answer===answers[i]?10:0),0);},
  badge(score){return score===100?'Leyenda perica':score>=80?'Maestro perico':score>=50?'Aficionado perico':'Canterano';},
  weekKey(now=new Date()){
   const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Madrid',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
   const val=t=>parts.find(p=>p.type===t).value;
   const date=new Date(`${val('year')}-${val('month')}-${val('day')}T12:00:00Z`);
   date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);
   return date.toISOString().slice(0,10);
  },
  reviewStatus(entry){return ['recibida','en-revision','aplicada'].includes(entry?.status)?entry.status:'recibida';}
 };
 root.PericosQuiz=api;
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
