const express = require('express');
const router = express.Router();
const { upload, cloudinary } = require('../config/cloudinary');
const protect = require('../middleware/auth');

// POST /api/upload/profile-image
router.post('/profile-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('✅ Image uploaded:', req.file.path);

    res.json({
      success: true,
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/upload/profile-image — Old image delete karo
router.delete('/profile-image', protect, async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ error: 'Public ID required' });
    }
    await cloudinary.uploader.destroy(publicId);
    res.json({ success: true, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;