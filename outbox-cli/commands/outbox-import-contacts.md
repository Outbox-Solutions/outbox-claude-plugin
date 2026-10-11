---
description: Import contacts from a local CSV into the active client
argument-hint: <path/to/contacts.csv> [tag ...]
---

Import contacts from a CSV on the user's machine into the **active client**.

### Pre-flight

1. `mcp__outbox__show_client` — stop if no active client, and name the
   client you're importing into.
2. `$ARGUMENTS` should start with a file path. If it's missing, ask for it.
   Anything after the path is tags to add to every imported contact.

### Step 1 — read and map

Read the file with the Read tool. Show the header row and the first 3 rows.

Map our fields to their columns. Our fields:

| Field | Notes |
|---|---|
| `fullName` *or* `firstName` + `lastName` | One of these is required per row |
| `email` | |
| `phone` | Any format; it's normalised |
| `businessName`, `website`, `leadSource` | Optional |
| `tags` | A column of comma-separated tags |
| `custom_<field name>` | A client custom field |

Propose the mapping as a small table and ask the user to confirm or fix it.
Only map columns that exist in the file.

### Step 2 — import

Send the file's text as-is, up to about 500 rows per call. Split bigger
files by rows, repeating the header in each chunk. Every row passes through
the conversation, so for files over a few thousand rows suggest the
dashboard's **Contacts → Import** instead.

```
mcp__outbox__run_operation operation="contacts.import" body={
  "csv_text": "<the CSV text>",
  "fieldMapping": {"fullName": "Name", "email": "Email", "phone": "Mobile"},
  "selectedTags": ["<tags from $ARGUMENTS>"]
}
```

The import runs in the background. Report: rows sent, the client, and the
tags applied. Tell them rows without a name are skipped, and that they can
check the result with *"how many contacts were added today?"*.

### Guardrails

- Don't invent columns, and don't send columns the user didn't map.
- Importing doesn't contact anyone. Enrolling them in a workflow is a
  separate step (`/outbox-campaign`).
