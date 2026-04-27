---
description: Interactive scaffold for a new workflow
argument-hint: [workflow-name]
---

You are creating a new workflow for the active client.

### Pre-flight

1. Call `mcp__outbox__show_client`. If `effective_company_id` is empty,
   abort and tell the user to run `/outbox-use-client <name>` first.
2. Call `mcp__outbox__describe_operation` with `operation="workflows.create"`
   to see the current contract. Drive the questions below from that — do
   not invent field names.

### Gather inputs

Ask in a single message:

1. **Name** — defaults to `$ARGUMENTS` if provided.
2. **Trigger** — what kicks contacts into this workflow? (manual enrollment,
   form fill, tag added, inbound message, etc.)
3. **Goal** — what does success look like? (booked call, replied, opted in)
4. **Steps** — high-level outline of actions (send SMS → wait 1 day → send
   email → if no reply, send second SMS, etc.). Get the prose first; you'll
   structure it in the next step.

### Build the action graph

Translate the prose into the workflow's action structure. If you need to
verify supported action types, call `mcp__outbox__run_operation` with
`operation="workflows.list"` and inspect a recent example.

### Create

Call `mcp__outbox__create_record` with `resource="workflows"` and the
assembled payload. On success, show the workflow id and offer to add the
first contacts via `mcp__outbox__add_contacts_to_workflow`.
