---
description: Recent chats — filterable by agent, period
argument-hint: [agent=<id>] [period=daily|weekly|monthly] [limit=N]
---

Same shape as `/outbox-calls` but for chat threads.

### Pre-flight

`mcp__outbox__show_client` — abort if no active client.

### Pull

```
mcp__outbox__jarvis_query tool_name="query_threads"
args={"type": "chat", "period": <period>, "agent_id": <id?>,
      "limit": <limit>}
```

### Render

| When | Agent | Contact | Status | Score | Summary |

Truncate summaries to ~60 chars.

End with:

> `/outbox-chat <id>` for the full conversation.
