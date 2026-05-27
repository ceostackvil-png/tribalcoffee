import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- SCHEMAS ---

const AddressSchema = new mongoose.Schema({
  doorNo: String,
  area: String,
  landmark: String,
  city: String,
  state: String,
  pinCode: String
}, { _id: false });

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Connoisseur' },
  address: { type: AddressSchema, default: null }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  tagline: { type: String },
  roast: { type: String },
  roastLevel: { type: Number },
  strength: { type: Number },
  acidity: { type: Number },
  body: { type: Number },
  chicory: { type: String },
  tastingNotes: [{ type: String }],
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  image: { type: String },
  description: { type: String },
  aromaDescription: { type: String },
  bgGradient: { type: String },
  glowColor: { type: String }
}, { timestamps: true });

const BookingItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const BookingSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  date: { type: String, required: true },
  email: { type: String, required: true },
  customerName: { type: String, required: true },
  city: { type: String },
  pincode: { type: String },
  items: [BookingItemSchema],
  amount: { type: Number, required: true },
  status: { type: String, default: 'Pending' },
  courier: { type: String },
  awb: { type: String }
}, { timestamps: true });

// --- MODELS ---

export const User = mongoose.model('User', UserSchema);
export const Product = mongoose.model('Product', ProductSchema);
export const Booking = mongoose.model('Booking', BookingSchema);

// --- CONNECTION AND MIGRATION ---

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tribal_coffee';
  try {
    await mongoose.connect(mongoURI);
    console.log(`MongoDB connected successfully at: ${mongoURI}`);
    await migrateDataIfNeeded();
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function migrateDataIfNeeded() {
  try {
    // 1. Migrate Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Product collection in MongoDB is empty. Checking for local JSON migration...');
      const productsPath = path.join(__dirname, 'data', 'products.json');
      if (fs.existsSync(productsPath)) {
        const raw = fs.readFileSync(productsPath, 'utf8');
        const products = JSON.parse(raw);
        if (products && products.length > 0) {
          await Product.insertMany(products);
          console.log(`Successfully migrated ${products.length} products to MongoDB.`);
        }
      }
    }

    // 2. Migrate Users
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('User collection in MongoDB is empty. Checking for local JSON migration...');
      const usersPath = path.join(__dirname, 'data', 'users.json');
      if (fs.existsSync(usersPath)) {
        const raw = fs.readFileSync(usersPath, 'utf8');
        const users = JSON.parse(raw);
        if (users && users.length > 0) {
          // Normalise roles and properties if needed, or insert directly
          await User.insertMany(users);
          console.log(`Successfully migrated ${users.length} users to MongoDB.`);
        }
      }
    }

    // Ensure super admin user exists
    const adminUser = await User.findOne({ email: 'admin@tribalcoffee.in' });
    if (!adminUser) {
      await User.create({
        id: 'adm-1',
        name: 'tribal coffee',
        email: 'admin@tribalcoffee.in',
        password: 'password123',
        role: 'Super Admin',
        address: {
          doorNo: "SF1 dno 4/147",
          area: "currency nagar",
          landmark: "near indian oil",
          city: "Vijayawada",
          state: "Andhra Pradesh",
          pinCode: "520008"
        }
      });
      console.log('Seeded default admin user to MongoDB.');
    }

    // 3. Migrate Bookings
    const bookingCount = await Booking.countDocuments();
    if (bookingCount === 0) {
      console.log('Booking collection in MongoDB is empty. Checking for local JSON migration...');
      const bookingsPath = path.join(__dirname, 'data', 'bookings.json');
      if (fs.existsSync(bookingsPath)) {
        const raw = fs.readFileSync(bookingsPath, 'utf8');
        const bookings = JSON.parse(raw);
        if (bookings && bookings.length > 0) {
          await Booking.insertMany(bookings);
          console.log(`Successfully migrated ${bookings.length} bookings to MongoDB.`);
        }
      }
    }
  } catch (err) {
    console.error('Error during database migration:', err);
  }
}
