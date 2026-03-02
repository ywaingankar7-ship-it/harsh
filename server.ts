import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "visionx-secret-key-2026";
const db = new Database("visionx.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'staff',
    branch_id INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    age INTEGER,
    gender TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    image_url TEXT,
    details TEXT
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS eye_tests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    results TEXT,
    image_url TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    inventory_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
  );

  CREATE TABLE IF NOT EXISTS prescriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    sph_od TEXT,
    cyl_od TEXT,
    axis_od TEXT,
    sph_os TEXT,
    cyl_os TEXT,
    axis_os TEXT,
    add_power TEXT,
    pd TEXT,
    doctor_notes TEXT,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed Admin if not exists
const adminEmail = "admin@visionx.com";
const adminUser = db.prepare("SELECT * FROM users WHERE email = ?").get(adminEmail);
if (!adminUser) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "VisionX Admin",
    adminEmail,
    hashedPassword,
    "admin"
  );
}

// Seed Patient if not exists
const patientEmail = "patient@visionx.ai";
const patientUser = db.prepare("SELECT * FROM users WHERE email = ?").get(patientEmail);
if (!patientUser) {
  const hashedPassword = bcrypt.hashSync("patient123", 10);
  db.prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)").run(
    "John Doe",
    patientEmail,
    hashedPassword,
    "patient"
  );
}

// Seed Inventory if empty
const invCount = db.prepare("SELECT COUNT(*) as count FROM inventory").get() as any;
if (invCount.count === 0) {
  const items = [
    { type: 'frame', brand: 'Ray-Ban', model: 'Aviator Classic', price: 163, stock: 15, image_url: 'https://picsum.photos/seed/aviator/400/300', details: JSON.stringify({ color: 'Gold', material: 'Metal', shape: 'Aviator' }) },
    { type: 'frame', brand: 'Oakley', model: 'Holbrook', price: 146, stock: 10, image_url: 'https://picsum.photos/seed/holbrook/400/300', details: JSON.stringify({ color: 'Matte Black', material: 'O Matter', shape: 'Square' }) },
    { type: 'frame', brand: 'Gucci', model: 'GG0061O', price: 390, stock: 5, image_url: 'https://picsum.photos/seed/gucci/400/300', details: JSON.stringify({ color: 'Gold/Green', material: 'Metal', shape: 'Round' }) },
    { type: 'frame', brand: 'Prada', model: 'PR 17WS', price: 410, stock: 8, image_url: 'https://picsum.photos/seed/prada/400/300', details: JSON.stringify({ color: 'Black', material: 'Acetate', shape: 'Rectangle' }) },
    { type: 'frame', brand: 'Tom Ford', model: 'FT5634-B', price: 445, stock: 4, image_url: 'https://picsum.photos/seed/tomford/400/300', details: JSON.stringify({ color: 'Shiny Black', material: 'Acetate', shape: 'Square' }) },
    { type: 'frame', brand: 'Burberry', model: 'BE2108', price: 260, stock: 12, image_url: 'https://picsum.photos/seed/burberry/400/300', details: JSON.stringify({ color: 'Dark Tortoise', material: 'Acetate', shape: 'Cat Eye' }) },
    { type: 'frame', brand: 'Persol', model: 'PO3092V', price: 280, stock: 6, image_url: 'https://picsum.photos/seed/persol/400/300', details: JSON.stringify({ color: 'Havana', material: 'Acetate', shape: 'Phantos' }) },
    { type: 'frame', brand: 'Carrera', model: '1033/S', price: 180, stock: 20, image_url: 'https://picsum.photos/seed/carrera/400/300', details: JSON.stringify({ color: 'Black/Gold', material: 'Metal', shape: 'Navigator' }) },
    { type: 'frame', brand: 'Vogue', model: 'VO5334', price: 95, stock: 25, image_url: 'https://picsum.photos/seed/vogue/400/300', details: JSON.stringify({ color: 'Pink Tortoise', material: 'Propionate', shape: 'Cat Eye' }) },
    { type: 'frame', brand: 'Armani Exchange', model: 'AX3016', price: 110, stock: 18, image_url: 'https://picsum.photos/seed/armani/400/300', details: JSON.stringify({ color: 'Matte Blue', material: 'Plastic', shape: 'Rectangle' }) },
  ];
  const stmt = db.prepare("INSERT INTO inventory (type, brand, model, price, stock, image_url, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
  items.forEach(item => stmt.run(item.type, item.brand, item.model, item.price, item.stock, item.image_url, item.details));
}

// Add the specific user-requested styles
const userStylesExist = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE model = 'Stealth Aviator'").get() as any;
if (userStylesExist.count === 0) {
  const userItems = [
    { type: 'frame', brand: 'VisionX', model: 'Stealth Aviator', price: 125, stock: 10, image_url: 'https://picsum.photos/seed/stealth-aviator/400/200', details: JSON.stringify({ color: 'Black', material: 'Metal', shape: 'Aviator' }) },
    { type: 'frame', brand: 'VisionX', model: 'Executive Gold', price: 155, stock: 8, image_url: 'https://picsum.photos/seed/exec-gold/400/200', details: JSON.stringify({ color: 'Gold/Black', material: 'Metal', shape: 'Square' }) },
    { type: 'frame', brand: 'Fastrack', model: 'Clear Glaze', price: 95, stock: 15, image_url: 'https://picsum.photos/seed/fastrack-clear/400/200', details: JSON.stringify({ color: 'Clear', material: 'Acetate', shape: 'Square' }) },
    { type: 'frame', brand: 'VisionX', model: 'Classic Noir', price: 89, stock: 20, image_url: 'https://picsum.photos/seed/classic-noir/400/200', details: JSON.stringify({ color: 'Black', material: 'Plastic', shape: 'Square' }) },
    { type: 'frame', brand: 'VisionX', model: 'Retro Round', price: 115, stock: 12, image_url: 'https://picsum.photos/seed/retro-round/400/200', details: JSON.stringify({ color: 'Gold', material: 'Metal', shape: 'Round' }) },
  ];
  const stmt = db.prepare("INSERT INTO inventory (type, brand, model, price, stock, image_url, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
  userItems.forEach(item => stmt.run(item.type, item.brand, item.model, item.price, item.stock, item.image_url, item.details));
}

// Ensure new premium items are added if they don't exist
const gucciExists = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE brand = 'Gucci'").get() as any;
if (gucciExists.count === 0) {
  const newItems = [
    { type: 'frame', brand: 'Gucci', model: 'GG0061O', price: 390, stock: 5, image_url: 'https://picsum.photos/seed/gucci/400/300', details: JSON.stringify({ color: 'Gold/Green', material: 'Metal', shape: 'Round' }) },
    { type: 'frame', brand: 'Prada', model: 'PR 17WS', price: 410, stock: 8, image_url: 'https://picsum.photos/seed/prada/400/300', details: JSON.stringify({ color: 'Black', material: 'Acetate', shape: 'Rectangle' }) },
    { type: 'frame', brand: 'Tom Ford', model: 'FT5634-B', price: 445, stock: 4, image_url: 'https://picsum.photos/seed/tomford/400/300', details: JSON.stringify({ color: 'Shiny Black', material: 'Acetate', shape: 'Square' }) },
    { type: 'frame', brand: 'Burberry', model: 'BE2108', price: 260, stock: 12, image_url: 'https://picsum.photos/seed/burberry/400/300', details: JSON.stringify({ color: 'Dark Tortoise', material: 'Acetate', shape: 'Cat Eye' }) },
    { type: 'frame', brand: 'Carrera', model: '1033/S', price: 180, stock: 20, image_url: 'https://picsum.photos/seed/carrera/400/300', details: JSON.stringify({ color: 'Black/Gold', material: 'Metal', shape: 'Navigator' }) },
    { type: 'frame', brand: 'Vogue', model: 'VO5334', price: 95, stock: 25, image_url: 'https://picsum.photos/seed/vogue/400/300', details: JSON.stringify({ color: 'Pink Tortoise', material: 'Propionate', shape: 'Cat Eye' }) },
    { type: 'frame', brand: 'Armani Exchange', model: 'AX3016', price: 110, stock: 18, image_url: 'https://picsum.photos/seed/armani/400/300', details: JSON.stringify({ color: 'Matte Blue', material: 'Plastic', shape: 'Rectangle' }) },
  ];
  const stmt = db.prepare("INSERT INTO inventory (type, brand, model, price, stock, image_url, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
  newItems.forEach(item => stmt.run(item.type, item.brand, item.model, item.price, item.stock, item.image_url, item.details));
}

const app = express();
app.use(express.json());

// Middleware: Auth
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// --- API ROUTES ---

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user: any = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ id: user.id, role: user.role, name: user.name, email: user.email }, JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
});

app.get("/api/customers", authenticate, (req, res) => {
  const customers = db.prepare("SELECT * FROM customers ORDER BY created_at DESC").all();
  res.json(customers);
});

app.post("/api/customers", authenticate, (req, res) => {
  const { name, email, phone, address, age, gender } = req.body;
  const result = db.prepare("INSERT INTO customers (name, email, phone, address, age, gender) VALUES (?, ?, ?, ?, ?, ?)").run(
    name, email, phone, address, age, gender
  );
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/inventory", authenticate, (req, res) => {
  const items = db.prepare("SELECT * FROM inventory").all();
  res.json(items);
});

app.post("/api/inventory", authenticate, (req, res) => {
  const { type, brand, model, price, stock, image_url, details } = req.body;
  const result = db.prepare("INSERT INTO inventory (type, brand, model, price, stock, image_url, details) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    type, brand, model, price, stock, image_url, details
  );
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/appointments", authenticate, (req, res) => {
  const appointments = db.prepare(`
    SELECT a.*, c.name as customer_name 
    FROM appointments a
    JOIN customers c ON a.customer_id = c.id 
    ORDER BY a.date ASC, a.time ASC
  `).all();
  res.json(appointments);
});

app.post("/api/appointments", authenticate, (req, res) => {
  const { customer_id, date, time, notes } = req.body;
  const result = db.prepare("INSERT INTO appointments (customer_id, date, time, notes) VALUES (?, ?, ?, ?)").run(
    customer_id, date, time, notes
  );
  res.json({ id: result.lastInsertRowid });
});

app.patch("/api/appointments/:id", authenticate, (req, res) => {
  const { status } = req.body;
  db.prepare("UPDATE appointments SET status = ? WHERE id = ?").run(status, req.params.id);
  res.json({ success: true });
});

app.get("/api/prescriptions", authenticate, (req, res) => {
  const prescriptions = db.prepare(`
    SELECT p.*, c.name as customer_name 
    FROM prescriptions p
    JOIN customers c ON p.customer_id = c.id 
    ORDER BY p.date DESC
  `).all();
  res.json(prescriptions);
});

app.post("/api/prescriptions", authenticate, (req, res) => {
  const { customer_id, date, sph_od, cyl_od, axis_od, sph_os, cyl_os, axis_os, add_power, pd, doctor_notes } = req.body;
  const result = db.prepare(`
    INSERT INTO prescriptions (customer_id, date, sph_od, cyl_od, axis_od, sph_os, cyl_os, axis_os, add_power, pd, doctor_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(customer_id, date, sph_od, cyl_od, axis_od, sph_os, cyl_os, axis_os, add_power, pd, doctor_notes);
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/eye-tests", authenticate, (req, res) => {
  const tests = db.prepare(`
    SELECT t.*, c.name as customer_name 
    FROM eye_tests t 
    JOIN customers c ON t.customer_id = c.id 
    ORDER BY t.date DESC
  `).all();
  res.json(tests);
});

app.post("/api/customers/test", authenticate, (req, res) => {
  const { customer_id, results } = req.body;
  const result = db.prepare("INSERT INTO eye_tests (customer_id, results) VALUES (?, ?)").run(
    customer_id, JSON.stringify(results)
  );
  res.json({ id: result.lastInsertRowid });
});

app.get("/api/cart", authenticate, (req, res) => {
  const user = (req as any).user;
  const cartItems = db.prepare(`
    SELECT c.*, i.brand, i.model, i.price, i.image_url, i.type
    FROM cart c
    JOIN inventory i ON c.inventory_id = i.id
    WHERE c.user_id = ?
  `).all(user.id);
  res.json(cartItems);
});

app.post("/api/cart", authenticate, (req, res) => {
  const user = (req as any).user;
  const { inventory_id, quantity } = req.body;
  const existing = db.prepare("SELECT * FROM cart WHERE user_id = ? AND inventory_id = ?").get(user.id, inventory_id) as any;
  if (existing) {
    db.prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?").run(quantity || 1, existing.id);
  } else {
    db.prepare("INSERT INTO cart (user_id, inventory_id, quantity) VALUES (?, ?, ?)").run(user.id, inventory_id, quantity || 1);
  }
  res.json({ success: true });
});

app.delete("/api/cart/:id", authenticate, (req, res) => {
  const user = (req as any).user;
  db.prepare("DELETE FROM cart WHERE id = ? AND user_id = ?").run(req.params.id, user.id);
  res.json({ success: true });
});

app.get("/api/analytics", authenticate, (req, res) => {
  const totalCustomers = db.prepare("SELECT COUNT(*) as count FROM customers").get() as any;
  const lowStock = db.prepare("SELECT COUNT(*) as count FROM inventory WHERE stock < 5").get() as any;
  const appointmentsToday = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date = date('now')").get() as any;
  const aiTests = db.prepare("SELECT COUNT(*) as count FROM eye_tests").get() as any;

  res.json({
    stats: {
      totalCustomers: totalCustomers.count,
      lowStock: lowStock.count,
      appointmentsToday: appointmentsToday.count,
      aiTests: aiTests.count
    }
  });
});

app.get("/api/activity-logs", authenticate, (req, res) => {
  const logs = db.prepare(`
    SELECT l.*, u.name as user_name 
    FROM activity_logs l 
    JOIN users u ON l.user_id = u.id 
    ORDER BY l.timestamp DESC 
    LIMIT 10
  `).all();
  res.json(logs);
});

app.get("/api/notifications", authenticate, (req, res) => {
  const user = (req as any).user;
  const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(user.id);
  res.json(notifications);
});

// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
const configPath = path.join(process.cwd(), "vite.config.js");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      configFile: configPath,
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => res.sendFile(path.join(__dirname, "dist/index.html")));
  }

  const PORT = 3000;
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`VisionX Server running on http://localhost:${PORT}`);
  });
}

startServer();
