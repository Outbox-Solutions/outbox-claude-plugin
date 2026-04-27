---
description: List agents in the active client
---

Pre-flight: call `mcp__outbox__show_client`. If no active client, abort and
ask the user to run `/outbox-use-client <name>`.

Pull agents:

```
mcp__outbox__jarvis_query tool_name="list_agents" args={}
```

Render a compact table:

| Name | ID (8 chars) | Type | Status |

Top 25 by recency. After the table, end with one short tip:

> `/outbox-agent <id>` for details, or `/outbox-create-agent` for a new one.

No preamble.
