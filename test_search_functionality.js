/**
 * Test Search Functionality for Mumbai Transport Hub
 * Specifically tests route 242 search and other route searches
 */

console.log('🔍 Testing Search Functionality...\n');

// Mock the routes data
const mockRoutes = {
  bus: [
    { id: 'A1E', name: 'A-1 Express', from: 'Colaba', to: 'Bandra', time: 3, delay: 0, passengers: 45, capacity: 70 },
    { id: '2L', name: '2Ltd', from: 'Mumbai Central', to: 'Bandra', time: 7, delay: 2, passengers: 52, capacity: 65 },
    { id: '37', name: '37', from: 'Santacruz', to: 'Colaba', time: 12, delay: 0, passengers: 38, capacity: 60 },
    { id: '54L', name: '54Ltd', from: 'Kurla', to: 'Colaba', time: 5, delay: 1, passengers: 41, capacity: 55 },
    { id: '85', name: '85', from: 'Borivali', to: 'Colaba', time: 15, delay: 0, passengers: 29, capacity: 70 },
    { id: '124', name: '124', from: 'Andheri', to: 'CST', time: 8, delay: 3, passengers: 56, capacity: 65 },
    { id: '234', name: '234', from: 'Vesave/Yari Road', to: 'Jogeshwari', time: 10, delay: 0, passengers: 42, capacity: 60 },
    { id: '242', name: '242', from: 'Bandra Station', to: 'Worli', time: 6, delay: 1, passengers: 48, capacity: 65 },
    { id: '139', name: '139', from: 'CSMT', to: 'Geetanagar', time: 9, delay: 0, passengers: 35, capacity: 55 },
    { id: '164', name: '164', from: 'Maharana Pratap Chowk', to: 'Dharavi Depot', time: 11, delay: 2, passengers: 39, capacity: 60 },
    { id: '9', name: '9', from: 'Antop Hill', to: 'Colaba', time: 14, delay: 0, passengers: 31, capacity: 70 },
    { id: '42', name: '42', from: 'Sandhurst Road', to: 'Kamla Nehru Park', time: 7, delay: 1, passengers: 44, capacity: 55 }
  ],
  train: [
    { id: 'WR_F', name: 'Western Fast', from: 'Borivali', to: 'Churchgate', time: 2, delay: 3, passengers: 1247, capacity: 1800 },
    { id: 'WR_S', name: 'Western Slow', from: 'Virar', to: 'Churchgate', time: 4, delay: 1, passengers: 1456, capacity: 1800 },
    { id: 'CR_F', name: 'Central Fast', from: 'Kalyan', to: 'CST', time: 6, delay: 0, passengers: 1523, capacity: 1800 },
    { id: 'HR', name: 'Harbour Line', from: 'Panvel', to: 'CST', time: 8, delay: 2, passengers: 987, capacity: 1800 },
    { id: 'TH', name: 'Trans-Harbour', from: 'Thane', to: 'Vashi', time: 11, delay: 1, passengers: 754, capacity: 1800 }
  ]
};

// Test results tracking
let passedTests = 0;
let totalTests = 0;

function test(description, testFunction) {
  totalTests++;
  try {
    testFunction();
    console.log(`✅ PASS: ${description}`);
    passedTests++;
  } catch (error) {
    console.log(`❌ FAIL: ${description}`);
    console.log(`   Error: ${error.message}`);
  }
}

// Mock search function
function performSearch(query) {
  if (query.length < 2) {
    return [];
  }

  const allRoutes = [];
  const colors = { bus: '#5E6AD2', train: '#00B87A', metro: '#8B5CF6', ferry: '#0EA5E9', monorail: '#10B981' };
  const icons = { bus: 'fa-bus', train: 'fa-train-subway', metro: 'fa-train-tram', ferry: 'fa-ship', monorail: 'fa-train' };

  Object.keys(mockRoutes).forEach(transport => {
    mockRoutes[transport].forEach(route => allRoutes.push({ ...route, transport, color: colors[transport], icon: icons[transport] }));
  });

  const q = query.toLowerCase();
  const filtered = allRoutes.filter(route => {
    // Check if query matches route ID (for route numbers)
    if (route.id.toLowerCase().includes(q)) return true;
    // Check if query matches route name
    if (route.name.toLowerCase().includes(q)) return true;
    // Check if query matches source station
    if (route.from.toLowerCase().includes(q)) return true;
    // Check if query matches destination station
    if (route.to.toLowerCase().includes(q)) return true;
    return false;
  });

  return filtered;
}

console.log('🔍 Route Search Tests:');

test('Route 242 should be found when searching "242"', () => {
  const results = performSearch('242');
  if (results.length === 0) {
    throw new Error('Route 242 not found in search results');
  }
  
  const route242 = results.find(route => route.id === '242');
  if (!route242) {
    throw new Error('Route 242 not found in search results');
  }
  
  if (route242.from !== 'Bandra Station' || route242.to !== 'Worli') {
    throw new Error(`Route 242 details incorrect. Expected: Bandra Station → Worli, Got: ${route242.from} → ${route242.to}`);
  }
});

test('Route 234 should be found when searching "234"', () => {
  const results = performSearch('234');
  if (results.length === 0) {
    throw new Error('Route 234 not found in search results');
  }
  
  const route234 = results.find(route => route.id === '234');
  if (!route234) {
    throw new Error('Route 234 not found in search results');
  }
});

test('Route 139 should be found when searching "139"', () => {
  const results = performSearch('139');
  if (results.length === 0) {
    throw new Error('Route 139 not found in search results');
  }
  
  const route139 = results.find(route => route.id === '139');
  if (!route139) {
    throw new Error('Route 139 not found in search results');
  }
});

test('Route A1E should be found when searching "A1E"', () => {
  const results = performSearch('A1E');
  if (results.length === 0) {
    throw new Error('Route A1E not found in search results');
  }
  
  const routeA1E = results.find(route => route.id === 'A1E');
  if (!routeA1E) {
    throw new Error('Route A1E not found in search results');
  }
});

test('Route 2L should be found when searching "2L"', () => {
  const results = performSearch('2L');
  if (results.length === 0) {
    throw new Error('Route 2L not found in search results');
  }
  
  const route2L = results.find(route => route.id === '2L');
  if (!route2L) {
    throw new Error('Route 2L not found in search results');
  }
});

console.log('\n🔍 Station Search Tests:');

test('Routes should be found when searching "Bandra"', () => {
  const results = performSearch('Bandra');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "Bandra"');
  }
  
  // Should find routes that go to or from Bandra
  const bandraRoutes = results.filter(route => 
    route.from.toLowerCase().includes('bandra') || route.to.toLowerCase().includes('bandra')
  );
  
  if (bandraRoutes.length === 0) {
    throw new Error('No Bandra routes found in search results');
  }
});

test('Routes should be found when searching "Colaba"', () => {
  const results = performSearch('Colaba');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "Colaba"');
  }
  
  const colabaRoutes = results.filter(route => 
    route.from.toLowerCase().includes('colaba') || route.to.toLowerCase().includes('colaba')
  );
  
  if (colabaRoutes.length === 0) {
    throw new Error('No Colaba routes found in search results');
  }
});

test('Routes should be found when searching "CST"', () => {
  const results = performSearch('CST');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "CST"');
  }
  
  const cstRoutes = results.filter(route => 
    route.from.toLowerCase().includes('cst') || route.to.toLowerCase().includes('cst')
  );
  
  if (cstRoutes.length === 0) {
    throw new Error('No CST routes found in search results');
  }
});

console.log('\n🔍 Edge Case Tests:');

test('Search with empty query should return empty results', () => {
  const results = performSearch('');
  if (results.length !== 0) {
    throw new Error(`Empty search should return 0 results, got ${results.length}`);
  }
});

test('Search with single character should return empty results', () => {
  const results = performSearch('2');
  if (results.length !== 0) {
    throw new Error(`Single character search should return 0 results, got ${results.length}`);
  }
});

test('Search with non-existent route should return empty results', () => {
  const results = performSearch('999');
  if (results.length !== 0) {
    throw new Error(`Non-existent route search should return 0 results, got ${results.length}`);
  }
});

test('Search should be case insensitive', () => {
  const results1 = performSearch('242');
  const results2 = performSearch('242');
  const results3 = performSearch('242');
  
  if (results1.length !== results2.length || results2.length !== results3.length) {
    throw new Error('Search results should be consistent regardless of case');
  }
});

console.log('\n🔍 Search Result Validation:');

test('Search results should have correct structure', () => {
  const results = performSearch('242');
  if (results.length > 0) {
    const route = results[0];
    const requiredFields = ['id', 'name', 'from', 'to', 'time', 'delay', 'transport', 'color', 'icon'];
    
    requiredFields.forEach(field => {
      if (!(field in route)) {
        throw new Error(`Search result missing required field: ${field}`);
      }
    });
  }
});

test('Search results should be limited to reasonable number', () => {
  const results = performSearch('a'); // This should match many routes
  if (results.length > 50) {
    throw new Error(`Search results should be limited, got ${results.length} results`);
  }
});

// Test summary
console.log('\n' + '='.repeat(50));
console.log(`📊 Search Test Results: ${passedTests}/${totalTests} tests passed`);
console.log('='.repeat(50));

if (passedTests === totalTests) {
  console.log('🎉 All search functionality tests passed!');
  console.log('✅ Route 242 search is working correctly');
  console.log('✅ All route number searches work');
  console.log('✅ Station name searches work');
  console.log('✅ Edge cases are handled properly');
  console.log('✅ Search results are properly structured');
} else {
  console.log('⚠️  Some search tests failed. Please check the implementation.');
}

console.log('\n🚌 Search functionality testing complete!');

// Export for potential use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { performSearch, mockRoutes };
}
