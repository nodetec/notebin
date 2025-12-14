# Notebin

Notebin is a code snippet sharing site similar to pastebin or GitHub gists.

## Features

- **Decentralized** - Snippets stored on Nostr relays, no central server
- **Code Highlighting** - Syntax highlighting for 50+ languages
- **MCP Integration** - LLMs can search and fetch snippets via MCP
- **Lightning Payments** - Premium tools available for 1 sat via NWC

## NIP-C0

This is a reference implementation for [NIP-C0](https://github.com/nostr-protocol/nips/blob/master/C0.md) (Code Snippets).

## MCP Server

Notebin includes an MCP (Model Context Protocol) server that allows LLMs to search and fetch code snippets.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | JSON-RPC endpoint |
| `/mcp` | GET | Health check |
| `/sse` | GET | Server-Sent Events stream |

### Available Tools

**Free Tools:**

| Tool | Description |
|------|-------------|
| `fetchCodeSnippets` | Fetch snippets by npub (supports language/tag filters) |
| `searchSnippets` | Search all snippets by language, tags, or keyword (limit: 50) |

**Paid Tools (Lightning ⚡):**

| Tool | Price | Description |
|------|-------|-------------|
| `searchSnippetsPremium` | 1 sat | Higher limits (500), full content, auto base64 decoding |

### Payment Flow

Paid tools use a two-phase payment flow:

1. **Phase 1**: Call the tool without `payment_hash` → receive a Lightning invoice
2. **Phase 2**: Pay the invoice, then call again with the `payment_hash`

```
LLM → searchSnippetsPremium() → Invoice returned
User pays invoice
LLM → searchSnippetsPremium(payment_hash: "...") → Results returned
```

### Testing MCP

```bash
# Start dev server
npm run dev

# Test via HTTP (in another terminal)
npm run mcp:test http://localhost:3000 http

# Test via SSE
npm run mcp:test http://localhost:3000
```

### Paid Tools Setup (Optional)

To enable paid tools, add your NWC URL to `.env.local`:

```bash
NWC_URL="nostr+walletconnect://..."
```

Get an NWC URL from [Alby](https://getalby.com) → Settings → Wallet Connections → Add Connection.

> **Note**: Without `NWC_URL`, paid tools return an error. Free tools always work.

## Development

### Install Dependencies

```shell
npm install
```

### Run Development Server

```shell
npm run dev
```

### Build for Production

```shell
npm run build
npm run start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NWC_URL` | No | NWC connection string for paid tools |
| `NEXT_PUBLIC_NOSTR_RELAYS` | No | Comma-separated relay URLs (has defaults) |

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Protocol**: Nostr (NIP-C0 for code snippets)
- **Payments**: Bitcoin Lightning via NWC
- **Editor**: CodeMirror
- **UI**: shadcn/ui + Tailwind CSS
