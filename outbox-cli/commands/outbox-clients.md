---
description: List all accessible client companies
---

Call `mcp__outbox__list_accessible_companies`. Then:

- If the call fails because there is no agency context (single-company API
  key), say so clearly and tell the user the API key they're using gives
  access to a single company only — no client switching is needed.
- Otherwise, render a compact table of clients with: **name**, **id**
  (truncated to first 8 chars), and any obvious status field on the record.
- After the table, also call `mcp__outbox__show_client` and indicate which
  row is the currently active one with a `→` marker.
- End with a one-line tip: `Use /outbox-use-client <name> to switch.`

Keep the output tight — no preamble, no recap.
