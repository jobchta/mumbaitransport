/**
 * DEBUG SEARCH FUNCTIONALITY
 * Lead Developer - 50 Years Experience
 * 
 * This script debugs the exact search functionality to identify why route 242 isn't found
 */

const fs = require('fs');

console.log('🔍 DEBUGGING SEARCH FUNCTIONALITY');
console.log('='.repeat(50));

// Load the current HTML file
const htmlContent = fs.readFileSync('live-portal.html', 'utf8');

// Extract the routes data from the HTML
const routesMatch = htmlContent.match(/initializeRoutes\(\)\s*\{\s*return\s*\{([\s\S]*?)\};\s*\}/);
if (!routesMatch) {
  console.log('❌ Could not find routes initialization in HTML');
  process.exit(1);
}

// Parse the routes data (simplified version)
console.log('📊 Analyzing routes data...');

// Find all route IDs in the HTML
const routeIdMatches = htmlContent.match(/"id":\s*'([^']+)'/g);
const routeIds = routeIdMatches ? routeIdMatches.map(match => {
  const idMatch = match.match(/"id":\s*'([^']+)'/);
  return idMatch ? idMatch[1] : null;
}).filter(id => id) : [];

console.log(`Found ${routeIds.length} route IDs in HTML`);

// Check for route 242 specifically
const route242Matches = routeIds.filter(id => id.includes('242'));
console.log(`Routes containing "242": ${route242Matches.join(', ')}`);

// Extract the exact route 242 data
const route242Pattern = /"id":\s*'242',\s*"name":\s*'([^']+)',\s*"from":\s*'([^']+)',\s*"to":\s*'([^']+)'/;
const route242Match = htmlContent.match(route242Pattern);

if (route242Match) {
  console.log('✅ Route 242 found in HTML:');
  console.log(`   ID: 242`);
  console.log(`   Name: ${route242Match[1]}`);
  console.log(`   From: ${route242Match[2]}`);
  console.log(`   To: ${route242Match[3]}`);
} else {
  console.log('❌ Route 242 not found in HTML');
}

// Test the search function logic
console.log('\n🔍 Testing search function logic...');

// Simulate the search function
function performSearch(query, routes) {
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

// Create test routes from the HTML data
const testRoutes = [];
const routePattern = /"id":\s*'([^']+)',\s*"name":\s*'([^']+)',\s*"from":\s*'([^']+)',\s*"to":\s*'([^']+)'/g;
let match;

while ((match = routePattern.exec(htmlContent)) !== null) {
  testRoutes.push({
    id: match[1],
    name: match[2],
    from: match[3],
    to: match[4]
  });
}

console.log(`Created ${testRoutes.length} test routes from HTML`);

// Test search for "242"
const searchResults = performSearch('242', testRoutes);
console.log(`\nSearch results for "242": ${searchResults.length} routes found`);

if (searchResults.length > 0) {
  console.log('Found routes:');
  searchResults.forEach((route, index) => {
    console.log(`   ${index + 1}. ${route.id} - ${route.name} (${route.from} → ${route.to})`);
  });
} else {
  console.log('❌ No routes found for "242"');
}

// Test search for "Bandra"
const bandraResults = performSearch('Bandra', testRoutes);
console.log(`\nSearch results for "Bandra": ${bandraResults.length} routes found`);

if (bandraResults.length > 0) {
  console.log('First 5 Bandra routes:');
  bandraResults.slice(0, 5).forEach((route, index) => {
    console.log(`   ${index + 1}. ${route.id} - ${route.name} (${route.from} → ${route.to})`);
  });
}

// Check if there are any issues with the route data structure
console.log('\n🔍 Checking route data structure...');

// Look for any malformed route entries
const malformedRoutes = testRoutes.filter(route => 
  !route.id || !route.name || !route.from || !route.to ||
  route.id.length === 0 || route.name.length === 0 || route.from.length === 0 || route.to.length === 0
);

if (malformedRoutes.length > 0) {
  console.log(`⚠️ Found ${malformedRoutes.length} malformed routes`);
  malformedRoutes.slice(0, 3).forEach((route, index) => {
    console.log(`   ${index + 1}. ID: "${route.id}", Name: "${route.name}", From: "${route.from}", To: "${route.to}"`);
  });
} else {
  console.log('✅ All routes have valid structure');
}

console.log('\n' + '='.repeat(50));
console.log('🔍 DEBUG SUMMARY:');
console.log('='.repeat(50));

if (searchResults.length > 0) {
  console.log('✅ Route 242 search is working correctly');
  console.log('✅ The issue might be in the UI display logic');
} else {
  console.log('❌ Route 242 search is not working');
  console.log('❌ The search function is not finding route 242');
}

console.log('\n🚀 Next steps:');
console.log('1. Check if the search results are being displayed correctly in the UI');
console.log('2. Verify that the search input is properly connected to the search function');
console.log('3. Check for any JavaScript errors in the browser console');
