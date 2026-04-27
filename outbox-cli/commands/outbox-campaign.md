---
description: Filter contacts and enroll them into a workflow — the campaign builder
argument-hint: [free-form description of the campaign]
---

Interactive campaign builder. Filter the active client's contacts, preview
the matches, then enroll them into a workflow. The user may have already
described what they want in `$ARGUMENTS` — extract as much as you can
from there before asking.

Example user prompts this command should handle:

> /outbox-campaign add 500 contacts with a phone number that haven't been
> contacted yet in the Husband Realty account to the AI Reactivation
> Sequence workflow

> /outbox-campaign

### Step 1 — Confirm context

1. Call `mcp__outbox__show_client`.
2. If the user mentioned a client by name in `$ARGUMENTS` ("...in the
   Husband Realty account..."), check whether it matches the active
   client. If not:
   - Ask: "You mentioned **Husband Realty** — switch to that client first?"
   - On yes, call `mcp__outbox__use_client identifier="Husband Realty"`.
3. If still no active client, abort and ask `/outbox-use-client <name>` first.

### Step 2 — Identify the workflow

If the user named a workflow in `$ARGUMENTS` ("...AI Reactivation
Sequence..."):

1. Call `mcp__outbox__jarvis_query tool_name="list_workflows" args={}`.
2. Fuzzy-match against names. If exactly one match, confirm:
   `Found workflow: **AI Reactivation Sequence** (id `abc123…`). Proceed?`
3. If multiple matches, list them and ask the user to pick.
4. If no match, list all workflows and ask which one.

If the user didn't specify, ask: "Which workflow do you want to enroll
contacts into?" then list workflows.

### Step 3 — Build the contact filter

Translate the user's natural language into the Outbox contact filter spec.
The contact list endpoint accepts:

- `pn=true` query param — only contacts with a phone number
- `tags=...` query param — comma-separated tags (any-match)
- `search=...` query param — name/email/phone substring
- `filters=<JSON>` query param — advanced filter tree

The advanced JSON filter supports operators on these field families:

- **Date fields:** `created_at`, `last_activity` — operators include
  `before`, `after`, `between`, `is_null`, `is_not_null`
- **Boolean fields:** various flags — `is_true`, `is_false`
- **Tags:** `contains_any`, `contains_all`, `contains_none`
- **last_call_status:** `equals`, `not_equals`, `in`, `not_in`
- **last_call_score:** numeric comparators
- **lead_source:** `equals`, `in`
- **Custom fields:** look up the field id first via
  `jarvis_query tool_name="list_custom_fields" args={}`, then filter by
  the field's value

For "haven't been contacted yet": filter on
`last_activity` `is_null`. (If the platform exposes a different
"never_called" flag, prefer that — check `list_custom_fields` and
`describe_operation operation="contacts.list"` if unsure.)

For "in the last 30 days": `last_activity` `before` <30 days ago>.

Build the filter, then **show the user the filter in plain English**
before running it:

> I'll filter for: contacts with a phone number, never been contacted.
> That OK?

### Step 4 — Preview

Call:

```
mcp__outbox__run_operation operation="contacts.list"
query={"pn": "true", "filters": <stringified JSON>, "limit": 10, "page": 1}
```

Get back a count + a 10-row sample. Render:

```
**Matches:** 1,247 contacts
**Sample (first 10):**
| Name | Phone | Last activity |
| ...  | ...   | Never         |
```

If the count is way more than the user asked for ("they said 500 but
1247 match"), ask: "I'll cap at 500 — sorted by created_at ascending so
oldest contacts go first. OK with the ordering, or want newest first?"

If the count is **way smaller** than expected, surface that:
"Only 23 contacts match — does the filter look right?"

### Step 5 — Confirm enrollment

Show the final plan:

```
**Plan:**
- Enroll **500 contacts** (capped from 1247 matches)
- Into **AI Reactivation Sequence** (`abc123…`)
- For client **Husband Realty**

Type `yes` to enroll, or describe what to change.
```

Wait for explicit confirmation. Don't proceed on anything ambiguous like
"sounds good" without a clear yes — ask again to be safe.

### Step 6 — Enroll in batches

The platform accepts up to ~500 contact_ids per `add_contacts_to_workflow`
call. For larger sets, batch.

1. Page through `contacts.list` with the filter, collecting IDs until you
   hit the cap.
2. Split into batches of 500.
3. For each batch:
   ```
   mcp__outbox__add_contacts_to_workflow workflow_id="<wf-id>"
   contact_ids=[...]
   ```
4. Track success/failure per batch. Don't bail on the first error —
   collect them all and report.

### Step 7 — Report

```
**Enrolled:** 500 of 500 contacts
**Workflow:** AI Reactivation Sequence
**Skipped (already enrolled):** 12
**Failed:** 0

First step fires immediately. Watch progress with:
`/outbox-enrollments abc123…`
```

If any batch failed, include the error and the count from that batch.

### Guardrails

- **Always preview before enrolling.** Never skip step 4.
- **Always require explicit confirmation.** Never proceed on "ok" or
  "looks good" alone — ask for `yes`.
- **Hard cap at 5000 contacts per command invocation.** Anything larger,
  recommend splitting and ask the user to be explicit about why.
- **Never enroll into a workflow on a different client than the active
  one** without re-confirming the client switch.
- If the workflow is in a draft/inactive state, surface that loudly
  before enrolling — the user probably doesn't want to enroll into a
  workflow that won't run.
- For destructive-feeling phrases like "send SMS to all contacts now",
  refuse — point them at `/outbox-campaign` for proper enrollment.
