---
description: List email senders configured for the active client
---

`mcp__outbox__show_client` — abort if no active client.

Pull email senders:

```
mcp__outbox__jarvis_query tool_name="list_email_senders" args={}
```

Render compactly:

| Name | Email | Status | Domain verified |

Mark the default sender (if any) with `→`.

End with one short tip if any sender is unverified or paused:

> Sender `<name>` is `<status>`. Configure in **Outbox → Settings →
> Email Senders** before using it in a campaign.
