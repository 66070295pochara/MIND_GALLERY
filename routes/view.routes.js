
const router = require("express").Router();
const { requireAuth } = require("../middlewares/authenticate");
const { renderOwnGallery } = require("../controllers/gallery.controller.js");
const { renderFeedGallery } = require("../controllers/gallery.controller.js");

// แก้บั๊กเดิมที่ใช้ res.redirect, { ... }
router.get("/", (req, res) => res.redirect("/login"));

router.get("/upload", requireAuth, (req, res) => {
  const claims = req.user || {};
  const username = req.query.username || claims['cognito:username'] || claims.email || "Anonymous";
  res.render("upload", { title: "Mind Gallery - Upload", username });
});

router.get("/owngallery", requireAuth, renderOwnGallery);

router.get("/feed", requireAuth, renderFeedGallery);

module.exports = router;
