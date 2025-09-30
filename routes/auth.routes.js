const router = require("express").Router();
const ctrl = require("../controllers/auth.controller");

router.get("/signup", ctrl.renderSignup);
router.post("/signup", ctrl.signup);

router.get("/confirm", ctrl.renderConfirm);
router.post("/confirm", ctrl.confirm);

router.get("/login", ctrl.renderLogin);
router.post("/login", ctrl.login);

router.get("/logout", ctrl.logout);

router.get("/auth/callback", ctrl.oauthCallback);

module.exports = router;
