"""Ranking calculado desde cuentas verificadas por GitHub; conserva partidas v1."""
import base64
import json
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from zoneinfo import ZoneInfo

QUESTIONS = json.loads((Path(__file__).resolve().parents[1] / 'questions.json').read_text())
BY_ID = {q['id']: q for q in QUESTIONS}

def grade(body):
    matches = re.findall(r'```pericos-quiz-v([12])\s*\n(.*?)\n```', body or '', re.S)
    if len(matches) != 1:
        return None
    try:
        version, raw = matches[0]
        data = json.loads(raw)
        if type(data.get('version')) is not int or data['version'] != int(version):
            return None
        answers = data['answers']
        if int(version) == 1:
            selected = QUESTIONS[:10]
        else:
            ids = data['questionIds']
            if not isinstance(ids, list) or len(ids) != 10 or any(type(i) is not str for i in ids) or len(set(ids)) != 10:
                return None
            selected = [BY_ID[i] for i in ids]
        if not isinstance(answers, list) or len(answers) != 10:
            return None
        if any(type(a) is not int or a not in range(len(q['options'])) for a, q in zip(answers, selected)):
            return None
        return sum(a == q['answer'] for a, q in zip(answers, selected)) * 10
    except (ValueError, KeyError, TypeError, AttributeError):
        return None

def badge(score):
    return 'Leyenda perica' if score == 100 else 'Maestro perico' if score >= 80 else 'Aficionado perico' if score >= 50 else 'Canterano'

def week_key(timestamp):
    local = datetime.fromisoformat(timestamp.replace('Z', '+00:00')).astimezone(ZoneInfo('Europe/Madrid')).date()
    return (local - timedelta(days=local.weekday())).isoformat()

def aggregate(issues):
    players = {}
    for issue in issues:
        if 'pull_request' in issue or not issue.get('title', '').startswith('[Quiz Pericos 1900]') or issue.get('user', {}).get('type') != 'User':
            continue
        score = grade(issue.get('body'))
        if score is None:
            continue
        user = issue['user']; key = str(user['id'])
        row = players.setdefault(key, {'login': user['login'], 'score': -1, 'attempts': 0, 'achieved': issue['created_at']})
        row['attempts'] += 1
        row['login'] = user['login']
        if score > row['score'] or (score == row['score'] and issue['created_at'] < row['achieved']):
            row.update(score=score, achieved=issue['created_at'])
        row['badge'] = badge(row['score'])
    return sorted(players.values(), key=lambda p: (-p['score'], p['achieved'], p['login'].lower()))

def rankings(issues):
    weeks = {}
    for issue in issues:
        if grade(issue.get('body')) is not None:
            weeks.setdefault(week_key(issue['created_at']), []).append(issue)
    return {'players': aggregate(issues), 'weeks': {key: aggregate(batch) for key, batch in weeks.items()}}

def main():
    repo = os.environ['GITHUB_REPOSITORY']; token = os.environ['GITHUB_TOKEN']
    def api(path, data=None):
        request = Request(f'https://api.github.com/repos/{repo}/{path}', data=json.dumps(data).encode() if data is not None else None,
                          headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json', 'User-Agent': 'pericos-quiz', 'Content-Type': 'application/json'},
                          method='PUT' if data is not None else 'GET')
        with urlopen(request, timeout=45) as response:
            return json.load(response)
    issues = []; page = 1
    while True:
        batch = api(f'issues?state=all&per_page=100&page={page}'); issues.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    result = rankings(issues)
    current = api('contents/ranking.json?ref=main'); old = json.loads(base64.b64decode(current['content']))
    if old.get('players') == result['players'] and old.get('weeks') == result['weeks']:
        return
    content = json.dumps({'updated': datetime.now(timezone.utc).isoformat(), **result}, ensure_ascii=False, indent=2) + '\n'
    api('contents/ranking.json', {'message': 'Actualizar rankings e insignias de la comunidad', 'sha': current['sha'], 'branch': 'main', 'content': base64.b64encode(content.encode()).decode()})

if __name__ == '__main__':
    main()
