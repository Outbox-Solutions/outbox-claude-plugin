---
description: First-run guided setup — sign in, pick a client, take a quick tour
---

You're walking the user through their first 60 seconds with the Outbox
plugin. Goal: get them from "just installed" to "did something useful"
with zero friction.

Be warm, not chatty. Each step should fit on one screen. If they already
appear to be set up (e.g. signed in + active client), skip ahead.

### Step 0 — quick welcome

Open with one short message:

> Welcome to Outbox CLI. I'll get you set up in under a minute. Three
> quick steps: sign in, pick a client, and a 30-second tour.

### Step 1 — check sign-in status

Call `mcp__outbox__show_client`. Four cases:

**A. Not signed in** — the Outbox tools don't exist yet, or the call fails
with 401 / "needs authentication". Tell them:
> First, sign in. Run `/mcp`, choose **plugin:outbox-cli:outbox** and
> select **Authenticate**. Your browser opens an Outbox sign-in page; sign
> in there and come back. Your password never goes through this terminal.
> Tell me when you're done.

When they say done, call `mcp__outbox__show_client` again and continue
with the case it now matches. Never ask for their email or password.

**A′. Transport / MCP failure** — connection refused, timeout, 5xx, or a
malformed response. **Don't send them to sign in.** Surface the raw error:
> The plugin can't reach the Outbox server. Here's what came back:
> `<raw error>`. This isn't a sign-in problem. Try again in a minute; if
> it persists, share the error above.

**B. Returns 200 with no `effective_company_id`** — signed in but no client picked.
> You're signed in. Now let's pick a client to work with.

Skip to Step 2.

**C. Returns 200 with `effective_company_id` set** — fully set up.
> You're already signed in to **<client name>**. Skipping ahead to the tour.

Skip to Step 3.

### Step 2 — pick an active client

Call `mcp__outbox__list_accessible_companies`. Three cases:

**A. Single-company key (no agency context).** The list call will fail
or return only one company. Tell them:
> Your account has access to one company: **<name>**. That's already your
> active context — no switching needed.

**B. Multiple clients (agency).** Render a compact list:

```
You have access to <N> clients:

  1. Acme Roofing
  2. Beta Dental
  3. Gamma Plumbing
  4. Delta Realty
  ...

Which one would you like to start with? (Type the name or number — you
can switch any time with `/outbox-use-client <name>`.)
```

Wait for their answer. On reply:
- If they typed a number, map to the indexed name.
- Call `mcp__outbox__use_client identifier="<name>"`.
- Confirm: `Active client → **<Name>**.`

**C. No clients found.** Surface the error and stop — they need to set up
their account first. Don't continue the tour.

### Step 3 — 30-second tour

Once a client is active, give them a single message with the most
valuable next steps:

```
You're set up. Here's what to try first:

**See what's there**
- `/outbox-agents` — list your agents
- `/outbox-workflows` — list your workflows
- `/outbox-calls period=weekly` — recent calls with summaries

**Build something new**
- `/outbox-create-agent` — interactive agent scaffold
- `/outbox-create-workflow` — interactive workflow scaffold
- `/outbox-new-client` — add a client (blank, or copied from one you've built)
- `/outbox-import-contacts <file.csv>` — import contacts from a local CSV

**The headline command**
- `/outbox-campaign` — filter contacts and enroll them into a workflow
  ("add 500 unreached contacts with phone numbers to the AI Reactivation
  Sequence")

**Or just talk to me in plain English** — I'll route to the right tools.
Try: "show me last week's report" or "which agents are failing on
objections?"

If you have multiple clients, switch with `/outbox-use-client <name>`
any time. Run `/outbox-whoami` to see who you're working as right now.
```

End there. Don't ask "what would you like to do next?" — let them drive.

### Guardrails

- **Don't run any of the tour commands automatically.** This is just a
  briefing — the user picks what to do next.
- **Don't loop back to Step 1 if Step 2 fails.** A failure in client
  pickup means something's wrong with their account, not the auth.
- **Only send them to Authenticate when they're actually signed out**
  (Case A). A network blip isn't fixed by signing in again.
- If `mcp__outbox__show_client` itself errors (network, MCP unreachable),
  surface the raw error — they need to know the plugin can't reach the
  Outbox server, and that's a different problem from sign-in.
