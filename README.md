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
- [Node.js](https://nodejs.org) v18 or later (the plugin uses a small
  Node shim to bridge to the hosted MCP — `npx` ships with Node)
- An [Outbox](https://getoutbox.ai) account (agency or company)
- macOS, Linux, or Windows (WSL)

---

## Install (under 2 minutes)

In Claude Code, run these three commands:

```
/plugin marketplace add Outbox-Solutions/outbox-claude-plugin
/plugin install outbox-cli@outbox
/outbox-cli:outbox-setup
```

The first run downloads `mcp-remote` via `npx` (~5 seconds) and walks
you through:

1. **Sign in** — paste your Outbox email and password (sent once to the
   login endpoint, never stored locally)
2. **Pick a client** — if you're an agency operator, choose which
   client to start in
3. **Quick tour** — 30 seconds on the most useful commands

That's it. The plugin saves a session token to `~/.outbox/credentials.json`
and you're done. **No Claude Code restart needed.**

> Your password is sent **once** to the Outbox login endpoint and never
> stored locally. What gets saved is a long-lived but revocable session
> token — revoke it anytime from **Outbox → Settings → Active Sessions**
> or by running `/outbox-cli:outbox-sign-out`.

### Already installed and just need to sign in?

```
/outbox-cli:outbox-sign-in
/reload-plugins
```

The reload picks up the new token without needing a Claude Code restart.

---

## Slash commands

All commands are namespaced under `/outbox-cli:` to avoid collisions
with Claude Code built-ins or other plugins.

**Auth + context**

| Command | What it does |
|---|---|
| `/outbox-cli:outbox-setup` | First-run guided setup — sign in, pick a client, quick tour |
| `/outbox-cli:outbox-sign-in` | Sign in with email + password |
| `/outbox-cli:outbox-sign-out` | Revoke the current session token |
| `/outbox-cli:outbox-whoami` | Show current context — active client, agency, auth source |
| `/outbox-cli:outbox-clients` | List every client your account can access |
| `/outbox-cli:outbox-use-client <name>` | Switch the active client |

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

The selection persists across Claude Code restarts and is keyed to your
session token (so two teammates in the same agency don't step on each
other's active client).

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

### "You're not signed in" after `/outbox-cli:outbox-sign-in`

Run `/reload-plugins`. The plugin needs to re-spawn its MCP shim to
pick up the new token from `~/.outbox/credentials.json`.

If that doesn't fix it, check the file is there and readable:

```bash
cat ~/.outbox/credentials.json
```

You should see a JSON object with a `token` field starting with
`obx_pls_`.

### "Plugin not found in any marketplace" on install

Make sure you're using the qualified install syntax:

```
/plugin install outbox-cli@outbox
```

Not just `/plugin install outbox-cli`.

### MCP shows ✘ failed in `/mcp`

Two common causes:

- **Node.js isn't installed.** Run `node --version` in your terminal.
  If it errors, install Node 18+ from [nodejs.org](https://nodejs.org).
- **First-run download is still in progress.** The shim downloads
  `mcp-remote` via `npx` on the first launch; give it ~10 seconds and
  try `/reload-plugins`.

### Slash commands aren't appearing

Run `/reload-plugins` once, then type `/outbox-cli:` and you should see
the full list in the autocomplete picker.

### "Token is invalid" or 401 errors

Your session was revoked or expired (180-day max lifetime). Run
`/outbox-cli:outbox-sign-in` again to issue a fresh one.

---

## Privacy and security

- Your password is sent **once** to Outbox during `/outbox-cli:outbox-sign-in`
  and never stored locally.
- The session token is stored in `~/.outbox/credentials.json` (mode 600,
  readable only by you) and optionally in `OUTBOX_TOKEN` in your shell
  profile as a backup.
- Tokens can be revoked anytime from **Outbox → Settings → Active
  Sessions** or via `/outbox-cli:outbox-sign-out`.
- The hosted MCP exchanges your session token for a short-lived JWT on
  every call, so a leaked token can be cut off immediately by
  revocation — no waiting for a long-lived JWT to expire.
- Active-client selection is stored server-side and keyed to your
  session token, so teammates sharing an agency don't step on each
  other's context.
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
│   ├── CLAUDE.md                       ← operating instructions for Claude
│   ├── commands/                       ← slash commands
│   ├── skills/                         ← auto-trigger skills
│   ├── agents/                         ← sub-agents
│   └── helpers/
│       └── mcp-shim.js                 ← stdio MCP bridge (reads token from ~/.outbox/credentials.json)
└── README.md
```

---

## License

MIT — see `LICENSE`.
