---
description: View a single agent — config, system prompt, tools
argument-hint: <agent-id>
---

Show full details on the agent identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__outbox__show_client` — abort if no active client.
2. If `$ARGUMENTS` is empty, call `mcp__outbox__jarvis_query
   tool_name="list_agents" args={}` and ask the user to pick one.

### Pull

In parallel:

- `mcp__outbox__get_record resource="agents" record_id="$ARGUMENTS"` — full
  agent record
- `mcp__outbox__jarvis_query tool_name="search_tools"
  args={"agent_id": "$ARGUMENTS"}` — attached tools

### Render

```
# <Agent name>  ·  <type>  ·  <status>

**Created:** <date>
**Voice / model:** <relevant fields>
**Tools attached:** <count> — <comma list of names>

## System prompt
<show the prompt verbatim, in a code block>

## Recent activity
<call `jarvis_query tool_name="aggregate_threads"
args={"agent_id": "$ARGUMENTS", "period": "weekly"}` and show counts>
```

End with:

> `/outbox-edit-agent <id>` to change the prompt, `/outbox-attach-tool <id>` to add
> tools, `/outbox-calls agent=<id>` for transcripts.
