---
name: triage-conversations
description: Surface stuck, escalated, or unread Outbox conversations that need a human. Use when the user asks "what needs my attention", "any conversations stuck", "what's unread", "show me anything that needs follow-up", or any variation of asking which contacts/threads need touch.
---

# Triage Conversations

Find the conversations in the active Outbox client that genuinely need a
human — unread, stalled mid-flow, flagged for handoff, or showing
escalation signals. Rank them so the user can work top-down.

## Workflow

1. **Confirm context.** `mcp__outbox__show_client`.

2. **Pull candidates** (in parallel):
   - `mcp__outbox__search_conversations search="" unread_only=true page=1`
   - `mcp__outbox__run_operation conversations.list query={page: 1}` for the
     broader set
   - For any conversation flagged or starred in Outbox, include it even if
     it isn't unread.

3. **Score each candidate** on:
   - **Unread inbound** in the last X hours (the older, the higher)
   - **Escalation signals** — words like "manager", "refund", "cancel",
     "lawyer", "complaint" in the most recent inbound message
   - **Stalled flow** — agent waiting on a reply for more than 24h
   - **High-value contact** — has an open opportunity, recent purchase, etc.
     (skip if you don't have this info; don't fabricate)

4. **Render a ranked table:**

   ```
   | # | Contact | Last inbound | Signal | Snippet |
   |---|---|---|---|---|
   ```

   Top 10 only. Snippet = ~80 chars from the most recent inbound message.

5. **Offer actions.** End with:

   > Reply to #1, send SMS via `mcp__outbox__send_sms_message`, or want me
   > to draft a suggested reply for any of these?

## Don'ts

- Don't surface marketing-only or already-resolved threads.
- Don't auto-reply. Always confirm before sending anything.
- Don't dump more than 10 rows — the goal is the next action, not a full
  inbox audit.
