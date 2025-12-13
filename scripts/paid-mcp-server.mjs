#!/usr/bin/env node
/**
 * Standalone PaidMCP server for testing.
 * Run with: node scripts/paid-mcp-server.mjs
 *
 * Requires NWC_URL environment variable.
 * Test with MCP Inspector: npx @modelcontextprotocol/inspector node scripts/paid-mcp-server.mjs
 */

import { PaidMcpServer, MemoryStorage } from "@getalby/paidmcp";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Load .env.local if exists
import { config } from "dotenv";
config({ path: ".env.local" });

const storage = new MemoryStorage();

function createServer() {
  const nwcUrl = process.env.NWC_URL;

  if (!nwcUrl) {
    console.error("ERROR: NWC_URL environment variable is required");
    console.error("");
    console.error("To get an NWC URL:");
    console.error("1. Go to https://getalby.com");
    console.error("2. Settings → Wallet Connections → Add Connection");
    console.error("3. Copy the connection string (starts with nostr+walletconnect://)");
    console.error("4. Add to .env.local: NWC_URL=\"nostr+walletconnect://...\"");
    process.exit(1);
  }

  const server = new PaidMcpServer(
    {
      name: "notebin-paid-test",
      version: "1.0.0",
    },
    { nwcUrl, storage }
  );

  // Test tool: Echo with payment
  server.registerPaidTool(
    "echo_paid",
    {
      title: "Paid Echo",
      description: "Echoes your message back (costs 1 sat)",
      inputSchema: {
        message: z.string().describe("The message to echo"),
      },
      outputSchema: {
        echo: z.string().describe("The echoed message"),
        timestamp: z.string().describe("When the echo was processed"),
      },
    },
    // Charge callback
    async (params) => ({
      satoshi: 1,
      description: `Echo: "${params.message.slice(0, 20)}..."`,
    }),
    // Tool callback - runs after payment
    async (params) => {
      const result = {
        echo: params.message,
        timestamp: new Date().toISOString(),
      };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  // Test tool: Random number with dynamic pricing
  server.registerPaidTool(
    "random_number",
    {
      title: "Random Number Generator",
      description: "Generates random numbers (costs 1 sat per number)",
      inputSchema: {
        count: z.number().min(1).max(100).default(1).describe("How many random numbers to generate (1-100)"),
        min: z.number().default(1).describe("Minimum value"),
        max: z.number().default(100).describe("Maximum value"),
      },
      outputSchema: {
        numbers: z.array(z.number()).describe("Generated random numbers"),
        count: z.number().describe("How many numbers were generated"),
      },
    },
    // Dynamic pricing based on count
    async (params) => ({
      satoshi: params.count,
      description: `Generate ${params.count} random number(s)`,
    }),
    async (params) => {
      const numbers = Array.from({ length: params.count }, () =>
        Math.floor(Math.random() * (params.max - params.min + 1)) + params.min
      );
      const result = { numbers, count: params.count };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    }
  );

  return server;
}

async function main() {
  // Use stderr for logging (STDIO mode uses stdout for protocol)
  console.error("Starting PaidMCP test server...");
  // SECURITY: Never log the actual NWC_URL - it contains wallet secrets
  console.error("NWC_URL:", process.env.NWC_URL ? "✓ Set (hidden)" : "✗ Missing");

  const server = createServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("Server connected. Use MCP Inspector to test.");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
