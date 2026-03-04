/**
 * 🔧 DEBUGGING UTILITIES FOR ROUTE TROUBLESHOOTING
 * Copy this into your server.js during debugging
 */

// ════════════════════════════════════════════════════════════════════════════
// ADD THIS TO server.js - AFTER CORS MIDDLEWARE, BEFORE ROUTES
// ════════════════════════════════════════════════════════════════════════════

// ✅ DETAILED REQUEST LOGGING MIDDLEWARE
app.use((req, res, next) => {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  console.log(`\n${'═'.repeat(80)}`);
  console.log(`📌 REQUEST [${requestId}] ${req.method} ${req.originalUrl}`);
  console.log(`📝 Headers: Content-Type = ${req.headers['content-type']}`);
  console.log(`📝 Body: ${JSON.stringify(req.body).substring(0, 200)}`);
  console.log(`${'═'.repeat(80)}\n`);

  // Intercept res.json to log responses
  const originalJson = res.json.bind(res);
  res.json = function(data) {
    const duration = Date.now() - startTime;
    console.log(`✅ RESPONSE [${requestId}] ${res.statusCode} (${duration}ms)`);
    console.log(`   Data: ${JSON.stringify(data).substring(0, 200)}`);
    return originalJson(data);
  };

  // Intercept res.status to catch status changes
  const originalStatus = res.status.bind(res);
  res.status = function(code) {
    console.log(`⚠️  STATUS [${requestId}] Changed to: ${code}`);
    return originalStatus(code);
  };

  next();
});

// ════════════════════════════════════════════════════════════════════════════
// DIAGNOSTIC ENDPOINTS
// ════════════════════════════════════════════════════════════════════════════

// Test if server is responding
app.get("/api/test", (req, res) => {
  res.json({ success: true, message: "Server is responding!" });
});

// Test if middleware is working
app.post("/api/test-post", (req, res) => {
  res.json({
    success: true,
    message: "POST middleware working!",
    receivedBody: req.body,
  });
});

// Test drives endpoint specifically
app.post("/api/test-drives", (req, res) => {
  console.log("\n🔥🔥🔥 TEST DRIVES ENDPOINT HIT 🔥🔥🔥");
  console.log("Body:", req.body);
  res.json({
    success: true,
    message: "Test drives endpoint working!",
    receivedData: req.body,
  });
});

// Routes health check
app.get("/api/routes", (req, res) => {
  const routes = [];
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Direct route
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods),
      });
    } else if (middleware.name === "router") {
      // Router middleware
      const prefix = middleware.regexp.source
        .replace(/\\\/|\\\/\$|[()]/g, "")
        .replace("api", "/api");
      
      middleware.handle.stack?.forEach((nestedRoute) => {
        if (nestedRoute.route) {
          routes.push({
            path: prefix + nestedRoute.route.path,
            methods: Object.keys(nestedRoute.route.methods),
          });
        }
      });
    }
  });

  res.json({
    success: true,
    totalRoutes: routes.length,
    routes: routes.slice(0, 50), // First 50 routes
  });
});

// ════════════════════════════════════════════════════════════════════════════
// TROUBLESHOOTING STEPS
// ════════════════════════════════════════════════════════════════════════════

/*

STEP 1: Check if server is running
---------------------------------
curl http://localhost:5000/api/health

Expected Response:
{
  "success": true,
  "server": "healthy",
  "database": "connected",
  "timestamp": "..."
}


STEP 2: Check if middleware is working
---------------------------------------
curl -X POST http://localhost:5000/api/test-post \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'

Expected Response:
{
  "success": true,
  "message": "POST middleware working!",
  "receivedBody": {"test": "data"}
}


STEP 3: Check if drives endpoint exists
----------------------------------------
curl http://localhost:5000/api/drives

Expected Response:
{
  "success": true,
  "data": [ ... list of drives ... ]
}


STEP 4: Test POST to drives (minimal payload)
---------------------------------------------
curl -X POST http://localhost:5000/api/drives \
  -H "Content-Type: application/json" \
  -d '{
    "recruiterFirebaseUid": "test-uid-123",
    "driveData": {
      "company": "TestCorp",
      "position": "Software Engineer"
    }
  }'

Expected Response with test UID:
{
  "error": "Recruiter not found"
}
(This is expected - it means the endpoint IS working, just no recruiter with that UID)


STEP 5: Test POST after checking if server is logging
------------------------------------------------------
1. Start server and watch console
2. Run the curl command above
3. Check if you see "📌 REQUEST [id] POST /api/drives" in the logs
4. If not logged, check CORS
5. If logged, check the error message


IF PROBLEM IS CORS:
------------------
Add this to server.js BEFORE routes:

app.options('*', cors()); // For preflight requests

*/

// ════════════════════════════════════════════════════════════════════════════
// EXPORT DEBUGGING NOTES
// ════════════════════════════════════════════════════════════════════════════

const DEBUG_NOTES = `
🔍 DEBUGGING ROUTES - ACTION ITEMS

1. IS SERVER RESPONDING?
   curl http://localhost:5000/api/health
   Should return 200 with server info

2. IS MIDDLEWARE PROCESSING REQUESTS?
   curl -X POST http://localhost:5000/api/test-post -H "Content-Type: application/json" -d '{"test":"data"}'
   Should return 200 with your data

3. IS /api/drives ENDPOINT RESPONDING?
   curl -X GET http://localhost:5000/api/drives
   Should return 200 with drives list

4. IS POST /api/drives RESPONDING?
   curl -X POST http://localhost:5000/api/drives \\
     -H "Content-Type: application/json" \\
     -d '{
       "recruiterFirebaseUid": "test-uid",
       "driveData": {"company": "Test", "position": "Role"}
     }'
   
   Expected Response:
   - If recruiter exists: 200 with drive data
   - If recruiter not found: 404 with "Recruiter not found"
   - If validation fails: 400 with error message
   - If server error: 500 with error message

5. ARE YOU SEEING CONSOLE LOGS?
   Look for: "📌 REQUEST [id] POST /api/drives"
   If NOT appearing: CORS is likely blocking the request
   If appearing: Error is in the handler

6. CHECK RECRUITER EXISTS
   Login as recruiter first, then try to create drive
   Make sure recruiter is properly created in MongoDB

COMMON ISSUES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issue: 404 Not Found
Cause: Recruiter doesn't exist in DB
Fix:   Login as recruiter first

Issue: 404 Not Found (not even logging request)
Cause: CORS blocking the request
Fix:   Add app.options('*', cors()); before routes

Issue: 400 Bad Request
Cause: Missing recruiterFirebaseUid or driveData
Fix:   Check axios payload structure

Issue: 500 Internal Server Error  
Cause: MongoDB error or validation error
Fix:   Check error details in server logs
`;

module.exports = { DEBUG_NOTES };
