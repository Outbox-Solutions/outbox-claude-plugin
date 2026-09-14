---
name: outbox-agents
description: How to build, edit and equip agents on this platform — model and timezone, the ten built-in tools and which to leave to workflows, connecting a calendar for booking, transfer destinations, and prompts that do not invent facts. Use whenever creating or editing a voice or chat agent, attaching a tool, or reviewing why an agent is not doing what it was asked to.
---

# Building agents

Written against real builds. Prefer it over inference.

## Before you build

Read `describe_operation` for `agents.create` and use that contract for field
names. `chatbot` answers messages; `voicebot` takes calls. Those are the only
two types — anything else is stored verbatim and becomes an agent no filter
can see.

Give every agent a `description` (the backend writes the prompt from it) or a
`prompt` outright. An agent with neither cannot answer anything.

## Model and timezone

Set both. Neither has a sensible default for a real agent.

- **`model`** — `gpt-4.1` for a voicebot, `gpt-5.4` for a chatbot. Do not leave
  it blank and do not reach for a cheaper open model; a cold caller on a small
  model loses the thread of its own script.
- **`timezone`** — the timezone the calls happen in, as an IANA name
  (`Australia/Perth`). It is what free-slot lookups and bookings are computed
  against, so `UTC` on an Australian business books 3am appointments. Ask if
  you cannot tell from the company.

If the agent calls across a country with several timezones, that one setting
cannot be right for everybody. Have the script ask which city they are in
before it offers times, and pass that through to the slot lookup.

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

Attach one with `type: "builtin"` and the `builtin_key`.

Do not attach the last two pairs by default. Tagging and workflow membership
are bookkeeping, and bookkeeping belongs in a workflow triggered by the call,
where it is visible and editable — not buried in an agent's tool list where the
only sign it happened is a tag appearing. Attach them when someone asks for
them during a call specifically.

`send_sms`, `send_email` and `book_ai_callback` are the ones a caller genuinely
reaches for mid-conversation.

Only build a custom tool when the catalogue has nothing that fits.

## Booking is an integration, not a tool you attach

The `booking` tool type is legacy. Do not create one. It resolves against a
calendar id the agent has no way to have, and the platform no longer offers it
as a way to set booking up.

Booking now comes from whichever calendar the business already uses. Four are
supported: **Google Calendar**, **Outlook**, **Cal.com** and **GoHighLevel**.
The order is always the same:

1. Ask which one they use — `request_user_action` with `kind: "choose_option"`,
   the four as options. Do not guess, and do not ask in prose when the control
   exists.
2. When they pick one, `request_user_action` with
   `kind: "connect_integration"` and that provider. They connect it in the
   dashboard; you wait.
3. Once it is connected, attach that integration's tools — the one that books
   and the one that finds free slots. Both, not just the booking one: an agent
   that can book but cannot see availability offers times that are already
   taken.

Under `run_module`/module tools those are, per provider:

| Provider | Find times | Book |
| --- | --- | --- |
| Google Calendar | `Google Calendar - Find Free Slots` | `Google Calendar - Create Event` |
| Outlook | `Outlook - Get Calendar View` | `Outlook - Calendar Create Event` |
| Cal.com | `Cal - List Event Types` | `Cal - Post New Booking Request` |
| GoHighLevel | `Fetch Free Slots` | `Book Appointment` |

Names drift, so confirm against the company's own module instances rather than
trusting this table; it is the shape that matters, not the spelling.

## A tool that cannot run

Each type needs something specific before it does anything at call time:

- **transfer** — at least one destination, each with a `phone_number` in E.164
  and a `description` of when to use it. A transfer tool with no destination
  has nowhere to send the call.
- **booking** — legacy, do not create one. Existing agents still carry them and
  they still run; a `url` naming the calendar is what they need. New booking
  goes through a calendar integration, above.
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
