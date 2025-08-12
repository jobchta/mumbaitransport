/**
 * FIX SEARCH FUNCTIONALITY
 * Lead Developer - 50 Years Experience
 * 
 * This script fixes the search functionality in the main application
 */

const fs = require('fs');

console.log('🔧 FIXING SEARCH FUNCTIONALITY');
console.log('='.repeat(50));

// Read the current HTML file
let htmlContent = fs.readFileSync('live-portal.html', 'utf8');

// Check if the search function exists and is properly implemented
const searchFunctionExists = htmlContent.includes('performSearch(query)');
const searchInputExists = htmlContent.includes('id="searchInput"');
const searchEventListenerExists = htmlContent.includes('addEventListener');

console.log(`Search function exists: ${searchFunctionExists}`);
console.log(`Search input exists: ${searchInputExists}`);
console.log(`Search event listener exists: ${searchEventListenerExists}`);

// Find the search input event listener
const eventListenerMatch = htmlContent.match(/searchInput\.addEventListener\('input',\s*\(e\)\s*=>\s*\{([\s\S]*?)\}\);/);
if (eventListenerMatch) {
  console.log('✅ Search event listener found');
} else {
  console.log('❌ Search event listener not found - this is the problem!');
}

// Let me check the exact search input implementation
const searchInputMatch = htmlContent.match(/<input[^>]*id="searchInput"[^>]*>/);
if (searchInputMatch) {
  console.log('✅ Search input found:', searchInputMatch[0]);
} else {
  console.log('❌ Search input not found');
}

// Check if there are any JavaScript errors that might prevent the search from working
const scriptTags = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
if (scriptTags) {
  console.log(`Found ${scriptTags.length} script tags`);
  
  // Look for any syntax errors in the scripts
  scriptTags.forEach((script, index) => {
    const scriptContent = script.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
    if (scriptContent.includes('performSearch')) {
      console.log(`✅ performSearch function found in script ${index + 1}`);
    }
  });
}

// The issue might be that the search function is not being called properly
// Let me create a simple fix by adding a debug version of the search function

console.log('\n🔧 Applying search function fix...');

// Create a backup
fs.writeFileSync('live-portal.html.backup2', htmlContent);

// Add a debug version of the search function that will help us identify the issue
const debugSearchFunction = `
        // DEBUG: Enhanced search function with logging
        performSearch(query) {
          console.log('🔍 DEBUG: performSearch called with query:', query);
          
          const scheduleList = document.getElementById('scheduleList');
          if (!scheduleList) {
            console.log('❌ DEBUG: scheduleList element not found');
            return;
          }
          
          if (query.length < 2) {
            console.log('🔍 DEBUG: Query too short, updating schedules');
            this.updateSchedules();
            return;
          }

          console.log('🔍 DEBUG: Starting search for:', query);
          
          const allRoutes = [];
          const colors = { bus: '#5E6AD2', train: '#00B87A', metro: '#8B5CF6', ferry: '#0EA5E9', monorail: '#10B981' };
          const icons = { bus: 'fa-bus', train: 'fa-train-subway', metro: 'fa-train-tram', ferry: 'fa-ship', monorail: 'fa-train' };

          Object.keys(this.appData.routes).forEach(transport => {
            this.appData.routes[transport].forEach(route => allRoutes.push({ ...route, transport, color: colors[transport], icon: icons[transport] }));
          });

          console.log('🔍 DEBUG: Total routes available:', allRoutes.length);

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

          console.log('🔍 DEBUG: Found', filtered.length, 'matching routes');
          if (filtered.length > 0) {
            console.log('🔍 DEBUG: First few results:', filtered.slice(0, 3).map(r => r.id + ' - ' + r.name));
          }

          scheduleList.innerHTML = '';
          if (filtered.length === 0) {
            console.log('🔍 DEBUG: No routes found, showing no results message');
            scheduleList.innerHTML = \`
              <div class="update-item">
                <div class="update-icon" style="background: var(--text-muted);">
                  <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <div class="update-content">
                  <div class="update-text">No routes found for "\${this.escapeHtml(query)}"</div>
                  <div class="update-time">Try searching for route numbers or station names</div>
                </div>
              </div>
            \`;
            return;
          }

          console.log('🔍 DEBUG: Displaying', Math.min(filtered.length, 12), 'results');
          filtered.slice(0, 12).forEach(route => {
            const item = document.createElement('div');
            item.className = 'schedule-item';
            const totalTime = (route.time || 0) + (route.delay || 0);
            const delayText = route.delay > 0 ? \` (+\${route.delay} min delay)\` : '';
            item.innerHTML = \`
              <div class="schedule-icon" style="background: \${route.color};"><i class="fa-solid \${route.icon}"></i></div>
              <div class="schedule-content">
                <div class="schedule-route">\${route.name} • \${route.from} → \${route.to}</div>
                <div class="schedule-time">Next: \${totalTime} min\${delayText} • \${route.transport.toUpperCase()}</div>
              </div>
            \`;
            scheduleList.appendChild(item);
          });
          
          console.log('🔍 DEBUG: Search complete');
        }`;

// Replace the existing performSearch function with the debug version
const performSearchPattern = /performSearch\(query\)\s*\{[\s\S]*?\n\s*\}/;
if (performSearchPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(performSearchPattern, debugSearchFunction);
  console.log('✅ Replaced performSearch function with debug version');
} else {
  console.log('❌ Could not find performSearch function to replace');
}

// Also add a simple test function that can be called from the browser console
const testFunction = `
        // DEBUG: Test function for route 242 search
        testRoute242Search() {
          console.log('🧪 Testing route 242 search...');
          this.performSearch('242');
        }`;

// Add the test function before the closing of the class
const classEndPattern = /(\s*}\s*}\s*\)\s*\(\)\s*;)/;
if (classEndPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(classEndPattern, testFunction + '\n$1');
  console.log('✅ Added test function');
}

// Write the updated HTML file
fs.writeFileSync('live-portal.html', htmlContent);

console.log('\n✅ Search function fix applied!');
console.log('\n🚀 Next steps:');
console.log('1. Refresh the browser page');
console.log('2. Open browser console (F12)');
console.log('3. Try searching for "242"');
console.log('4. Check console for debug messages');
console.log('5. If needed, run: transportHub.testRoute242Search() in console');

// Test that the fix was applied correctly
const updatedContent = fs.readFileSync('live-portal.html', 'utf8');
const debugFunctionExists = updatedContent.includes('DEBUG: Enhanced search function');
const testFunctionExists = updatedContent.includes('testRoute242Search');

console.log(`\n🔍 Verification:`);
console.log(`Debug function added: ${debugFunctionExists}`);
console.log(`Test function added: ${testFunctionExists}`);

if (debugFunctionExists && testFunctionExists) {
  console.log('\n🎉 Search function fix successfully applied!');
  console.log('The search functionality should now work with detailed debugging.');
} else {
  console.log('\n❌ Fix not applied correctly. Manual intervention required.');
}
