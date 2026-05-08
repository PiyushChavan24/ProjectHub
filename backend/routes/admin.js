const express = require('express');
const User    = require('../models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// ── verifyAdmin — reusable guard applied to every route in this file ──────────
const verifyAdmin = [authenticate, authorize('admin')];

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/users  — full user list (no passwords)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/admin/users', ...verifyAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/users  — manually create a user
// ─────────────────────────────────────────────────────────────────────────────
router.post('/admin/users', ...verifyAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    // Unique-index violation (code 11000) covers the duplicate-email case below —
    // no need for a separate findOne round-trip before create.
    const user = await User.create({ name, email: email.toLowerCase(), password, role: role || 'student' });

    res.status(201).json({
      message: 'User created',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/users/:id  — update name, email, or role
// Password is intentionally NOT updatable here (separate flow if needed)
// ─────────────────────────────────────────────────────────────────────────────
router.put('/admin/users/:id', ...verifyAdmin, async (req, res) => {
  try {
    const { name, email, role } = req.body;

    // Prevent an admin from accidentally demoting themselves
    if (req.params.id === req.user.id && role && role !== 'admin') {
      return res.status(400).json({ message: 'Admins cannot change their own role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name)  user.name  = name.trim();
    if (email) {
      // Check uniqueness only if email is actually changing
      if (email.toLowerCase() !== user.email) {
        const clash = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
        if (clash) return res.status(409).json({ message: 'Email already in use by another account' });
        user.email = email.toLowerCase();
      }
    }
    if (role)  user.role  = role;

    await user.save({ validateModifiedOnly: true });

    res.json({
      message: 'User updated',
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: Object.values(err.errors).map((e) => e.message).join(', ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/users/:id  — remove a user account
// An admin cannot delete their own account
// ─────────────────────────────────────────────────────────────────────────────
router.delete('/admin/users/:id', ...verifyAdmin, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Admins cannot delete their own account' });
    }

    // findByIdAndDelete returns the deleted doc in one query instead of findById + deleteOne
    const user = await User.findByIdAndDelete(req.params.id).select('name').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: `User "${user.name}" deleted successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
