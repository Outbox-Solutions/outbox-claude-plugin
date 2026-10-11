---
description: Add a new client to your agency — blank, or copied from a client you've already built
argument-hint: [client name]
---

Create a new client company under the user's agency. Client operations act
on the **agency**, not the active client.

### Step 1 — blank or copy?

Ask one question (skip it if `$ARGUMENTS` or the user already said):

> Start the new client blank, or copy one you've already set up? A copy
> brings over its agents, workflows and settings, so it's the fastest way
> to roll out the same build to another business.

### Path A — blank client

Collect, in one message: **business name** (use `$ARGUMENTS` if given) and
**contact email** (required). Optionally: website (used for business
context), address/city/state/country, and a client plan.

If they want a plan, list them first:
`mcp__outbox__run_operation operation="client_plans.list"`.

Then:

```
mcp__outbox__run_operation operation="clients.create" body={
  "name": "<name>", "email": "<email>",
  "website": "<optional>", "agency_client_plan_id": "<optional>"
}
```

If the result asks which agency (they admin more than one), show the
`agencies` list it returns, ask, and repeat with `target_agency_id`.

### Path B — copy an existing client

1. `mcp__outbox__list_accessible_companies` — ask which client to copy.
2. `mcp__outbox__use_client identifier="<source client>"` — the copy is
   made from the active client.
3. Ask for the new client's name.
4. ```
   mcp__outbox__run_operation operation="clients.duplicate" body={
     "company_name": "<new name>", "agency_id": "<agency id from list_accessible_companies>"
   }
   ```

### Finish

Confirm in two lines: the new client's name and id, and what's next:

> Created **<name>**. Switch to it with `/outbox-use-client <name>`, then
> `/outbox-create-agent` to build its first agent.

Don't switch the active client automatically — ask first.

### Guardrails

- Creating clients needs an agency admin. A 401/403 means their login isn't
  an agency admin; say so plainly.
- Starter agencies can have up to 3 clients and Growth up to 10. If the
  create fails on a limit, say which plan they're on and that upgrading
  raises it.
