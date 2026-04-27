---
description: Recent calls — filterable by agent, status, date
argument-hint: [agent=<id>] [period=daily|weekly|monthly] [limit=N]
---

Pull recent voice calls in the active client. Parse simple key=value flags
out of `$ARGUMENTS`:

- `agent=<id>` — filter to one agent
- `period=daily|weekly|monthly` — defaults to `weekly`
- `limit=N` — defaults to 25, max 100
- `status=completed|error|...` — filter by status

### Pre-flight

`mcp__plugin_outbox-cli_outbox__show_client` — abort if no active client.

### Pull (one tool call)

```
mcp__plugin_outbox-cli_outbox__jarvis_query
  tool_name="query_threads"
  args={"type": "voice", "period": <period>, "agent_id": <id?>,
        "status": <status?>, "limit": <limit>}
```

(`query_threads` returns both calls and chats; `type=voice` narrows it.)
The result includes `summary` per row — render the first ~60 chars in
the table column.

**Don't** call `describe_operation` or `jarvis_list_tools` first — the
shape above is stable.

### Render

```
**Calls — <period>**  ·  <count> rows

| When | Agent | Contact | Direction | Status | Duration | Score | Summary |
| ...  | ...   | ...     | inbound   | ok     | 1m 23s   | 7     | <first 60 chars> |
```

Truncate summaries to ~60 chars in the table; full summaries are in the
returned data if the user asks.

End with:

> `/outbox-call <id>` for transcript + tool calls, or
> `/optimize-agent <agent-id>` to fix patterns you see here.

If no rows: don't render an empty table — just `No calls in <period>.` and
suggest broadening the filter.
