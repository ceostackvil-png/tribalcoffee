import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB, User, Product, Booking } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(bodyParser.json());

// Serve static assets (media, product images) from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- API ROUTES -----------------

// 1. Auth Endpoint: Admin & User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Check admin connection
    const adminUser = await User.findOne({ email: 'admin@tribalcoffee.in' });
    if (email.toLowerCase() === 'admin@tribalcoffee.in' && password === (adminUser ? adminUser.password : 'password123')) {
      return res.json({
        success: true,
        user: {
          id: adminUser ? adminUser.id : 'adm-1',
          name: adminUser ? adminUser.name : 'tribal coffee',
          email: 'admin@tribalcoffee.in',
          role: 'Super Admin',
          address: adminUser ? adminUser.address : null
        },
        token: 'secure-token-tribal-lounge-2026'
      });
    }

    // Regular user authentication check
    const matchedUser = await User.findOne({ email: email.toLowerCase() });

    if (!matchedUser) {
      return res.status(404).json({
        success: false,
        message: 'This connoisseur profile does not exist. Please register first.'
      });
    }

    if (matchedUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Authentication rejected. Invalid password credentials.'
      });
    }

    return res.json({
      success: true,
      user: {
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role || 'Connoisseur',
        address: matchedUser.address
      }
    });
  } catch (err) {
    console.error('Error on login:', err);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
});

// 1b. Auth Endpoint: User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please complete all fields.' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });

    if (userExists) {
      return res.status(409).json({ success: false, message: 'This email is not available.' });
    }

    const newUser = await User.create({
      id: `user-${Date.now()}`,
      name,
      email: email.toLowerCase(),
      password,
      role: 'Connoisseur'
    });

    res.status(201).json({
      success: true,
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        address: null
      }
    });
  } catch (err) {
    console.error('Error on registration:', err);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
});

// 1c. Get Registered Users list for Admin
app.get('/api/auth/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error fetching user profiles.' });
  }
});

// 1f. Update user profile name and address
app.put('/api/auth/users/update', async (req, res) => {
  try {
    const { email, name, address } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in archives.' });
    }

    if (name) user.name = name;
    if (address !== undefined) user.address = address;
    await user.save();

    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error updating user details.' });
  }
});

// 1d. Create Booking/Order History
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = req.body;
    if (!booking.email || !booking.items) {
      return res.status(400).json({ success: false, message: 'Invalid booking data.' });
    }

    const newBooking = await Booking.create({
      id: `TRB-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN'),
      ...booking
    });

    res.status(201).json({ success: true, booking: newBooking });
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ success: false, message: 'Server error recording order.' });
  }
});

// 1e. Get Booking History
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ success: false, message: 'Server error retrieving orders.' });
  }
});

// 1g. Update Booking status to Dispatched
app.put('/api/bookings/:id/dispatch', async (req, res) => {
  try {
    const { id } = req.params;
    const { courier, awb } = req.body;

    const booking = await Booking.findOne({ id });

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    booking.status = 'Dispatched';
    booking.courier = courier || 'Delhivery Express';
    booking.awb = awb || `SR${Math.floor(10000000 + Math.random() * 90000000)}`;

    await booking.save();

    res.json({ success: true, booking });
  } catch (err) {
    console.error('Error dispatching booking:', err);
    res.status(500).json({ success: false, message: 'Server error updating dispatch.' });
  }
});

// 2. Fetch all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ success: false, message: 'Server error fetching product catalog.' });
  }
});

// 3. Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const newProduct = req.body;
    
    if (!newProduct.id || !newProduct.name || !newProduct.price) {
      return res.status(400).json({ success: false, message: 'Invalid product specifications.' });
    }

    // Double check ID uniqueness
    const productExists = await Product.findOne({ id: newProduct.id });
    if (productExists) {
      return res.status(409).json({ success: false, message: 'Product ID already exists in our archives.' });
    }

    await Product.create(newProduct);
    const products = await Product.find();

    res.status(201).json({ success: true, products });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: 'Server error creating product.' });
  }
});

// 4. Update an existing product
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;

    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in our archives.' });
    }

    // Preserve ID and update fields
    Object.assign(product, updatedProduct, { id });
    await product.save();

    const products = await Product.find();
    res.json({ success: true, products });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: 'Server error updating product.' });
  }
});

// 5. Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({ id });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in our archives.' });
    }

    await Product.deleteOne({ id });
    const products = await Product.find();

    res.json({ success: true, products });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ success: false, message: 'Server error deleting product.' });
  }
});

// DEFAULT PRODUCTS SEED DATA FOR FACTORY RESET
const DEFAULT_PRODUCTS = [
  {
    "id": "just-arabica-beans",
    "name": "Just Arabica Coffee Beans",
    "category": "beans",
    "tagline": "100% ORGANIC ARAKU BEANS",
    "roast": "Medium-Dark Roast",
    "roastLevel": 4,
    "strength": 4,
    "acidity": 2,
    "body": 4,
    "chicory": "0% Chicory",
    "tastingNotes": ["Sweet Caramel", "Roasted Almond", "Mild Citrus", "Smoky Oak"],
    "price": 449,
    "originalPrice": 499,
    "image": "/images/Arabica Coffee Beans.webp",
    "description": "Certified organic, hand-selected Arabica whole beans grown at high altitudes of 1,200 meters by indigenous farmers in the volcanic soil of the Araku Valley. Roasted to medium-dark complexity in micro-batches to unleash an exceptionally low-acidity cup with a velvet, chocolatey finish.",
    "aromaDescription": "Intense and welcoming with sweet hints of brown sugar and warm toasted nuts, settling into a deep, earthy cacao bloom.",
    "bgGradient": "radial-gradient(circle at 50% 40%, rgba(43, 24, 16, 0.45) 0%, rgba(17, 17, 17, 1) 70%)",
    "glowColor": "rgba(74, 44, 29, 0.45)"
  },
  {
    "id": "just-arabica-fine-powder",
    "name": "Just Arabica Fine Ground Powder",
    "category": "powder",
    "tagline": "MICRO-BATCH ARABICA ESPRESSO GRIND",
    "roast": "Medium Roast",
    "roastLevel": 3,
    "strength": 3.5,
    "acidity": 3,
    "body": 3.5,
    "chicory": "0% Chicory",
    "tastingNotes": ["Cocoa Nibs", "Warm Nutmeg", "Floral Honey"],
    "price": 449,
    "image": "/images/Arabica Fine Ground Powder.webp",
    "description": "Freshly packed-to-order organic Arabica fine grinds, tailored specifically for high-pressure brewing methods like Espresso machines, Aeropress, or traditional stovetop Moka Pots. Offers a bright, balanced crema with intricate spice profiles.",
    "aromaDescription": "Bright floral top notes interwoven with a sweet, warming fragrance of natural nutmeg and wild mountain honey.",
    "bgGradient": "radial-gradient(circle at 50% 40%, rgba(74, 44, 29, 0.45) 0%, rgba(17, 17, 17, 1) 70%)",
    "glowColor": "rgba(154, 107, 66, 0.35)"
  },
  {
    "id": "just-arabica-coarse-powder",
    "name": "Just Arabica Coarse Ground Powder",
    "category": "powder",
    "tagline": "SLOW IMMERSION DEEP BREW",
    "roast": "Medium-Dark Roast",
    "roastLevel": 4,
    "strength": 4,
    "acidity": 2,
    "body": 4,
    "chicory": "0% Chicory",
    "tastingNotes": ["Dark Chocolate", "Smoked Mahogany", "Toasted Hazelnut"],
    "price": 449,
    "image": "/images/Arabica Coarse Ground Powder.webp",
    "description": "Organic Arabica beans ground to a coarse, uniform size to prevent over-extraction. Perfect for slow immersion coffee rituals including French Press, Cold Brew drippers, or siphon brewers. Brings out heavy-bodied cocoa depths.",
    "aromaDescription": "Robust, comforting woody aromas mixed with heavy dark cocoa solids and a whisper of slow smoky oak.",
    "bgGradient": "radial-gradient(circle at 50% 40%, rgba(60, 36, 25, 0.45) 0%, rgba(17, 17, 17, 1) 70%)",
    "glowColor": "rgba(200, 169, 126, 0.35)"
  },
  {
    "id": "south-indian-filter-coffee",
    "name": "South Indian Filter Coffee Powder",
    "category": "filter",
    "tagline": "60:40 ARABICA & CHICORY BLEND",
    "roast": "Dark Roast",
    "roastLevel": 5,
    "strength": 5,
    "acidity": 1,
    "body": 5,
    "chicory": "40% Chicory",
    "tastingNotes": ["Intense Cacao", "Chicory Sweetness", "Heavy Molasses"],
    "price": 299,
    "image": "/images/South Indian Filter Coffee Powder.webp",
    "description": "The definitive traditional South Indian filter coffee blend. Combining 60% high-altitude shade-grown Arabica and Robusta beans from Araku with 40% premium, slow-roasted French chicory. Delivers an incredibly thick, strong, and highly aromatic morning cup that pairs flawlessly with warm frothed milk.",
    "aromaDescription": "Pungent, highly concentrated and dark roasted with heavy caramel sugars, sweet malted chicory, and molasses.",
    "bgGradient": "radial-gradient(circle at 50% 40%, rgba(74, 50, 35, 0.45) 0%, rgba(17, 17, 17, 1) 70%)",
    "glowColor": "rgba(212, 140, 69, 0.4)"
  },
  {
    "id": "just-arabica-cold-brew",
    "name": "Just Arabica Cold Brew Concentrate",
    "category": "specialty",
    "tagline": "24-HOUR SLOW DRIPPED NECTAR",
    "roast": "Cold Steepted",
    "roastLevel": 3,
    "strength": 4,
    "acidity": 1,
    "body": 4,
    "chicory": "0% Chicory",
    "tastingNotes": ["Vanilla Pod", "Floral Jasmine", "Crisp Toffee"],
    "price": 399,
    "image": "/images/Arabica Cold Brew Concentrate.webp",
    "description": "Our signature cold-brewed nectar, slow-extracted over 24 hours in cold spring water from pure organic Araku Arabica beans. Yields an incredibly smooth, naturally sweet concentrate containing twice the caffeine kick of hot brew, with practically zero bitterness or acidity.",
    "aromaDescription": "Soft and delicate with undercurrents of fragrant night jasmine, vanilla bean pods, and light buttery toffee.",
    "bgGradient": "radial-gradient(circle at 50% 40%, rgba(83, 59, 40, 0.45) 0%, rgba(17, 17, 17, 1) 70%)",
    "glowColor": "rgba(154, 107, 66, 0.45)"
  }
];

// 6. Reset database to default seed products
app.post('/api/products/reset', async (req, res) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(DEFAULT_PRODUCTS);
    res.json({ success: true, products: DEFAULT_PRODUCTS });
  } catch (err) {
    console.error('Error resetting products:', err);
    res.status(500).json({ success: false, message: 'Failed to reset product file.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`TRIBAL COFFEE LOUNGE BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`Serving static images from public/`);
  console.log(`MongoDB Database connection initiated`);
  console.log(`====================================================`);
});
