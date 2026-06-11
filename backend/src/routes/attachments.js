const { Router } = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const authenticate = require('../middleware/auth');
const { uploadAttachment, listAttachments } = require('../controllers/attachments.controller');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

router.use(authenticate);

router.post('/:id/attachments', upload.single('file'), uploadAttachment);
router.get('/:id/attachments', listAttachments);

module.exports = router;
