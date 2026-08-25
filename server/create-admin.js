const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use the MongoDB URI from .env or hardcode it
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://henryosuagwu22_db_user:Ka6vNcMaaEdT0xz2@cluster0.ef7xxog.mongodb.net/naija-snacks?retryWrites=true&w=majority&appName=Cluster0';

// CHANGE THESE DETAILS TO YOUR OWN
const adminDetails = {
  firstName: 'Henry',                    // ← Your first name
  lastName: 'Osuagwu',                   // ← Your last name
  email: 'henry@naijasnacks.ng',         // ← Your email
  password: 'Henry123',                  // ← Your password (min 8 chars, 1 uppercase, 1 number)
  phone: '+2348000000000',               // ← Your phone number
};

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check if user exists
    const existingUser = await usersCollection.findOne({ email: adminDetails.email });

    // Hash password
    const hashedPassword = await bcrypt.hash(adminDetails.password, 10);
    console.log('🔐 Password hashed');

    if (existingUser) {
      // Update existing user to admin
      await usersCollection.updateOne(
        { email: adminDetails.email },
        { 
          $set: { 
            role: 'admin',
            password: hashedPassword,
            firstName: adminDetails.firstName,
            lastName: adminDetails.lastName,
          } 
        }
      );
      console.log('✅ Existing user updated to admin!');
    } else {
      // Create new admin
      await usersCollection.insertOne({
        firstName: adminDetails.firstName,
        lastName: adminDetails.lastName,
        email: adminDetails.email,
        password: hashedPassword,
        phone: adminDetails.phone,
        role: 'admin',
        addresses: [],
        favourites: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log('✅ New admin created!');
    }

    console.log('──────────────────────────────');
    console.log('🎉 ADMIN ACCOUNT READY');
    console.log('──────────────────────────────');
    console.log('📧 Email:', adminDetails.email);
    console.log('🔑 Password:', adminDetails.password);
    console.log('👑 Role: admin');
    console.log('──────────────────────────────');
    console.log('Login at: http://localhost:5173/login');
    console.log('Admin panel: http://localhost:5173/admin');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();