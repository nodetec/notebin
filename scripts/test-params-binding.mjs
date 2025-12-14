/**
 * Payment Hash Theft Prevention Test (Interactive)
 *
 * This script:
 * 1. Calls the paid tool to get a Lightning invoice with ORIGINAL params
 * 2. Waits for you to pay the invoice
 * 3. Attempts to use the payment_hash with DIFFERENT params
 * 4. Verifies the theft attempt is BLOCKED (proving params binding works)
 *
 * Run: node scripts/test-params-binding.mjs
 */

import readline from 'readline';
import fs from 'fs';

const LOG_FILE = 'scripts/test-params-binding-results.txt';
const logLines = [];

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:3000/mcp';

// Original params used to generate the invoice
const ORIGINAL_PARAMS = {
  language: 'typescript',
  keyword: 'original-binding-test',
  limit: 10,
};

// Different params that attacker tries to use with stolen payment_hash
const STOLEN_PARAMS = {
  language: 'python',
  keyword: 'stolen-attempt',
  limit: 100,
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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

async function getInvoice(params) {
  console.log('\n📝 Requesting invoice from MCP server...\n');

  const response = await fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'searchSnippetsPremium',
        arguments: params,
      },
      id: 1,
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  const content = JSON.parse(data.result.content[0].text);
  return {
    paymentRequest: content.payment_request,
    paymentHash: content.payment_hash,
    amountSats: content.amount_sats,
  };
}

async function callToolWithHash(paymentHash, params) {
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
            ...params,
            payment_hash: paymentHash,
          },
        },
        id: 1,
      }),
    });

    const data = await response.json();
    const duration = Date.now() - start;

    return {
      success: !data.error,
      error: data.error?.message,
      duration,
      data: data.result,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
      duration: Date.now() - start,
    };
  }
}

async function runParamsBindingTest() {
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║     Payment Hash Theft Prevention Test (Interactive)         ║');
  log('╚══════════════════════════════════════════════════════════════╝');
  log('');
  log(`Timestamp: ${new Date().toISOString()}`);
  log('');

  // Step 1: Get invoice with ORIGINAL params
  log('Step 1: Getting Lightning Invoice with ORIGINAL params');
  log('');
  log('  Original params:');
  log(`    language: "${ORIGINAL_PARAMS.language}"`);
  log(`    keyword:  "${ORIGINAL_PARAMS.keyword}"`);
  log(`    limit:    ${ORIGINAL_PARAMS.limit}`);
  log('');

  const invoice = await getInvoice(ORIGINAL_PARAMS);

  log(`  Amount:        ${invoice.amountSats} sats`);
  log(`  Payment Hash:  ${invoice.paymentHash}`);
  log('');
  log('  ┌─────────────────────────────────────────────────────────────┐');
  log('  │ INVOICE (copy and pay with Lightning wallet):              │');
  log('  └─────────────────────────────────────────────────────────────┘');
  log('');
  console.log(invoice.paymentRequest);  // Full invoice for copying
  log(`  Invoice: ${invoice.paymentRequest}`);
  log('');

  // Step 2: Wait for payment
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  PAY THE INVOICE ABOVE, then press ENTER to continue...      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  await ask('\n  Press ENTER after payment is complete... ');
  log('');
  log('Payment confirmed by user. Starting theft simulation...');
  log('');

  // Step 3: Attempt to use payment_hash with DIFFERENT params (theft attempt)
  log('Step 2: Attempting to use payment_hash with DIFFERENT params');
  log('');
  log('  Stolen params (DIFFERENT from original):');
  log(`    language: "${STOLEN_PARAMS.language}" (was "${ORIGINAL_PARAMS.language}")`);
  log(`    keyword:  "${STOLEN_PARAMS.keyword}" (was "${ORIGINAL_PARAMS.keyword}")`);
  log(`    limit:    ${STOLEN_PARAMS.limit} (was ${ORIGINAL_PARAMS.limit})`);
  log('');
  log('  Simulating attacker using your paid payment_hash...');
  log('');

  const theftResult = await callToolWithHash(invoice.paymentHash, STOLEN_PARAMS);

  log(`  Duration: ${theftResult.duration}ms`);
  log('');

  // Step 4: Analyze theft result
  let theftBlocked = false;

  if (theftResult.success) {
    log('  ❌ THEFT SUCCEEDED - VULNERABILITY EXISTS!');
    log('     The payment_hash was accepted with different params!');
  } else {
    if (theftResult.error?.includes('different parameters')) {
      log('  ✅ THEFT BLOCKED!');
      log(`     Error: "${theftResult.error}"`);
      theftBlocked = true;
    } else {
      log(`  ⚠️  Request failed but not due to params binding:`);
      log(`     Error: "${theftResult.error}"`);
    }
  }
  log('');

  // Step 5: Try with original params (should work if payment was made)
  log('Step 3: Verifying ORIGINAL params still work');
  log('');
  log('  Using payment_hash with the SAME params it was generated for...');
  log('');

  const originalResult = await callToolWithHash(invoice.paymentHash, ORIGINAL_PARAMS);

  log(`  Duration: ${originalResult.duration}ms`);
  log('');

  let originalWorked = false;

  if (originalResult.success) {
    log('  ✅ ORIGINAL PARAMS ACCEPTED!');
    log('     Tool executed successfully with matching params.');
    originalWorked = true;
  } else {
    if (originalResult.error?.includes('different parameters')) {
      log('  ❌ UNEXPECTED: Original params rejected as different!');
      log('     This is a bug in the params hashing logic.');
    } else if (originalResult.error?.includes('already consumed')) {
      log('  ⚠️  Payment hash already consumed.');
      log('     (This is expected if theft attempt somehow succeeded)');
    } else if (originalResult.error?.includes('Payment not received')) {
      log('  ⚠️  Payment not yet confirmed on Lightning network.');
      log('     Wait a moment and try again.');
    } else {
      log(`  ⚠️  Request failed: "${originalResult.error}"`);
    }
  }
  log('');

  // Summary
  log('╔══════════════════════════════════════════════════════════════╗');
  log('║                        SUMMARY                               ║');
  log('╠══════════════════════════════════════════════════════════════╣');
  log('║                                                              ║');

  if (theftBlocked) {
    log('║  🎉 PARAMS BINDING VERIFIED!                                 ║');
    log('║                                                              ║');
    log('║  The theft attempt with different params was BLOCKED.       ║');
    log('║  Payment hashes are correctly bound to their original       ║');
    log('║  request parameters.                                        ║');
  } else if (theftResult.success) {
    log('║  ❌ PARAMS BINDING FAILED!                                   ║');
    log('║                                                              ║');
    log('║  An attacker could steal your payment_hash and use it       ║');
    log('║  with different parameters!                                 ║');
  } else {
    log('║  ⚠️  INCONCLUSIVE                                            ║');
    log('║                                                              ║');
    log('║  Could not determine if params binding is working.          ║');
    log('║  Check the errors above and try again.                      ║');
  }

  log('║                                                              ║');
  log('╠══════════════════════════════════════════════════════════════╣');
  log(`║  Theft attempt (different params): ${theftBlocked ? '✅ BLOCKED' : '❌ ALLOWED'}                  ║`);
  log(`║  Original params:                  ${originalWorked ? '✅ ACCEPTED' : '⚠️  SEE ABOVE'}                  ║`);
  log('╚══════════════════════════════════════════════════════════════╝');
  log('');

  saveLog();
  rl.close();
  process.exit(theftBlocked ? 0 : 1);
}

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
  await runParamsBindingTest();
}

main().catch(err => {
  console.error('\n❌ Test error:', err.message);
  rl.close();
  process.exit(1);
});
