const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// All routes here require Admin role
router.use(authenticateToken, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/students', adminController.getStudentsList);
router.get('/students/:studentId/history', adminController.getStudentHistoryForAdmin);

module.exports = router;
