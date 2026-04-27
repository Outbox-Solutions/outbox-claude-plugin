---
description: Edit an existing agent — system prompt, voice, or config
argument-hint: <agent-id>
---

Interactive edit of the agent identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__outbox__show_client` — abort if no active client.
2. If `$ARGUMENTS` is empty, run `mcp__outbox__jarvis_query
   tool_name="list_agents" args={}` and let the user pick.
3. Pull the current state:
   `mcp__outbox__get_record resource="agents" record_id="$ARGUMENTS"`.

### Ask what to change

Show the current values for the most-edited fields (name, type, voice,
system prompt) and ask:

> Which would you like to change? You can say "the prompt" or paste a new
> value directly.

### Apply

For prompt edits, default to **showing a diff** before applying — the
prompt is the highest-impact field on agent behavior.

When the user confirms, call:

```
mcp__outbox__update_record resource="agents" record_id="$ARGUMENTS"
data={...changed fields only...}
```

On success, briefly confirm what changed (one line) and offer:

> Want me to test it with a call (`mcp__outbox__send_ai_call`) or run
> `/optimize-agent` to pull recent transcripts?

### Don't

- Don't update the entire record blindly — only send the fields that
  changed. Reduces risk of accidentally clobbering server-side fields.
- Don't auto-revert if the user expresses doubt — just ask them.
