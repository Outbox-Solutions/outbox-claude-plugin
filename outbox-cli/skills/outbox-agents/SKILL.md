---
name: outbox-agents
description: How to build, edit and equip agents on this platform — the ten built-in tools, what each tool type needs before it can run, transfer destinations, and prompts that do not invent facts. Use whenever creating or editing a voice or chat agent, attaching a tool, or reviewing why an agent is not doing what it was asked to.
---

# Building agents

Derived from the Outbox CLI plugin's agent guidance. Prefer it over inference.

## Before you build

Read `describe_operation` for `agents.create` and use that contract for field
names. `chatbot` answers messages; `voicebot` takes calls. Those are the only
two types — anything else is stored verbatim and becomes an agent no filter
can see.

Give every agent a `description` (the backend writes the prompt from it) or a
`prompt` outright. An agent with neither cannot answer anything.

## Reach for a built-in first

Ten built-ins exist. They have working auth and a maintained schema, and
attaching one is free:

| Key | What it does |
|---|---|
| `send_sms` | SMS the contact or a passed number |
| `send_email` | Email the contact or a passed address |
| `book_ai_callback` | Queue a future AI callback for the contact |
| `create_opportunity` | Create a CRM opportunity |
| `update_opportunity` | Update the contact's latest matching opportunity |
| `update_contact` | Patch fields on the contact |
| `add_tag` / `remove_tag` | Tag the contact |
| `add_to_workflow` / `remove_from_workflow` | Move the contact through automations |

Attach one with `type: "builtin"` and the `builtin_key`. There is **no
built-in for calendar booking** — the documented booking integrations are
Cal.com and GoHighLevel, both external. If someone asks for booking and no
calendar is connected, say so rather than attaching a booking tool that
resolves to nothing.

Only build a custom tool when the catalogue has nothing that fits.

## A tool that cannot run

Each type needs something specific before it does anything at call time:

- **transfer** — at least one destination, each with a `phone_number` in E.164
  and a `description` of when to use it. A transfer tool with no destination
  has nowhere to send the call.
- **booking** — a `url` naming a Cal.com or GoHighLevel calendar. An empty url
  resolves to an empty calendar id and fails on the first real booking.
- **custom** — a `url`.
- **mcp** — an `mcp_tool`.
- **all of them** — a `description`. It is what the agent decides from; without
  one the tool is attached and never fires.

Tool names are function names the agent model calls, so they must be
snake_case. "Book plumbing job" is not a name anything can invoke.

## Transfer types

Four, and the choice matters:

- **blind** — connects immediately, no introduction. Fastest; the recipient
  gets no context.
- **warm_summary** — the agent summarises the conversation to the recipient
  first. Usually the right default.
- **warm_custom** — the agent delivers a specific message before connecting.
- **warm_experimental** — the agent calls the destination first, shares
  context, and asks whether they want the call. Protects callers from being
  routed to someone unprepared, and ends gracefully if declined.

## Prompts that will not embarrass anyone

Never write a fact into a prompt you were not given. Opening hours, address,
prices, guarantees, staff names, response times, what is or is not included —
if nobody told you, the agent should say it will check rather than state a
number. An invented detail does not read as invented; it reads as confident,
and a customer acts on it.

Say in your reply what you left out, so it can be filled in later.

## Editing

Read the agent back before changing its prompt — an edit replaces it rather
than merging. Apply the smallest change asked for.
