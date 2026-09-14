---
name: outbox-workflows
description: How to build and edit workflows on this platform — trigger filters, action graphs, branching, and the call-chase shape that beats hand-built if_else chains. Use whenever creating, editing or reviewing a workflow, an automation, a follow-up sequence, a nurture, a redial sequence, or anything triggered by a call, form, webhook or schedule.
---

# Building workflows

Written against real builds. Prefer it over inference.

## Before you build

Read `describe_operation` for `workflows.create` and drive the shape from
that contract rather than from memory. If you are unsure what an action type
supports, list workflows and read a recent one that already does something
similar — matching an existing shape beats inventing one.

## Filter at the trigger, not with a branch

A trigger filter is evaluated before anything is enrolled. An `if_else` runs
after, costs an action, and is one more thing to wire wrong. If the question
is "only when X", try the trigger first.

`ai_call_completed` filters, exactly as the engine reads them:

| Key | Shape |
|---|---|
| `agent_ids` | list of agent ids (`agent_id` also accepted) |
| `statuses` | list of call statuses (`status` also accepted) |
| `types` | list of agent types (`type` also accepted) |
| `direction` | inbound / outbound |
| `score_min` | minimum score |
| `score_max` | maximum score |

`score_min` and `score_max` — **not** `min_score`/`max_score`. Trigger filters
are stored as unvalidated JSON, so a wrong key saves without complaint, shows
as empty in the builder, and matches every call including the ones that scored
twelve. A filter that silently passes everything is worse than no filter.

Score is not the same as a good outcome. A polite call where the person said
no can still score 80. If the point is "this one is worth your time", filter on
status as well.

`meta_form_submitted` takes one filter, `form_ids`. `inbound_webhook` takes
none — it mints its own URL on save, so do not invent a `webhook_key`.

## Schedule triggers

`schedule` fires because a moment arrived rather than because something
happened. It takes **no filters**; everything is `config`:

| Key | Shape |
|---|---|
| `mode` | `interval`, `daily`, `weekly` or `monthly` |
| `every` + `unit` | for `interval` — `minutes`, `hours` or `days`, five minutes minimum |
| `at` | `HH:MM`, for the other three modes |
| `weekdays` | list of `0`-`6` where **0 is Monday**, for `weekly` |
| `day_of_month` | `1`-`28`, for `monthly` |
| `timezone` | falls back to the workflow's, then the company's |
| `target` | `none` (one run, no contact) or `contacts` (one run per contact) |
| `tags` | with `target: contacts`, only contacts carrying one of these |
| `exclude_dnd` | defaults true |
| `max_contacts` | defaults 500 |

Cron is not supported. Times are wall-clock in the business's own timezone and
stay that way across a clock change, so "9am Monday" keeps meaning 9am.

Pick `target` deliberately. A report, a sync or an outbound webhook wants
`none`. "Chase quotes older than three days" wants `contacts`, and anything
that sends to a person needs it, because contact actions with no contact do
nothing.

## Branching, when you genuinely need it

Two actions branch. `if_else` picks a branch by testing the contact or the
call. `split` picks one at random against percentages, for split-testing two
approaches against each other. Everything below applies to both.

### How a branch is attached

Actions are sent as one flat list, not nested. A child says which branch it
belongs to:

- `parent_action_id` — the `id` of the branching action, either its real id
  from a workflow you read back, or any string you make up in the same payload
  for an action you are creating in the same call.
- `branch_index` — `0` for the first branch, `1` for the second, and `null`
  for the else branch of an `if_else`. A `split` has no else branch.

Give every action a growing `order`, children included; order sequences the
actions within their own branch.

```json
{"actions": [
  {"id": "route", "action_type": "if_else", "order": 0, "node_type": "condition",
   "config": {"branches": [
     {"label": "Hot", "condition_field": "call_score", "operator": "equals",
      "values": [], "min_score": 70}]}},
  {"id": "tag-hot",  "action_type": "add_tag", "order": 1,
   "parent_action_id": "route", "branch_index": 0,    "config": {"tags": ["hot"]}},
  {"id": "tag-cold", "action_type": "add_tag", "order": 2,
   "parent_action_id": "route", "branch_index": null, "config": {"tags": ["cold"]}}
]}
```

An action with no `parent_action_id` sits *after* the whole branching block and
runs whichever branch was taken. That is often what you want for a final step —
but it is also what you get by forgetting the field, and the two look identical
in the payload. Read the workflow back and check `parent_action` is set.

Branches nest. A branching action can itself be a child of another branch; give
it a `parent_action_id` and `branch_index` like any other action. Keep trees
shallow — deeper than about three levels is usually a sign the logic belongs in
a separate workflow.

### if_else conditions

A branch is `{label, condition_field, operator, values}` and `values` is always
a list, even for one value.

`describe_operation` on `workflows.create` carries the field list, or read
`GET /workflow/condition-fields/` for the live one including the company's own
custom fields and the tags it actually uses. Do not guess a field name — one
that nothing reads is refused on save.

Fields are namespaced by where the value comes from:

| Field | Type | Operators |
| --- | --- | --- |
| `contact.tags` | tags | `has_any_of`, `has_all_of`, `has_none_of`, `is_empty`, `is_not_empty` |
| `contact.email`, `contact.phone_number`, `contact.first_name`, `contact.last_name`, `contact.full_name`, `contact.business_name`, `contact.website`, `contact.notes` | text | `is`, `is_not`, `contains`, `not_contains`, `starts_with`, `ends_with`, `is_empty`, `is_not_empty` |
| `contact.lead_source` | choice | `is_any_of`, `is_none_of` |
| `contact.is_dnd` | boolean | `is_true`, `is_false` |
| `contact.custom.<name>` | text | as text above |
| `call.status` | choice | `is_any_of`, `is_none_of` |
| `call.score`, `call.duration` | number | `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `between` |
| `call.direction`, `call.agent_id` | choice | `is_any_of`, `is_none_of` |
| `call.summary` | text | as text above |

`between` takes two values, low then high. `is_empty`, `is_not_empty`,
`is_true` and `is_false` take none.

A contact field only means anything when the workflow has a contact. A schedule
with `target: none` has none, so `contact.tags` matches nothing there.

Anything on the contact beats an `if_else` on the call: routing two uploaded
lists to two agents is `contact.tags has_any_of ["list-a"]`, not a condition on
how the call went.

```json
{"label": "List A", "condition_field": "contact.tags",
 "operator": "has_any_of", "values": ["list-a"]}
```

Branches are tested top to bottom and the first match wins, so order them
narrowest to widest. Anything matching no branch falls to the else, and without
an else it carries on past the whole block.

Legacy spellings — `call_status`, `score`, `equals`, `min_score`/`max_score` —
still work on existing workflows. Write the table above for anything new.

Trigger filters use `score_min`/`score_max`; a branch uses `call.score` with
`gte`/`lte`/`between`. Different places, different names.

### split

`split` config is `{"branches": [{"label": "...", "weight": 50}, ...]}` and
nothing else. At least two branches. Weights are percentages that may not
exceed 100 between them; a branch with no weight takes an even share of what is
left, so two unweighted branches are a straight 50/50.

The choice is made once per contact and recorded, so a contact never travels
down two paths even if the workflow sleeps halfway through a branch.

Use `split` only when the paths genuinely differ — two subject lines, an SMS
against an email. Splitting a contact between identical paths measures nothing.

## Call chases: do not hand-build the loop

A very common request is "call, wait, if no answer call again". The naive
build — `send_ai_call → wait(time, 1 min) → if_else call_status ==
did-not-answer → repeat` — is an anti-pattern:

- **Never gate a redial on a fixed `wait_type: "time"` delay.** A one-minute
  time wait fires the next call while the contact may still be on the phone,
  and evaluates `call_status` before the call has finished, when the status is
  still `active`. Put `wait {"wait_type": "call_end"}` immediately after every
  `send_ai_call`. It blocks until the call actually ends, however long it runs,
  and only then is the final status available.
- Use a `time` wait only for the deliberate gap between attempts — two hours
  between dials, twenty-two hours to roll to the next day.
- **Set `stop_on_response: true` at the workflow root** instead of building an
  if_else after every call to check for a pickup. An answered call or an
  inbound SMS reply then auto-unenrols the contact and the remaining steps
  never fire. This collapses a 180-action monster into a flat
  `call → wait(call_end) → wait(time) → call → …` list with no branching.
- Keep an explicit `if_else` only when a branch does something other than
  "stop because they responded" — routing by score, tagging an error. Post-call
  routing like that belongs in a separate workflow triggered by
  `ai_call_completed`, not inlined into the dial sequence.

If a chase workflow has dozens of near-identical `send_ai_call + if_else`
blocks, it should almost certainly be `stop_on_response` plus
`wait(call_end)`. Seeing one already built that way is worth flagging — offer
the rebuild, do not force it.

## Editing

Apply the smallest change that satisfies the request. Do not restructure a
workflow nobody asked you to restructure. Say what changed in one line.

## Email steps

A `send_email` action with no `from_email` goes out from the account default.
Check which sender identities exist before assuming one, and say so if there
are none — a workflow that sends from an unverified address fails at send
time, not at build time.
