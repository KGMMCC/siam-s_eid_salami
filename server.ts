import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("salami.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_name TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    transaction_id TEXT NOT NULL UNIQUE,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );
`);

// Seed default settings and admin if not exists
const seedSettings = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
seedSettings.run("bkash_number", "017XXXXXXXX");
seedSettings.run("nagad_number", "018XXXXXXXX");
seedSettings.run("bank_name", "Sonali Bank PLC");
seedSettings.run("account_name", "Siam Mahmud Mukti");
seedSettings.run("account_number", "1234567890");
seedSettings.run("routing_number", "012345678");
seedSettings.run("branch_name", "Main Branch, Dhaka");
seedSettings.run("swift_code", "SONABDDH");
seedSettings.run("hero_title", "ঈদের চাঁদ আকাশে, সালামি দিন বিকাশে!");
seedSettings.run("hero_message", "সালামি হলো ছোটদের অধিকার আর বড়দের ভালোবাসা। তাই কৃপণতা না করে ঝটপট সালামি পাঠিয়ে দিন!");
seedSettings.run("about_message", "ঈদ মানেই আনন্দ, ঈদ মানেই খুশি। আর এই খুশিতে আপনাদের ভালোবাসা আমার জন্য সবচেয়ে বড় উপহার। সালামি শুধু টাকা নয়, এটি আপনাদের স্নেহের বহিঃপ্রকাশ।");

const adminCheck = db.prepare("SELECT * FROM admins WHERE username = ?").get("admin");
if (!adminCheck) {
  const hashedPassword = bcrypt.hashSync("admin123", 10);
  db.prepare("INSERT INTO admins (username, password) VALUES (?, ?)").run("admin", hashedPassword);
}

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  const PORT = 3000;

  app.use(express.json());

  const JWT_SECRET = process.env.JWT_SECRET || "super-secret-eid-key";

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  };

  // API Routes
  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsMap = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  });

  app.get("/api/submissions/approved", (req, res) => {
    const submissions = db.prepare("SELECT sender_name, amount, message, created_at FROM submissions WHERE status = 'approved' ORDER BY created_at DESC").all();
    res.json(submissions);
  });

  app.post("/api/submissions", (req, res) => {
    const { senderName, amount, paymentMethod, transactionId, message } = req.body;
    try {
      const stmt = db.prepare("INSERT INTO submissions (sender_name, amount, payment_method, transaction_id, message) VALUES (?, ?, ?, ?, ?)");
      stmt.run(senderName, amount, paymentMethod, transactionId, message);
      
      // Notify admin of new submission
      io.emit('new_submission');
      
      res.json({ success: true });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        res.status(400).json({ error: "Transaction ID already exists." });
      } else {
        res.status(500).json({ error: "Failed to submit." });
      }
    }
  });

  // Admin Routes
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    const admin: any = db.prepare("SELECT * FROM admins WHERE username = ?").get(username);
    if (admin && bcrypt.compareSync(password, admin.password)) {
      const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/admin/submissions", authenticateToken, (req, res) => {
    const submissions = db.prepare("SELECT * FROM submissions ORDER BY created_at DESC").all();
    res.json(submissions);
  });

  app.patch("/api/admin/submissions/:id/status", authenticateToken, (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    db.prepare("UPDATE submissions SET status = ? WHERE id = ?").run(status, id);
    
    // Notify all clients that submissions have been updated
    io.emit('submissions_updated');
    
    res.json({ success: true });
  });

  app.delete("/api/admin/submissions/:id", authenticateToken, (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM submissions WHERE id = ?").run(id);
    
    // Notify all clients
    io.emit('submissions_updated');
    
    res.json({ success: true });
  });

  app.post("/api/admin/settings", authenticateToken, (req, res) => {
    const { settings } = req.body;
    const stmt = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    const transaction = db.transaction((settingsObj) => {
      for (const [key, value] of Object.entries(settingsObj)) {
        stmt.run(key, value);
      }
    });
    transaction(settings);
    
    // Notify all clients that settings have changed
    io.emit('settings_updated');
    
    res.json({ success: true });
  });

  app.get("/api/admin/stats", authenticateToken, (req, res) => {
    const totalSalami = db.prepare("SELECT SUM(amount) as total FROM submissions WHERE status = 'approved'").get();
    const totalSubmissions = db.prepare("SELECT COUNT(*) as count FROM submissions").get();
    const pendingSubmissions = db.prepare("SELECT COUNT(*) as count FROM submissions WHERE status = 'pending'").get();
    res.json({
      totalSalami: totalSalami.total || 0,
      totalSubmissions: totalSubmissions.count,
      pendingSubmissions: pendingSubmissions.count
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
