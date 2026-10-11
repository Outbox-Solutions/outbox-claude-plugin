# Outbox CLI for Claude Code

Run your Outbox agency from the terminal. Build agents, ship workflows,
audit calls, triage conversations, and pull reports — all by just
talking to Claude.

A Claude Code plugin for [Outbox](https://getoutbox.ai) agency operators
and their teams.

---

## What you can do

Once installed, ask in plain English:

```
> Create a new outbound sales agent for Acme Roofing — friendly,
  qualifies budget and timeline, books a 15-min discovery call.

> Add 500 contacts with a phone number that haven't been called yet in
  the Husband Realty account to the AI Reactivation Sequence workflow.

> Show me last week's report for Beta Dental.

> The booking agent on Gamma Plumbing keeps failing on price objections.
  Pull the last 30 calls and tell me what to fix.

> What conversations need my attention right now?

> Switch me over to Delta Roofing.
```

Or use slash commands directly when you want a specific, repeatable
output format.

### The campaign command

The headline feature: `/outbox-cli:outbox-campaign` is an interactive
campaign builder. It filters contacts in the active client (with full
support for tags, custom fields, last-activity date, has-phone, etc.),
previews the matches, and enrolls them into a workflow in batches. Use
it for reactivation pushes, follow-up sequences, segment-specific
outreach — anything where you'd otherwise be exporting CSVs and
importing into the workflow UI.

---

## Requirements

- [Claude Code](https://docs.claude.com/en/docs/claude-code) v2.x or later
- An [Outbox](https://getoutbox.ai) account (agency or company) with a
  password. If you sign in with Google, set one with **Forgot password**
  on the Outbox sign-in page first.

No Node.js, API key or token file needed.

---

## Install (under 2 minutes)

In Claude Code, run:

```
/plugin marketplace add Outbox-Solutions/outbox-claude-plugin
/plugin install outbox-cli@outbox
```

Then sign in:

1. Run `/mcp`
2. Choose **plugin:outbox-cli:outbox** and select **Authenticate**
3. Sign in on the Outbox page that opens in your browser, then come back

Finish with `/outbox-cli:outbox-setup` to pick a client and take a
30-second tour.

> Your password goes to Outbox in your browser, never into the terminal.
> Claude Code keeps a token that renews itself and lasts up to 180 days.
> See or disconnect connected apps any time in **Outbox → Settings →
> Claude & Codex**, or with `/outbox-cli:outbox-sign-out`.

### Updating from 0.1.x

Version 0.2 replaces the old terminal sign-in. After updating, run `/mcp`
→ **plugin:outbox-cli:outbox** → **Authenticate** once. You can delete
`~/.outbox/credentials.json` and any `OUTBOX_TOKEN` line in your shell
profile; nothing reads them any more.

---

## Slash commands

All commands are namespaced under `/outbox-cli:` to avoid collisions
with Claude Code built-ins or other plugins.

**Auth + context**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-setup` | First-run guided setup — sign in, pick a client, quick tour |
| `/outbox-cli:outbox-sign-in` | Check you're signed in, and how to sign in if not |
| `/outbox-cli:outbox-sign-out` | Sign out here, or disconnect another device |
| `/outbox-cli:outbox-whoami` | Show current context — active client, agency, auth source |
| `/outbox-cli:outbox-clients` | List every client your account can access |
| `/outbox-cli:outbox-use-client <name>` | Switch the active client |
| `/outbox-cli:outbox-new-client [name]` | Add a client — blank, or copied from one you've built |

**Agents**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-agents` | List agents in the active client |
| `/outbox-cli:outbox-agent <id>` | View a single agent — config, prompt, tools, recent activity |
| `/outbox-cli:outbox-create-agent` | Interactive new-agent scaffold |
| `/outbox-cli:outbox-edit-agent <id>` | Interactive prompt/config edit |
| `/outbox-cli:outbox-attach-tool <agent-id>` | Attach tools from the platform library |
| `/outbox-cli:outbox-clone-agent <id>` | Pull an agent's config to local files for editing |
| `/outbox-cli:outbox-push-agent` | Push local edits back to Outbox |
| `/outbox-cli:outbox-prompt-history <agent>` | Prompt versions, compare, roll back |

**Workflows + campaigns**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-workflows` | List workflows |
| `/outbox-cli:outbox-workflow <id>` | View a workflow — structure + recent enrollments |
| `/outbox-cli:outbox-create-workflow` | Interactive new-workflow scaffold |
| `/outbox-cli:outbox-edit-workflow <id>` | Interactive workflow edit |
| `/outbox-cli:outbox-campaign` | Filter contacts and enroll them into a workflow |

**Logs + debugging**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-calls [agent=… period=…]` | Recent voice calls |
| `/outbox-cli:outbox-call <id>` | Single call: full transcript, tool calls, summary |
| `/outbox-cli:outbox-chats [agent=… period=…]` | Recent chats |
| `/outbox-cli:outbox-chat <id>` | Single chat: full message history |
| `/outbox-cli:outbox-conversations [search]` | Search messages across the active client |
| `/outbox-cli:outbox-enrollments [workflow-id]` | Workflow enrollment history + execution log |
| `/outbox-cli:outbox-tool-runs [agent=… tool=…]` | Recent tool executions |

**Resources**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-senders` | List email senders |
| `/outbox-cli:outbox-phones` | List phone numbers |
| `/outbox-cli:outbox-import-contacts <file.csv> [tags]` | Import contacts from a local CSV |

---

## Skills (auto-trigger)

Claude triggers these automatically when you describe what you want — no
need to remember a command name.

| Skill | Triggers on |
|---|---|
| `optimize-agent` | "improve this agent", "calls keep failing", "audit performance" |
| `build-report` | "give me a weekly report", "how did we do this month", "summarize last week" |
| `triage-conversations` | "what needs my attention", "any unread", "anything stuck" |

---

## For agency operators

If your account is an **agency account**, signing in gives you access
to every client company under your agency. Switch between them at any
time:

```
/outbox-cli:outbox-use-client acme
```

The selection persists across Claude Code restarts and is kept per
sign-in, so two teammates in the same agency don't step on each other's
active client.

Agency admins can also manage clients themselves from here: add one with
`/outbox-cli:outbox-new-client` (blank, or copied from a client you've
already built), change a client's limits or plan, and manage client plans
and white-label settings. Just ask.

### Using Codex instead?

The same Outbox server works in OpenAI Codex. See
[Connect to Codex](https://docs.getoutbox.ai/codex-connector).

### Recommended workflow

Keep a folder per client:

```
~/clients/
  acme/
  beta-dental/
  gamma-plumbing/
```

`cd` into a client's folder before launching Claude Code. Use
`/outbox-cli:outbox-use-client` once per folder to set the context;
after that, the client stays active for that session.

---

## Built-in docs lookup

The plugin also wires Claude Code into the official
[Outbox docs](https://docs.getoutbox.ai) via a separate MCP. Ask any
"how do I…" or "what does X mean" question and Claude searches the docs
automatically.

```
> what's the difference between an agency key and a company key?
> how do I set up a voice mailbox?
> what does "concurrent call limit" mean?
```

---

## Sub-agent

`outbox-analyst` is a read-only sub-agent that Claude can spawn for
deep analysis (hundreds of calls, complex pattern detection, etc.)
without filling up the main conversation context. You don't need to
invoke it directly — Claude calls on it when the analysis is heavy
enough to warrant it.

---

## Troubleshooting

### Outbox tools are missing, or calls say "needs authentication"

You're signed out. Run `/mcp`, choose **plugin:outbox-cli:outbox** and
select **Authenticate**.

If sign-in keeps failing, choose **Clear authentication** in the same
menu, then **Authenticate** again. Changing your Outbox password, or
disconnecting the app in **Settings → Claude & Codex**, signs you out too.

### "Plugin not found in any marketplace" on install

Make sure you're using the qualified install syntax:

```
/plugin install outbox-cli@outbox
```

Not just `/plugin install outbox-cli`.

### Slash commands aren't appearing

Run `/reload-plugins` once, then type `/outbox-cli:` and you should see
the full list in the autocomplete picker.

---

## Before anything risky

Deleting things, releasing or buying numbers, bulk SMS/email, launching
email campaigns, enrolling more than 5 contacts and changing a client's
billing don't run straight away. Outbox sends back a summary, Claude asks
you, and it only runs after you say yes.

---

## Privacy and security

- You sign in on an Outbox page in your browser. Your password never goes
  through Claude Code.
- Claude Code holds a token, not your login. It's replaced every hour and
  lasts up to 180 days.
- Claude can do what your Outbox login can do, and no more.
- Disconnect any time from **Outbox → Settings → Claude & Codex**, with
  `/outbox-cli:outbox-sign-out`, or by changing your password.
- Active-client selection is stored server-side per sign-in, so teammates
  sharing an agency don't step on each other's context.
- All traffic goes over HTTPS to the Outbox MCP endpoint. No
  third-party telemetry.

---

## Support

- Docs: [docs.getoutbox.ai](https://docs.getoutbox.ai)
- Email: [support@getoutbox.ai](mailto:support@getoutbox.ai)
- Issues: open a GitHub issue on this repo

---

## Repo layout

```
.
├── .claude-plugin/marketplace.json    ← Claude Code marketplace manifest
├── outbox-cli/                         ← the plugin
│   ├── .claude-plugin/plugin.json
│   ├── commands/                       ← slash commands
│   ├── skills/                         ← auto-trigger skills (outbox-platform holds the operating instructions)
│   └── agents/                         ← sub-agents
└── README.md
```

---

## License

MIT — see `LICENSE`.
