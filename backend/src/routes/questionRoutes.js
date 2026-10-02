const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Get questions (accessible to authenticated users or admin)
router.get('/', questionController.getAdminQuestions);
router.get('/:id', questionController.getQuestionById);

// Admin-only question modifications with multer image upload
router.post('/', authenticateToken, requireAdmin, upload.single('image'), questionController.createQuestion);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), questionController.updateQuestion);
router.delete('/:id', authenticateToken, requireAdmin, questionController.deleteQuestion);

module.exports = router;
