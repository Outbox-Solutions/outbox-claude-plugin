---
description: Attach a tool from the platform tool library to an agent
argument-hint: <agent-id>
---

Attach one or more tools to the agent identified by `$ARGUMENTS`. Outbox
agents support three tool sources:

- **Built-in tools** — first-party actions baked into the platform (SMS,
  email, CRM, workflows, callbacks). Fastest to attach, no external auth.
- **Platform tool library** — Composio/MCP integrations and other modules
  searchable via `search_tools`.
- **Custom tools** — user-authored HTTP/MCP/transfer tools created
  inline. Out of scope for this command — the user can build those in the UI.

### Pre-flight

1. `mcp__outbox__show_client` — abort if no active client.
2. If `$ARGUMENTS` is empty, list agents first:
   `mcp__outbox__jarvis_query tool_name="list_agents" args={}`.

### Pull current state + offer paths

In parallel, fetch the agent's currently attached tools and the platform
library:

- `mcp__outbox__run_operation operation="agent_tools.list"
  path_params={"agent_id": "$ARGUMENTS"}`
- `mcp__outbox__jarvis_query tool_name="search_tools" args={}`

Ask the user which source they want to attach from. Default to **Built-in**
unless they mention a specific external integration.

### Path A — Built-in tools

The catalog is stable. Show this list, marking any already-attached entries
(those with `type: "builtin"` in the agent's tool list) as `[attached]`:

| Key | Name | What it does |
|---|---|---|
| `send_sms` | Send SMS | SMS the contact or a passed number |
| `send_email` | Send Email | Email the contact or a passed address |
| `book_ai_callback` | Book AI Callback | Queue a future AI callback for the contact |
| `create_opportunity` | Create Opportunity | Create a CRM opportunity for the contact |
| `update_opportunity` | Update Opportunity | Update the contact's latest matching opportunity |
| `update_contact` | Update Contact | Patch fields on the current contact |
| `add_tag` | Add Tag | Add tags to the current contact |
| `remove_tag` | Remove Tag | Remove tags from the current contact |
| `add_to_workflow` | Add to Workflow | Enroll the contact into a workflow |
| `remove_from_workflow` | Remove from Workflow | Pull the contact out of active workflow enrollments |

Ask which one(s) to attach.

**Gather config defaults.** Some built-ins have config fields that pre-fill
values when the LLM doesn't pick one. Ask only for the ones relevant to the
chosen tool — never invent values. Pull live IDs from the active client when
needed (run these in parallel after the user picks a tool):

| Built-in | Config field | How to source the value |
|---|---|---|
| `send_sms` | `from_number` | `mcp__outbox__list_records resource="phones"` — phone ID |
| `send_email` | `from_email` | `mcp__outbox__list_records resource="senders"` — verified sender |
| `book_ai_callback` | `agent_id` | `mcp__outbox__jarvis_query tool_name="list_agents" args={}` (voice agents only) |
| `book_ai_callback` | `agent_number` | `mcp__outbox__list_records resource="phones"` |
| `create_opportunity` / `update_opportunity` | `pipeline_id`, then `stage_id` | `mcp__outbox__list_records resource="pipelines"`, then list stages on the chosen pipeline |
| `add_to_workflow` | `workflow_id` | `mcp__outbox__jarvis_query tool_name="list_workflows" args={}` |
| `remove_from_workflow` | `workflow_ids` | same as above (multi-select) |

Skip config entirely if the user wants the LLM to choose at runtime — every
config field is optional defaults, not required.

**Attach.** For each chosen tool, call:

```
mcp__outbox__run_operation operation="agent_tools.create" body={
  "agent_id": "$ARGUMENTS",
  "type": "builtin",
  "builtin_key": "<key>",
  "is_async": true,
  "config": { ...only the fields the user provided... }
}
```

The backend auto-fills `name`, `mcp_tool`, `description`, and `schema` from
the catalog — don't pass those.

### Path B — Platform tool library

Render `search_tools` results as a compact list grouped by application.
Mark already-attached tools with `[attached]`. Ask which to add. For each
chosen tool, call `agent_tools.create` with `type` matching the tool
record (typically `mcp` or `custom`) plus any required config — if the
contract demands fields you don't have, **ask** rather than guessing.
Don't fabricate API keys.

### Confirm

Briefly summarize: `Attached <N> tool(s) to <agent name>: <list>`.

End with:

> Test it with `mcp__outbox__send_ai_call agent_id=<id>` to make sure the
> agent picks up the new capability.
