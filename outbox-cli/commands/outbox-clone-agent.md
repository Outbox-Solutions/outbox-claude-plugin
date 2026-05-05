---
description: Pull an existing agent's config into local files for editing
argument-hint: <agent-id>
---

Clone the agent identified by `$ARGUMENTS` into the local project so the user
can edit it as files.

### Pre-flight

1. Call `mcp__outbox__show_client`. If `effective_company_id` is empty, abort.
2. If `$ARGUMENTS` is empty, ask the user for the agent id (or call
   `mcp__outbox__list_records resource="agents"` and let them pick).

### Pull

1. Call `mcp__outbox__get_record` with `resource="agents"` and
   `record_id="$ARGUMENTS"`.
2. Call `mcp__outbox__run_operation` with `operation="agent_tools.list"`
   and `path_params={agent_id: "$ARGUMENTS"}` to fetch the agent's tool list.
3. Call `mcp__outbox__run_operation` with `operation="agent_files.list"`
   for the file list (filenames only — don't fetch contents unless asked).

### Write to disk

Create `agents/<agent-name-slug>/` with:

- `agent.json` — the full agent record (pretty-printed)
- `system_prompt.md` — extracted system prompt as a separate editable file
- `tools.json` — tool list. Preserve each row's `type`, and for built-ins
  preserve the `builtin_key` and `config` fields verbatim — `/outbox-push-agent`
  uses those to reattach.
- `files.json` — file metadata
- `README.md` — short note explaining how to push edits back via
  `/outbox-push-agent` or `mcp__outbox__update_record`

Confirm with the user before overwriting existing files.

### After

Tell the user:

> Cloned to `agents/<slug>/`. Edit `system_prompt.md` and ask me to push
> changes back when ready.
