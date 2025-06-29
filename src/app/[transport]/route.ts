import { createMcpHandler } from "@vercel/mcp-adapter";
import { type Filter, nip19, SimplePool } from "nostr-tools";
import { z } from "zod";
import { DEFAULT_RELAYS } from "~/lib/constants";

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "fetchCodeSnippets",
      "Fetch code snippets from Notebin",
      {
        npub: z.string(),
        limit: z.number().default(100),
        language: z.string().optional(),
        tags: z.array(z.string()).optional(),
      },
      async ({ npub, limit, language, tags }) => {
        try {
          const publicKey = nip19.decode(npub).data as string;

          const pool = new SimplePool();

          const filter: Filter = {
            kinds: [1337],
            limit: limit,
            authors: [publicKey],
          };

          if (language) {
            filter["#l"] = [language];
          }

          if (tags) {
            filter["#t"] = tags;
          }

          const events = await pool.querySync(DEFAULT_RELAYS, filter);

          pool.close(DEFAULT_RELAYS);

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(events, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            content: [
              {
                type: "text",
                text: `Error fetching snippets: ${
                  error instanceof Error ? error.message : String(error)
                }`,
              },
            ],
          };
        }
      },
    );
  },
  {
    capabilities: {
      tools: {
        fetchCodeSnippets: {
          description: "Fetch code snippets from Notebin",
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
  },
);

export { handler as GET, handler as POST, handler as DELETE };
