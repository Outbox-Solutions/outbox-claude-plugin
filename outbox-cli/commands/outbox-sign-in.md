---
description: Sign in to Outbox in your browser
---

The plugin signs in through the browser. You can't open the sign-in page
yourself, and you must never ask for or handle the user's password. Your
job is to check whether they're signed in and, if not, tell them the two
clicks that do it.

### Step 1 — check

Call `mcp__outbox__show_client`.

- **It returns 200** — they're already signed in. Say so in one line, with
  the active client if there is one, and stop.
- **The tool doesn't exist, or the call fails with 401 / "needs
  authentication"** — go to Step 2.
- **Any other error** (network, timeout, 5xx) — show the raw error and stop.
  It isn't a sign-in problem.

### Step 2 — tell them how

> To sign in:
> 1. Run `/mcp`
> 2. Choose **plugin:outbox-cli:outbox** and select **Authenticate**
>
> Your browser opens an Outbox sign-in page. Sign in with your Outbox email
> and password there, then come back here. Your password goes to Outbox,
> never into this terminal.
>
> If you normally sign in with Google, set a password first with
> **Forgot password** on the Outbox sign-in page.

When they say they're done, call `mcp__outbox__show_client` again and
confirm in one line. If there's no active client and they have several,
point them at `/outbox-use-client <name>`.

### Guardrails

- Never ask for, accept, or send an email/password, and never POST to any
  login endpoint. If the user pastes a password anyway, tell them not to and
  that it wasn't used.
- If Authenticate keeps failing, suggest: `/mcp` → **outbox** → **Clear
  authentication**, then **Authenticate** again.
