// routes/notification.routes.js
import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get user's notifications
router.get('/', auth, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, unreadOnly } = req.query;
    
    let query = { userId: req.userId };
    if (type) query.type = type;
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({
      notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Mark notification as read
router.patch('/:notificationId/read', auth, async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      notificationId: req.params.notificationId,
      userId: req.userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    next(error);
  }
});

// Mark all notifications as read
router.patch('/read-all', auth, async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete notification
router.delete('/:notificationId', auth, async (req, res, next) => {
  try {
    const result = await Notification.findOneAndDelete({
      notificationId: req.params.notificationId,
      userId: req.userId
    });

    if (!result) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;