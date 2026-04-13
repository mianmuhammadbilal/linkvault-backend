const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const Link = require('../models/Link');
const protect = require('../middleware/auth');

// POST /api/profile — Profile banao (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { username, fullName, bio, profileImage, theme } = req.body;

    // Pehle check karo is user ka profile hai ya nahi
    const existingProfile = await Profile.findOne({ userId: req.user._id });
    if (existingProfile) {
      return res.status(400).json({ error: 'Profile already exists' });
    }

    // Username available hai?
    const usernameTaken = await Profile.findOne({ username: username.toLowerCase() });
    if (usernameTaken) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    const profile = new Profile({
      userId: req.user._id,
      username,
      fullName,
      bio,
      profileImage,
      theme,
    });

    await profile.save();
    res.status(201).json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profile/:username — Public profile (no auth needed)
router.get('/:username', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      username: req.params.username.toLowerCase(),
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const links = await Link.find({
      profileId: profile._id,
      isActive: true,
    }).sort({ order: 1 });

    res.json({ success: true, profile, links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profile/:username — Update (protected)
router.put('/:username', protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      username: req.params.username.toLowerCase(),
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Sirf apna profile update kar sakta hai
    if (profile.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await Profile.findByIdAndUpdate(
      profile._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, profile: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;