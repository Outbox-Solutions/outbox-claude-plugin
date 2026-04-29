---
description: Recent calls — filterable by agent, status, direction, score, date
argument-hint: [agent=<id>] [status=<s>] [direction=web|inbound|outbound] [min_score=N] [max_score=N] [start=YYYY-MM-DD] [end=YYYY-MM-DD] [period=daily|weekly|monthly] [limit=N] [page=N]
---

Pull recent voice calls in the active client. **Always filter** — calls
can run into the thousands and unfiltered pulls waste tokens and money.

### Filter flags (parse from `$ARGUMENTS`)

| Flag | Maps to | Notes |
|---|---|---|
| `agent=<id>` | `agent_id` | Single-agent filter |
| `status=<s>` | `status` | One of: `active`, `success`, `unqualified`, `customer-ended`, `agent-ended`, `forwarded`, `callback-booked`, `no-answer`, `error` |
| `direction=<d>` | `direction` | `web`, `inbound`, or `outbound` |
| `min_score=N` | `min_score` | 0–100 quality score |
| `max_score=N` | `max_score` | 0–100 quality score |
| `start=YYYY-MM-DD` | `start_date` | Inclusive lower bound |
| `end=YYYY-MM-DD` | `end_date` | Inclusive upper bound |
| `period=<p>` | `period` | `daily`, `weekly` (default), `monthly`. Ignored if `start`/`end` given. |
| `limit=N` | `limit` | Default **25**, hard cap **100**. Never raise without a user ask. |
| `page=N` | `page` | 1-indexed pagination; combine with stable `limit` |

### Pre-flight

`mcp__plugin_outbox-cli_outbox__show_client` — abort if no active client.

### Filter discipline (read this before calling)

**Default is restrictive, not exhaustive.** If the user just says "show
me calls", use `period=weekly limit=25` and stop — do not pull more
"to be safe". Pulling 500 rows costs the user real tokens.

Add filters based on the user's words:

- "today" / "yesterday" → `period=daily` (or explicit `start_date`/`end_date`)
- "this week" / no time given → `period=weekly`
- "this month" → `period=monthly`
- "from <agent>" / agent name mentioned → resolve to `agent_id` first
  (call `list_agents` if not already known), then filter
- "failed" / "broken" → `status=error`
- "no answer" / "didn't pick up" → `status=no-answer`
- "successful" / "won" / "converted" → `status=success`
- "unqualified" / "not a fit" → `status=unqualified`
- "forwarded" / "transferred" → `status=forwarded`
- "callback booked" → `status=callback-booked`
- "live" / "in progress" → `status=active`
- "agent hung up" → `status=agent-ended` ; "customer hung up" → `status=customer-ended`
- "bad calls" / "low quality" → `max_score=40`
- "best calls" / "good ones" → `min_score=70`
- "inbound" / "people called us" → `direction=inbound`
- "outbound" / "we called" → `direction=outbound`
- "web call" / "from the website widget" → `direction=web`

If the user's request is broad ("show me calls this month") and the
first page comes back at the limit (25 of 25 returned), **don't auto-
paginate**. Tell them how many came back and offer `page=2` or a
narrower filter.

### Pull (one tool call)

```
mcp__plugin_outbox-cli_outbox__jarvis_query
  tool_name="query_calls"
  args={
    "agent_id":   <id?>,
    "status":     <status?>,
    "direction":  <direction?>,           # web | inbound | outbound
    "min_score":  <0-100?>,
    "max_score":  <0-100?>,
    "start_date": "YYYY-MM-DD"?,          # omit if using period
    "end_date":   "YYYY-MM-DD"?,
    "period":     <daily|weekly|monthly>, # default weekly, omit if dates given
    "limit":      <1-100>,                # default 25
    "page":       <1+?>
  }
```

Only include keys the user actually asked for — don't pad the args object
with nulls. `query_calls` is the dedicated calls endpoint;
`query_threads` with `type=voice` works too but `query_calls` is clearer.

**Don't** call `describe_operation` or `jarvis_list_tools` first — the
shape above is stable.

### Render

```
**Calls — <filter summary>**  ·  <count> rows  (page <n> of ?)

| When | Agent | Contact | Direction | Status | Duration | Score | Summary |
| ...  | ...   | ...     | inbound   | ok     | 1m 23s   | 7     | <first 60 chars> |
```

Truncate summaries to ~60 chars in the table; full summaries are in the
returned data if the user asks. Echo the filter you applied above the
table so the user can see what was scoped (e.g.
`Calls — weekly · agent=Jacob · status=error · 12 rows`).

End with:

> `/outbox-call <id>` for transcript + tool calls, or
> `/optimize-agent <agent-id>` to fix patterns you see here.

If `count == limit`, also suggest:

> More results may exist — re-run with `page=2` or narrow the filter.

If no rows: don't render an empty table — just `No calls match <filter>.`
and suggest broadening (drop a filter, widen the date range).
