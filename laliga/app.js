(() => {
  "use strict";
  const D = window.LIGA_DATA || {};
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const teams = D.teams || {};
  let live = {standings:[], leaders:{}, events:[], forums:{}};
  let standings = D.standings || [];
  let leaders = D.leaders || {};
  let activeRound = 8;

  const fmtDate = (iso, opts={}) => {
    if (!iso) return "Horario por confirmar";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat("es-ES", {timeZone:"Europe/Madrid", day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit", ...opts}).format(d);
  };
  const teamName = code => teams[code]?.short || teams[code]?.name || code;
  const forumKey = (r,h,a) => `${r}:${h}:${a}`;
  const staticForumUrl = (r,h,a) => {
    const title = `[FORO J${r}] ${teamName(h)} vs ${teamName(a)}`;
    const body = `Foro del partido de la jornada ${r}: ${teamName(h)} vs ${teamName(a)}.`;
    return `https://github.com/${D.repo || "daniferjim20082008-cloud/pericos1900"}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  };

  function liveEvent(round, home, away) {
    return (live.events || []).find(e => Number(e.round) === Number(round) && e.home === home && e.away === away);
  }

  function positionMap() {
    const map = {};
    standings.forEach((r, i) => map[r[0]] = {pos:i+1, points:r[1], played:r[2], wins:r[3], draws:r[4], losses:r[5], gf:r[6], ga:r[7]});
    return map;
  }

  function strength(code) {
    const r = positionMap()[code];
    if (!r) return 1;
    const ppg = r.played ? r.points / r.played : 1.2;
    const gdpg = r.played ? (r.gf-r.ga) / r.played : 0;
    return Math.max(.35, ppg + .22 * gdpg);
  }

  function predict(home, away) {
    const sh = strength(home), sa = strength(away);
    const delta = Math.max(-1.6, Math.min(1.6, (sh-sa)*.55 + .32));
    const hg = Math.max(.35, Math.min(3.4, 1.35 + delta*.72));
    const ag = Math.max(.25, Math.min(3.0, 1.08 - delta*.55));
    const score = [Math.max(0, Math.round(hg)), Math.max(0, Math.round(ag))];
    const homeP = Math.round(Math.max(18, Math.min(68, 39 + delta*18)));
    const awayP = Math.round(Math.max(14, Math.min(58, 31 - delta*15)));
    const drawP = Math.max(12, 100-homeP-awayP);
    const total = homeP + drawP + awayP;
    return {
      score,
      p:[Math.round(homeP*100/total), Math.round(drawP*100/total), Math.round(awayP*100/total)]
    };
  }

  function roundFromDate() {
    const q = Number(new URLSearchParams(location.search).get("round"));
    if (q >= 1 && q <= 38) return q;
    const now = Date.now();
    const upcoming = (live.events || []).filter(e => e.kickoff && new Date(e.kickoff).getTime() >= now - 3*3600e3)
      .sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff))[0];
    if (upcoming?.round) return Number(upcoming.round);
    const dates = D.roundDates || [];
    for (let i=0;i<dates.length;i++) {
      if (new Date(`${dates[i]}T23:59:59+02:00`).getTime() >= now) return i+1;
    }
    return 38;
  }

  function renderStandings() {
    const el = $("standings");
    if (!el) return;
    el.innerHTML = `<div class="standing-row standing-head"><span>#</span><span>Equipo</span><span>PJ</span><span>DG</span><span>PTS</span></div>` +
      standings.map((r,i) => {
        const [code,pts,pj,v,e,d,gf,gc] = r;
        const zone = i<4 ? "champions" : i===4 ? "europa" : i>=17 ? "danger" : "";
        return `<button class="standing-row ${zone}" data-team="${code}"><span>${i+1}</span><span class="club-cell"><i class="team-dot" style="--c:${teams[code]?.primary||'#777'}"></i>${esc(teamName(code))}</span><span>${pj}</span><span>${gf-gc>0?'+':''}${gf-gc}</span><b>${pts}</b></button>`;
      }).join("");
    el.querySelectorAll("[data-team]").forEach(b => b.addEventListener("click", () => openClub(b.dataset.team)));
  }

  function roundMatches(round) {
    return (D.fixtures?.[round-1] || []).map(pair => ({home:pair[0], away:pair[1]}));
  }

  function renderRound(round) {
    activeRound = Math.max(1, Math.min(38, Number(round)||1));
    const sel = $("round-select");
    if (sel) sel.value = String(activeRound);
    const title = $("round-title");
    if (title) title.textContent = `Jornada ${activeRound}`;
    const rd = D.roundDates?.[activeRound-1];
    const date = $("round-date");
    if (date) date.textContent = rd ? new Intl.DateTimeFormat("es-ES",{day:"numeric",month:"long",year:"numeric"}).format(new Date(`${rd}T12:00:00+02:00`)) : "";
    const container = $("matches");
    if (!container) return;
    container.innerHTML = roundMatches(activeRound).map(({home,away}) => {
      const ev = liveEvent(activeRound,home,away);
      const pr = predict(home,away);
      const finished = ev && ["finished","afterpenalties","afterextra"].includes(ev.status);
      const score = finished && ev.homeScore != null ? `${ev.homeScore} – ${ev.awayScore}` : `${pr.score[0]} – ${pr.score[1]}`;
      const label = finished ? "Resultado" : "Predicción";
      const when = ev?.kickoff ? fmtDate(ev.kickoff) : (D.roundDates?.[activeRound-1] ? `Semana del ${D.roundDates[activeRound-1]}` : "Horario por confirmar");
      const fkey = forumKey(activeRound,home,away);
      const forum = live.forums?.[fkey] || staticForumUrl(activeRound,home,away);
      return `<article class="match-card">
        <div class="match-meta"><span>J${activeRound}</span><time>${esc(when)}</time></div>
        <div class="match-teams"><button data-team="${home}">${esc(teamName(home))}</button><strong>${score}</strong><button data-team="${away}">${esc(teamName(away))}</button></div>
        <div class="prediction"><small>${label}</small>${finished ? `<b>Finalizado</b>` : `<b>1 ${pr.p[0]}% · X ${pr.p[1]}% · 2 ${pr.p[2]}%</b>`}</div>
        <div class="match-actions"><button class="tiny porra-btn" data-match="${activeRound}:${home}:${away}">⚽ Mi porra</button><a class="tiny" href="${forum}" target="_blank" rel="noopener">💬 Foro</a></div>
      </article>`;
    }).join("");
    container.querySelectorAll("[data-team]").forEach(b => b.addEventListener("click",()=>openClub(b.dataset.team)));
    container.querySelectorAll(".porra-btn").forEach(b => b.addEventListener("click",()=>savePrediction(b.dataset.match)));
    const u = new URL(location.href); u.searchParams.set("round", activeRound); history.replaceState(null,"",u);
  }

  function savePrediction(key) {
    const old = JSON.parse(localStorage.getItem("liga1900-predictions") || "{}");
    const value = prompt("Tu pronóstico (ejemplo 2-1):", old[key] || "");
    if (value === null) return;
    if (!/^\d{1,2}-\d{1,2}$/.test(value.trim())) {
      alert("Escribe el resultado con formato 2-1.");
      return;
    }
    old[key] = value.trim();
    localStorage.setItem("liga1900-predictions", JSON.stringify(old));
    alert("Porra guardada en este dispositivo.");
  }

  function renderTeams() {
    const root = $("teams");
    if (!root) return;
    const search = ($("team-search")?.value || "").toLowerCase();
    const sort = $("team-sort")?.value || "pos";
    const pos = positionMap();
    let entries = Object.entries(teams).filter(([,t]) => `${t.name} ${t.short} ${t.city}`.toLowerCase().includes(search));
    entries.sort((a,b) => sort==="name" ? a[1].name.localeCompare(b[1].name) : sort==="city" ? a[1].city.localeCompare(b[1].city) : (pos[a[0]]?.pos||99)-(pos[b[0]]?.pos||99));
    const fav = new Set(JSON.parse(localStorage.getItem("liga1900-favorites") || "[]"));
    root.innerHTML = entries.map(([code,t]) => {
      const p = pos[code];
      return `<article class="team-card" style="--team:${t.primary};--team2:${t.secondary}">
        <div class="team-band"></div><div class="team-card-top"><span class="team-monogram">${code}</span><button class="fav ${fav.has(code)?"on":""}" data-fav="${code}" aria-label="Favorito">★</button></div>
        <h3>${esc(t.name)}</h3><p>${esc(t.city)} · ${esc(t.stadium?.name||"")}</p>
        <div class="team-numbers"><span><b>${p?.pos||"—"}º</b><small>posición</small></span><span><b>${p?.points??"—"}</b><small>puntos</small></span><span><b>${p?.gf??"—"}</b><small>goles</small></span></div>
        <button class="btn primary team-open" data-team="${code}">Abrir ficha</button>
      </article>`;
    }).join("");
    root.querySelectorAll("[data-team]").forEach(b=>b.addEventListener("click",()=>openClub(b.dataset.team)));
    root.querySelectorAll("[data-fav]").forEach(b=>b.addEventListener("click",()=>toggleFav(b.dataset.fav)));
    renderFavorites();
  }

  function toggleFav(code) {
    const fav = new Set(JSON.parse(localStorage.getItem("liga1900-favorites") || "[]"));
    fav.has(code) ? fav.delete(code) : fav.add(code);
    localStorage.setItem("liga1900-favorites", JSON.stringify([...fav]));
    renderTeams();
  }

  function renderFavorites() {
    const el = $("favorites"); if (!el) return;
    const fav = JSON.parse(localStorage.getItem("liga1900-favorites") || "[]");
    el.innerHTML = fav.length ? fav.map(c=>`<button class="tiny" data-team="${c}">${esc(teamName(c))}</button>`).join(" ") : `<p class="mini">Todavía no has marcado ningún club.</p>`;
    el.querySelectorAll("[data-team]").forEach(b=>b.addEventListener("click",()=>openClub(b.dataset.team)));
  }

  function renderLeaders() {
    const root = $("leaders"); if (!root) return;
    const defs = [
      ["goals","⚽","Goleadores","goles"],
      ["assists","🎯","Asistencias","asist."],
      ["yellow","🟨","Tarjetas amarillas","amarillas"],
      ["red","🟥","Tarjetas rojas","rojas"],
    ];
    root.innerHTML = defs.map(([key,icon,title,unit]) => {
      const rows = (leaders[key] || []).slice(0,7);
      return `<article class="leader-card"><h3>${icon} ${title}</h3>${rows.length ? rows.map((x,i)=>`<button data-team="${x.t}"><span>${i+1}. ${esc(x.n)}</span><small>${esc(teamName(x.t))}</small><b>${x.v} ${unit}</b></button>`).join("") : `<p>Esperando la próxima actualización automática.</p>`}</article>`;
    }).join("");
    root.querySelectorAll("[data-team]").forEach(b=>b.addEventListener("click",()=>openClub(b.dataset.team)));
  }

  function renderStadiums() {
    const root = $("stadiums"); if (!root) return;
    root.innerHTML = Object.entries(teams).map(([code,t])=>`<article class="stadium-card">
      <div class="stadium-badge" style="background:${t.primary}">${code}</div><div><h3>${esc(t.stadium.name)}</h3><strong>${esc(t.name)}</strong><p>📍 ${esc(t.stadium.address)}</p>
      <details><summary>🚆 Transporte público</summary><p>${esc(t.stadium.public)}</p></details>
      <details><summary>🚗 Coche y aparcamiento</summary><p>${esc(t.stadium.car)}</p></details>
      <div class="stadium-actions"><a class="btn primary compact" href="${t.stadium.map}" target="_blank" rel="noopener">Abrir en Maps ↗</a><button class="btn ghost compact" data-team="${code}">Ficha del club</button></div></div>
    </article>`).join("");
    root.querySelectorAll("[data-team]").forEach(b=>b.addEventListener("click",()=>openClub(b.dataset.team)));
  }

  function clubSeasonMatches(code) {
    const out = [];
    (D.fixtures || []).forEach((round,i) => round.forEach(([h,a]) => {
      if (h===code || a===code) out.push({round:i+1,home:h,away:a,event:liveEvent(i+1,h,a)});
    }));
    return out;
  }

  function openClub(code) {
    const t = teams[code]; if (!t) return;
    const p = positionMap()[code] || {};
    const all = clubSeasonMatches(code);
    const now = Date.now();
    const next = all.filter(m=>m.event?.kickoff && new Date(m.event.kickoff).getTime() > now).sort((a,b)=>new Date(a.event.kickoff)-new Date(b.event.kickoff)).slice(0,5);
    const recent = all.filter(m=>m.event && ["finished","afterpenalties","afterextra"].includes(m.event.status)).sort((a,b)=>new Date(b.event.kickoff)-new Date(a.event.kickoff)).slice(0,5);
    const content = $("club-content");
    content.innerHTML = `<div class="club-hero" style="--team:${t.primary};--team2:${t.secondary}">
      <div class="club-monogram">${code}</div><div><span class="eyebrow">${esc(t.city)}</span><h2>${esc(t.name)}</h2><p>${p.pos?`${p.pos}º · ${p.points} puntos · ${p.gf}-${p.ga} goles`:"Datos pendientes de actualización"}</p>
      <div class="hero-actions"><a class="btn primary" href="${t.official}" target="_blank" rel="noopener">Web oficial ↗</a><a class="btn ghost" href="${t.stadium.map}" target="_blank" rel="noopener">Cómo llegar ↗</a></div></div>
    </div>
    <div class="club-grid">
      <article class="club-panel"><h3>📊 Radiografía</h3><div class="facts"><span><small>Posición</small><b>${p.pos||"—"}º</b></span><span><small>Puntos</small><b>${p.points??"—"}</b></span><span><small>Victorias</small><b>${p.wins??"—"}</b></span><span><small>Goles</small><b>${p.gf??"—"}</b></span></div></article>
      <article class="club-panel"><h3>🏟️ ${esc(t.stadium.name)}</h3><p>${esc(t.stadium.address)}</p><p><b>Transporte:</b> ${esc(t.stadium.public)}</p><p><b>Coche:</b> ${esc(t.stadium.car)}</p><a class="btn primary compact" href="${t.stadium.map}" target="_blank" rel="noopener">Google Maps ↗</a></article>
    </div>
    <div class="club-panel club-calendar"><h3>📅 Sus 38 jornadas</h3><div class="club-fixtures">${all.map(m=>{
      const ev=m.event, finished=ev&&["finished","afterpenalties","afterextra"].includes(ev.status);
      const score=finished?`${ev.homeScore}-${ev.awayScore}`:"vs";
      const forum=live.forums?.[forumKey(m.round,m.home,m.away)]||staticForumUrl(m.round,m.home,m.away);
      return `<div><span>J${m.round}</span><b>${esc(teamName(m.home))} ${score} ${esc(teamName(m.away))}</b><small>${ev?.kickoff?fmtDate(ev.kickoff):"Horario por confirmar"}</small><a href="${forum}" target="_blank" rel="noopener">Foro ↗</a></div>`;
    }).join("")}</div></div>
    <div class="club-grid">
      <article class="club-panel"><h3>⏭️ Próximos</h3>${next.length?next.map(m=>`<p><b>J${m.round} · ${esc(teamName(m.home))} – ${esc(teamName(m.away))}</b><br>${fmtDate(m.event.kickoff)}</p>`).join(""):"<p>Sin próximos horarios confirmados.</p>"}</article>
      <article class="club-panel"><h3>✅ Últimos resultados</h3>${recent.length?recent.map(m=>`<p><b>J${m.round} · ${esc(teamName(m.home))} ${m.event.homeScore}-${m.event.awayScore} ${esc(teamName(m.away))}</b></p>`).join(""):"<p>Aún no hay resultados automáticos disponibles.</p>"}</article>
    </div>`;
    document.querySelectorAll("main > section:not(#club-page)").forEach(s=>s.hidden=true);
    $("club-page").hidden=false;
    scrollTo({top:0,behavior:"smooth"});
  }

  function closeClub() {
    $("club-page").hidden=true;
    document.querySelectorAll("main > section:not(#club-page)").forEach(s=>s.hidden=false);
    scrollTo({top:0,behavior:"smooth"});
  }

  function renderComparison() {
    const a=$("compare-a")?.value, b=$("compare-b")?.value, root=$("comparison");
    if (!a||!b||!root) return;
    const pa=positionMap()[a]||{}, pb=positionMap()[b]||{}, pr=predict(a,b);
    root.innerHTML=`<div class="compare-team"><span>${esc(teamName(a))}</span><b>${pa.points??"—"} pts</b><small>${pa.pos||"—"}º · ${pa.gf??"—"} GF · ${pa.ga??"—"} GC</small></div><div class="compare-pred"><small>Predicción si ${esc(teamName(a))} es local</small><strong>${pr.score[0]} – ${pr.score[1]}</strong><span>1 ${pr.p[0]}% · X ${pr.p[1]}% · 2 ${pr.p[2]}%</span></div><div class="compare-team"><span>${esc(teamName(b))}</span><b>${pb.points??"—"} pts</b><small>${pb.pos||"—"}º · ${pb.gf??"—"} GF · ${pb.ga??"—"} GC</small></div>`;
  }

  function setupCompare() {
    const options = Object.entries(teams).map(([c,t])=>`<option value="${c}">${esc(t.name)}</option>`).join("");
    ["compare-a","compare-b"].forEach((id,i)=>{const e=$(id); if(e){e.innerHTML=options;e.selectedIndex=i?1:0;e.addEventListener("change",renderComparison);}});
    renderComparison();
  }

  function setupQuiz() {
    const options = [["20",true],["18",false],["22",false],["24",false]].sort(()=>Math.random()-.5);
    const root=$("quiz-options"); if(!root)return;
    root.innerHTML=options.map(([x])=>`<button class="tiny">${x}</button>`).join("");
    [...root.children].forEach((b,i)=>b.addEventListener("click",()=>{$("quiz-result").textContent=options[i][1]?"✅ Correcto: LaLiga tiene 20 equipos.":"❌ No. La respuesta correcta es 20.";}));
  }

  function setupReview() {
    const text=$("review-text"), status=$("review-status"), btn=$("save-review");
    if (!text||!btn)return;
    text.value=localStorage.getItem("liga1900-review")||"";
    btn.addEventListener("click",()=>{localStorage.setItem("liga1900-review",text.value.trim());status.textContent="Reseña guardada en este dispositivo.";});
  }

  function nextClock() {
    const all=(live.events||[]).filter(e=>e.kickoff&&new Date(e.kickoff).getTime()>Date.now()).sort((a,b)=>new Date(a.kickoff)-new Date(b.kickoff));
    const e=all[0], match=$("clock-match"), time=$("clock-time");
    if(!match||!time)return;
    if(!e){match.textContent="Consulta el calendario";time.textContent="Horarios en actualización";return;}
    match.textContent=`${teamName(e.home)} – ${teamName(e.away)}`;
    const tick=()=>{const ms=new Date(e.kickoff).getTime()-Date.now();if(ms<=0){time.textContent="En juego / comenzando";return;}const d=Math.floor(ms/864e5),h=Math.floor(ms/36e5)%24,m=Math.floor(ms/6e4)%60,s=Math.floor(ms/1000)%60;time.textContent=`${d}d ${String(h).padStart(2,"0")}h ${String(m).padStart(2,"0")}m ${String(s).padStart(2,"0")}s`;};
    tick(); setInterval(tick,1000);
  }

  function markFreshness() {
    const el=document.querySelector("#clasificacion .source-row span");
    if(!el)return;
    if(live.updated){el.textContent=`Actualización automática: ${fmtDate(live.updated,{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"})}`;}
  }

  async function loadLive() {
    try {
      const r=await fetch(`live-data.json?v=${Date.now()}`,{cache:"no-store"});
      if(r.ok) live=await r.json();
    } catch (_) {}
    if(Array.isArray(live.standings)&&live.standings.length>=18) standings=live.standings;
    if(live.leaders&&Object.values(live.leaders).some(x=>Array.isArray(x)&&x.length)) leaders={...leaders,...live.leaders};
  }

  async function init() {
    await loadLive();
    activeRound=roundFromDate();
    const select=$("round-select");
    if(select){select.innerHTML=Array.from({length:38},(_,i)=>`<option value="${i+1}">Jornada ${i+1}</option>`).join("");select.addEventListener("change",()=>renderRound(select.value));}
    $("prev-round")?.addEventListener("click",()=>renderRound(activeRound-1));
    $("next-round")?.addEventListener("click",()=>renderRound(activeRound+1));
    $("team-search")?.addEventListener("input",renderTeams);
    $("team-sort")?.addEventListener("change",renderTeams);
    $("club-back")?.addEventListener("click",closeClub);
    renderStandings(); renderRound(activeRound); renderTeams(); renderLeaders(); renderStadiums(); setupCompare(); setupQuiz(); setupReview(); nextClock(); markFreshness();
  }
  document.readyState==="loading"?document.addEventListener("DOMContentLoaded",init):init();
})();