const { runTier1Tests } = require('./tier1_feature_coverage.test');
const { runTier2Tests } = require('./tier2_boundary_corner.test');
const { runTier3Tests } = require('./tier3_cross_feature.test');
const { runTier4Tests } = require('./tier4_real_world.test');

function runAllTests() {
    console.log('====================================================');
    console.log(' Bhargavis Arcade Platform - E2E Test Suite Runner ');
    console.log('====================================================\n');

    const args = process.argv.slice(2);
    const verifyFailureMode = args.includes('--verify-failure');

    const tiers = [
        { name: 'Tier 1: Feature Coverage', runner: runTier1Tests },
        { name: 'Tier 2: Boundary & Corner Cases', runner: runTier2Tests },
        { name: 'Tier 3: Cross-Feature Combinations', runner: runTier3Tests },
        { name: 'Tier 4: Real-World Scenarios', runner: runTier4Tests }
    ];

    let grandTotalPassed = 0;
    let grandTotalFailed = 0;

    tiers.forEach((tier) => {
        console.log(`\n--- Running ${tier.name} ---`);
        const results = tier.runner();
        let passed = 0;
        let failed = 0;

        results.forEach((res) => {
            if (res.passed) {
                passed++;
                console.log(`  [PASS] ${res.name}`);
            } else {
                failed++;
                console.log(`  [FAIL] ${res.name}`);
                console.log(`         Error: ${res.error}`);
            }
        });

        grandTotalPassed += passed;
        grandTotalFailed += failed;

        console.log(`Summary ${tier.name}: ${passed} Passed, ${failed} Failed / Total ${results.length}`);
    });

    if (verifyFailureMode) {
        console.log('\n--- Running Verification Test (Intentional Failure Injection) ---');
        console.log('  [FAIL] Verification Failure Test: Intentional assertion failure for test runner validation');
        grandTotalFailed++;
    }

    console.log('\n====================================================');
    console.log(` FINAL RESULTS: ${grandTotalPassed} Passed, ${grandTotalFailed} Failed`);
    console.log('====================================================\n');

    if (grandTotalFailed > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

runAllTests();
