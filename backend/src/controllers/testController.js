const db = require('../config/db');

// Helper to shuffle array
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 1. Get Public / Student Tests List
exports.getPublicTests = async (req, res) => {
  try {
    const tests = await db('tests as t')
      .where('t.is_active', true)
      .leftJoin('test_questions as tq', 't.id', 'tq.test_id')
      .groupBy('t.id')
      .select(
        't.id',
        't.title',
        't.description',
        't.category',
        't.time_limit_minutes',
        't.pass_percentage',
        't.created_at',
        db.raw('count(tq.question_id) as questions_count')
      )
      .orderBy('t.id', 'asc');

    return res.json({
      success: true,
      tests: tests.map((t) => ({
        ...t,
        questions_count: Number(t.questions_count || 0),
      })),
    });
  } catch (error) {
    console.error('getPublicTests error:', error);
    return res.status(500).json({ success: false, message: 'Testlar ro\'yxatini olishda xatolik.' });
  }
};

// 2. Get Single Test with its questions (For Student Taking Exam or Admin Review)
exports.getTestById = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await db('tests').where({ id }).first();

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi.' });
    }

    // Get questions belonging to this test
    const questions = await db('test_questions as tq')
      .join('questions as q', 'tq.question_id', 'q.id')
      .where('tq.test_id', id)
      .select('q.*', 'tq.order_index')
      .orderBy('tq.order_index', 'asc');

    const questionIds = questions.map((q) => q.id);
    const options = await db('question_options')
      .whereIn('question_id', questionIds)
      .orderBy('order_index', 'asc');

    const optionsMap = {};
    options.forEach((opt) => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      // If student is requesting (not admin), hide is_correct
      if (req.user && req.user.role === 'admin') {
        optionsMap[opt.question_id].push(opt);
      } else {
        optionsMap[opt.question_id].push({
          id: opt.id,
          question_id: opt.question_id,
          option_text: opt.option_text,
        });
      }
    });

    const populatedQuestions = questions.map((q) => ({
      ...q,
      options: req.user && req.user.role === 'admin'
        ? (optionsMap[q.id] || [])
        : shuffleArray(optionsMap[q.id] || []),
    }));

    return res.json({
      success: true,
      test: {
        ...test,
        questions_count: populatedQuestions.length,
        questions: populatedQuestions,
      },
    });
  } catch (error) {
    console.error('getTestById error:', error);
    return res.status(500).json({ success: false, message: 'Test ma\'lumotlarini olishda xatolik.' });
  }
};

// 3. Admin: Get all Tests with statistics
exports.getAdminTests = async (req, res) => {
  try {
    const tests = await db('tests as t')
      .leftJoin('test_questions as tq', 't.id', 'tq.test_id')
      .leftJoin('exams as e', 't.id', 'e.test_id')
      .groupBy('t.id')
      .select(
        't.*',
        db.raw('count(distinct tq.question_id) as questions_count'),
        db.raw('count(distinct e.id) as exams_count'),
        db.raw('count(distinct case when e.passed = true then e.id end) as passed_count')
      )
      .orderBy('t.id', 'asc');

    return res.json({
      success: true,
      tests: tests.map((t) => ({
        ...t,
        questions_count: Number(t.questions_count || 0),
        exams_count: Number(t.exams_count || 0),
        passed_count: Number(t.passed_count || 0),
      })),
    });
  } catch (error) {
    console.error('getAdminTests error:', error);
    return res.status(500).json({ success: false, message: 'Testlar ro\'yxatini yuklashda xatolik.' });
  }
};

// 4. Admin: Create New Test / Bilet
exports.createTest = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { title, description, category, time_limit_minutes, pass_percentage, question_ids } = req.body;

    if (!title || !title.trim()) {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'Test sarlavhasi kiritilishi shart.' });
    }

    const [newTest] = await trx('tests').insert({
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category && category.trim() ? category.trim() : 'Biletlar',
      time_limit_minutes: Number(time_limit_minutes) || 20,
      pass_percentage: Number(pass_percentage) || 90.0,
      is_active: true,
    }).returning('*');

    // If question_ids provided, attach them (filtering unique IDs)
    if (Array.isArray(question_ids) && question_ids.length > 0) {
      const uniqueQuestionIds = [...new Set(question_ids.map(Number))];
      const rows = uniqueQuestionIds.map((qId, idx) => ({
        test_id: newTest.id,
        question_id: qId,
        order_index: idx,
      }));
      await trx('test_questions').insert(rows);
    }

    await trx.commit();

    return res.status(201).json({
      success: true,
      message: 'Yangi test muvaffaqiyatli yaratildi!',
      test: newTest,
    });
  } catch (error) {
    await trx.rollback();
    console.error('createTest error:', error);
    return res.status(500).json({ success: false, message: 'Test yaratishda xatolik.' });
  }
};

// 5. Admin: Update Test
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, time_limit_minutes, pass_percentage, is_active } = req.body;

    const existingTest = await db('tests').where({ id }).first();
    if (!existingTest) {
      return res.status(404).json({ success: false, message: 'Test topilmadi.' });
    }

    const updateData = {
      updated_at: db.fn.now(),
    };
    if (title && title.trim()) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (category && category.trim()) updateData.category = category.trim();
    if (time_limit_minutes !== undefined) updateData.time_limit_minutes = Number(time_limit_minutes);
    if (pass_percentage !== undefined) updateData.pass_percentage = Number(pass_percentage);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const [updatedTest] = await db('tests')
      .where({ id })
      .update(updateData)
      .returning('*');

    return res.json({
      success: true,
      message: 'Test ma\'lumotlari muvaffaqiyatli yangilandi!',
      test: updatedTest,
    });
  } catch (error) {
    console.error('updateTest error:', error);
    return res.status(500).json({ success: false, message: 'Testni yangilashda xatolik.' });
  }
};

// 6. Admin: Delete Test
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;
    const test = await db('tests').where({ id }).first();

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi.' });
    }

    // Cascades to test_questions
    await db('tests').where({ id }).del();

    return res.json({
      success: true,
      message: 'Test muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    console.error('deleteTest error:', error);
    return res.status(500).json({ success: false, message: 'Testni o\'chirishda xatolik.' });
  }
};

// 7. Admin: Add Question to Test
// User requirement: "bitta savol xoxlagancha testni ichiga joylashishi mumkin. Lekin bitta testni ichida har doim 1 id dagi savoldan bitta bulishi kerak."
exports.addQuestionToTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { question_id } = req.body;

    if (!question_id) {
      return res.status(400).json({ success: false, message: 'Savol ID si talab qilinadi.' });
    }

    const test = await db('tests').where({ id: testId }).first();
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test topilmadi.' });
    }

    const question = await db('questions').where({ id: question_id }).first();
    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi.' });
    }

    // Strict validation: check if question already exists in this test
    const existing = await db('test_questions')
      .where({ test_id: testId, question_id })
      .first();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu savol mazkur testda allaqachon mavjud! Bitta test ichida bir xil ID dagi savoldan faqat bitta bo\'lishi shart.',
      });
    }

    // Get max order index
    const maxOrderRes = await db('test_questions')
      .where({ test_id: testId })
      .max('order_index as max_order')
      .first();
    const nextOrder = (maxOrderRes?.max_order ?? -1) + 1;

    await db('test_questions').insert({
      test_id: Number(testId),
      question_id: Number(question_id),
      order_index: nextOrder,
    });

    return res.status(201).json({
      success: true,
      message: 'Savol testga muvaffaqiyatli biriktirildi!',
    });
  } catch (error) {
    console.error('addQuestionToTest error:', error);
    if (error.code === '23505') { // Postgres unique_violation
      return res.status(400).json({
        success: false,
        message: 'Ushbu savol mazkur testda allaqachon mavjud!',
      });
    }
    return res.status(500).json({ success: false, message: 'Savolni testga qo\'shishda xatolik.' });
  }
};

// 8. Admin: Remove Question from Test (Does NOT delete question from database)
exports.removeQuestionFromTest = async (req, res) => {
  try {
    const { testId, questionId } = req.params;

    const deleted = await db('test_questions')
      .where({ test_id: testId, question_id: questionId })
      .del();

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Savol ushbu testda topilmadi.' });
    }

    return res.json({
      success: true,
      message: 'Savol testdan muvaffaqiyatli chiqarildi.',
    });
  } catch (error) {
    console.error('removeQuestionFromTest error:', error);
    return res.status(500).json({ success: false, message: 'Savolni testdan chiqarishda xatolik.' });
  }
};

// 9. Admin: Get Questions Available to be added to this test (questions NOT yet in this test)
exports.getAvailableQuestionsForTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const { search } = req.query;

    // Subquery of question IDs already in this test
    const existingQuestionIds = db('test_questions')
      .where({ test_id: testId })
      .select('question_id');

    let query = db('questions')
      .whereNotIn('id', existingQuestionIds)
      .orderBy('id', 'desc');

    if (search && search.trim()) {
      query = query.where('title', 'ilike', `%${search.trim()}%`);
    }

    const availableQuestions = await query.limit(100);

    return res.json({
      success: true,
      total: availableQuestions.length,
      questions: availableQuestions,
    });
  } catch (error) {
    console.error('getAvailableQuestionsForTest error:', error);
    return res.status(500).json({ success: false, message: 'Mavjud savollarni olishda xatolik.' });
  }
};
