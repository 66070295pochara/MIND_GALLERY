// routes/upload.routes.js
const router = require('express').Router();
const { requireAuth } = require('../middlewares/authenticate');
const uploadController = require('../controllers/upload.controller');

router.put('/presign', requireAuth, uploadController.getPresignedPutUrl);
router.get('/', uploadController.renderUploadPage);

module.exports = router;
