# Guide: Creating Paid Tools

This guide walks you through creating a paid tool from scratch.

## Prerequisites

- Working PaidMCP server (see [quick-start.md](quick-start.md))
- Understanding of the [two-phase payment flow](../adr/001-two-phase-payment.md)

## Quick Reference

```typescript
server.registerPaidTool(
  "tool_name",                    // 1. Unique identifier (snake_case)
  { inputSchema, outputSchema },  // 2. Zod schemas with descriptions
  async (params) => ({ ... }),    // 3. Charge callback → { satoshi, description }
  async (params) => ({ ... })     // 4. Tool callback → { content, structuredContent }
);
```

## Step-by-Step

### 1. Create the Tool File

```typescript
// src/tools/lookup_company.ts
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

export function registerLookupCompanyTool(server: PaidMcpServer) {
  // Tool registration goes here
}
```

### 2. Define the Tool Name

Choose a unique, descriptive `snake_case` name:

```typescript
server.registerPaidTool(
  "lookup_company",  // What the LLM will call
  // ...
);
```

Good names: `get_weather`, `send_email`, `analyze_document`
Bad names: `tool1`, `myTool`, `GetWeather`

### 3. Define Input Schema

Use Zod with `.describe()` on every field:

```typescript
{
  inputSchema: {
    // Required parameter
    company_name: z.string()
      .describe("The company name to look up (e.g., 'Apple', 'Microsoft')"),
    
    // Optional parameter with default behavior
    include_financials: z.boolean()
      .optional()
      .describe("Include financial data. Defaults to false."),
    
    // Enum parameter
    market: z.enum(["us", "eu", "asia"])
      .optional()
      .describe("Stock market region. Defaults to 'us'."),
  },
}
```

**Why `.describe()` matters**: The LLM sees these descriptions to understand how to call your tool. Without them, the LLM guesses—often incorrectly.

### 4. Define Output Schema

Describe what the tool returns:

```typescript
{
  outputSchema: {
    name: z.string().describe("Official company name"),
    ticker: z.string().optional().describe("Stock ticker symbol if public"),
    description: z.string().describe("Brief company description"),
    employees: z.number().optional().describe("Approximate employee count"),
  },
}
```

### 5. Implement Charge Callback

Determines payment amount. Runs BEFORE invoice generation.

```typescript
// Simple fixed pricing
async (params) => ({
  satoshi: 50,
  description: `Company lookup: ${params.company_name}`,
})

// Dynamic pricing based on parameters
async (params) => ({
  satoshi: params.include_financials ? 100 : 50,
  description: `${params.include_financials ? "Full" : "Basic"} lookup: ${params.company_name}`,
})
```

**Pricing tips**:
- 21 sats ≈ $0.02 at $100k/BTC
- Consider your API costs, value delivered
- Start low, adjust based on usage

### 6. Implement Tool Callback

The actual logic. Runs ONLY after payment verification.

```typescript
async (params) => {
  // Call your API / do your logic
  const response = await fetch(
    `https://api.example.com/company/${encodeURIComponent(params.company_name)}`
  );
  
  if (!response.ok) {
    throw new Error(`Company not found: ${params.company_name}`);
  }
  
  const data = await response.json() as CompanyData;
  
  // Build result matching outputSchema
  const result = {
    name: data.officialName,
    ticker: data.stockSymbol || undefined,
    description: data.summary,
    employees: data.employeeCount,
  };
  
  // MUST return both formats
  return {
    content: [
      { type: "text", text: JSON.stringify(result) }
    ],
    structuredContent: result,
  };
}
```

### 7. Register the Tool

Add to your server initialization:

```typescript
// src/mcp_server.ts
import { registerLookupCompanyTool } from "./tools/lookup_company.js";

export function createMcpServer() {
  const server = new PaidMcpServer(...);
  
  registerLookupCompanyTool(server);  // Add this
  
  return server;
}
```

### 8. Test with Inspector

```bash
npm run build
npm run inspect
```

1. Select your tool from the list
2. Enter test parameters
3. Observe invoice generation (Phase 1)
4. Pay the invoice (if testing full flow)
5. Verify the response (Phase 2)

## Complete Example

```typescript
// src/tools/lookup_company.ts
import { z } from "zod";
import { PaidMcpServer } from "@getalby/paidmcp";

export function registerLookupCompanyTool(server: PaidMcpServer) {
  server.registerPaidTool(
    "lookup_company",
    {
      title: "Company Lookup",
      description: "Look up information about a company by name",
      inputSchema: {
        company_name: z.string()
          .describe("The company name to look up"),
        include_financials: z.boolean()
          .optional()
          .describe("Include financial data (costs extra). Default: false"),
      },
      outputSchema: {
        name: z.string().describe("Official company name"),
        ticker: z.string().optional().describe("Stock ticker if public"),
        description: z.string().describe("Company description"),
        market_cap: z.number().optional().describe("Market cap in USD if financials requested"),
      },
    },
    
    // Charge callback
    async (params) => ({
      satoshi: params.include_financials ? 100 : 50,
      description: `Company lookup: ${params.company_name}`,
    }),
    
    // Tool callback
    async (params) => {
      // Simulated API call
      const result = {
        name: params.company_name,
        ticker: "DEMO",
        description: `Information about ${params.company_name}`,
        market_cap: params.include_financials ? 1000000000 : undefined,
      };
      
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      };
    }
  );
}
```

## Common Patterns

### Error Handling

```typescript
async (params) => {
  const response = await fetch(url);
  
  // Throw descriptive errors - server formats them
  if (response.status === 404) {
    throw new Error(`Company not found: ${params.company_name}`);
  }
  if (response.status === 429) {
    throw new Error("Rate limit exceeded. Please try again later.");
  }
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  // ... process response
}
```

### Multiple Content Types

```typescript
return {
  content: [
    { type: "text", text: "Summary: " + summary },
    { type: "text", text: "Details: " + JSON.stringify(details) },
  ],
  structuredContent: { summary, details },
};
```

### Streaming-Friendly Response

For long operations, return progress info:

```typescript
return {
  content: [
    { type: "text", text: `Processed ${items.length} items in ${duration}ms` },
    { type: "text", text: JSON.stringify(results) },
  ],
  structuredContent: { count: items.length, duration, results },
};
```

## Checklist

Before deploying your tool:

- [ ] Tool name is `snake_case`
- [ ] All input fields have `.describe()`
- [ ] Output schema matches actual return structure
- [ ] Charge callback returns `{ satoshi, description }`
- [ ] Tool callback returns `{ content, structuredContent }`
- [ ] Errors are thrown, not returned
- [ ] No `console.log()` (use `console.error()` for debugging)
- [ ] Tested with MCP Inspector
- [ ] Import uses `.js` extension
