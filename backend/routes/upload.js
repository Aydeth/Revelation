const express = require('express');
const multer = require('multer');
const ImageKit = require('imagekit');
const router = express.Router();

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images allowed'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

router.post('/', upload.single('file'), async (req, res) => {
  console.log('🔵 Upload request received');
  console.log('📁 File:', req.file ? req.file.originalname : 'NO FILE');
  console.log('👤 User ID:', req.userId);
  
  if (!req.file) {
    console.log('❌ No file');
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    console.log('📤 Uploading to ImageKit...');
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1E9);
    const fileExtension = req.file.originalname.split('.').pop();
    const fileName = `avatars/${timestamp}-${random}.${fileExtension}`;

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: fileName,
      useUniqueFileName: true,
      folder: '/avatars',
    });

    console.log('✅ Upload successful:', result.url);
    res.json({ url: result.url });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

module.exports = router;