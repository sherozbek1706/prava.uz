const db = require('../config/db');

// 1. Dashboard Statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Total questions count (Savollar soni)
    const questionsCountRes = await db('questions').count('* as count').first();
    const totalQuestions = Number(questionsCountRes?.count || 0);

    // Total students count (Studentlar soni)
    const studentsCountRes = await db('users').where({ role: 'student' }).count('* as count').first();
    const totalStudents = Number(studentsCountRes?.count || 0);

    // Total tests / biletlar count
    const testsCountRes = await db('tests').count('* as count').first();
    const totalTests = Number(testsCountRes?.count || 0);

    // Total exams and performance metrics
    const examsStatsRes = await db('exams')
      .select(
        db.raw('count(*) as total_exams'),
        db.raw('count(case when passed = true then 1 end) as passed_exams'),
        db.raw('avg(score_percentage) as average_score')
      )
      .first();

    const totalExams = Number(examsStatsRes?.total_exams || 0);
    const passedExams = Number(examsStatsRes?.passed_exams || 0);
    const averageScore = Math.round(Number(examsStatsRes?.average_score || 0));
    const passRate = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    // Recent 5 exams
    const recentExams = await db('exams as e')
      .join('users as u', 'e.user_id', 'u.id')
      .select(
        'e.id',
        'e.user_id',
        'u.name as student_name',
        'u.phone as student_phone',
        'e.total_questions',
        'e.correct_answers',
        'e.score_percentage',
        'e.passed',
        'e.time_spent_seconds',
        'e.created_at'
      )
      .orderBy('e.created_at', 'desc')
      .limit(6);

    // Categories breakdown
    const categoryStats = await db('questions')
      .select('category', db.raw('count(*) as count'))
      .groupBy('category');

    return res.json({
      success: true,
      stats: {
        total_questions: totalQuestions,
        total_students: totalStudents,
        total_tests: totalTests,
        total_exams: totalExams,
        passed_exams: passedExams,
        failed_exams: totalExams - passedExams,
        average_score: averageScore,
        pass_rate: passRate,
      },
      recent_exams: recentExams,
      category_stats: categoryStats,
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    return res.status(500).json({ success: false, message: 'Statistikani yuklashda xatolik.' });
  }
};

// 2. Get All Students with their progress stats
exports.getStudentsList = async (req, res) => {
  try {
    const { search } = req.query;

    let query = db('users as u')
      .leftJoin('exams as e', 'u.id', 'e.user_id')
      .where('u.role', 'student')
      .groupBy('u.id', 'u.name', 'u.phone', 'u.created_at')
      .select(
        'u.id',
        'u.name',
        'u.phone',
        'u.created_at',
        db.raw('count(e.id) as total_exams'),
        db.raw('count(case when e.passed = true then 1 end) as passed_exams'),
        db.raw('round(coalesce(avg(e.score_percentage), 0), 1) as average_score'),
        db.raw('max(e.created_at) as last_exam_at')
      )
      .orderBy('u.created_at', 'desc');

    if (search && search.trim()) {
      query = query.where((builder) => {
        builder
          .where('u.name', 'ilike', `%${search.trim()}%`)
          .orWhere('u.phone', 'ilike', `%${search.trim()}%`);
      });
    }

    const students = await query;

    return res.json({
      success: true,
      total: students.length,
      students: students.map((s) => ({
        ...s,
        total_exams: Number(s.total_exams),
        passed_exams: Number(s.passed_exams),
        average_score: Number(s.average_score),
      })),
    });
  } catch (error) {
    console.error('getStudentsList error:', error);
    return res.status(500).json({ success: false, message: 'Studentlar ro\'yxatini olishda xatolik.' });
  }
};

// 3. Get Specific Student's Exam History for Admin
exports.getStudentHistoryForAdmin = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await db('users')
      .where({ id: studentId, role: 'student' })
      .select('id', 'name', 'phone', 'created_at')
      .first();

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student topilmadi.' });
    }

    const exams = await db('exams')
      .where({ user_id: studentId })
      .orderBy('created_at', 'desc');

    return res.json({
      success: true,
      student,
      exams,
    });
  } catch (error) {
    console.error('getStudentHistoryForAdmin error:', error);
    return res.status(500).json({ success: false, message: 'Student tarixini olishda xatolik.' });
  }
};
