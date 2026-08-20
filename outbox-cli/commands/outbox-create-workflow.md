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

**Call-chase / multi-dial workflows — build them the right way.** A very
common request is "call, wait, if no answer call again" (double/triple
dialling to beat DND). The naive build — `send_ai_call → wait (time, 1 min)
→ if_else call_status == did-not-answer → repeat` — is an anti-pattern.
Avoid it:

- **Never gate a redial on a fixed `wait_type: "time"` delay.** A 1-minute
  time wait fires the next call while the contact may still be on the phone,
  and it evaluates `call_status` before the call has finished (the status is
  still `active`), so the branch is unreliable. Instead put a
  `wait { wait_type: "call_end" }` immediately after every `send_ai_call`.
  It blocks until the call actually ends — however long it runs — then the
  final `call_status` is available for branching. Add a short `time` wait
  only for the *deliberate* gap between attempts (e.g. 2 hours between dials,
  22 hours to roll to the next day).
- **Turn on `stop_on_response: true` at the workflow root** instead of
  hand-building an if_else after every call to check for a pickup. When on,
  an answered call *or* an inbound SMS reply auto-unenrolls the contact, so
  the remaining steps never fire. This collapses a 180-action monster into a
  flat `call → wait(call_end) → wait(time) → call → …` list with no
  branching at all.
- Only keep an explicit `if_else` when a branch does something *other* than
  "stop because they responded" (e.g. route by `call_score`, tag an error
  status). Post-call routing like that belongs in a **separate** workflow
  triggered by `ai_call_completed`, not inlined into the dial sequence.

Rule of thumb: if a chase workflow has dozens of near-identical
`send_ai_call + if_else` blocks, it should almost certainly be `stop_on_response`
+ `wait(call_end)` instead.

### Create

Call `mcp__outbox__create_record` with `resource="workflows"` and the
assembled payload. On success, show the workflow id and offer to add the
first contacts via `mcp__outbox__add_contacts_to_workflow`.
