/**
 * jest.sequencer.js
 * 
 * Custom test file sequencer to ensure consistent test execution order.
 * Prevents test interdependency issues by running tests in a predictable sequence.
 * 
 * Order: rate-limiter (no DB) → auth → user → taxProfile → invoice
 */

const Sequencer = require('@jest/test-sequencer').default;

class CustomSequencer extends Sequencer {
    sort(tests) {
        // Define the desired test order
        const order = [
            'rate-limiter',      // No database, safe to run first
            'auth',              // Creates users
            'user',              // Creates/modifies users  
            'taxProfile',        // Creates tax profiles (depends on users)
            'invoice',           // Creates invoices (depends on tax profiles)
        ];

        const sortedTests = [...tests].sort((a, b) => {
            // Find matching order keys for each test
            const aOrder = order.findIndex(key => a.path.includes(key));
            const bOrder = order.findIndex(key => b.path.includes(key));

            // If both found in order, use order index
            if (aOrder !== -1 && bOrder !== -1) {
                return aOrder - bOrder;
            }

            // If only a is in order, it comes first
            if (aOrder !== -1) return -1;

            // If only b is in order, it comes first
            if (bOrder !== -1) return 1;

            // If neither in order, maintain original order
            return tests.indexOf(a) - tests.indexOf(b);
        });

        return sortedTests;
    }
}

module.exports = CustomSequencer;
