---
description: View a single workflow — structure and recent enrollments
argument-hint: <workflow-id>
---

Show full details for the workflow identified by `$ARGUMENTS`.

### Pre-flight

1. `mcp__outbox__show_client`.
2. If `$ARGUMENTS` is empty, run `jarvis_query tool_name="list_workflows"
   args={}` and ask the user to pick.

### Pull (in parallel)

- `mcp__outbox__get_record resource="workflows" record_id="$ARGUMENTS"` —
  full workflow record (steps, triggers, etc.)
- `mcp__outbox__jarvis_query tool_name="query_workflow_enrollments"
  args={"workflow_id": "$ARGUMENTS", "limit": 10}` — recent enrollments
- `mcp__outbox__jarvis_query tool_name="query_workflow_execution_logs"
  args={"workflow_id": "$ARGUMENTS", "limit": 10}` — recent execution logs

### Render

```
# <Workflow name>  ·  <status>

**Trigger:** <trigger summary>
**Goal:** <goal if set>
**Total steps:** <N>

## Steps
<numbered list of steps in order>

## Recent enrollments (last 10)
| Contact | Enrolled at | Status | Last action |

## Recent execution logs (last 10)
<show errors prominently if any>
```

End with:

> `/outbox-edit-workflow <id>` to change steps, `/outbox-campaign` to enroll new
> contacts, or `/outbox-enrollments <id>` for full enrollment history.
