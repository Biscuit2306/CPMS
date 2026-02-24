# 🔍 Trusted Device Token - Debugging Guide

I've added extensive logging to help identify where the issue is. Follow these steps:

## Step 1: **Check Browser Console Logs**

1. **Open DevTools**: Press `F12` or `Ctrl+Shift+I`
2. **Go to Console tab**
3. **Login and enter 2FA code with "Remember this device" checked**

Look for these console messages:

✅ **Should see:**
```
🔐 Verifying 2FA code with rememberDevice: true
✅ 2FA verification successful {success: true, ...}
```

❌ **If you see errors**: note the exact error message

---

## Step 2: **Check Browser Cookies**

1. **In DevTools, go to Storage/Application tab**
2. **Click Cookies → localhost:5000 (or your backend URL)**
3. **Look for a cookie named: `trustedDeviceToken`**

✅ **Should see:**
- Cookie name: `trustedDeviceToken`
- Path: `/`
- HttpOnly: ✓ (checked)
- Expires/Max-Age: 7 days from now

❌ **If missing**: The cookie is not being set by the backend

---

## Step 3: **Check Server Console Logs**

1. **Look at your backend terminal running `npm start`**
2. **When you verify 2FA, look for:**

✅ **Should see:**
```
✅ 2FA VERIFIED - Trusted device token set for student user
   Token expiry: 2026-03-02T...
```

❌ **If missing**: The backend isn't setting the token

---

## Step 4: **Test the Trusted Device Check**

1. **After 2FA verification, clear browser cache**
2. **Close the browser completely**
3. **Reopen browser and login again**
4. **Check console for:**

✅ **Should see (at login):**
```
🔍 Checking if device is trusted...
📡 Trusted device response: {trusted: true, message: "Device is trusted, skipping 2FA"}
✅ Device is TRUSTED - Skipping 2FA
```

❌ **If you see instead:**
```
📡 Trusted device response: {trusted: false, ...}
❌ Device NOT trusted - Requiring 2FA
```

Then check the **backend logs** which should show:
```
🔍 TRUSTED DEVICE CHECK for student:
   Token exists in DB: [true/false]
   Token match: [true/false]
   Token not expired: [true/false]
   Token expiry: ...
```

---

## 🐛 Common Issues & Fixes

### **Issue 1: Cookie not showing up in DevTools**

**Cause**: Cookies not being set by the backend
**Fix**: 
- Make sure you're checking `localhost:5000` cookies (not `localhost:5173` for frontend)
- The cookie should be set by the BACKEND when you verify 2FA

### **Issue 2: Cookie exists but trusted device check still fails**

**Cause**: Token in database doesn't match cookie
**Fix**:
- Check server logs to see if tokens match
- This could be a timing issue - wait a few seconds and try again

### **Issue 3: Cookie not being sent in requests**

**Cause**: `withCredentials: true` might not be working / CORS issue
**Fix**:
- Already added `withCredentials: true` in all requests
- Changed `sameSite` from "strict" to "lax" for better compatibility
- This should be fixed now

### **Issue 4: 5-6 minute timeout issue**

**Cause**: Cookie/session timeout or Firebase token expiration
**Fix**:
- Firebase tokens expire after 1 hour (that's expected)
- Trusted device token should be valid for 7 days
- Try logging in within 2 minutes of the first login to test

---

## 📋 What to Report

Please share the **console logs** and **server logs** showing:

1. Initial login with "Remember device" checked
2. What messages appear
3. Whether cookie shows in DevTools
4. When you login again, what messages appear
5. Server console messages for both actions

**Example format:**
```
=== FIRST LOGIN ===
Console: [paste logs]
Cookie in DevTools: [Yes/No, describe]
Server logs: [paste logs]

=== SECOND LOGIN (after logout) ===
Console: [paste logs]
Server logs: [paste logs]
```

---

## 🚀 Quick Test Command

To verify the backend is running correctly, run this in browser console:

```javascript
// Test trusted device endpoint
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(d => console.log('Backend Health:', d))
  .catch(e => console.log('Backend error:', e))
```

Should return: `{success: true, server: "healthy", ...}`

---

## 📞 Next Steps

Once you've collected the logs:

1. **Share the console logs** (F12 → Console)
2. **Share the server logs** (backend terminal)
3. **Tell me if cookie appears in DevTools**
4. **Tell me the exact error messages** (if any)

This will help me pinpoint exactly where the issue is occurring!
