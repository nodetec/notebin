import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

/**
 * Template for registering a paid tool.
 * Copy this file and customize for your use case.
 */
export function registerMyTool(server: PaidMcpServer) {
  server.registerPaidTool(
    // Tool name - unique identifier
    "my_tool_name",

    // Tool configuration
    {
      title: "My Tool",
      description: "Description of what this tool does",
      inputSchema: {
        // Define input parameters with Zod
        requiredParam: z.string().describe("A required string parameter"),
        optionalParam: z.number().optional().describe("An optional number"),
      },
      outputSchema: {
        // Define output structure with Zod
        result: z.string().describe("The result of the operation"),
        metadata: z.object({
          timestamp: z.string(),
        }).optional(),
      },
    },

    // Charge callback - determines payment amount
    async (params) => ({
      satoshi: 21, // Amount in satoshis
      description: `Tool usage: ${params.requiredParam}`,
    }),

    // Tool callback - executes after payment verified
    async (params) => {
      // Your tool logic here
      const result = {
        result: `Processed: ${params.requiredParam}`,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      // Return MCP-compatible response
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
        structuredContent: result,
      };
    }
  );
}
