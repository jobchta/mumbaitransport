/**
 * Website Verification Script
 * Checks if the actual website is displaying the correct 518 BEST routes
 */

const https = require('https');
const http = require('http');

console.log('🔍 Verifying website BEST routes display...\n');

function checkWebsite(url, isHttps = true) {
  return new Promise((resolve, reject) => {
    const client = isHttps ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function verifyWebsite() {
  try {
    console.log('📡 Checking local server...');
    const localData = await checkWebsite('http://localhost:8000/', false);
    
    // Check for 518 routes in the HTML
    const has518Routes = localData.includes('"bus-count">518</span>') || 
                        localData.includes('id="bus-count">518</span>') ||
                        localData.includes('bus-count">518');
    
    const has3800Buses = localData.includes('"bus-ontime">3,800</span>') ||
                        localData.includes('id="bus-ontime">3,800</span>') ||
                        localData.includes('bus-ontime">3,800');
    
    console.log('📍 Local Server Results:');
    console.log(`   ✅ 518 Routes: ${has518Routes ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`   ✅ 3,800 Buses: ${has3800Buses ? 'FOUND' : 'NOT FOUND'}`);
    
    // Check for JavaScript stats
    const hasJS518 = localData.includes('count: 518') || localData.includes('count:518');
    console.log(`   ✅ JavaScript 518: ${hasJS518 ? 'FOUND' : 'NOT FOUND'}`);
    
    if (has518Routes && has3800Buses && hasJS518) {
      console.log('\n🎉 SUCCESS: Local website is correctly displaying 518 BEST routes!');
    } else {
      console.log('\n⚠️  WARNING: Some elements not found. Check implementation.');
    }
    
    // Summary
    console.log('\n📊 Verification Summary:');
    console.log('='.repeat(40));
    console.log(`✅ Local Server: ${has518Routes && has3800Buses ? 'WORKING' : 'NEEDS FIX'}`);
    console.log(`✅ 518 Routes Display: ${has518Routes ? 'CORRECT' : 'INCORRECT'}`);
    console.log(`✅ 3,800 Buses Display: ${has3800Buses ? 'CORRECT' : 'INCORRECT'}`);
    console.log(`✅ JavaScript Integration: ${hasJS518 ? 'WORKING' : 'NEEDS FIX'}`);
    console.log('='.repeat(40));
    
    if (has518Routes && has3800Buses && hasJS518) {
      console.log('\n🚌 BEST Routes Integration: FULLY FUNCTIONAL');
      console.log('✅ Website correctly displays 518 routes and 3,800 buses');
      console.log('✅ JavaScript stats are properly configured');
      console.log('✅ All elements are in sync');
    } else {
      console.log('\n🔧 BEST Routes Integration: NEEDS ATTENTION');
      console.log('❌ Some elements are not displaying correctly');
      console.log('❌ Check HTML and JavaScript implementation');
    }
    
  } catch (error) {
    console.log('❌ Error checking website:', error.message);
    console.log('💡 Make sure the local server is running: python3 -m http.server 8000');
  }
}

// Run verification
verifyWebsite().then(() => {
  console.log('\n🔍 Website verification complete!');
}).catch((error) => {
  console.log('❌ Verification failed:', error.message);
});
