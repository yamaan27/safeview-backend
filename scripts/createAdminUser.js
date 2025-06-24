const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const hashedPassword = await bcrypt.hash("Admin@123", 10);

  const user = new User({
    name: "Admin",
    email: "admin@eqaim.com",
    password: hashedPassword,
    role: "admin",
    location_lat: 0,
    location_lng: 0,
  });

  await user.save();
  console.log("✅ Admin user created");
  mongoose.disconnect();
};

createAdmin();
