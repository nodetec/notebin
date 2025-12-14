/**
 * EXTREME Race Condition Test
 *
 * Uses Worker Threads to fire requests from multiple parallel processes
 * at the exact same moment using a synchronization barrier.
 *
 * Run: node scripts/test-race-extreme.mjs
 */

import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { fileURLToPath } from 'url';
import readline from 'readline';

const MCP_ENDPOINT = process.env.MCP_ENDPOINT || 'http://localhost:3000/mcp';
const NUM_WORKERS = 20; // 20 parallel workers

// ============================================================================
// WORKER THREAD CODE
// ============================================================================
if (!isMainThread) {
  const { paymentHash, workerId, startTime } = workerData;

  // Busy-wait until start time (synchronization barrier)
  while (Date.now() < startTime) {
    // Spin
  }

  const launchTime = Date.now();

  fetch(MCP_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'searchSnippetsPremium',
        arguments: { keyword: 'extreme-test', payment_hash: paymentHash },
      },
      id: workerId,
    }),
  })
    .then(res => res.json())
    .then(data => {
      parentPort.postMessage({
        workerId,
        success: !data.error,
        error: data.error?.message,
        launchTime,
        endTime: Date.now(),
      });
    })
    .catch(err => {
      parentPort.postMessage({
        workerId,
        success: false,
        error: err.message,
        launchTime,
        endTime: Date.now(),
      });
    });
}

// ============================================================================
// MAIN THREAD CODE
// ============================================================================
if (isMainThread) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function ask(question) {
    return new Promise(resolve => rl.question(question, resolve));
  }

  async function getInvoice() {
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'tools/call',
        params: { name: 'searchSnippetsPremium', arguments: { keyword: 'extreme-test' } },
        id: 0,
      }),
    });
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);
    return JSON.parse(data.result.content[0].text);
  }

  async function main() {
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║    EXTREME Race Condition Test (Worker Threads)              ║');
    console.log('║    ' + NUM_WORKERS + ' parallel workers with sync barrier                     ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    // Check server
    try {
      const health = await fetch(MCP_ENDPOINT).then(r => r.json());
      if (health.redis !== 'connected') throw new Error('Redis not connected');
      console.log('✅ Server running, Redis connected\n');
    } catch (e) {
      console.error('❌ Server not ready:', e.message);
      process.exit(1);
    }

    // Get invoice
    console.log('Step 1: Getting Lightning Invoice...\n');
    const invoice = await getInvoice();
    console.log('  Amount:', invoice.amount_sats, 'sats');
    console.log('  Hash:  ', invoice.payment_hash);
    console.log('\n  Invoice:\n');
    console.log('  ' + invoice.payment_request);

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║  PAY THE INVOICE, then press ENTER                           ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    await ask('\n  Press ENTER after payment... ');

    // Launch workers with synchronized start time
    console.log(`\nStep 2: Launching ${NUM_WORKERS} worker threads...\n`);

    const startTime = Date.now() + 500; // Start 500ms from now (gives workers time to spawn)
    const workers = [];
    const results = [];

    const workerFile = fileURLToPath(import.meta.url);

    for (let i = 1; i <= NUM_WORKERS; i++) {
      const worker = new Worker(workerFile, {
        workerData: {
          paymentHash: invoice.payment_hash,
          workerId: i,
          startTime,
        },
      });

      worker.on('message', msg => {
        results.push(msg);
        if (results.length === NUM_WORKERS) {
          showResults(results, startTime);
        }
      });

      worker.on('error', err => {
        results.push({ workerId: i, success: false, error: err.message });
      });

      workers.push(worker);
      console.log(`  Worker #${i} spawned`);
    }

    console.log(`\n  All workers will fire at exactly: ${new Date(startTime).toISOString()}`);
    console.log('  Waiting for synchronized launch...\n');
  }

  function showResults(results, startTime) {
    console.log('\nStep 3: Results\n');
    console.log('  Worker | Launch Δ | Status  | Duration | Details');
    console.log('  -------|----------|---------|----------|--------');

    results
      .sort((a, b) => a.launchTime - b.launchTime)
      .forEach(r => {
        const launchDelta = r.launchTime - startTime;
        const duration = r.endTime - r.launchTime;
        const status = r.success ? '✅ OK   ' : '❌ BLOCK';
        const detail = r.success ? 'EXECUTED!' : (r.error?.slice(0, 25) || 'Unknown');
        console.log(
          `  #${r.workerId.toString().padEnd(5)} | ${launchDelta >= 0 ? '+' : ''}${launchDelta.toString().padStart(6)}ms | ${status} | ${duration.toString().padStart(6)}ms | ${detail}`
        );
      });

    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;

    // Check launch time spread
    const launchTimes = results.map(r => r.launchTime);
    const minLaunch = Math.min(...launchTimes);
    const maxLaunch = Math.max(...launchTimes);
    const spread = maxLaunch - minLaunch;

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                        SUMMARY                               ║');
    console.log('╠══════════════════════════════════════════════════════════════╣');
    console.log(`║  Workers:              ${NUM_WORKERS.toString().padEnd(36)}║`);
    console.log(`║  Launch time spread:   ${(spread + 'ms').padEnd(36)}║`);
    console.log(`║  ✅ Successes:          ${successes.toString().padEnd(36)}║`);
    console.log(`║  ❌ Blocked:            ${failures.toString().padEnd(36)}║`);
    console.log('╠══════════════════════════════════════════════════════════════╣');

    if (successes === 1 && spread <= 5) {
      console.log('║                                                              ║');
      console.log('║  🎉 EXTREME TEST PASSED!                                     ║');
      console.log('║                                                              ║');
      console.log(`║  ${NUM_WORKERS} workers launched within ${spread}ms - only 1 succeeded!         ║`);
      console.log('║  Redis atomic Lua scripts are bulletproof!                  ║');
      console.log('║                                                              ║');
    } else if (successes === 0) {
      console.log('║  ⚠️  No successes - payment may not be confirmed             ║');
    } else if (successes > 1) {
      console.log('║  ❌ VULNERABILITY: Multiple successes detected!              ║');
    }
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    rl.close();
    process.exit(successes === 1 ? 0 : 1);
  }

  main().catch(err => {
    console.error('Error:', err.message);
    rl.close();
    process.exit(1);
  });
}
