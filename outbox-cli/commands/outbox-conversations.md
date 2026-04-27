---
description: Search contact conversations — by name, phrase, or sentiment
argument-hint: [search-text]
---

Search through contact conversations in the active client. Useful for
finding specific clients, gauging sentiment, or pulling all messages that
mention a topic.

### Pre-flight

`mcp__outbox__show_client` — abort if no active client.

### Pull

If the user passed a phrase in `$ARGUMENTS`:

```
mcp__outbox__jarvis_query tool_name="query_messages"
args={"query": "$ARGUMENTS", "limit": 25, "include_summaries": true}
```

If `$ARGUMENTS` is empty, default to recent unread:

```
mcp__outbox__search_conversations search="" unread_only=true page=1
```

### Render

For search results:

```
**Found <N> matches for "<query>"**

| When | Contact | Agent | Snippet (with match highlighted) |
```

Highlight the matched substring in the snippet (use **bold**) so the user
can scan quickly. ~120-char snippet, with the match centered.

If query also returned thread summaries (the Jarvis tool merges both),
group them under a `## Summaries` heading after the message rows.

End with:

> `/outbox-chat <thread-id>` or `/outbox-call <thread-id>` for the full conversation.

### Don't

- Don't fabricate sentiment scores. If the user asks "how do they feel
  about us?" surface the actual quotes and let the user judge — only
  comment on tone if there's clear evidence in the snippets.
