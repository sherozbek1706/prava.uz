const express = require('express');
const router = express.Router();
const testController = require('../controllers/testController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public / Student tests listing
router.get('/', testController.getPublicTests);

// Admin tests list
router.get('/admin/all', authenticateToken, requireAdmin, testController.getAdminTests);

// Single test details
router.get('/:id', authenticateToken, testController.getTestById);

// Admin Test CRUD
router.post('/', authenticateToken, requireAdmin, testController.createTest);
router.put('/:id', authenticateToken, requireAdmin, testController.updateTest);
router.delete('/:id', authenticateToken, requireAdmin, testController.deleteTest);

// Admin Question Assignment to Test
// User requirement: "Savollar turadigan testlar buladi bitta savol xoxlagancha testni ichiga joylashishi mumkin. Lekin bitta testni ichida har doim 1 id dagi savoldan bitta bulishi kerak."
router.get('/:testId/available-questions', authenticateToken, requireAdmin, testController.getAvailableQuestionsForTest);
router.post('/:testId/questions', authenticateToken, requireAdmin, testController.addQuestionToTest);
router.delete('/:testId/questions/:questionId', authenticateToken, requireAdmin, testController.removeQuestionFromTest);

module.exports = router;
