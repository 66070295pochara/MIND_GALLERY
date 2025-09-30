require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
const viewRoutes = require("./routes/view.routes");
const authRoutes = require("./routes/auth.routes");

app.use("/", viewRoutes);
app.use("/", authRoutes);

const postRoutes = require("./routes/upload.routes");
app.use("/upload", postRoutes);
// 404
app.use((req, res) => res.status(404).send("Not found"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`http://localhost:${PORT}/`));
