---
description: Switch the active client for this session
argument-hint: <client-name-or-id>
---

The user wants to switch the active client to: **$ARGUMENTS**

Steps:

1. Call `mcp__outbox__use_client` with `identifier="$ARGUMENTS"`.
2. If it returns `ok: false` because the name is ambiguous, list the matching
   clients and ask the user which one they meant.
3. If it returns `ok: false` because no match was found, call
   `mcp__outbox__list_accessible_companies` and show the user a short list of
   plausible matches (case-insensitive substring of `$ARGUMENTS`), and ask
   them to pick one.
4. On success, confirm the switch with one short line including the
   client's name and id, e.g.:

   > Active client → **Acme Corp** (`abc-123…`). All subsequent actions will
   > target this client until you switch again.

Do not perform any other actions — this command only switches context.
