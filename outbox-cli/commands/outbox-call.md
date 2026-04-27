---
description: View a single call — full transcript, tool calls, summary
argument-hint: <thread-id>
---

Show full detail on the call (thread) identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__plugin_outbox-cli_outbox__show_client`.
2. If `$ARGUMENTS` is empty, list recent calls first via the
   `/outbox-cli:outbox-calls` logic and ask the user to pick.

### Pull (one tool call — `get_thread_context` already returns the
transcript + tool calls in a single shot, no need to call query_messages
or query_tool_calls separately)

```
mcp__plugin_outbox-cli_outbox__jarvis_query
  tool_name="get_thread_context"
  args={"thread_id": "$ARGUMENTS"}
```

**Important:** the arg name is **`thread_id`** — never `call_id`,
`record_id`, or `id`. The wrapper field is **`tool_name`** — never
`tool`.

### Render

```
# Call <id-prefix>  ·  <agent name>  ·  <date>

**Contact:** <name> (<phone if any>)
**Direction:** <inbound/outbound/web>
**Status:** <status>
**Duration:** <length>
**Score:** <score>

## Summary
<thread.summary from the response>

## Transcript
<role>: <message>
<role>: <message>
...

## Tool calls (N)
| Tool | Args (truncated) | Result | When |
| ...  | ...              | ok     | ...  |
```

If the transcript is long (>50 turns), show first 20 + last 10 with
`[... N turns omitted ...]` in the middle, and offer to show the full
thing.

End with:

> Want me to run /outbox-cli:optimize-agent on the agent that handled this call?
