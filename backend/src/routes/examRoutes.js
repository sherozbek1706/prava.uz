const express = require('express');
const router = express.Router();
const examController = require('../controllers/examController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Student exam routes (requires login)
router.get('/questions', authenticateToken, examController.getExamQuestions);
router.post('/submit', authenticateToken, examController.submitExam);
router.get('/my-history', authenticateToken, examController.getMyExamHistory);
router.get('/:id', authenticateToken, examController.getExamDetails);

module.exports = router;
