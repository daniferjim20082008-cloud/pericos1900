'use strict';
// The full squad is defined in app.js. Each calendar entry supplies a stable
// data-mvp-match ID, an ISO kickoff with timezone, and a data-match-name.
(() => {
  const select = document.getElementById('pericos-mvp');
  const form = document.getElementById('pericos-mvp-form');
  const status = document.getElementById('pericos-mvp-status');
  const label = document.getElementById('pericos-mvp-match');
  if (!select || !form || !status || !label) return;
  const squad = [...players].sort((a, b) => a.n - b.n);
  const button = form.querySelector('button');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Selecciona un jugador de la plantilla';
  select.replaceChildren(placeholder);
  for (const player of squad) {
    const option = document.createElement('option');
    option.value = String(player.n);
    option.textContent = player.n + ' · ' + player.full;
    select.append(option);
  }
  let active = null;
  let initialized = false;
  const key = match => 'pericos1900_mvp_v2:' + match.id;
  const dateLabel = match => new Date(match.kickoff).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid'
  });
  function currentMatch() {
    const now = Date.now();
    return [...document.querySelectorAll('[data-mvp-match]')]
      .map(el => ({id: el.dataset.mvpMatch, name: el.dataset.matchName,
        kickoff: Date.parse(el.dataset.kickoff)}))
      .filter(match => match.id && match.name && Number.isFinite(match.kickoff) && match.kickoff <= now)
      .sort((a, b) => b.kickoff - a.kickoff)[0] || null;
  }
  function refresh() {
    const match = currentMatch();
    select.disabled = button.disabled = !match;
    if (initialized && match?.id === active?.id) return;
    initialized = true;
    active = match;
    select.value = '';
    if (!match) {
      label.textContent = 'No hay un partido disponible para votar.';
      status.textContent = 'La votación se abre al comenzar un partido del calendario publicado.';
      return;
    }
    label.textContent = match.name + ' · ' + dateLabel(match);
    status.textContent = 'Elige tu MVP de este encuentro. El voto se guarda solo en este dispositivo.';
    try {
      const saved = JSON.parse(localStorage.getItem(key(match)) || 'null');
      const player = squad.find(p => String(p.n) === saved?.player);
      if (player) {
        select.value = String(player.n);
        status.textContent = 'Tu MVP: ' + player.full + ' · ' + match.name + ' (guardado en este dispositivo). Puedes cambiar tu voto.';
      }
    } catch {
      status.textContent = 'Puedes votar, pero no se ha podido recuperar el voto guardado.';
    }
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    const previousId = active?.id;
    refresh();
    if (!active) return;
    if (previousId !== active.id) {
      status.textContent = 'Ha comenzado otro partido. Elige tu MVP para este encuentro.';
      return;
    }
    const player = squad.find(p => String(p.n) === select.value);
    if (!player) return;
    const message = 'Tu MVP: ' + player.full + ' · ' + active.name;
    try {
      localStorage.setItem(key(active), JSON.stringify({player: String(player.n), name: player.full}));
      status.textContent = message + ' (guardado en este dispositivo). Puedes cambiar tu voto.';
    } catch {
      status.textContent = message + ' (no se pudo guardar permanentemente).';
    }
  });
  // Check on return to the tab and while open, without carrying votes forward.
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('focus', refresh);
  refresh();
  setInterval(refresh, 1000);
})();
