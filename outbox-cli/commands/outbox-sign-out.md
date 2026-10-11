---
description: Sign out of Outbox, or disconnect another device
---

There are two kinds of sign-out. Ask which one only if it isn't obvious.

### Sign out of this Claude Code

Tell the user:

> Run `/mcp`, choose **plugin:outbox-cli:outbox** and select **Clear
> authentication**. Outbox tools stop working here until you
> **Authenticate** again.

### Disconnect another device or app

1. Call `mcp__outbox__run_operation operation="plugin_sessions.list"`.
2. Show a compact table: app (`label`), kind, last used, connected — newest
   first. Mark nothing as "this one"; you can't tell which row is this
   session.
3. When they pick one, call `mcp__outbox__run_operation
   operation="plugin_sessions.revoke" path_params={"session_id": "<id>"}`.
   It comes back with `needs_confirmation` and a `confirm_token`. Tell them
   which app will be disconnected, wait for a yes, then repeat the call with
   the same arguments plus `confirm_token`.

If they revoke the session this Claude Code is using, the next tool call
fails; they sign in again with `/outbox-sign-in`.

Changing the Outbox password also disconnects every app. They can also
manage connections in the dashboard under **Settings → Claude & Codex**.
