"""Corrector de participaciones autenticadas por GitHub. No ejecuta texto de issues."""
import base64
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen

QUESTIONS = json.loads((Path(__file__).resolve().parents[1] / 'questions.json').read_text())

def grade(body):
    matches = re.findall(r'```pericos-quiz-v1\s*\n(.*?)\n```', body or '', re.S)
    if len(matches) != 1:
        return None
    try:
        data = json.loads(matches[0])
        answers = data['answers']
        if data.get('version') != 1 or not isinstance(answers, list) or len(answers) != len(QUESTIONS):
            return None
        if any(type(a) is not int or a not in range(len(q['options'])) for a, q in zip(answers, QUESTIONS)):
            return None
        return sum(a == q['answer'] for a, q in zip(answers, QUESTIONS)) * 10
    except (ValueError, KeyError, TypeError):
        return None

def aggregate(issues):
    players = {}
    for issue in issues:
        if 'pull_request' in issue or not issue.get('title', '').startswith('[Quiz Pericos 1900]') or issue.get('user', {}).get('type') != 'User':
            continue
        score = grade(issue.get('body'))
        if score is None:
            continue
        # The identity is supplied by GitHub, never by a participant's submitted JSON.
        user = issue['user']; key = str(user['id'])
        row = players.setdefault(key, {'login': user['login'], 'score': -1, 'attempts': 0, 'achieved': issue['created_at']})
        row['attempts'] += 1
        row['login'] = user['login']
        if score > row['score'] or (score == row['score'] and issue['created_at'] < row['achieved']):
            row.update(score=score, achieved=issue['created_at'])
    return sorted(players.values(), key=lambda p: (-p['score'], p['achieved'], p['login'].lower()))

def main():
    repo = os.environ['GITHUB_REPOSITORY']
    token = os.environ['GITHUB_TOKEN']
    def api(path, data=None):
        request = Request(f'https://api.github.com/repos/{repo}/{path}', data=json.dumps(data).encode() if data is not None else None,
                          headers={'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json', 'User-Agent': 'pericos-quiz', 'Content-Type': 'application/json'},
                          method='PUT' if data is not None else 'GET')
        with urlopen(request, timeout=45) as response:
            return json.load(response)
    issues = []; page = 1
    while True:
        batch = api(f'issues?state=all&per_page=100&page={page}')
        issues.extend(batch)
        if len(batch) < 100:
            break
        page += 1
    players = aggregate(issues)
    current = api('contents/ranking.json?ref=main')
    old = json.loads(base64.b64decode(current['content']))
    if old['players'] == players:
        return
    content = json.dumps({'updated': datetime.now(timezone.utc).isoformat(), 'players': players}, ensure_ascii=False, indent=2) + '\n'
    api('contents/ranking.json', {'message': 'Actualizar ranking de participaciones verificadas', 'sha': current['sha'], 'branch': 'main', 'content': base64.b64encode(content.encode()).decode()})

if __name__ == '__main__':
    main()
