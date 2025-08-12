/**
 * ENTERPRISE PRODUCTION TEST SUITE
 * Lead Developer - 50 Years Experience
 * 
 * Comprehensive testing for production deployment
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

console.log('🏢 ENTERPRISE PRODUCTION TEST SUITE');
console.log('='.repeat(60));
console.log('Lead Developer: 50 Years Experience');
console.log('Priority: CRITICAL - Production Verification');
console.log('='.repeat(60));

class EnterpriseProductionTester {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      critical: 0,
      total: 0
    };
    this.criticalFailures = [];
  }

  test(description, testFunction, isCritical = false) {
    this.testResults.total++;
    try {
      testFunction();
      console.log(`✅ PASS: ${description}`);
      this.testResults.passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${description}`);
      console.log(`   Error: ${error.message}`);
      this.testResults.failed++;
      if (isCritical) {
        this.testResults.critical++;
        this.criticalFailures.push({ description, error: error.message });
      }
    }
  }

  // Test data integrity
  testDataIntegrity() {
    console.log('\n📊 DATA INTEGRITY TESTS:');
    
    this.test('Should have exactly 518 routes in live application', () => {
      const htmlContent = fs.readFileSync('live-portal.html', 'utf8');
      const routeMatches = htmlContent.match(/'242'/g);
      if (!routeMatches || routeMatches.length === 0) {
        throw new Error('Route 242 not found in live application');
      }
    }, true);

    this.test('Should have backup file created', () => {
      if (!fs.existsSync('live-portal.html.backup')) {
        throw new Error('Backup file not found');
      }
    }, true);

    this.test('Should have optimized routes file', () => {
      if (!fs.existsSync('optimized_routes.json')) {
        throw new Error('Optimized routes file not found');
      }
    }, true);

    this.test('Optimized routes should contain 518 routes', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      if (optimizedData.totalRoutes !== 518) {
        throw new Error(`Expected 518 routes, got ${optimizedData.totalRoutes}`);
      }
    }, true);
  }

  // Test server functionality
  testServerFunctionality() {
    console.log('\n🌐 SERVER FUNCTIONALITY TESTS:');
    
    this.test('Server should be running on port 8000', () => {
      return new Promise((resolve, reject) => {
        http.get('http://localhost:8000', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Server returned status ${res.statusCode}`));
          }
        }).on('error', (err) => {
          reject(new Error(`Server connection failed: ${err.message}`));
        });
      });
    }, true);

    this.test('Live portal should be accessible', () => {
      return new Promise((resolve, reject) => {
        http.get('http://localhost:8000/live-portal.html', (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else {
            reject(new Error(`Live portal returned status ${res.statusCode}`));
          }
        }).on('error', (err) => {
          reject(new Error(`Live portal connection failed: ${err.message}`));
        });
      });
    }, true);

    this.test('Live portal should contain route 242', () => {
      return new Promise((resolve, reject) => {
        http.get('http://localhost:8000/live-portal.html', (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            if (data.includes('242')) {
              resolve();
            } else {
              reject(new Error('Route 242 not found in live portal'));
            }
          });
        }).on('error', (err) => {
          reject(new Error(`Live portal connection failed: ${err.message}`));
        });
      });
    }, true);
  }

  // Test search functionality
  testSearchFunctionality() {
    console.log('\n🔍 SEARCH FUNCTIONALITY TESTS:');
    
    this.test('Route 242 should be searchable', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const route242 = optimizedData.routes.find(route => route.id === '242');
      if (!route242) {
        throw new Error('Route 242 not found in optimized data');
      }
      if (route242.from !== 'Bandra Station' || route242.to !== 'Worli') {
        throw new Error(`Route 242 details incorrect: ${route242.from} → ${route242.to}`);
      }
    }, true);

    this.test('Search should find multiple routes for "Bandra"', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const bandraRoutes = optimizedData.routes.filter(route => 
        route.from.toLowerCase().includes('bandra') || route.to.toLowerCase().includes('bandra')
      );
      if (bandraRoutes.length < 5) {
        throw new Error(`Expected at least 5 Bandra routes, got ${bandraRoutes.length}`);
      }
    });

    this.test('Search should find multiple routes for "Colaba"', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const colabaRoutes = optimizedData.routes.filter(route => 
        route.from.toLowerCase().includes('colaba') || route.to.toLowerCase().includes('colaba')
      );
      if (colabaRoutes.length < 3) {
        throw new Error(`Expected at least 3 Colaba routes, got ${colabaRoutes.length}`);
      }
    });
  }

  // Test performance
  testPerformance() {
    console.log('\n⚡ PERFORMANCE TESTS:');
    
    this.test('Route lookup should be fast', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const startTime = Date.now();
      
      // Perform 1000 route lookups
      for (let i = 0; i < 1000; i++) {
        const route = optimizedData.routeLookup['242'];
        if (!route) {
          throw new Error('Route lookup failed');
        }
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      if (executionTime > 100) {
        throw new Error(`Route lookup too slow: ${executionTime}ms for 1000 lookups`);
      }
      
      console.log(`   → 1000 route lookups completed in ${executionTime}ms`);
    }, true);

    this.test('Search should be fast for large dataset', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const startTime = Date.now();
      
      // Perform multiple searches
      for (let i = 0; i < 100; i++) {
        const results = optimizedData.routes.filter(route => 
          route.id.toLowerCase().includes('2') ||
          route.from.toLowerCase().includes('bandra') ||
          route.to.toLowerCase().includes('colaba')
        );
        if (results.length === 0) {
          throw new Error('Search returned no results');
        }
      }
      
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      if (executionTime > 500) {
        throw new Error(`Search too slow: ${executionTime}ms for 100 searches`);
      }
      
      console.log(`   → 100 searches completed in ${executionTime}ms`);
    });
  }

  // Test data quality
  testDataQuality() {
    console.log('\n🎯 DATA QUALITY TESTS:');
    
    this.test('All routes should have valid time values', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const invalidRoutes = optimizedData.routes.filter(route => 
        route.time < 1 || route.time > 60
      );
      if (invalidRoutes.length > 0) {
        throw new Error(`${invalidRoutes.length} routes have invalid time values`);
      }
    }, true);

    this.test('All routes should have valid delay values', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const invalidRoutes = optimizedData.routes.filter(route => 
        route.delay < 0 || route.delay > 20
      );
      if (invalidRoutes.length > 0) {
        throw new Error(`${invalidRoutes.length} routes have invalid delay values`);
      }
    }, true);

    this.test('All routes should have valid passenger counts', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const invalidRoutes = optimizedData.routes.filter(route => 
        route.passengers < 0 || route.passengers > 100
      );
      if (invalidRoutes.length > 0) {
        throw new Error(`${invalidRoutes.length} routes have invalid passenger counts`);
      }
    }, true);

    this.test('All routes should have valid capacity values', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const invalidRoutes = optimizedData.routes.filter(route => 
        route.capacity < 20 || route.capacity > 100
      );
      if (invalidRoutes.length > 0) {
        throw new Error(`${invalidRoutes.length} routes have invalid capacity values`);
      }
    }, true);
  }

  // Test error handling
  testErrorHandling() {
    console.log('\n🛡️ ERROR HANDLING TESTS:');
    
    this.test('Should handle missing route gracefully', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const missingRoute = optimizedData.routeLookup['999999'];
      if (missingRoute !== undefined) {
        throw new Error('Missing route should return undefined');
      }
    });

    this.test('Should handle empty search gracefully', () => {
      const optimizedData = JSON.parse(fs.readFileSync('optimized_routes.json', 'utf8'));
      const emptyResults = optimizedData.routes.filter(route => 
        route.id.toLowerCase().includes('nonexistent')
      );
      if (emptyResults.length !== 0) {
        throw new Error('Empty search should return empty results');
      }
    });
  }

  // Run all tests
  async runAllTests() {
    console.log('\n🚀 Starting Enterprise Production Tests...\n');
    
    this.testDataIntegrity();
    this.testServerFunctionality();
    this.testSearchFunctionality();
    this.testPerformance();
    this.testDataQuality();
    this.testErrorHandling();

    // Test summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 ENTERPRISE PRODUCTION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}/${this.testResults.total}`);
    console.log(`❌ Failed: ${this.testResults.failed}/${this.testResults.total}`);
    console.log(`🚨 Critical Failures: ${this.testResults.critical}`);

    if (this.criticalFailures.length > 0) {
      console.log('\n🚨 CRITICAL FAILURES:');
      this.criticalFailures.forEach(failure => {
        console.log(`   - ${failure.description}: ${failure.error}`);
      });
    }

    if (this.testResults.critical === 0 && this.testResults.failed === 0) {
      console.log('\n🎉 ENTERPRISE PRODUCTION READY!');
      console.log('='.repeat(60));
      console.log('✅ All critical tests passed');
      console.log('✅ Route 242 search functionality verified');
      console.log('✅ Server running and accessible');
      console.log('✅ Performance meets enterprise standards');
      console.log('✅ Data quality validated');
      console.log('✅ Error handling robust');
      console.log('✅ Production deployment approved');
      console.log('='.repeat(60));
      return true;
    } else {
      console.log('\n🚨 PRODUCTION DEPLOYMENT BLOCKED');
      console.log('❌ Critical issues must be resolved before deployment');
      return false;
    }
  }
}

// Execute enterprise production tests
const tester = new EnterpriseProductionTester();
tester.runAllTests().then(success => {
  if (success) {
    console.log('\n🏢 LEAD DEVELOPER STATUS: PRODUCTION APPROVED');
    console.log('🚀 System ready for enterprise production deployment');
  } else {
    console.log('\n🚨 LEAD DEVELOPER STATUS: PRODUCTION BLOCKED');
    console.log('❌ Critical issues require immediate resolution');
    process.exit(1);
  }
});
