---
description: Sign out — revoke the current Outbox session token
---

Revoke the user's current session and remove the token from their shell
profile.

### Step 1 — revoke server-side

Call the logout endpoint with the current token. Read the token from
`~/.outbox/credentials.json` first (primary), then fall back to
`$OUTBOX_TOKEN` env var if the file isn't there.

```
POST https://api.theaiagentshub.com/auth/plugin/logout/
Authorization: Bearer <token>
```

This is idempotent — a 204 response is success regardless of whether the
token was active. Don't worry if it's already revoked.

### Step 2 — remove from credentials file

```bash
rm -f ~/.outbox/credentials.json
```

### Step 3 — remove from shell profile

1. Detect the user's shell rc file (zsh/bash/fish — same logic as
   `/outbox-sign-in`).
2. Use `Edit` to remove the `export OUTBOX_TOKEN="…"` line (and any
   accompanying comment line if present).
3. Confirm:

   > Signed out. The session has been revoked on Outbox and removed from
   > `~/.outbox/credentials.json` + `<rc-file>`. Run `/outbox-sign-in`
   > again any time to sign back in.

### Step 4 — note about active session

The MCP server's JWT cache may briefly hold a valid access token (~30s
remaining at most) for the just-revoked session. Subsequent tool calls
will fail with 401 within that window. Run `/reload-plugins` to drop the
MCP connection and force a re-handshake with no credentials.

### Guardrails

- Don't print the old token anywhere.
- Don't try to delete other env vars that look related (e.g. legacy
  `OUTBOX_API_KEY`) unless the user asks.
