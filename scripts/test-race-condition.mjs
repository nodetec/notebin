/**
 * TOCTOU Race Condition Test (Interactive)
 *
 * This script:
 * 1. Calls the paid tool to get a Lightning invoice
 * 2. Waits for you to pay the invoice
 * 3. Fires N concurrent requests with the same payment_hash
 * 4. Verifies only ONE succeeds (proving TOCTOU fix works)
 *
 * Run: node scripts/test-race-condition.mjs
 * Results saved to: scripts/test-results.txt
 */

import readline from 'readline';
import fs from 'fs';

const LOG_FILE = 'scripts/test-results.txt';
const logLines = [];

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:3000/mcp';
const CONCURRENT_REQUESTS = 10;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Log to console AND file
function log(msg = '') {
  console.log(msg);
  logLines.push(msg);
}

function saveLog() {
  fs.writeFileSync(LOG_FILE, logLines.join('\n'), 'utf8');
  console.log(`\n📄 Results saved to: ${LOG_FILE}`);
}

function ask(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function getInvoice() {
  console.log('\n📝 Requesting invoice from MCP server...\n');

  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'searchSnippetsPremium',
        arguments: { keyword: 'race-test' },
      },
      id: 1,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  // Parse the response
  const content = JSON.parse(data.result.content[0].text);
  return {
    paymentRequest: content.payment_request,
    paymentHash: content.payment_hash,
    amountSats: content.amount_sats,
  };
}

async function callToolWithHash(paymentHash, requestId) {
  const start = Date.now();

  try {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'searchSnippetsPremium',
          arguments: {
            keyword: 'race-test',
            payment_hash: paymentHash,
          },
        },
        id: requestId,
      }),
    });

    const data = await response.json();
    const duration = Date.now() - start;

    return {
      requestId,
      success: !data.error,
      error: data.error?.message,
      duration,
    };
  } catch (err) {
    return {
      requestId,
      success: false,
      error: err.message,
      duration: Date.now() - start,
    };
  }
}

async function runRaceTest() {
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║       TOCTOU Race Condition Test (Interactive)               ║');
  log('╚══════════════════════════════════════════════════════════════╝');
  log('');
  log(`Timestamp: ${new Date().toISOString()}`);
  log('');

  // Step 1: Get invoice
  log('Step 1: Getting Lightning Invoice');
  log('');
  const invoice = await getInvoice();

  log(`  Amount:        ${invoice.amountSats} sats`);
  log(`  Payment Hash:  ${invoice.paymentHash}`);
  log('');
  log('  ┌─────────────────────────────────────────────────────────────┐');
  log('  │ INVOICE (copy and pay):                                     │');
  log('  └─────────────────────────────────────────────────────────────┘');
  log('');
  console.log(invoice.paymentRequest);  // Full invoice to console for copying
  log(`  Invoice: ${invoice.paymentRequest}`);  // Also to log file
  log('');

  // Step 2: Wait for payment
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  PAY THE INVOICE ABOVE, then press ENTER to continue...      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  await ask('\n  Press ENTER after payment is complete... ');
  log('');
  log('Payment confirmed by user. Starting concurrent test...');
  log('');

  // Step 3: Fire concurrent requests
  log(`Step 2: Firing ${CONCURRENT_REQUESTS} CONCURRENT requests with same payment_hash`);
  log('');
  log(`  Payment Hash: ${invoice.paymentHash.slice(0, 20)}...`);
  log('  Starting concurrent attack simulation...');
  log('');

  const startTime = Date.now();

  // Fire all requests SIMULTANEOUSLY
  const promises = [];
  const startSignal = Date.now();

  for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
    promises.push(
      new Promise(resolve => {
        setImmediate(() => {
          const launchTime = Date.now() - startSignal;
          log(`  → Request #${i + 1} launched at +${launchTime}ms`);
          callToolWithHash(invoice.paymentHash, i + 1).then(result => {
            resolve({ ...result, launchTime });
          });
        });
      })
    );
  }

  const results = await Promise.all(promises);
  const totalTime = Date.now() - startTime;

  // Step 4: Analyze results
  log('');
  log('Step 3: Results');
  log('');
  log('  Request | Launch | Status  | Duration | Details');
  log('  --------|--------|---------|----------|--------------------------------');

  results
    .sort((a, b) => a.duration - b.duration)
    .forEach(r => {
      const status = r.success ? '✅ OK   ' : '❌ BLOCK';
      const detail = r.success
        ? 'TOOL EXECUTED SUCCESSFULLY!'
        : (r.error || 'Unknown error');
      log(
        `  #${r.requestId.toString().padEnd(6)} | +${(r.launchTime || 0).toString().padStart(4)}ms | ${status} | ${r.duration.toString().padStart(6)}ms | ${detail}`
      );
    });

  // Summary
  const successes = results.filter(r => r.success).length;
  const failures = results.filter(r => !r.success).length;

  log('');
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║                        SUMMARY                               ║');
  log('╠══════════════════════════════════════════════════════════════╣');
  log(`║  Concurrent requests:  ${CONCURRENT_REQUESTS.toString().padEnd(36)}║`);
  log(`║  Total time:           ${(totalTime + 'ms').padEnd(36)}║`);
  log(`║  ✅ Successes:          ${successes.toString().padEnd(36)}║`);
  log(`║  ❌ Blocked:            ${failures.toString().padEnd(36)}║`);
  log('╠══════════════════════════════════════════════════════════════╣');

  if (successes === 1) {
    log('║                                                              ║');
    log('║  🎉 TOCTOU FIX VERIFIED!                                     ║');
    log('║                                                              ║');
    log('║  Only 1 of 10 concurrent requests succeeded.                ║');
    log('║  The atomic Lua script prevented 9 double-spend attempts!   ║');
    log('║                                                              ║');
  } else if (successes === 0) {
    log('║                                                              ║');
    log('║  ⚠️  NO SUCCESSES                                            ║');
    log('║  Payment may not have been confirmed yet. Try again.        ║');
    log('║                                                              ║');
  } else {
    log('║                                                              ║');
    log('║  ❌ TOCTOU VULNERABILITY DETECTED!                           ║');
    log('║                                                              ║');
    log(`║  ${successes} requests succeeded with the same payment!            ║`);
    log('║  This means the race condition fix is NOT working.          ║');
    log('║                                                              ║');
  }
  log('╚══════════════════════════════════════════════════════════════╝');
  log('');

  // Save to file
  saveLog();

  rl.close();
  process.exit(successes === 1 ? 0 : 1);
}

// Check server
async function checkServer() {
  try {
    const res = await fetch(MCP_ENDPOINT);
    const data = await res.json();
    return data.redis === 'connected';
  } catch {
    return false;
  }
}

async function main() {
  console.log('\nChecking server...');
  const serverUp = await checkServer();

  if (!serverUp) {
    console.error('\n❌ Server not running or Redis not connected');
    console.error('   Start with: npm run dev');
    console.error('   Endpoint:', MCP_ENDPOINT);
    rl.close();
    process.exit(1);
  }

  console.log('✅ Server running, Redis connected\n');
  await runRaceTest();
}

main().catch(err => {
  console.error('\n❌ Test error:', err.message);
  rl.close();
  process.exit(1);
});
