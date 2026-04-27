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
5. **Tools** — any specific integrations to enable? (skip if unsure)

### Create

Once all inputs are confirmed, call `mcp__outbox__create_record` with
`resource="agents"` and the gathered data. On success:

- Show the new agent's id.
- Offer next steps: `Want me to add a tool, attach a knowledge file, or test it with a call?`

If validation fails, surface the field-level errors and offer to retry.
