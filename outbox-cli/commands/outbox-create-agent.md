---
description: Interactive scaffold for a new agent
argument-hint: [agent-name]
---

You are creating a new agent for the active client. If `$ARGUMENTS` is empty,
ask the user what to name the agent. Otherwise treat `$ARGUMENTS` as the
proposed name.

### Pre-flight

1. Call `mcp__outbox__show_client`. If `effective_company_id` is empty,
   abort and tell the user to run `/outbox-use-client <name>` first.
2. Call `mcp__outbox__describe_operation` with `operation="agents.create"`
   to see the current required body fields. Use that contract to drive the
   questions below — don't hardcode field names from memory.

### Gather inputs

Ask the user (in one message, as a numbered list):

1. **Purpose** — what does this agent do? (1-2 sentences)
2. **Channel** — call, chat, or both?
3. **Voice / persona** — friendly, professional, blunt, etc.
4. **Initial system prompt** — offer to draft one based on (1)-(3) and have
   them edit, OR let them paste their own.
5. **Built-in tools** — show the built-in catalog and let them tick any
   that fit the agent's job. Multi-select; defaults to none. Catalog:
   `send_sms`, `send_email`, `book_ai_callback`, `create_opportunity`,
   `update_opportunity`, `update_contact`, `add_tag`, `remove_tag`,
   `add_to_workflow`, `remove_from_workflow`. Skip if unsure — they can
   add later via `/outbox-attach-tool`.

### Create

Once all inputs are confirmed, call `mcp__outbox__create_record` with
`resource="agents"` and the gathered data.

If the user picked any built-in tools, attach each one after the agent is
created — call `mcp__outbox__run_operation operation="agent_tools.create"`
with body `{"agent_id": "<new-id>", "type": "builtin", "builtin_key":
"<key>", "is_async": true}`. For built-ins with config fields the user
also wants pre-filled (e.g. a default pipeline for `create_opportunity`),
defer to `/outbox-attach-tool <new-id>` rather than gathering them inline
— scaffold creation should stay quick.

On success:

- Show the new agent's id.
- Offer next steps: `Want me to attach more tools, attach a knowledge file, or test it with a call?`

If validation fails, surface the field-level errors and offer to retry.
