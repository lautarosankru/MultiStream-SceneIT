
import { parseSlugs } from './lib/streamers';

console.log('Testing parseSlugs...');

const testCases = [
    {
        name: 'Simple streamers (default kick)',
        input: ['coscu', 'goncho'],
        expected: [{ platform: 'kick', username: 'coscu' }, { platform: 'kick', username: 'goncho' }]
    },
    {
        name: 'Explicit platforms',
        input: ['kick', 'coscu', 'twitch', 'ibai'],
        expected: [{ platform: 'kick', username: 'coscu' }, { platform: 'twitch', username: 'ibai' }]
    },
    {
        name: 'Mixed/Malformed (Robustness)',
        input: ['kick', 'coscu', 'twitch'], // Odd length
        expected: [{ platform: 'kick', username: 'coscu' }] // Should drop the last one or handle gracefully
    },
    {
        name: 'Garbage',
        input: [''],
        expected: []
    }
];

let failed = false;

testCases.forEach((tc, i) => {
    try {
        const result = parseSlugs(tc.input);
        const jsonResult = JSON.stringify(result);
        const jsonExpected = JSON.stringify(tc.expected);

        if (jsonResult === jsonExpected) {
            console.log(`[PASS] ${tc.name}`);
        } else {
            console.error(`[FAIL] ${tc.name}`);
            console.error(`  Expected: ${jsonExpected}`);
            console.error(`  Got:      ${jsonResult}`);
            failed = true;
        }
    } catch (e) {
        console.error(`[ERROR] ${tc.name} threw exception:`, e);
        failed = true;
    }
});

if (failed) process.exit(1);
console.log('All tests passed!');
