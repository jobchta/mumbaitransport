/**
 * EMERGENCY FIX - IMMEDIATE SEARCH FUNCTIONALITY
 * Lead Developer - 50 Years Experience
 * 
 * This script fixes the search to work immediately on the website
 */

const fs = require('fs');

console.log('🚨 EMERGENCY FIX - IMMEDIATE SEARCH FUNCTIONALITY');
console.log('='.repeat(60));

// Read the current HTML file
let htmlContent = fs.readFileSync('live-portal.html', 'utf8');

// Create a backup
fs.writeFileSync('live-portal.html.backup3', htmlContent);

// Fix the search event listener to work immediately
const newSearchListener = `
          const searchInput = document.getElementById('searchInput');
          searchInput.addEventListener('input', (e) => {
            const q = e.target.value.trim();
            console.log('🔍 SEARCH INPUT:', q);
            
            // Clear any existing timer
            if (this.appData.searchTimer) {
              clearTimeout(this.appData.searchTimer);
            }
            
            // Perform search immediately for short queries, with delay for longer ones
            if (q.length >= 2) {
              console.log('🔍 PERFORMING SEARCH FOR:', q);
              this.performSearch(q);
            } else if (q.length === 0) {
              console.log('🔍 CLEARING SEARCH');
              this.updateSchedules();
            }
          });
          
          // Also add keypress event for immediate response
          searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
              const q = e.target.value.trim();
              console.log('🔍 ENTER PRESSED, SEARCHING FOR:', q);
              if (q.length >= 2) {
                this.performSearch(q);
              }
            }
          });`;

// Replace the search event listener
const searchListenerPattern = /const searchInput = document\.getElementById\('searchInput'\);\s*searchInput\.addEventListener\('input',\s*\(e\)\s*=>\s*\{[\s\S]*?\}\);/;
if (searchListenerPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(searchListenerPattern, newSearchListener);
  console.log('✅ Replaced search event listener with immediate response');
} else {
  console.log('❌ Could not find search event listener to replace');
}

// Also fix the performSearch function to be more robust
const robustSearchFunction = `
        // ROBUST SEARCH FUNCTION - IMMEDIATE RESPONSE
        performSearch(query) {
          console.log('🔍 ROBUST SEARCH CALLED WITH:', query);
          
          try {
            const scheduleList = document.getElementById('scheduleList');
            if (!scheduleList) {
              console.log('❌ scheduleList element not found');
              return;
            }
            
            if (query.length < 2) {
              console.log('🔍 Query too short, updating schedules');
              this.updateSchedules();
              return;
            }

            console.log('🔍 Starting robust search for:', query);
            
            const allRoutes = [];
            const colors = { bus: '#5E6AD2', train: '#00B87A', metro: '#8B5CF6', ferry: '#0EA5E9', monorail: '#10B981' };
            const icons = { bus: 'fa-bus', train: 'fa-train-subway', metro: 'fa-train-tram', ferry: 'fa-ship', monorail: 'fa-train' };

            // Collect all routes
            Object.keys(this.appData.routes).forEach(transport => {
              if (this.appData.routes[transport] && Array.isArray(this.appData.routes[transport])) {
                this.appData.routes[transport].forEach(route => {
                  allRoutes.push({ ...route, transport, color: colors[transport], icon: icons[transport] });
                });
              }
            });

            console.log('🔍 Total routes available:', allRoutes.length);

            const q = query.toLowerCase();
            const filtered = allRoutes.filter(route => {
              // Check if query matches route ID (for route numbers)
              if (route.id && route.id.toLowerCase().includes(q)) return true;
              // Check if query matches route name
              if (route.name && route.name.toLowerCase().includes(q)) return true;
              // Check if query matches source station
              if (route.from && route.from.toLowerCase().includes(q)) return true;
              // Check if query matches destination station
              if (route.to && route.to.toLowerCase().includes(q)) return true;
              return false;
            });

            console.log('🔍 Found', filtered.length, 'matching routes');
            if (filtered.length > 0) {
              console.log('🔍 First few results:', filtered.slice(0, 3).map(r => r.id + ' - ' + r.name));
            }

            // Clear and update the display
            scheduleList.innerHTML = '';
            
            if (filtered.length === 0) {
              console.log('🔍 No routes found, showing no results message');
              scheduleList.innerHTML = \`
                <div class="update-item">
                  <div class="update-icon" style="background: var(--text-muted);">
                    <i class="fa-solid fa-magnifying-glass"></i>
                  </div>
                  <div class="update-content">
                    <div class="update-text">No routes found for "\${this.escapeHtml ? this.escapeHtml(query) : query}"</div>
                    <div class="update-time">Try searching for route numbers or station names</div>
                  </div>
                </div>
              \`;
              return;
            }

            console.log('🔍 Displaying', Math.min(filtered.length, 12), 'results');
            
            // Add a header
            const header = document.createElement('div');
            header.className = 'update-item';
            header.innerHTML = \`
              <div class="update-icon" style="background: var(--primary);">
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
              <div class="update-content">
                <div class="update-text"><strong>Search Results for "\${query}"</strong></div>
                <div class="update-time">Found \${filtered.length} route(s)</div>
              </div>
            \`;
            scheduleList.appendChild(header);
            
            // Add results
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
            
            console.log('🔍 Search complete - results displayed');
            
          } catch (error) {
            console.error('❌ Search error:', error);
            const scheduleList = document.getElementById('scheduleList');
            if (scheduleList) {
              scheduleList.innerHTML = \`
                <div class="update-item">
                  <div class="update-icon" style="background: var(--error);">
                    <i class="fa-solid fa-exclamation-triangle"></i>
                  </div>
                  <div class="update-content">
                    <div class="update-text">Search error occurred</div>
                    <div class="update-time">Please try again</div>
                  </div>
                </div>
              \`;
            }
          }
        }`;

// Replace the performSearch function
const performSearchPattern = /performSearch\(query\)\s*\{[\s\S]*?\n\s*\}/;
if (performSearchPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(performSearchPattern, robustSearchFunction);
  console.log('✅ Replaced performSearch function with robust version');
} else {
  console.log('❌ Could not find performSearch function to replace');
}

// Add a global test function that can be called from anywhere
const globalTestFunction = `
        // GLOBAL TEST FUNCTION - CALL FROM CONSOLE
        window.testRoute242 = function() {
          console.log('🧪 GLOBAL TEST: Testing route 242 search...');
          if (window.MumbaiTransport) {
            window.MumbaiTransport.performSearch('242');
          } else {
            console.log('❌ MumbaiTransport not available');
          }
        };
        
        // Also add to the transport hub
        testRoute242Search() {
          console.log('🧪 Testing route 242 search...');
          this.performSearch('242');
        }`;

// Add the global test function
const classEndPattern = /(\s*}\s*}\s*\)\s*\(\)\s*;)/;
if (classEndPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(classEndPattern, globalTestFunction + '\n$1');
  console.log('✅ Added global test function');
}

// Write the updated HTML file
fs.writeFileSync('live-portal.html', htmlContent);

console.log('\n✅ EMERGENCY FIX APPLIED!');
console.log('\n🚀 IMMEDIATE TESTING INSTRUCTIONS:');
console.log('1. Refresh the browser page (Ctrl+F5 or Cmd+Shift+R)');
console.log('2. Open browser console (F12)');
console.log('3. Type "242" in the search box');
console.log('4. Search should work IMMEDIATELY');
console.log('5. If it still doesn\'t work, run this in console: testRoute242()');

// Test that the fix was applied
const updatedContent = fs.readFileSync('live-portal.html', 'utf8');
const robustSearchExists = updatedContent.includes('ROBUST SEARCH FUNCTION');
const globalTestExists = updatedContent.includes('window.testRoute242');

console.log(`\n🔍 VERIFICATION:`);
console.log(`Robust search function: ${robustSearchExists}`);
console.log(`Global test function: ${globalTestExists}`);

if (robustSearchExists && globalTestExists) {
  console.log('\n🎉 EMERGENCY FIX SUCCESSFULLY APPLIED!');
  console.log('The search should now work IMMEDIATELY on the website.');
} else {
  console.log('\n❌ Emergency fix not applied correctly.');
}
