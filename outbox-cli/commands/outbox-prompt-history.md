---
description: See an agent's prompt history and roll back to an earlier version
argument-hint: <agent-id-or-name>
---

Show the saved prompt versions for an agent in the **active client**, and
restore one if the user wants.

### Step 1 — find the agent

If `$ARGUMENTS` isn't an id, find it with
`mcp__outbox__jarvis_query tool_name="list_agents" args={}` and match by
name. Ask if more than one matches.

### Step 2 — list versions

```
mcp__outbox__run_operation operation="agent_prompt_history.list"
  path_params={"agent_id": "<id>"} query={"page_size": 10}
```

Render newest first: when, who changed it (if present), and a one-line
summary of what changed versus the version before it. Keep it to 10 rows
and offer more.

### Step 3 — compare or restore

- To see one version in full:
  `operation="agent_prompt_history.get" path_params={"agent_id": "<id>", "log_id": "<log id>"}`.
  When comparing, show only the lines that differ.
- To restore, confirm first:
  > Restore **<agent>** to the version from <when>? The current prompt
  > stays in the history, so you can switch back.

  On yes:
  `operation="agent_prompt_history.revert" path_params={"agent_id": "<id>", "log_id": "<log id>"}`.

Confirm in one line and suggest a test: *"test chat it with: <a question
the change affects>"* (`agents.test_chat`).
