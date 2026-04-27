---
name: build-report
description: Generate a daily, weekly, or monthly Outbox performance report — calls, chats, conversions, agent performance, billing usage. Use when the user asks for a "report", "summary", "how did we do", "weekly recap", "month in review", or any variation of "tell me what happened" over a time window.
---

# Build Report

Produce a tight executive-style report for the active Outbox client over a
time window the user specified.

## Inputs

- **Period**: `daily`, `weekly`, `monthly`, or an explicit date range.
- **Focus**: optional — calls only, chats only, a specific agent, etc.

If the user didn't specify a period, default to the last 7 days and say so
explicitly in the report header.

## Workflow

1. **Confirm context.** `mcp__outbox__show_client` — abort with a prompt if
   no active client.

2. **Pull data in parallel.** Call these in one batch via
   `mcp__plugin_outbox-cli_outbox__run_operation`:
   - `analytics.get` with the date range
   - `analytics.pie` with the same range
   - `logs.call.list` (paginate with `page` until you have enough)
   - `logs.chat.list`
   - `company_billing.get` with the date range (for usage numbers)

   **If `analytics.get` returns 500 in this batch, do NOT retry it for the
   prior-period delta** — the endpoint is broken regardless of date range.
   Skip the delta and call it out in the header instead.

3. **Structure the report.** Use this exact shape:

   ```
   # <Client name> — <Period> Report
   _Generated for the period <start> → <end>._

   ## Headline numbers
   - Calls: <count> (<delta vs prior period>)
   - Chats: <count> (<delta>)
   - Conversions / bookings: <count>
   - Spend: <amount>

   ## What worked
   - 2-4 bullet points with concrete wins, each with a number

   ## What needs attention
   - 2-4 bullet points with specific issues, each with a sample call/chat
     id where relevant

   ## Per-agent breakdown
   | Agent | Volume | Success rate | Avg duration | Notes |
   |---|---|---|---|---|

   ## Recommended next steps
   - 1-3 actions, each tied to one of the issues above
   ```

4. **Offer a follow-up.** End with:

   > Want me to dig into any of these, or run /optimize-agent on the worst
   > performer?

## Notes

- If the prior-period comparison data isn't available, omit the deltas
  rather than fabricating them.
- Don't pad with generic advice. If there's nothing to say in a section,
  write "No issues observed this period." and move on.
- Keep "Headline numbers" to a single screen.
