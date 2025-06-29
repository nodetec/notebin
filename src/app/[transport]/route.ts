import { createMcpHandler } from "@vercel/mcp-adapter";
import { z } from "zod";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "test",
      "test tool",
      {
        test: z.string(),
      },
       async ({ test }) => ({
        content: [
          {
            type: "text",
            text: `test tool ${test}`,
          },
        ],
      })
    );
  },
  {
    capabilities: {
      tools: {
        test: {
          description: "test tool",
          parameters: {
            type: "object",
            properties: {
              test: { type: "string" },
            },
          },
        },
      },
    },
  },
  {
    redisUrl: process.env.REDIS_URL,
    sseEndpoint: "/sse",
    streamableHttpEndpoint: "/mcp",
    verboseLogs: true,
    maxDuration: 60,
  }
);
