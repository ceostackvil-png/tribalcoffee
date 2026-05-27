import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(bodyParser.json());

// Serve static assets (media, product images) from public/ directory
app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE_PATH = path.join(__dirname, 'data', 'products.json');
const USERS_FILE_PATH = path.join(__dirname, 'data', 'users.json');
const BOOKINGS_FILE_PATH = path.join(__dirname, 'data', 'bookings.json');

// Helper functions for reading/writing persistent product data
const readProducts = () => {
  try {
    if (!fs.existsSync(DATA_FILE_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(DATA_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading database file:', err);
    return [];
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(products, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to database file:', err);
    return false;
  }
};

const readUsers = () => {
  try {
    let users = [];
    if (fs.existsSync(USERS_FILE_PATH)) {
      const rawData = fs.readFileSync(USERS_FILE_PATH, 'utf8');
      users = JSON.parse(rawData);
    }
    // Seed Super Admin if not already present
    if (!users.some(u => u.email.toLowerCase() === 'admin@tribalcoffee.in')) {
      users.push({
        id: 'adm-1',
        name: 'Sharmila K',
        email: 'admin@tribalcoffee.in',
        password: 'password123',
        role: 'Super Admin'
      });
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
    }
    return users;
  } catch (err) {
    console.error('Error reading users file:', err);
    return [];
  }
};

const writeUsers = (users) => {
  try {
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to users file:', err);
    return false;
  }
};

const readBookings = () => {
  try {
    if (!fs.existsSync(BOOKINGS_FILE_PATH)) {
      return [];
    }
    const rawData = fs.readFileSync(BOOKINGS_FILE_PATH, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error('Error reading bookings file:', err);
    return [];
  }
};

const writeBookings = (bookings) => {
  try {
    fs.writeFileSync(BOOKINGS_FILE_PATH, JSON.stringify(bookings, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing to bookings file:', err);
    return false;
  }
};

// ----------------- API ROUTES -----------------

// 1. Auth Endpoint: Admin & User Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Load latest users list from file
  const users = readUsers();

  // Super admin check dynamically loaded from persistent database
  const adminUser = users.find(u => u.email.toLowerCase() === 'admin@tribalcoffee.in');
  if (email.toLowerCase() === 'admin@tribalcoffee.in' && password === (adminUser ? adminUser.password : 'password123')) {
    return res.json({
      success: true,
      user: {
        id: adminUser ? adminUser.id : 'adm-1',
        name: adminUser ? adminUser.name : 'Sharmila K',
        email: 'admin@tribalcoffee.in',
        role: 'Super Admin'
      },
      token: 'secure-token-tribal-lounge-2026'
    });
  }

  // Regular user authentication check
  const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

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
      role: 'Connoisseur',
      address: matchedUser.address
    }
  });
});

// 1b. Auth Endpoint: User Registration
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Please complete all fields.' });
  }

  const users = readUsers();
  const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());

  if (userExists) {
    return res.status(409).json({ success: false, message: 'This email is not available.' });
  }

  const newUser = { id: `user-${Date.now()}`, name, email, password };
  users.push(newUser);
  const success = writeUsers(users);

  if (success) {
    res.status(201).json({
      success: true,
      user: { name, email, role: 'Connoisseur', address: null }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write profile to files.' });
  }
});

// 1c. Get Registered Users list for Admin
app.get('/api/auth/users', (req, res) => {
  const users = readUsers();
  res.json(users);
});

// 1f. Update user profile name and address
app.put('/api/auth/users/update', (req, res) => {
  const { email, name, address } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required.' });
  }

  const users = readUsers();
  const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'User not found in archives.' });
  }

  if (name) users[index].name = name;
  if (address) users[index].address = address;
  const success = writeUsers(users);

  if (success) {
    const isSuperAdmin = users[index].email.toLowerCase() === 'admin@tribalcoffee.in';
    res.json({
      success: true,
      user: {
        name: users[index].name,
        email: users[index].email,
        role: isSuperAdmin ? 'Super Admin' : 'Connoisseur',
        address: users[index].address
      }
    });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update user profile.' });
  }
});

// 1d. Create Booking/Order History
app.post('/api/bookings', (req, res) => {
  const booking = req.body;
  if (!booking.email || !booking.items) {
    return res.status(400).json({ success: false, message: 'Invalid booking data.' });
  }

  const bookings = readBookings();
  const newBooking = {
    id: `TRB-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toLocaleDateString('en-IN'),
    ...booking
  };

  bookings.push(newBooking);
  const success = writeBookings(bookings);

  if (success) {
    res.status(201).json({ success: true, booking: newBooking });
  } else {
    res.status(500).json({ success: false, message: 'Failed to record booking history.' });
  }
});

// 1e. Get Booking History
app.get('/api/bookings', (req, res) => {
  const bookings = readBookings();
  res.json(bookings);
});

// 1g. Update Booking status to Dispatched
app.put('/api/bookings/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const { courier, awb } = req.body;

  const bookings = readBookings();
  const index = bookings.findIndex(b => b.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Booking not found.' });
  }

  bookings[index].status = 'Dispatched';
  bookings[index].courier = courier || 'Delhivery Express';
  bookings[index].awb = awb || `SR${Math.floor(10000000 + Math.random() * 90000000)}`;

  const success = writeBookings(bookings);

  if (success) {
    res.json({ success: true, booking: bookings[index] });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update dispatch status.' });
  }
});

// 2. Fetch all products
app.get('/api/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// 3. Add a new product
app.post('/api/products', (req, res) => {
  const newProduct = req.body;
  
  if (!newProduct.id || !newProduct.name || !newProduct.price) {
    return res.status(400).json({ success: false, message: 'Invalid product specifications.' });
  }

  const products = readProducts();
  // Double check ID uniqueness
  if (products.some(p => p.id === newProduct.id)) {
    return res.status(409).json({ success: false, message: 'Product ID already exists in our archives.' });
  }

  products.push(newProduct);
  const success = writeProducts(products);

  if (success) {
    res.status(201).json({ success: true, products });
  } else {
    res.status(500).json({ success: false, message: 'Failed to write product to files.' });
  }
});

// 4. Update an existing product
app.put('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const updatedProduct = req.body;

  const products = readProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found in our archives.' });
  }

  // Preserve ID
  products[index] = { ...updatedProduct, id };
  const success = writeProducts(products);

  if (success) {
    res.json({ success: true, products });
  } else {
    res.status(500).json({ success: false, message: 'Failed to update product file.' });
  }
});

// 5. Delete a product
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;

  const products = readProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: 'Product not found in our archives.' });
  }

  products.splice(index, 1);
  const success = writeProducts(products);

  if (success) {
    res.json({ success: true, products });
  } else {
    res.status(500).json({ success: false, message: 'Failed to delete product from archives.' });
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
app.post('/api/products/reset', (req, res) => {
  const success = writeProducts(DEFAULT_PRODUCTS);
  if (success) {
    res.json({ success: true, products: DEFAULT_PRODUCTS });
  } else {
    res.status(500).json({ success: false, message: 'Failed to reset product file.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`TRIBAL COFFEE LOUNGE BACKEND RUNNING ON PORT ${PORT}`);
  console.log(`Serving static images from public/`);
  console.log(`JSON database active at: ${DATA_FILE_PATH}`);
  console.log(`====================================================`);
});

