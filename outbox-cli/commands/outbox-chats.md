---
description: Recent chats — filterable by agent, status, score, date
argument-hint: [agent=<id>] [status=<s>] [min_score=N] [max_score=N] [start=YYYY-MM-DD] [end=YYYY-MM-DD] [period=daily|weekly|monthly] [limit=N] [page=N]
---

Pull recent chats in the active client. **Always filter** — chats can
run into the thousands and unfiltered pulls waste tokens and money.

### Filter flags (parse from `$ARGUMENTS`)

| Flag | Maps to | Notes |
|---|---|---|
| `agent=<id>` | `agent_id` | Single-agent filter |
| `status=<s>` | `status` | One of: `active`, `success`, `interrupted` |
| `min_score=N` | `min_score` | 0–100 quality score |
| `max_score=N` | `max_score` | 0–100 quality score |
| `start=YYYY-MM-DD` | `start_date` | Inclusive lower bound |
| `end=YYYY-MM-DD` | `end_date` | Inclusive upper bound |
| `period=<p>` | `period` | `daily`, `weekly` (default), `monthly`. Ignored if `start`/`end` given. |
| `limit=N` | `limit` | Default **25**, hard cap **100**. Never raise without a user ask. |
| `page=N` | `page` | 1-indexed pagination; combine with stable `limit` |

Note: chats have no `direction` filter — that field is voice-only.

### Pre-flight

`mcp__plugin_outbox-cli_outbox__show_client` — abort if no active client.

### Filter discipline (read this before calling)

**Default is restrictive, not exhaustive.** If the user just says "show
me chats", use `period=weekly limit=25` and stop — do not pull more
"to be safe". Pulling 500 rows costs the user real tokens.

Add filters based on the user's words:

- "today" / "yesterday" → `period=daily` (or explicit date range)
- "this week" / no time given → `period=weekly`
- "this month" → `period=monthly`
- "from <agent>" / agent name mentioned → resolve to `agent_id` first
- "successful" / "converted" → `status=success`
- "interrupted" / "dropped" → `status=interrupted`
- "live" / "in progress" → `status=active`
- "bad chats" / "low quality" → `max_score=40`
- "best chats" / "good ones" → `min_score=70`

If the user's request is broad and the first page comes back at the
limit, **don't auto-paginate**. Tell them how many came back and offer
`page=2` or a narrower filter.

### Pull (one tool call)

```
mcp__plugin_outbox-cli_outbox__jarvis_query
  tool_name="query_threads"
  args={
    "type":       "chat",                 # required — narrows to chats
    "agent_id":   <id?>,
    "status":     <active|success|interrupted?>,
    "min_score":  <0-100?>,
    "max_score":  <0-100?>,
    "start_date": "YYYY-MM-DD"?,          # omit if using period
    "end_date":   "YYYY-MM-DD"?,
    "period":     <daily|weekly|monthly>, # default weekly, omit if dates given
    "limit":      <1-100>,                # default 25
    "page":       <1+?>
  }
```

Only include keys the user actually asked for — don't pad with nulls.

**Don't** call `describe_operation` or `jarvis_list_tools` first — the
shape above is stable.

### Render

```
**Chats — <filter summary>**  ·  <count> rows  (page <n> of ?)

| When | Agent | Contact | Status | Score | Summary |
| ...  | ...   | ...     | success| 8     | <first 60 chars> |
```

Truncate summaries to ~60 chars. Echo the filter you applied above the
table (e.g. `Chats — weekly · agent=Jacob · status=interrupted · 7 rows`).

End with:

> `/outbox-chat <id>` for the full conversation.

If `count == limit`, also suggest:

> More results may exist — re-run with `page=2` or narrow the filter.

If no rows: `No chats match <filter>.` and suggest broadening.
