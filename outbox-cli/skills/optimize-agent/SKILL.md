---
name: optimize-agent
description: Review an Outbox agent's recent calls or chats and propose targeted prompt improvements. Use when the user asks to "improve", "optimize", "fix", "tune", or "audit" an agent based on its real conversation history. Also triggers on phrases like "this agent is failing on X", "calls keep going wrong", "review the bot's performance".
---

# Optimize Agent

You're being asked to look at how an Outbox agent is actually performing,
find what's breaking, and propose concrete edits to its system prompt
and/or tool config.

## Inputs you may have

- The agent's name or id (from the user, or implied from context)
- A symptom ("failing on objections", "transferring too early", "not asking
  for the appointment")
- A time window ("last week", "last 50 calls")

If any are missing, ask before pulling data — but only the missing ones.

## Workflow

1. **Confirm context.** Call `mcp__outbox__show_client`. If no active
   client, ask the user which client and run `mcp__outbox__use_client`.

2. **Locate the agent.**
   - If the user gave an id, use it.
   - Otherwise call `mcp__outbox__list_records resource="agents"` and
     either pick the obvious match or ask the user.

3. **Pull the current config.**
   `mcp__outbox__get_record resource="agents" record_id=<id>` to see the
   current system prompt, tools, and any guardrails.

4. **Pull recent samples.** Use `mcp__outbox__run_operation`:
   - `logs.call.list` with `query={agent: "<id>", page: 1}` (and a
     date range if the user specified one)
   - or `logs.chat.list` for chat-channel agents
   - Pull 20-50 samples. Skim transcripts; you don't need to read every word.

5. **Diagnose.** Group failures by pattern. Common buckets to look for:
   - Misunderstood intents
   - Missing handoff / transfer logic
   - Hallucinated facts (compare against the agent's knowledge files)
   - Awkward objection handling
   - Premature termination

   Quote 2-3 short transcript snippets per pattern as evidence.

6. **Propose edits.** Produce a concrete diff against the current system
   prompt. Show:
   - The exact text to add/change/remove
   - Which failure pattern it addresses
   - Why it should help (one sentence)

7. **Confirm before applying.** Show the proposed update; ask the user to
   approve. On approval, call
   `mcp__outbox__update_record resource="agents" record_id=<id>` with the
   new prompt.

8. **Suggest a verification plan.** "Re-run this analysis in a week" or
   "place a test call with `mcp__outbox__send_ai_call`" — whichever fits.

## What to avoid

- Don't propose vague edits like "be more empathetic". Edits must be specific
  enough to copy-paste.
- Don't make tool/integration changes without explicitly calling them out as a
  separate proposal — those have higher blast radius.
- Don't apply changes silently. Always confirm.
