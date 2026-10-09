#!/usr/bin/env python3
"""
Actualiza automáticamente Liga 1900 para GitHub Pages.

Fuente de datos deportivos: endpoints públicos de SofaScore.
- Descubre la temporada 2026/27 de LaLiga (unique tournament 8).
- Actualiza clasificación, líderes y calendario/resultados de las 38 jornadas.
- Crea/recupera foros de GitHub Issues para partidos cercanos.
- Si una fuente falla, conserva el último dato válido publicado.

Este script usa únicamente la librería estándar de Python.
"""
from __future__ import annotations

import json
import os
import re
import time
import unicodedata
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "laliga" / "live-data.json"
REPO = os.getenv("GITHUB_REPOSITORY", "daniferjim20082008-cloud/pericos1900")
TOKEN = os.getenv("GITHUB_TOKEN", "")
TOURNAMENT_ID = 8
SEASON_HINTS = ("26/27", "2026/27", "2026-27", "2026")
SOFA_BASES = (
    "https://www.sofascore.com/api/v1",
    "https://api.sofascore.com/api/v1",
)

TEAM_ALIASES = {
    "ALA": ["deportivo alaves", "alaves"],
    "ATH": ["athletic club", "athletic bilbao"],
    "ATM": ["atletico madrid", "atletico de madrid"],
    "BAR": ["barcelona", "fc barcelona"],
    "BET": ["real betis", "real betis balompie", "betis"],
    "CEL": ["celta vigo", "rc celta", "celta"],
    "DEP": ["deportivo la coruna", "deportivo de la coruna", "rc deportivo", "deportivo"],
    "ELC": ["elche", "elche cf"],
    "ESP": ["espanyol", "rcd espanyol"],
    "GET": ["getafe", "getafe cf"],
    "LEV": ["levante", "levante ud"],
    "MGA": ["malaga", "malaga cf"],
    "OSA": ["osasuna", "ca osasuna"],
    "RAC": ["racing santander", "racing de santander", "real racing club"],
    "RAY": ["rayo vallecano", "rayo"],
    "RMA": ["real madrid", "real madrid cf"],
    "RSO": ["real sociedad"],
    "SEV": ["sevilla", "sevilla fc"],
    "VAL": ["valencia", "valencia cf"],
    "VIL": ["villarreal", "villarreal cf"],
}

DISPLAY = {
    "ALA": "Deportivo Alavés", "ATH": "Athletic Club", "ATM": "Atlético de Madrid",
    "BAR": "FC Barcelona", "BET": "Real Betis", "CEL": "Celta", "DEP": "RC Deportivo",
    "ELC": "Elche", "ESP": "RCD Espanyol", "GET": "Getafe", "LEV": "Levante",
    "MGA": "Málaga", "OSA": "Osasuna", "RAC": "Racing Santander", "RAY": "Rayo Vallecano",
    "RMA": "Real Madrid", "RSO": "Real Sociedad", "SEV": "Sevilla", "VAL": "Valencia",
    "VIL": "Villarreal",
}

def norm(text: str) -> str:
    text = unicodedata.normalize("NFKD", text or "")
    text = "".join(c for c in text if not unicodedata.combining(c))
    text = re.sub(r"[^a-z0-9]+", " ", text.lower()).strip()
    return text

ALIAS_TO_CODE = {norm(alias): code for code, aliases in TEAM_ALIASES.items() for alias in aliases}

def team_code(team: dict | str | None) -> str | None:
    if isinstance(team, dict):
        candidates = [team.get("name"), team.get("shortName"), team.get("slug"), team.get("nameCode")]
    else:
        candidates = [team]
    for candidate in candidates:
        n = norm(str(candidate or ""))
        if n in ALIAS_TO_CODE:
            return ALIAS_TO_CODE[n]
        for alias, code in ALIAS_TO_CODE.items():
            if alias and (alias in n or n in alias) and len(n) >= 4:
                return code
    return None

def http_json(url: str, *, method: str = "GET", payload=None, headers=None, timeout=25):
    body = None
    req_headers = {
        "User-Agent": "Mozilla/5.0 (compatible; Liga1900Bot/1.0; +https://github.com/%s)" % REPO,
        "Accept": "application/json",
    }
    if headers:
        req_headers.update(headers)
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        req_headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=req_headers, method=method)
    with urllib.request.urlopen(req, timeout=timeout) as response:
        return json.loads(response.read().decode("utf-8"))

def sofa(path: str):
    last = None
    for base in SOFA_BASES:
        url = base + path
        for attempt in range(3):
            try:
                return http_json(url)
            except Exception as exc:
                last = exc
                time.sleep(1.2 * (attempt + 1))
    raise RuntimeError(f"No se pudo consultar SofaScore: {path}: {last}")

def load_previous():
    if OUT.exists():
        try:
            return json.loads(OUT.read_text("utf-8"))
        except Exception:
            pass
    return {"standings": [], "leaders": {}, "events": [], "forums": {}, "warnings": []}

def discover_season():
    data = sofa(f"/unique-tournament/{TOURNAMENT_ID}/seasons")
    seasons = data.get("seasons", [])
    for hint in SEASON_HINTS:
        for season in seasons:
            haystack = f"{season.get('name','')} {season.get('year','')}"
            if hint.lower() in haystack.lower():
                return season
    if seasons:
        return seasons[0]
    raise RuntimeError("No se encontró ninguna temporada de LaLiga.")

def get_standings(season_id: int):
    data = sofa(f"/unique-tournament/{TOURNAMENT_ID}/season/{season_id}/standings/total")
    groups = data.get("standings", [])
    rows = []
    for group in groups:
        for r in group.get("rows", []):
            code = team_code(r.get("team"))
            if not code:
                continue
            rows.append([
                code,
                int(r.get("points") or 0),
                int(r.get("matches") or 0),
                int(r.get("wins") or 0),
                int(r.get("draws") or 0),
                int(r.get("losses") or 0),
                int(r.get("scoresFor") or 0),
                int(r.get("scoresAgainst") or 0),
            ])
    dedup = {row[0]: row for row in rows}
    result = list(dedup.values())
    result.sort(key=lambda r: (-r[1], -(r[6]-r[7]), -r[6], r[0]))
    return result

def _leader_rows(items, stat_names):
    out = []
    for item in items or []:
        player = item.get("player", {})
        stats = item.get("statistics", {})
        code = team_code(item.get("team"))
        if not code:
            continue
        value = None
        for stat in stat_names:
            if stats.get(stat) is not None:
                value = stats.get(stat)
                break
        if value is None:
            continue
        try:
            value = int(value)
        except Exception:
            continue
        out.append({"n": player.get("shortName") or player.get("name") or "Jugador", "t": code, "v": value})
    seen = set()
    clean = []
    for row in sorted(out, key=lambda x: (-x["v"], x["n"])):
        key = (row["n"], row["t"])
        if key not in seen:
            seen.add(key)
            clean.append(row)
    return clean[:10]

def get_leaders(season_id: int):
    data = sofa(f"/unique-tournament/{TOURNAMENT_ID}/season/{season_id}/top-players/overall")
    tp = data.get("topPlayers", {})
    return {
        "goals": _leader_rows(tp.get("goals"), ("goals",)),
        "assists": _leader_rows(tp.get("assists"), ("goalAssist", "assists")),
        "yellow": _leader_rows(tp.get("yellowCards"), ("yellowCards",)),
        "red": _leader_rows(tp.get("redCards"), ("redCards",)),
    }

def get_events(season_id: int):
    events = []
    for round_no in range(1, 39):
        try:
            data = sofa(f"/unique-tournament/{TOURNAMENT_ID}/season/{season_id}/events/round/{round_no}")
        except Exception:
            continue
        for event in data.get("events", []):
            home = team_code(event.get("homeTeam"))
            away = team_code(event.get("awayTeam"))
            if not home or not away:
                continue
            ts = event.get("startTimestamp")
            kickoff = None
            if ts:
                kickoff = datetime.fromtimestamp(int(ts), timezone.utc).isoformat().replace("+00:00", "Z")
            hs = event.get("homeScore") or {}
            as_ = event.get("awayScore") or {}
            events.append({
                "id": event.get("id"),
                "round": round_no,
                "home": home,
                "away": away,
                "kickoff": kickoff,
                "status": (event.get("status") or {}).get("type") or "notstarted",
                "homeScore": hs.get("current"),
                "awayScore": as_.get("current"),
            })
    return events

def gh_headers():
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    return h

def github_json(url, *, method="GET", payload=None):
    return http_json(url, method=method, payload=payload, headers=gh_headers())

def find_or_create_forum(event):
    if not TOKEN:
        return None
    r = event["round"]
    home = DISPLAY[event["home"]]
    away = DISPLAY[event["away"]]
    hfrag = home.split()[0]
    afrag = away.split()[0]
    q = f'repo:{REPO} is:issue in:title "[FORO J{r}]" "{hfrag}" "{afrag}"'
    search_url = "https://api.github.com/search/issues?q=" + urllib.parse.quote(q)
    try:
        found = github_json(search_url).get("items", [])
        if found:
            return found[0].get("html_url")
    except Exception:
        pass

    kickoff = event.get("kickoff") or "horario por confirmar"
    title = f"[FORO J{r}] {home} vs {away}"
    body = (
        f"## Foro del partido · Jornada {r} · LALIGA EA SPORTS 2026/27\n\n"
        f"**{home} vs {away}** · {kickoff}.\n\n"
        "Comenta la previa, alineaciones, partido y postpartido con respeto.\n\n"
        "### Normas\n"
        "- Debate con respeto.\n"
        "- Nada de spam ni datos personales.\n"
        "- Las predicciones de Liga 1900 son estimaciones recreativas, no recomendaciones de apuestas.\n\n"
        f"[Abrir Liga 1900](https://daniferjim20082008-cloud.github.io/pericos1900/laliga/?round={r})\n"
    )
    try:
        created = github_json(
            f"https://api.github.com/repos/{REPO}/issues",
            method="POST",
            payload={"title": title, "body": body},
        )
        return created.get("html_url")
    except Exception:
        return None

def forum_key(event):
    return f'{event["round"]}:{event["home"]}:{event["away"]}'

def update_forums(events, previous_forums):
    forums = dict(previous_forums or {})
    now = datetime.now(timezone.utc)
    horizon = now + timedelta(days=14)
    for event in events:
        kickoff_s = event.get("kickoff")
        if not kickoff_s:
            continue
        try:
            kickoff = datetime.fromisoformat(kickoff_s.replace("Z", "+00:00"))
        except ValueError:
            continue
        if now - timedelta(days=2) <= kickoff <= horizon:
            key = forum_key(event)
            if not forums.get(key):
                url = find_or_create_forum(event)
                if url:
                    forums[key] = url
    return forums

def main():
    previous = load_previous()
    result = dict(previous)
    warnings = []
    season = None

    try:
        season = discover_season()
        result["season_id"] = season.get("id")
        result["season_name"] = season.get("name")
    except Exception as exc:
        warnings.append(f"Temporada: {exc}")

    if season:
        sid = int(season["id"])
        try:
            standings = get_standings(sid)
            if len(standings) >= 18:
                result["standings"] = standings
            else:
                warnings.append("Clasificación incompleta; se conserva la versión anterior.")
        except Exception as exc:
            warnings.append(f"Clasificación: {exc}")

        try:
            leaders = get_leaders(sid)
            if any(leaders.values()):
                merged = dict(result.get("leaders") or {})
                for k, v in leaders.items():
                    if v:
                        merged[k] = v
                result["leaders"] = merged
            else:
                warnings.append("Líderes vacíos; se conserva la versión anterior.")
        except Exception as exc:
            warnings.append(f"Líderes: {exc}")

        try:
            events = get_events(sid)
            if len(events) >= 300:
                result["events"] = events
            elif events:
                old = {forum_key(e): e for e in result.get("events", []) if e.get("round") and e.get("home") and e.get("away")}
                for e in events:
                    old[forum_key(e)] = e
                result["events"] = list(old.values())
                warnings.append(f"Calendario parcial ({len(events)} partidos); combinado con la caché anterior.")
            else:
                warnings.append("Calendario no disponible; se conserva la versión anterior.")
        except Exception as exc:
            warnings.append(f"Calendario: {exc}")

    try:
        result["forums"] = update_forums(result.get("events", []), result.get("forums", {}))
    except Exception as exc:
        warnings.append(f"Foros: {exc}")

    result["updated"] = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
    result["source"] = "SofaScore (datos deportivos) + GitHub Issues (foros)"
    result["warnings"] = warnings
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(result, ensure_ascii=False, indent=2, sort_keys=False) + "\n", "utf-8")
    print(f"Actualizado {OUT}: {len(result.get('events', []))} partidos; {len(result.get('standings', []))} equipos.")
    for warning in warnings:
        print("AVISO:", warning)

if __name__ == "__main__":
    main()
