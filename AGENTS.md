# AGENTS.md

Instructions for AI agents working in this repo.

## Commits (on `haz un commit` / `haz el commit`)

Every commit must follow this convention:

1. **Inspect first**: run `git status --short`, `git diff HEAD --stat`,
   and `git log --oneline -5` to see what changed and match repo style.
2. **Stage deliberately**: `git add -A` only when the whole change set
   belongs to the commit; otherwise stage specific paths. Never stage
   secrets (`.env`, `*.pem`, `*.key`, credentials). Confirm `.gitignore`
   covers them.
3. **Message in technical English**, detailed but with no filler, still
   easy to understand. Format:
   - Subject line (<= 72 chars), imperative mood, no trailing period:
     `Restructure to hexagonal backend and standalone frontend`
   - Blank line, then one paragraph per topic, each via its own
     `git commit -m` flag. Each paragraph: what changed + why/file
     location, no marketing language, no emojis.
   - Typical paragraphs: backend change, frontend change,
     build/deploy change, tests/verification, housekeeping
     (gitignore, lockfiles, cleanup).
4. **Verify before committing** when code changed: run the relevant
   checks (e.g. `pytest`, `py_compile`, `docker compose config`) and
   mention the result in the reply, not in the message.
5. **After committing**: report the short hash and the
   `+insertions/-deletions` stat. Do not push, amend, or force-push
   unless explicitly asked. If hooks reject the commit, fix the issue
   in a new commit.
