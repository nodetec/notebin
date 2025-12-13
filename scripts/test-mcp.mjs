import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const origin = process.argv[2] || "https://notebin.io";
const mode = process.argv[3] || "sse"; // "sse" or "http"

async function main() {
  let transport;

  if (mode === "http") {
    transport = new StreamableHTTPClientTransport(new URL(`${origin}/mcp`));
    console.log("Connecting via HTTP to", origin + "/mcp");
  } else {
    transport = new SSEClientTransport(new URL(`${origin}/sse`));
    console.log("Connecting via SSE to", origin + "/sse");
  }

  const client = new Client(
    {
      name: "example-client",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: {},
        tools: {},
      },
    }
  );

  await client.connect(transport);

  console.log("Connected", client.getServerCapabilities());

  const result = await client.listTools();
  console.log("Tools:", result);

  // Test fetchCodeSnippets if npub provided
  const npub = process.argv[4];
  if (npub) {
    console.log("\nFetching snippets for:", npub);
    const snippets = await client.callTool({ name: "fetchCodeSnippets", arguments: { npub, limit: 10 } });
    console.log("Snippets:", JSON.stringify(snippets, null, 2));
  }

  client.close();
}

main();