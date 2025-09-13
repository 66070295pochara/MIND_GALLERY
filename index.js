// index.js
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); // parse application/json
app.use(express.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

// Static files (ถ้ามีไฟล์ public เช่น css, js, images)
app.use(express.static(path.join(__dirname, "public")));

// View engine (ถ้าใช้ EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.get("/", (req, res) => {
  res.render("homepage", { title: "Home Page" });
});

// ตัวอย่าง API route
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
