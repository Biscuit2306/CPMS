const mongoose = require("mongoose");
require("dotenv").config();

async function repair() {
  try {
    console.log("🔧 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const Admin = require("./models/Admin");

    console.log("\n🔧 Dropping all indexes on Admin collection...");
    try {
      const indexes = await Admin.collection.getIndexes();
      console.log("Current indexes:", Object.keys(indexes));
      
      for (const indexName in indexes) {
        if (indexName !== "_id_") {
          console.log(`  Dropping: ${indexName}`);
          await Admin.collection.dropIndex(indexName);
        }
      }
      console.log("✅ Dropped old indexes");
    } catch (indexErr) {
      console.log("Note: Index drop had message:", indexErr.message);
    }

    console.log("\n🔧 Rebuilding indexes from schema...");
    await Admin.collection.createIndex({ firebaseUid: 1 }, { unique: true });
    console.log("✅ Created firebaseUid unique index");

    console.log("\n✅ INDEX REPAIR COMPLETE!");
    console.log("   Email field is NO LONGER unique");
    console.log("   Reload your admin dashboard - it should work now!\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ REPAIR FAILED:", err.message);
    console.error(err);
    process.exit(1);
  }
}

repair();
