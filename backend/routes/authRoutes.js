const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const Student = require("../models/Student");
const Recruiter = require("../models/Recruiter");
const Admin = require("../models/Admin");

const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const verifyFirebaseToken = require("../middlewares/verifyFirebaseToken");

// =======================================================
// 🔧 HELPERS
// =======================================================

// ----------------------------
// Helper: find user by role
// ✅ checks firebaseUid first, then email fallback
// ----------------------------
const findUserByRole = async (role, firebaseUid, email = "") => {
  const safeEmail = (email || "").toLowerCase().trim();

  if (role === "student") {
    let user = await Student.findOne({ firebaseUid });
    if (!user && safeEmail) user = await Student.findOne({ email: safeEmail });
    return user;
  }

  if (role === "recruiter") {
    let user = await Recruiter.findOne({ firebaseUid });
    if (!user && safeEmail) user = await Recruiter.findOne({ email: safeEmail });
    return user;
  }

  if (role === "admin") {
    let user = await Admin.findOne({ firebaseUid });
    if (!user && safeEmail) user = await Admin.findOne({ email: safeEmail });
    return user;
  }

  return null;
};

// ----------------------------
// Helper: update user by role
// ----------------------------
const updateUserByRole = async (role, firebaseUid, updateObj) => {
  if (role === "student")
    return await Student.findOneAndUpdate({ firebaseUid }, updateObj, { new: true });

  if (role === "recruiter")
    return await Recruiter.findOneAndUpdate({ firebaseUid }, updateObj, { new: true });

  if (role === "admin")
    return await Admin.findOneAndUpdate({ firebaseUid }, updateObj, { new: true });

  return null;
};

// =======================================================
// 📝 REGISTER
// =======================================================
router.post("/register", async (req, res) => {
  try {
    const { role, firebaseUid, ...profileData } = req.body;

    if (!firebaseUid || !role) {
      return res.status(400).json({ message: "Missing firebaseUid or role" });
    }

    // ❌ Prevent duplicate across all roles
    const exists =
      (await Student.findOne({ firebaseUid })) ||
      (await Recruiter.findOne({ firebaseUid })) ||
      (await Admin.findOne({ firebaseUid }));

    if (exists) {
      return res.status(409).json({ message: "User already registered" });
    }

    const baseData = {
      firebaseUid,
      fullName: profileData.fullName || "",
      email: profileData.email || "",
      phone: profileData.phone || null,
    };

    let user;

    if (role === "student") {
      user = await Student.create(baseData);
    } else if (role === "recruiter") {
      user = await Recruiter.create({
        ...baseData,
        companyName: profileData.companyName || "",
        designation: profileData.designation || "",
        companyWebsite: profileData.companyWebsite || "",
        companySize: profileData.companySize || "",
      });
    } else if (role === "admin") {
      user = await Admin.create({
        ...baseData,
        collegeName: profileData.collegeName || "",
        employeeId: profileData.employeeId || "",
        adminRole: profileData.adminRole || "",
        department: profileData.department || "",
      });
    } else {
      return res.status(400).json({ message: "Invalid role" });
    }

    res.status(201).json({ role, user });
  } catch (err) {
    console.error("REGISTER ERROR FULL:", {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", error: err.message });
    }

    if (err.code === 11000) {
      return res.status(409).json({ message: "Duplicate user" });
    }

    res.status(500).json({ message: "Server error: " + err.message });
  }
});

// =======================================================
// 🔑 RESOLVE LOGIN
// 🔥 Firebase token verified
// ✅ Email fallback + firebaseUid sync + 2FA status
// =======================================================
router.post("/resolve-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestedRole } = req.body;
    const firebaseUid = req.user?.uid;
    const firebaseEmail = req.user?.email || "";

    if (!firebaseUid || !requestedRole) {
      return res.status(400).json({ error: "Missing firebaseUid or requestedRole" });
    }

    let user = await findUserByRole(requestedRole, firebaseUid, firebaseEmail);

    // ✅ If found by email but firebaseUid mismatch → sync firebaseUid
    if (user && user.firebaseUid !== firebaseUid) {
      if (requestedRole === "student") {
        user = await Student.findOneAndUpdate({ _id: user._id }, { firebaseUid }, { new: true });
      } else if (requestedRole === "recruiter") {
        user = await Recruiter.findOneAndUpdate({ _id: user._id }, { firebaseUid }, { new: true });
      } else if (requestedRole === "admin") {
        user = await Admin.findOneAndUpdate({ _id: user._id }, { firebaseUid }, { new: true });
      }
    }

    if (!user) {
      return res.status(403).json({ error: "Unauthorized role access" });
    }

    res.json({
      role: requestedRole,
      user,
      twoFactorEnabled: user.twoFactorEnabled || false,
    });
  } catch (err) {
    console.error("RESOLVE LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================================================
// 🔑 GOOGLE LOGIN
// 🔥 Firebase token verified
// ✅ Email fallback + firebaseUid sync + 2FA status
// =======================================================
router.post("/google-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { requestedRole, ...profile } = req.body;
    const firebaseUid = req.user?.uid;
    const firebaseEmail = req.user?.email || "";

    if (!firebaseUid || !requestedRole) {
      return res.status(400).json({ error: "Missing firebaseUid or requestedRole" });
    }

    const safeProfile = {
      firebaseUid,
      fullName: profile.fullName || "",
      email: profile.email || firebaseEmail || "",
      phone: profile.phone || null,
    };

    let user;

    if (requestedRole === "student") {
      user = await Student.findOne({ firebaseUid });
      if (!user && safeProfile.email) {
        user = await Student.findOne({ email: safeProfile.email.toLowerCase() });
      }
      if (!user) {
        user = await Student.create(safeProfile);
      } else {
        const updateObj = {};
        if (user.firebaseUid !== firebaseUid) updateObj.firebaseUid = firebaseUid;
        if (!user.fullName && safeProfile.fullName) updateObj.fullName = safeProfile.fullName;
        if (Object.keys(updateObj).length > 0) {
          user = await Student.findOneAndUpdate({ _id: user._id }, updateObj, { new: true });
        }
      }
    } else if (requestedRole === "recruiter") {
      user = await Recruiter.findOne({ firebaseUid });
      if (!user && safeProfile.email) {
        user = await Recruiter.findOne({ email: safeProfile.email.toLowerCase() });
      }
      if (!user) {
        user = await Recruiter.create({
          ...safeProfile,
          companyName: profile.companyName || "",
          designation: profile.designation || "",
          companyWebsite: profile.companyWebsite || "",
          companySize: profile.companySize || "",
        });
      } else {
        const updateObj = {};
        if (user.firebaseUid !== firebaseUid) updateObj.firebaseUid = firebaseUid;
        if (!user.fullName && safeProfile.fullName) updateObj.fullName = safeProfile.fullName;
        if (Object.keys(updateObj).length > 0) {
          user = await Recruiter.findOneAndUpdate({ _id: user._id }, updateObj, { new: true });
        }
      }
    } else if (requestedRole === "admin") {
      user = await Admin.findOne({ firebaseUid });
      if (!user && safeProfile.email) {
        user = await Admin.findOne({ email: safeProfile.email.toLowerCase() });
      }
      if (!user) {
        user = await Admin.create({
          ...safeProfile,
          collegeName: profile.collegeName || "",
          employeeId: profile.employeeId || "",
          adminRole: profile.adminRole || "",
          department: profile.department || "",
        });
      } else {
        const updateObj = {};
        if (user.firebaseUid !== firebaseUid) updateObj.firebaseUid = firebaseUid;
        if (!user.fullName && safeProfile.fullName) updateObj.fullName = safeProfile.fullName;
        if (Object.keys(updateObj).length > 0) {
          user = await Admin.findOneAndUpdate({ _id: user._id }, updateObj, { new: true });
        }
      }
    } else {
      return res.status(400).json({ error: "Invalid role" });
    }

    res.json({
      role: requestedRole,
      user,
      twoFactorEnabled: user.twoFactorEnabled || false,
    });
  } catch (err) {
    console.error("GOOGLE LOGIN ERROR DETAILS:", {
      message: err.message,
      name: err.name,
      code: err.code,
      stack: err.stack,
    });

    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation error", details: err.message });
    }

    if (err.code === 11000) {
      return res.status(409).json({ error: "User already exists" });
    }

    res.status(500).json({ error: "Server error: " + err.message });
  }
});

// =======================================================
// 🔐 2FA ROUTES (AUTHENTICATOR APP)
// =======================================================

// ----------------------------
// 1) SETUP 2FA — generate QR
// POST /api/auth/2fa/setup
// ----------------------------
router.post("/2fa/setup", verifyFirebaseToken, async (req, res) => {
  try {
    const { role } = req.body;
    const firebaseUid = req.user?.uid;

    if (!role) {
      return res.status(400).json({ error: "Missing role" });
    }

    const user = await findUserByRole(role, firebaseUid);

    if (!user) {
      return res.status(404).json({ error: "User not found for role" });
    }

    if (user.twoFactorEnabled) {
      return res.json({ alreadyEnabled: true, message: "2FA already enabled" });
    }

    const secret = speakeasy.generateSecret({ name: `CPMS (${role})` });
    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url);

    await updateUserByRole(role, firebaseUid, { twoFactorSecret: secret.base32 });

    res.json({
      alreadyEnabled: false,
      qrCode: qrDataUrl,
      secret: secret.base32,
    });
  } catch (err) {
    console.error("2FA SETUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------------
// POST /api/auth/2fa/verify-setup
// ----------------------------
router.post("/2fa/verify-setup", verifyFirebaseToken, async (req, res) => {
  try {
    const { role, otp } = req.body;
    const firebaseUid = req.user?.uid;

    if (!role || !otp) {
      return res.status(400).json({ error: "Missing role or otp" });
    }

    // Validate OTP length
    if (otp.length !== 6 || isNaN(otp)) {
      return res.status(400).json({ error: "OTP must be 6 digits" });
    }

    const user = await findUserByRole(role, firebaseUid);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ error: "2FA not initialized" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: "Invalid OTP. Check time sync." });
    }

    await updateUserByRole(role, firebaseUid, { twoFactorEnabled: true });

    res.json({ success: true, message: "2FA enabled successfully" });
  } catch (err) {
    console.error("2FA VERIFY SETUP ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 3) VERIFY LOGIN OTP (every login)
// POST /api/auth/2fa/verify-login
// ----------------------------
router.post("/2fa/verify-login", verifyFirebaseToken, async (req, res) => {
  try {
    const { role, otp, rememberDevice } = req.body;
    const firebaseUid = req.user?.uid;

    if (!role || !otp) {
      return res.status(400).json({ error: "Missing role or otp" });
    }

    // Validate OTP length
    if (otp.length !== 6 || isNaN(otp)) {
      return res.status(400).json({ error: "OTP must be 6 digits" });
    }

    const user = await findUserByRole(role, firebaseUid);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(403).json({ error: "2FA not enabled. Setup required." });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: otp,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: "Invalid OTP. Check time sync." });
    }

    // ✅ Generate trusted device token (valid 7 days)
    let updateObj = {};
    if (rememberDevice) {
      const trustedToken = crypto.randomBytes(32).toString("hex");
      const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      updateObj = {
        trustedDeviceToken: trustedToken,
        trustedDeviceExpiry: expiryDate,
      };

      await updateUserByRole(role, firebaseUid, updateObj);

      // 🍪 Set secure httpOnly cookie (CRITICAL: secure must be false on localhost)
      const cookieOptions = {
        httpOnly: true,
        secure: false, // ⚠️ MUST be false for localhost (http), true only for production (https)
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      };

      res.cookie("trustedDeviceToken", trustedToken, cookieOptions);

      console.log(`✅ 2FA VERIFIED - Trusted device token set for ${role} user`);
      console.log(`   Cookie name: trustedDeviceToken`);
      console.log(`   Cookie options:`, cookieOptions);
      console.log(`   Token: ${trustedToken.substring(0, 10)}...`);
      console.log(`   Token expiry: ${expiryDate.toISOString()}`);
    }

    res.json({
      success: true,
      message: "2FA verified",
      verified: true,
      trustedDevice: rememberDevice ? true : false,
    });
  } catch (err) {
    console.error("2FA VERIFY LOGIN ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================================================
// 🚪 LOGOUT & CLEAR TRUSTED DEVICE
// POST /api/auth/logout
// =======================================================
router.post("/logout", verifyFirebaseToken, async (req, res) => {
  try {
    const { role } = req.body;
    const firebaseUid = req.user?.uid;

    if (!role) {
      return res.status(400).json({ error: "Missing role" });
    }

    const user = await findUserByRole(role, firebaseUid);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ NOTE: We DO NOT clear the trusted device token on logout
    // Reason: Logout = end session, but device should remain trusted for next login
    // User can explicitly "untrust device" if they want (separate feature)
    
    console.log(`🚪 User logging out - Device remains trusted for 7 days`);

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// =======================================================
// ✅ CHECK TRUSTED DEVICE (Skip 2FA if valid)
// POST /api/auth/check-trusted-device
// =======================================================
router.post("/check-trusted-device", verifyFirebaseToken, async (req, res) => {
  try {
    const { role } = req.body;
    const firebaseUid = req.user?.uid;
    const trustedToken = req.cookies?.trustedDeviceToken;

    if (!role) {
      return res.status(400).json({ error: "Missing role" });
    }

    console.log(`\n🔍 TRUSTED DEVICE CHECK for ${role}:`);
    console.log(`   All cookies received:`, Object.keys(req.cookies || {}));
    console.log(`   trustedDeviceToken: ${trustedToken ? trustedToken.substring(0, 10) + "..." : "NOT FOUND"}`);

    if (!trustedToken) {
      console.log(`   ❌ No trusted token in cookies - Requiring 2FA\n`);
      return res.json({ trusted: false, message: "No token found" });
    }

    const user = await findUserByRole(role, firebaseUid);

    if (!user) {
      console.log(`   ❌ User not found for role: ${role}`);
      return res.status(404).json({ error: "User not found" });
    }

    // ✅ Check if trusted device token is valid
    const tokenMatch = user.trustedDeviceToken === trustedToken;
    const tokenNotExpired = user.trustedDeviceExpiry && new Date(user.trustedDeviceExpiry) > new Date();

    console.log(`   Token in DB: ${user.trustedDeviceToken ? user.trustedDeviceToken.substring(0, 10) + "..." : "EMPTY"}`);
    console.log(`   Token match: ${tokenMatch}`);
    console.log(`   Token not expired: ${tokenNotExpired}`);
    if (user.trustedDeviceExpiry) {
      console.log(`   Token expiry: ${new Date(user.trustedDeviceExpiry).toISOString()}`);
    }

    if (tokenMatch && tokenNotExpired) {
      console.log(`   ✅ TRUSTED DEVICE AUTHORIZED - Skipping 2FA\n`);
      return res.json({
        trusted: true,
        message: "Device is trusted, skipping 2FA",
      });
    }

    // ❌ Token expired or mismatch
    console.log(`   ❌ DEVICE NOT TRUSTED - Requiring 2FA\n`);
    return res.json({
      trusted: false,
      message: "Token expired or invalid",
    });
  } catch (err) {
    console.error("CHECK TRUSTED DEVICE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;