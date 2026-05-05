---
description: Push local agent edits back to Outbox
argument-hint: [agent-slug-or-path]
---

Push edits from a previously cloned agent back to Outbox.

### Find the agent

1. If `$ARGUMENTS` is provided, look for `agents/$ARGUMENTS/outbox-agent.json`.
   Otherwise list directories under `agents/` and ask which one to push.
2. Read `agent.json`, `system_prompt.md`, and any other tracked files.
3. The agent's `id` lives in `agent.json` — verify it's still set.

### Pre-flight

1. Call `mcp__outbox__show_client`. If `effective_company_id` is empty or
   doesn't match the company id stored in `agent.json` (if present), warn
   the user loudly and ask them to confirm before continuing.
2. Call `mcp__outbox__get_record` with `resource="agents"` and the id, and
   **diff** the server's current state against the local files. Show the
   diff before pushing.

### Push

3. Ask the user to confirm the diff.
4. Call `mcp__outbox__update_record` with `resource="agents"`, the id, and
   the merged payload (local system prompt overrides server, plus any other
   tracked field changes).
5. If `tools.json` changed, reconcile tools separately from the agent
   record — `update_record` on `agents` doesn't touch the tool list.
   For each added or modified tool, call `agent_tools.create` (it
   upserts when an `id` is supplied). For built-ins, the body is
   `{"agent_id": "<id>", "type": "builtin", "builtin_key": "<key>",
   "is_async": true, "config": {...}}` — don't send `name`,
   `description`, or `schema`; the backend fills those from the
   catalog. For deletions, call `agent_tools.delete`.
6. On success, summarize what changed in one line (record fields +
   tool diffs).

If the server-side state has drifted significantly since the clone, surface
that and offer to re-clone instead of overwriting.
