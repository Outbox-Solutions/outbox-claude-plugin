---
description: View recent tool executions — debug tool failures
argument-hint: [agent=<id>] [tool=<name>] [period=daily|weekly|monthly]
---

Show recent tool runs from agents in the active client. Useful for
diagnosing why a specific tool keeps failing or which tools are getting
called most.

### Pre-flight

`mcp__outbox__show_client` — abort if no active client.

### Parse flags

From `$ARGUMENTS`:
- `agent=<id>` — scope to one agent
- `tool=<name>` — scope to one tool name
- `period=daily|weekly|monthly` — defaults to `weekly`
- `errors_only=true` — only show failed runs

### Pull

```
mcp__outbox__jarvis_query tool_name="query_tool_calls"
args={"agent_id": <id?>, "tool_name": <tool?>, "period": <period>,
      "limit": 50}
```

### Render

```
**Tool runs — <period>**  ·  <count> rows

| When | Agent | Tool | Args (trunc) | Result | Duration |
| ...  | ...   | ...  | ...          | ok/err | 230ms    |
```

Sort: errors first, then by recency.

For error rows, render the error message on a sub-line so it's readable
without expanding.

End with (if errors present):

> Want me to /optimize-agent <agent-id> to look at the calls these tool
> failures came from?

If no rows: `No tool runs in <period>.` and suggest a wider period.
