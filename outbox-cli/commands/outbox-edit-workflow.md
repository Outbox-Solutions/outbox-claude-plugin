---
description: Edit an existing workflow — name, steps, or trigger
argument-hint: <workflow-id>
---

Interactive edit of the workflow identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__outbox__show_client`.
2. If `$ARGUMENTS` is empty, list workflows and let the user pick.
3. Pull current state:
   `mcp__outbox__get_record resource="workflows" record_id="$ARGUMENTS"`.

### Ask what to change

Show the current trigger + step summary. Ask:

> What would you like to change? Examples:
> - Rename the workflow
> - Add a new step (e.g. "send SMS after 24 hours")
> - Edit an existing step
> - Remove a step
> - Change the trigger

### Apply

For step edits, walk through the change conversationally. Verify the
edit by re-fetching the relevant action's contract via
`mcp__outbox__describe_operation operation="workflows.update"`.

Show the user the **final payload** before pushing:

```
mcp__outbox__update_record resource="workflows" record_id="$ARGUMENTS"
data={...}
```

Confirm what changed in one short line.

### Don't

- Don't restructure the entire workflow unless the user asked for it.
  Apply the smallest diff that satisfies the request.
- Don't push without showing the diff for non-trivial changes.
