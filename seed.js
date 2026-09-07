require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/user");

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB Atlas");

    const adminEmail = "admin@schoolerp.com";
    const adminPassword = "Admin@12345";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");

      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: "School Super Admin",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    console.log("Super Admin created successfully.");
    console.log(`Email: ${admin.email}`);
    console.log("Password: Admin@12345");

    await mongoose.disconnect();

    console.log("MongoDB connection closed.");
  } catch (error) {
    console.error("Seed error:", error.message);

    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }

    process.exit(1);
  }
};

seedAdmin();