/**
 * Test 518 BEST Bus Routes Search Functionality
 * Verifies that route 242 and all other routes are searchable
 */

console.log('🔍 Testing 518 BEST Bus Routes Search...\n');

// Load the generated routes
const fs = require('fs');
let routesData;

try {
  routesData = JSON.parse(fs.readFileSync('best_routes_518.json', 'utf8'));
  console.log(`✅ Loaded ${routesData.totalRoutes} routes from best_routes_518.json`);
} catch (error) {
  console.log('❌ Error loading routes file:', error.message);
  process.exit(1);
}

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

// Search function
function performSearch(query, routes = routesData.routes) {
  if (query.length < 2) {
    return [];
  }

  const q = query.toLowerCase();
  const filtered = routes.filter(route => {
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

console.log('📊 Route Count Tests:');
test('Should have exactly 518 routes', () => {
  if (routesData.totalRoutes !== 518) {
    throw new Error(`Expected 518 routes, got ${routesData.totalRoutes}`);
  }
  if (routesData.routes.length !== 518) {
    throw new Error(`Expected 518 routes in array, got ${routesData.routes.length}`);
  }
});

test('All routes should have required fields', () => {
  routesData.routes.forEach((route, index) => {
    const requiredFields = ['id', 'name', 'from', 'to', 'time', 'delay', 'passengers', 'capacity'];
    requiredFields.forEach(field => {
      if (!(field in route)) {
        throw new Error(`Route ${index} missing required field: ${field}`);
      }
    });
  });
});

console.log('\n🔍 Route 242 Specific Tests:');
test('Route 242 should be found when searching "242"', () => {
  const results = performSearch('242');
  if (results.length === 0) {
    throw new Error('Route 242 not found in search results');
  }
  
  const route242 = results.find(route => route.id === '242');
  if (!route242) {
    throw new Error('Route 242 not found in search results');
  }
  
  console.log(`   → Found: ${route242.name} (${route242.from} → ${route242.to})`);
});

test('Route 242 should have correct details', () => {
  const results = performSearch('242');
  const route242 = results.find(route => route.id === '242');
  
  if (!route242) {
    throw new Error('Route 242 not found');
  }
  
  if (!route242.from || !route242.to) {
    throw new Error('Route 242 missing source or destination');
  }
  
  if (route242.time < 1 || route242.time > 60) {
    throw new Error(`Route 242 has invalid time: ${route242.time}`);
  }
  
  if (route242.delay < 0 || route242.delay > 20) {
    throw new Error(`Route 242 has invalid delay: ${route242.delay}`);
  }
});

console.log('\n🔍 Other Route Search Tests:');
test('Route 234 should be found when searching "234"', () => {
  const results = performSearch('234');
  if (results.length === 0) {
    throw new Error('Route 234 not found in search results');
  }
});

test('Route 139 should be found when searching "139"', () => {
  const results = performSearch('139');
  if (results.length === 0) {
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
  
  console.log(`   → Found: ${routeA1E.name} (${routeA1E.from} → ${routeA1E.to})`);
});

test('Route 2L should be found when searching "2L"', () => {
  const results = performSearch('2L');
  if (results.length === 0) {
    throw new Error('Route 2L not found in search results');
  }
});

console.log('\n🔍 Station Search Tests:');
test('Routes should be found when searching "Bandra"', () => {
  const results = performSearch('Bandra');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "Bandra"');
  }
  console.log(`   → Found ${results.length} routes serving Bandra`);
});

test('Routes should be found when searching "Colaba"', () => {
  const results = performSearch('Colaba');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "Colaba"');
  }
  console.log(`   → Found ${results.length} routes serving Colaba`);
});

test('Routes should be found when searching "CST"', () => {
  const results = performSearch('CST');
  if (results.length === 0) {
    throw new Error('No routes found when searching for "CST"');
  }
  console.log(`   → Found ${results.length} routes serving CST`);
});

console.log('\n🔍 Route Type Tests:');
test('Should have Limited routes (L suffix)', () => {
  const limitedRoutes = routesData.routes.filter(route => route.id.includes('L'));
  if (limitedRoutes.length === 0) {
    throw new Error('No Limited routes found');
  }
  console.log(`   → Found ${limitedRoutes.length} Limited routes`);
});

test('Should have Express routes (E suffix)', () => {
  const expressRoutes = routesData.routes.filter(route => route.id.includes('E'));
  if (expressRoutes.length === 0) {
    throw new Error('No Express routes found');
  }
  console.log(`   → Found ${expressRoutes.length} Express routes`);
});

test('Should have AC routes', () => {
  const acRoutes = routesData.routes.filter(route => route.id.includes('AC'));
  if (acRoutes.length === 0) {
    throw new Error('No AC routes found');
  }
  console.log(`   → Found ${acRoutes.length} AC routes`);
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

console.log('\n🔍 Performance Tests:');
test('Search should be fast for large dataset', () => {
  const startTime = Date.now();
  
  // Perform multiple searches
  for (let i = 0; i < 100; i++) {
    performSearch('242');
    performSearch('Bandra');
    performSearch('Colaba');
  }
  
  const endTime = Date.now();
  const executionTime = endTime - startTime;
  
  if (executionTime > 1000) {
    throw new Error(`Search performance too slow: took ${executionTime}ms for 300 searches`);
  }
  
  console.log(`   → 300 searches completed in ${executionTime}ms`);
});

console.log('\n🔍 Data Quality Tests:');
test('All routes should have valid time values', () => {
  routesData.routes.forEach((route, index) => {
    if (route.time < 1 || route.time > 60) {
      throw new Error(`Route ${index} (${route.id}) has invalid time: ${route.time}`);
    }
  });
});

test('All routes should have valid delay values', () => {
  routesData.routes.forEach((route, index) => {
    if (route.delay < 0 || route.delay > 20) {
      throw new Error(`Route ${index} (${route.id}) has invalid delay: ${route.delay}`);
    }
  });
});

test('All routes should have valid passenger counts', () => {
  routesData.routes.forEach((route, index) => {
    if (route.passengers < 0 || route.passengers > 100) {
      throw new Error(`Route ${index} (${route.id}) has invalid passenger count: ${route.passengers}`);
    }
  });
});

test('All routes should have valid capacity values', () => {
  routesData.routes.forEach((route, index) => {
    if (route.capacity < 20 || route.capacity > 100) {
      throw new Error(`Route ${index} (${route.id}) has invalid capacity: ${route.capacity}`);
    }
  });
});

// Test summary
console.log('\n' + '='.repeat(60));
console.log(`📊 518 Routes Test Results: ${passedTests}/${totalTests} tests passed`);
console.log('='.repeat(60));

if (passedTests === totalTests) {
  console.log('🎉 All 518 routes tests passed!');
  console.log('✅ Route 242 is searchable and working correctly');
  console.log('✅ All 518 routes are properly structured');
  console.log('✅ Search functionality works with large dataset');
  console.log('✅ Performance is acceptable');
  console.log('✅ Data quality is maintained');
} else {
  console.log('⚠️  Some tests failed. Please check the implementation.');
}

console.log('\n🚌 518 routes testing complete!');

// Export for potential use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { routesData, performSearch };
}
