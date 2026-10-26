import { describe, it, expect } from 'vitest';
import { generateUserDigest } from '../src/digest/generator.js';

describe('GistMyMail — 3 Repeat Test Runs Multi-Inbox Benchmark', () => {
  it('executes 3 repeated runs, recording latency, tokens/sec, and verification metrics', async () => {
    const runsSummary: Array<{
      run: number;
      latencyMs: number;
      itemsCount: number;
      verifiedQuotesCount: number;
      unverifiedQuotesCount: number;
      tokensPerSec: number;
    }> = [];

    for (let run = 1; run <= 3; run++) {
      const startTime = performance.now();
      const digest = await generateUserDigest('usr_demo_01', { useMockProvider: true });
      const durationMs = Math.round(performance.now() - startTime);

      const verifiedCount = digest.items.filter(item => item.evidence.verifiedInSource).length;
      const unverifiedCount = digest.items.filter(item => !item.evidence.verifiedInSource).length;
      
      const estimatedTokens = digest.items.length * 110 + 250;
      const tokensPerSec = Math.round((estimatedTokens / Math.max(durationMs, 10)) * 1000);

      runsSummary.push({
        run,
        latencyMs: durationMs,
        itemsCount: digest.items.length,
        verifiedQuotesCount: verifiedCount,
        unverifiedQuotesCount: unverifiedCount,
        tokensPerSec
      });

      // Assertions per run
      expect(digest.items.length).toBeGreaterThan(0);
      expect(digest.sourceAccountsCount).toBeGreaterThanOrEqual(1);
    }

    console.log('\n=============================================================');
    console.log(' GISTMYMAIL — 3 REPEAT TEST RUNS METRICS TABLE');
    console.log('=============================================================');
    console.table(runsSummary);
    console.log('=============================================================\n');

    expect(runsSummary.length).toBe(3);
    for (const res of runsSummary) {
      expect(res.itemsCount).toBeGreaterThan(0);
      expect(res.latencyMs).toBeLessThan(5000); // Fast & reliable
    }
  });
});
