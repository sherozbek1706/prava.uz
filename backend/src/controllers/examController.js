const db = require('../config/db');

// Helper to shuffle array (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 1. Get Questions for a New Exam (specific test/bilet or random pool)
exports.getExamQuestions = async (req, res) => {
  try {
    const { count = 10, test_id } = req.query;
    let questions = [];
    let testInfo = null;

    if (test_id) {
      testInfo = await db('tests').where({ id: test_id }).first();
      if (!testInfo) {
        return res.status(404).json({ success: false, message: 'Test/Bilet topilmadi.' });
      }

      questions = await db('test_questions as tq')
        .join('questions as q', 'tq.question_id', 'q.id')
        .where('tq.test_id', test_id)
        .select('q.*', 'tq.order_index')
        .orderBy('tq.order_index', 'asc');
    } else {
      const limit = Math.min(Math.max(Number(count) || 10, 5), 50);
      questions = await db('questions')
        .orderByRaw('RANDOM()')
        .limit(limit);
    }

    if (!questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu testda hali savollar mavjud emas.',
      });
    }

    const questionIds = questions.map((q) => q.id);
    const options = await db('question_options')
      .whereIn('question_id', questionIds)
      .select('id', 'question_id', 'option_text', 'order_index')
      .orderBy('order_index', 'asc');

    const optionsMap = {};
    options.forEach((opt) => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push({
        id: opt.id,
        question_id: opt.question_id,
        option_text: opt.option_text,
      });
    });

    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      title: q.title,
      image_url: q.image_url,
      category: q.category,
      options: shuffleArray(optionsMap[q.id] || []),
    }));

    return res.json({
      success: true,
      test: testInfo ? {
        id: testInfo.id,
        title: testInfo.title,
        description: testInfo.description,
        time_limit_minutes: testInfo.time_limit_minutes,
        pass_percentage: testInfo.pass_percentage,
      } : null,
      total_questions: sanitizedQuestions.length,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    console.error('getExamQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Imtihon savollarini olishda xatolik.' });
  }
};

// 2. Submit Exam and Save to History (Tarixga yozib qo'yish)
exports.submitExam = async (req, res) => {
  const trx = await db.transaction();
  try {
    const userId = req.user.id;
    const { answers, time_spent_seconds = 0, test_id = null } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Javoblar ro\'yxati bo\'sh bo\'lishi mumkin emas.',
      });
    }

    const totalQuestions = answers.length;
    let correctAnswersCount = 0;
    const detailedResults = [];

    // Verify each answer
    for (const ans of answers) {
      const { question_id, selected_option_id } = ans;

      const question = await trx('questions').where({ id: question_id }).first();
      if (!question) continue;

      const allOptions = await trx('question_options')
        .where({ question_id })
        .orderBy('order_index', 'asc');

      const correctOption = allOptions.find((o) => o.is_correct);
      const isCorrect = correctOption && selected_option_id && Number(correctOption.id) === Number(selected_option_id);

      if (isCorrect) {
        correctAnswersCount++;
      }

      detailedResults.push({
        question_id,
        question_title: question.title,
        question_description: question.description,
        image_url: question.image_url,
        selected_option_id: selected_option_id || null,
        correct_option_id: correctOption ? correctOption.id : null,
        is_correct: Boolean(isCorrect),
        options: allOptions.map((opt) => ({
          id: opt.id,
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      });
    }

    const scorePercentage = Number(((correctAnswersCount / totalQuestions) * 100).toFixed(2));
    
    // Check passing threshold (defaults to 90%)
    let passingScore = 90.0;
    if (test_id) {
      const test = await trx('tests').where({ id: test_id }).first();
      if (test && test.pass_percentage) {
        passingScore = Number(test.pass_percentage);
      }
    }
    const passed = scorePercentage >= passingScore;

    // Save Exam Record
    const [savedExam] = await trx('exams').insert({
      user_id: userId,
      test_id: test_id ? Number(test_id) : null,
      total_questions: totalQuestions,
      correct_answers: correctAnswersCount,
      score_percentage: scorePercentage,
      passed,
      time_spent_seconds: Number(time_spent_seconds) || 0,
    }).returning('*');

    // Save each answer to exam_answers
    const examAnswersToInsert = detailedResults.map((dr) => ({
      exam_id: savedExam.id,
      question_id: dr.question_id,
      selected_option_id: dr.selected_option_id,
      is_correct: dr.is_correct,
    }));

    await trx('exam_answers').insert(examAnswersToInsert);

    await trx.commit();

    return res.status(201).json({
      success: true,
      message: passed
        ? 'Tabriklaymiz! Siz imtihondan muvaffaqiyatli o\'tdingiz!'
        : 'Afsuski, imtihondan o\'ta olmadingiz. Qaytadan tayyorlanib ko\'ring.',
      exam: {
        id: savedExam.id,
        test_id: savedExam.test_id,
        total_questions: totalQuestions,
        correct_answers: correctAnswersCount,
        score_percentage: scorePercentage,
        passed,
        time_spent_seconds: savedExam.time_spent_seconds,
        created_at: savedExam.created_at,
        results: detailedResults,
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error('submitExam error:', error);
    return res.status(500).json({ success: false, message: 'Imtihon natijasini saqlashda xatolik yuz berdi.' });
  }
};

// 3. Get Student's Own Exam History (Student Tarixi)
exports.getMyExamHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const exams = await db('exams as e')
      .leftJoin('tests as t', 'e.test_id', 't.id')
      .where('e.user_id', userId)
      .select('e.*', 't.title as test_title')
      .orderBy('e.created_at', 'desc');

    const totalExams = exams.length;
    const passedExams = exams.filter((e) => e.passed).length;
    const averageScore = totalExams > 0
      ? Math.round(exams.reduce((sum, e) => sum + Number(e.score_percentage), 0) / totalExams)
      : 0;

    return res.json({
      success: true,
      summary: {
        total_exams: totalExams,
        passed_exams: passedExams,
        failed_exams: totalExams - passedExams,
        average_score: averageScore,
      },
      exams,
    });
  } catch (error) {
    console.error('getMyExamHistory error:', error);
    return res.status(500).json({ success: false, message: 'Tarixni yuklashda xatolik.' });
  }
};

// 4. Get Detailed Single Exam Review (by Exam ID)
exports.getExamDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await db('exams as e')
      .leftJoin('tests as t', 'e.test_id', 't.id')
      .where('e.id', id)
      .select('e.*', 't.title as test_title')
      .first();

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Imtihon topilmadi.' });
    }

    // Permission check: student can only view their own exam, admin can view all
    if (req.user.role !== 'admin' && Number(exam.user_id) !== Number(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Ruxsat berilmagan.' });
    }

    const student = await db('users')
      .where({ id: exam.user_id })
      .select('id', 'name', 'phone')
      .first();

    const answers = await db('exam_answers as ea')
      .join('questions as q', 'ea.question_id', 'q.id')
      .where('ea.exam_id', id)
      .select(
        'ea.id as answer_id',
        'ea.question_id',
        'ea.selected_option_id',
        'ea.is_correct',
        'q.title as question_title',
        'q.description as question_description',
        'q.image_url',
        'q.category'
      );

    const questionIds = answers.map((a) => a.question_id);
    const options = await db('question_options')
      .whereIn('question_id', questionIds)
      .orderBy('order_index', 'asc');

    const optionsMap = {};
    options.forEach((opt) => {
      if (!optionsMap[opt.question_id]) {
        optionsMap[opt.question_id] = [];
      }
      optionsMap[opt.question_id].push(opt);
    });

    const detailedAnswers = answers.map((a) => ({
      ...a,
      options: optionsMap[a.question_id] || [],
    }));

    return res.json({
      success: true,
      exam: {
        ...exam,
        student,
        answers: detailedAnswers,
      },
    });
  } catch (error) {
    console.error('getExamDetails error:', error);
    return res.status(500).json({ success: false, message: 'Natijani yuklashda xatolik.' });
  }
};
