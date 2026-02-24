const admin = require("../firebaseAdmin");

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split("Bearer ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    req.user = decoded; // contains uid, email, etc.
    next();
  } catch (err) {
    console.error("Firebase token verify error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyFirebaseToken;