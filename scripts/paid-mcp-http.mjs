#!/usr/bin/env node
/**
 * HTTP PaidMCP server for testing.
 * Run with: node scripts/paid-mcp-http.mjs
 *
 * Test with curl:
 *   curl -X POST http://localhost:3001/mcp \
 *     -H "Content-Type: application/json" \
 *     -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'
 */

import { PaidMcpServer, MemoryStorage } from "@getalby/paidmcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { z } from "zod";

// Load .env.local if exists
import { config } from "dotenv";
config({ path: ".env.local" });

const storage = new MemoryStorage();
const PORT = process.env.PORT || 3001;

function createServer() {
  const nwcUrl = process.env.NWC_URL;

  if (!nwcUrl) {
    console.error("ERROR: NWC_URL environment variable is required");
    console.error("");
    console.error("To get an NWC URL:");
    console.error("1. Go to https://getalby.com");
    console.error("2. Settings → Wallet Connections → Add Connection");
    console.error("3. Copy the connection string");
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
    async (params) => ({
      satoshi: 1,
      description: `Echo: "${params.message.slice(0, 20)}..."`,
    }),
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
        count: z.number().min(1).max(100).default(1).describe("How many random numbers (1-100)"),
        min: z.number().default(1).describe("Minimum value"),
        max: z.number().default(100).describe("Maximum value"),
      },
      outputSchema: {
        numbers: z.array(z.number()).describe("Generated random numbers"),
        count: z.number().describe("How many numbers were generated"),
      },
    },
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

const app = express();
app.use(express.json());

// Health check - SECURITY: only expose boolean, never the actual URL
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    nwc_configured: !!process.env.NWC_URL,
    // Never expose: process.env.NWC_URL, process.env.REDIS_URL
  });
});

// MCP endpoint
app.post("/mcp", async (req, res) => {
  try {
    const server = createServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: error.message || "Internal server error" },
        id: null,
      });
    }
  }
});

app.listen(PORT, () => {
  console.log(`PaidMCP HTTP server running on http://localhost:${PORT}`);
  // SECURITY: Never log the actual NWC_URL - it contains wallet secrets
  console.log(`NWC_URL: ${process.env.NWC_URL ? "✓ Set (hidden)" : "✗ Missing"}`);
  console.log("");
  console.log("Test commands:");
  console.log(`  curl http://localhost:${PORT}/health`);
  console.log(`  curl -X POST http://localhost:${PORT}/mcp -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}'`);
});
