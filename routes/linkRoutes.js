const express = require('express');
const router = express.Router();
const Link = require('../models/Link');
const protect = require('../middleware/auth');

// POST /api/links — Create new link (protected)
router.post('/', protect, async (req, res) => {
  try {
    const { profileId, title, url, icon } = req.body;
    const count = await Link.countDocuments({ profileId });
    const link = new Link({ profileId, title, url, icon, order: count });
    await link.save();
    res.status(201).json({ success: true, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/:profileId — Get all links
router.get('/:profileId', protect, async (req, res) => {
  try {
    const links = await Link.find({
      profileId: req.params.profileId,
    }).sort({ order: 1 });
    res.json({ success: true, links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/links/:id — Update link
router.put('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/links/:id/toggle
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });
    link.isActive = !link.isActive;
    await link.save();
    res.json({ success: true, link });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/links/:id/click — Public, no auth
router.patch('/:id/click', async (req, res) => {
  try {
    const link = await Link.findByIdAndUpdate(
      req.params.id,
      { $inc: { clicks: 1 } },
      { new: true }
    );
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ success: true, clicks: link.clicks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/links/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const link = await Link.findByIdAndDelete(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });
    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/links/:profileId/analytics — Analytics data
router.get('/:profileId/analytics', protect, async (req, res) => {
  try {
    const links = await Link.find({
      profileId: req.params.profileId,
    }).sort({ clicks: -1 });

    const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);
    const activeLinks = links.filter((l) => l.isActive).length;
    const topLink = links[0] || null;

    const analyticsData = links.map((link) => ({
      id: link._id,
      title: link.title,
      clicks: link.clicks,
      isActive: link.isActive,
      icon: link.icon,
      percentage: totalClicks > 0
        ? Math.round((link.clicks / totalClicks) * 100)
        : 0,
    }));

    res.json({
      success: true,
      analytics: {
        totalClicks,
        totalLinks: links.length,
        activeLinks,
        topLink: topLink ? {
          title: topLink.title,
          clicks: topLink.clicks,
        } : null,
        links: analyticsData,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// PATCH /api/links/reorder — Links reorder karo
router.patch('/reorder', protect, async (req, res) => {
  try {
    const { links } = req.body;
    // links = [{ id: '...', order: 0 }, { id: '...', order: 1 }]

    const updatePromises = links.map((item) =>
      Link.findByIdAndUpdate(item.id, { order: item.order })
    );

    await Promise.all(updatePromises);

    res.json({ success: true, message: 'Links reordered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;