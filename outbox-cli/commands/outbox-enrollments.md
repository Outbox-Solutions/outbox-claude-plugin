---
description: View workflow enrollment history — debug workflow runs
argument-hint: [workflow-id]
---

Show recent workflow enrollments. With `$ARGUMENTS`, scope to one workflow.
Without, show all recent enrollments across the active client.

### Pre-flight

`mcp__outbox__show_client` — abort if no active client.

### Pull (in parallel)

- `mcp__outbox__jarvis_query tool_name="query_workflow_enrollments"
  args={"workflow_id": "$ARGUMENTS" or null, "limit": 50}`
- `mcp__outbox__jarvis_query tool_name="query_workflow_execution_logs"
  args={"workflow_id": "$ARGUMENTS" or null, "limit": 25,
        "include_errors": true}`

### Render

Two sections:

```
## Enrollments (last 50)
| Workflow | Contact | Enrolled at | Current step | Status |

## Execution log (last 25, errors first)
| When | Workflow | Contact | Step | Result |
```

Sort the execution log so **errors and failures appear at the top**, then
recent successes. The user is here to debug — pain first.

For each error row, include the error message in a sub-line under the row
(don't truncate aggressively).

If everything is healthy:

> No errors in the last 25 executions. Workflows look healthy.

End with (only if there are errors):

> `/outbox-workflow <id>` to inspect the workflow structure, or
> `/contact <contact-id>` to see what else happened to that contact.
