#!/usr/bin/env node
/**
 * Test script for PaidMCP HTTP server.
 *
 * Usage:
 *   1. Start server: node scripts/paid-mcp-http.mjs
 *   2. Run tests: node scripts/test-paid-mcp.mjs
 *
 * Tests the two-phase payment flow:
 *   Phase 1: Call tool without payment_hash → get invoice
 *   Phase 2: (Manual) Pay invoice, then call with payment_hash
 */

const BASE_URL = process.argv[2] || "http://localhost:3001";

async function mcpRequest(method, params = {}, id = 1) {
  const response = await fetch(`${BASE_URL}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method,
      params,
      id,
    }),
  });

  const data = await response.json();
  return data;
}

async function testListTools() {
  console.log("=== Test: List Tools ===");
  const result = await mcpRequest("tools/list");

  if (result.error) {
    console.error("Error:", result.error);
    return false;
  }

  console.log("Available tools:");
  for (const tool of result.result?.tools || []) {
    console.log(`  - ${tool.name}: ${tool.description}`);
  }
  console.log("");
  return true;
}

async function testPaidToolPhase1() {
  console.log("=== Test: Call Paid Tool (Phase 1 - Get Invoice) ===");

  const result = await mcpRequest("tools/call", {
    name: "echo_paid",
    arguments: {
      message: "Hello, PaidMCP!",
    },
  });

  if (result.error) {
    console.error("Error:", result.error);
    return null;
  }

  // Parse the response to get payment info
  const content = result.result?.content?.[0]?.text;
  if (!content) {
    console.error("No content in response");
    return null;
  }

  try {
    const parsed = JSON.parse(content);

    if (parsed.payment_request) {
      console.log("✓ Invoice generated!");
      console.log("");
      console.log("Payment Info:");
      console.log(`  payment_hash: ${parsed.payment_hash}`);
      console.log(`  payment_request: ${parsed.payment_request.slice(0, 50)}...`);
      console.log("");
      console.log("Instructions:");
      console.log(parsed.payment_instructions);
      console.log("");
      return parsed;
    } else {
      // Tool executed without payment (shouldn't happen)
      console.log("Tool executed:", parsed);
      return null;
    }
  } catch (e) {
    console.log("Response:", content);
    return null;
  }
}

async function testPaidToolPhase2(paymentHash) {
  console.log("=== Test: Call Paid Tool (Phase 2 - With Payment Hash) ===");

  const result = await mcpRequest("tools/call", {
    name: "echo_paid",
    arguments: {
      message: "Hello, PaidMCP!",
      payment_hash: paymentHash,
    },
  });

  if (result.error) {
    console.error("Error:", result.error);
    return false;
  }

  const content = result.result?.content?.[0]?.text;
  console.log("Response:", content);
  return true;
}

async function testDynamicPricing() {
  console.log("=== Test: Dynamic Pricing (random_number) ===");

  // Request 5 numbers - should cost 5 sats
  const result = await mcpRequest("tools/call", {
    name: "random_number",
    arguments: {
      count: 5,
      min: 1,
      max: 100,
    },
  });

  if (result.error) {
    console.error("Error:", result.error);
    return;
  }

  const content = result.result?.content?.[0]?.text;
  try {
    const parsed = JSON.parse(content);
    if (parsed.payment_request) {
      console.log("✓ Invoice generated for 5 sats (1 sat per number)");
      console.log(`  payment_hash: ${parsed.payment_hash}`);
    }
  } catch (e) {
    console.log("Response:", content);
  }
  console.log("");
}

async function main() {
  console.log(`Testing PaidMCP at ${BASE_URL}`);
  console.log("=".repeat(50));
  console.log("");

  // Check health
  try {
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const health = await healthResponse.json();
    console.log("Server health:", health);
    console.log("");
  } catch (e) {
    console.error(`Cannot connect to ${BASE_URL}`);
    console.error("Make sure the server is running: node scripts/paid-mcp-http.mjs");
    process.exit(1);
  }

  // Test 1: List tools
  const toolsOk = await testListTools();
  if (!toolsOk) {
    console.error("Failed to list tools");
    process.exit(1);
  }

  // Test 2: Call paid tool (Phase 1 - get invoice)
  const paymentInfo = await testPaidToolPhase1();
  if (!paymentInfo) {
    console.error("Failed to get invoice");
    process.exit(1);
  }

  // Test 3: Dynamic pricing
  await testDynamicPricing();

  // Instructions for Phase 2
  console.log("=".repeat(50));
  console.log("NEXT STEPS:");
  console.log("=".repeat(50));
  console.log("");
  console.log("1. Pay the invoice using a Lightning wallet");
  console.log("");
  console.log("2. Then run this command to complete Phase 2:");
  console.log(`   node scripts/test-paid-mcp.mjs ${BASE_URL} --phase2 ${paymentInfo.payment_hash}`);
  console.log("");
  console.log("Or test with curl:");
  console.log(`   curl -X POST ${BASE_URL}/mcp \\`);
  console.log('     -H "Content-Type: application/json" \\');
  console.log(`     -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"echo_paid","arguments":{"message":"test","payment_hash":"${paymentInfo.payment_hash}"}},"id":1}'`);
}

// Handle --phase2 flag
if (process.argv.includes("--phase2")) {
  const hashIndex = process.argv.indexOf("--phase2") + 1;
  const paymentHash = process.argv[hashIndex];
  if (!paymentHash) {
    console.error("Usage: node scripts/test-paid-mcp.mjs --phase2 <payment_hash>");
    process.exit(1);
  }
  testPaidToolPhase2(paymentHash).catch(console.error);
} else {
  main().catch(console.error);
}
