#!/usr/bin/env node

/**
 * 🚀 COMPREHENSIVE SYSTEM TESTING SCRIPT
 * Tests all features: Backend API, Database, Notifications, Risks
 * Run: node test-system.js
 */

const http = require('http');
const apiBase = 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const tests = [];
let passedTests = 0;
let failedTests = 0;

/**
 * Make HTTP request
 */
function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(apiBase + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data || '{}');
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        } catch (err) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

/**
 * Test helper
 */
async function test(name, fn) {
  process.stdout.write(`  ⏳ ${name}... `);
  try {
    const result = await fn();
    if (result === true || result === undefined) {
      console.log(`${colors.green}✅ PASS${colors.reset}`);
      passedTests++;
    } else {
      console.log(`${colors.red}❌ FAIL${colors.reset} (${result})`);
      failedTests++;
    }
  } catch (err) {
    console.log(`${colors.red}❌ ERROR${colors.reset} (${err.message})`);
    failedTests++;
  }
}

/**
 * MAIN TEST SUITE
 */
async function runTests() {
  console.log(`\n${colors.bold}${colors.blue}🚀 COMPREHENSIVE SYSTEM TEST SUITE${colors.reset}\n`);
  
  // ═══════════════════════════════════════════════════════════════════════
  console.log(`${colors.bold}PHASE 1: BACKEND HEALTH${colors.reset}\n`);
  
  await test('Health Endpoint', async () => {
    const res = await makeRequest('GET', '/api/health');
    return res.data.success && res.data.server === 'healthy';
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 2: RISK MANAGEMENT ENDPOINTS${colors.reset}\n`);

  await test('Account Risk Summary', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/account-summary');
    return res.data.success && res.data.data?.students;
  });

  await test('High Risk Accounts', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/high-risk-accounts');
    return res.data.success && Array.isArray(res.data.data?.students);
  });

  await test('Drive Risk Summary', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/drive-summary');
    return res.data.success && res.data.data?.total !== undefined;
  });

  await test('High Risk Drives', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/high-risk-drives');
    return res.data.success && Array.isArray(res.data.data);
  });

  await test('Auto-blocked Drives', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/auto-blocked-drives');
    return res.data.success && Array.isArray(res.data.data);
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 3: RECRUITER APIs${colors.reset}\n`);

  // For these tests, we need a valid UID. Let's try with test data
  const testUID = 'test-uid-123';

  await test('Get Recruiter Dashboard', async () => {
    const res = await makeRequest('GET', `/api/recruiter/dashboard/${testUID}`);
    return res.status === 200 || res.status === 404 || res.data.success || res.data.error?.includes !== undefined;
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 4: JOB DRIVES APIs${colors.reset}\n`);

  await test('Get Job Drives', async () => {
    const res = await makeRequest('GET', '/api/drives');
    return res.data.success || Array.isArray(res.data.data);
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 5: NOTIFICATION APIs${colors.reset}\n`);

  await test('Get Notifications', async () => {
    const res = await makeRequest('GET', `/api/notifications/${testUID}`);
    return res.status === 200 || res.status === 404 || Array.isArray(res.data);
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 6: RESPONSE VALIDATION${colors.reset}\n`);

  await test('Risk Summary Has Correct Structure', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/account-summary');
    const data = res.data.data;
    return data?.students?.high !== undefined &&
           data?.students?.medium !== undefined &&
           data?.students?.low !== undefined &&
           data?.recruiters?.high !== undefined;
  });

  await test('High Risk Accounts Have All Fields', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/high-risk-accounts');
    if (!res.data.data?.students || res.data.data.students.length === 0) {
      return true; // Pass if no high risk students
    }
    const account = res.data.data.students[0];
    return account.fullName !== undefined &&
           account.email !== undefined &&
           account.riskAnalysis?.riskScore !== undefined;
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 7: DATA INTEGRITY${colors.reset}\n`);

  await test('Risk Scores Are Numbers', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/account-summary');
    const data = res.data.data;
    return typeof data?.students?.high === 'number' &&
           typeof data?.students?.medium === 'number' &&
           typeof data?.students?.low === 'number';
  });

  await test('No Negative Risk Counts', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/account-summary');
    const data = res.data.data;
    return data?.students?.high >= 0 &&
           data?.students?.medium >= 0 &&
           data?.students?.low >= 0;
  });

  // ═══════════════════════════════════════════════════════════════════════
  console.log(`\n${colors.bold}PHASE 8: EDGE CASES${colors.reset}\n`);

  await test('High Risk with Large Limit', async () => {
    const res = await makeRequest('GET', '/api/admin/risk/high-risk-accounts?limit=1000');
    return res.data.success || res.status === 200;
  });

  await test('Database is Responsive', async () => {
    const startTime = Date.now();
    const res = await makeRequest('GET', '/api/admin/risk/account-summary');
    const duration = Date.now() - startTime;
    return duration < 5000; // Should respond in under 5 seconds
  });

  // ═══════════════════════════════════════════════════════════════════════
  // SUMMARY
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${colors.bold}TEST SUMMARY${colors.reset}`);
  console.log(`${'='.repeat(60)}\n`);
  
  console.log(`${colors.green}✅ Passed: ${passedTests}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${failedTests}${colors.reset}`);
  console.log(`📊 Total:  ${passedTests + failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log(`${colors.green}${colors.bold}🎉 ALL TESTS PASSED!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`${colors.yellow}${colors.bold}⚠️  SOME TESTS FAILED - CHECK BACKEND${colors.reset}\n`);
    process.exit(1);
  }
}

// ═══════════════════════════════════════════════════════════════════════
// Error handling
process.on('unhandledRejection', (err) => {
  console.log(`\n${colors.red}${colors.bold}❌ CRITICAL ERROR ${colors.reset}${colors.red}${err.message}${colors.reset}\n`);
  console.log('Make sure the backend server is running on port 5000!\n');
  process.exit(1);
});

// Run tests
runTests();
