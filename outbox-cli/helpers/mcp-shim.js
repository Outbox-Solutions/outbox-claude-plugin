#!/usr/bin/env node
//
// Outbox MCP stdio shim.
//
// Why this exists:
//   Claude Code's HTTP MCP transport accepts a `headers` block in
//   plugin.json BUT (a) `${VAR}` interpolation is broken (issue #6204),
//   and (b) the `headersHelper` workaround isn't actually invoked in
//   v2.1.112. Both paths leave us unable to send a per-user Authorization
//   header without hardcoding a token in plugin.json.
//
// What this does:
//   This stdio shim is launched by Claude Code on plugin start and
//   /reload-plugins. It reads the user's current token from
//   ~/.outbox/credentials.json (written by /outbox-cli:outbox-sign-in),
//   then execs `npx mcp-remote` which acts as the actual stdio<->HTTP
//   bridge to the hosted Outbox MCP at api.theaiagentshub.com/mcp.
//
//   Token is read fresh on every MCP spawn — so a fresh /sign-in followed
//   by /reload-plugins is enough to swap sessions; no Claude Code restart
//   required.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

const REMOTE_URL = 'https://api.theaiagentshub.com/mcp';
const CREDENTIALS_PATH = path.join(os.homedir(), '.outbox', 'credentials.json');

function readToken() {
  // Prefer the credentials file (always reflects the latest /sign-in).
  try {
    const data = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    if (typeof data.token === 'string' && data.token) return data.token;
  } catch (_) {
    // missing or unreadable — fall through to env
  }
  return (process.env.OUTBOX_TOKEN || '').trim() || null;
}

const token = readToken();
if (!token) {
  // No token available. Print a clean error to stderr; Claude Code surfaces
  // this when the MCP fails to connect, prompting the user to /sign-in.
  process.stderr.write(
    '[outbox-cli] No Outbox token found. Run /outbox-cli:outbox-sign-in to authenticate.\n'
  );
  process.exit(1);
}

// Forward stdio to mcp-remote, which speaks stdio MCP on its standard
// streams and bridges to streamable-http on the wire.
const child = spawn(
  'npx',
  [
    '-y',
    'mcp-remote@latest',
    REMOTE_URL,
    '--header',
    `Authorization:Bearer ${token}`,
  ],
  { stdio: 'inherit' }
);

child.on('error', (err) => {
  process.stderr.write(`[outbox-cli] Failed to spawn mcp-remote: ${err.message}\n`);
  process.exit(1);
});
child.on('exit', (code) => process.exit(code ?? 1));
