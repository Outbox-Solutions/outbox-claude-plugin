---
description: Attach a tool from the platform tool library to an agent
argument-hint: <agent-id>
---

Attach one or more tools from the platform's tool library to the agent
identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__outbox__show_client` — abort if no active client.
2. If `$ARGUMENTS` is empty, list agents first:
   `mcp__outbox__jarvis_query tool_name="list_agents" args={}`.

### Browse the tool library

Pull the full library + the agent's currently attached tools, in parallel:

- `mcp__outbox__jarvis_query tool_name="search_tools" args={}`
- `mcp__outbox__run_operation operation="agent_tools.list"
  path_params={"agent_id": "$ARGUMENTS"}`

Render the library as a compact list grouped by category. Mark already-
attached tools with `[attached]` so the user doesn't re-add.

Ask the user which tool(s) to attach.

### Attach

For each chosen tool, call:

```
mcp__outbox__run_operation operation="agent_tools.create"
body={"agent_id": "$ARGUMENTS", "tool_id": "<chosen-tool-id>", ...any required config}
```

Some tools require config (API keys, default values). If the tool
contract demands fields you don't have, **ask** rather than guessing.
Don't fabricate API keys.

### Confirm

Briefly summarize: `Attached <N> tool(s) to <agent name>: <list>`.

End with:

> Test it with `mcp__outbox__send_ai_call agent_id=<id>` to make sure the
> agent picks up the new capability.
