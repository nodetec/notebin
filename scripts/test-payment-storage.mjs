/**
 * Test script for Redis Payment Storage
 * Run: node scripts/test-payment-storage.mjs
 */

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Lua scripts (same as in redis.ts)
const CLAIM_SCRIPT = `
  local key = KEYS[1]
  local now = tonumber(ARGV[1])
  local stale_timeout = tonumber(ARGV[2])
  local ttl = tonumber(ARGV[3])

  local state = redis.call('HGET', key, 'state')

  if state == 'VALID' then
    redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
    redis.call('EXPIRE', key, ttl)
    return 1
  end

  if state == 'PROCESSING' then
    local started = tonumber(redis.call('HGET', key, 'processingStarted') or '0')
    if (now - started) > stale_timeout then
      redis.call('HSET', key, 'state', 'PROCESSING', 'processingStarted', now)
      redis.call('EXPIRE', key, ttl)
      return 1
    end
  end

  return 0
`;

const RELEASE_SCRIPT = `
  local key = KEYS[1]
  local ttl = tonumber(ARGV[1])

  local state = redis.call('HGET', key, 'state')
  if state == 'PROCESSING' then
    redis.call('HSET', key, 'state', 'VALID')
    redis.call('HDEL', key, 'processingStarted')
    redis.call('EXPIRE', key, ttl)
    return 1
  end
  return 0
`;

const testHash = 'test_payment_' + Date.now();
const key = 'payment:' + testHash;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.log(`  ✗ ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        TOCTOU Fix - Redis Payment Storage Tests              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // Test 0: Redis connection
  console.log('Test 0: Redis Connection');
  try {
    const pong = await redis.ping();
    assert(pong === 'PONG', 'Redis connected');
  } catch (err) {
    assert(false, `Redis connection failed: ${err.message}`);
    await redis.quit();
    process.exit(1);
  }

  // Test 1: Set VALID
  console.log('\nTest 1: Create Payment Hash (VALID state)');
  await redis.hset(key, {
    state: 'VALID',
    toolName: 'searchSnippetsPremium',
    paramsHash: 'abc123',
    created: Date.now().toString(),
  });
  await redis.expire(key, 3600);
  const state1 = await redis.hget(key, 'state');
  assert(state1 === 'VALID', `State is VALID (got: ${state1})`);

  // Test 2: Atomic claim (VALID → PROCESSING)
  console.log('\nTest 2: Atomic Claim (VALID → PROCESSING)');
  const claimed1 = await redis.eval(CLAIM_SCRIPT, 1, key, Date.now(), 30000, 3600);
  const state2 = await redis.hget(key, 'state');
  assert(claimed1 === 1, `Claim succeeded (returned: ${claimed1})`);
  assert(state2 === 'PROCESSING', `State is PROCESSING (got: ${state2})`);

  // Test 3: Second claim should FAIL (TOCTOU prevention!)
  console.log('\nTest 3: Race Condition Prevention (second claim fails)');
  const claimed2 = await redis.eval(CLAIM_SCRIPT, 1, key, Date.now(), 30000, 3600);
  assert(claimed2 === 0, `Second claim blocked (returned: ${claimed2})`);
  console.log('  → TOCTOU race condition PREVENTED!');

  // Test 4: Release back (PROCESSING → VALID)
  console.log('\nTest 4: Release Back (PROCESSING → VALID)');
  const released = await redis.eval(RELEASE_SCRIPT, 1, key, 3600);
  const state4 = await redis.hget(key, 'state');
  assert(released === 1, `Release succeeded (returned: ${released})`);
  assert(state4 === 'VALID', `State restored to VALID (got: ${state4})`);

  // Test 5: Claim again after release
  console.log('\nTest 5: Claim After Release');
  const claimed3 = await redis.eval(CLAIM_SCRIPT, 1, key, Date.now(), 30000, 3600);
  assert(claimed3 === 1, `Re-claim succeeded after release (returned: ${claimed3})`);

  // Test 6: Consume (PROCESSING → INVALID)
  console.log('\nTest 6: Consume Payment (PROCESSING → INVALID)');
  await redis.hset(key, 'state', 'INVALID');
  await redis.hdel(key, 'processingStarted');
  const state6 = await redis.hget(key, 'state');
  assert(state6 === 'INVALID', `State is INVALID (got: ${state6})`);

  // Test 7: Cannot claim INVALID hash
  console.log('\nTest 7: Cannot Claim INVALID Hash');
  const claimed4 = await redis.eval(CLAIM_SCRIPT, 1, key, Date.now(), 30000, 3600);
  assert(claimed4 === 0, `Claim on INVALID hash blocked (returned: ${claimed4})`);

  // Test 8: Concurrent claim simulation
  console.log('\nTest 8: Concurrent Claim Simulation');
  const concurrentKey = 'payment:concurrent_test_' + Date.now();
  await redis.hset(concurrentKey, { state: 'VALID', created: Date.now().toString() });
  await redis.expire(concurrentKey, 60);

  // Simulate 10 concurrent claims
  const claims = await Promise.all(
    Array(10).fill(null).map(() =>
      redis.eval(CLAIM_SCRIPT, 1, concurrentKey, Date.now(), 30000, 3600)
    )
  );
  const successCount = claims.filter(c => c === 1).length;
  assert(successCount === 1, `Only 1 of 10 concurrent claims succeeded (got: ${successCount})`);
  await redis.del(concurrentKey);

  // Cleanup
  await redis.del(key);

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  Results: ${passed} passed, ${failed} failed                                   ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (failed === 0) {
    console.log('\n✅ All tests passed! TOCTOU vulnerability is FIXED.\n');
  } else {
    console.log('\n❌ Some tests failed. Please check the implementation.\n');
  }

  await redis.quit();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error('Test error:', err);
  redis.quit();
  process.exit(1);
});
