const path = require('path');
const fs = require('fs');
const db = require('../config/db');

// Helper to safely delete file from uploads
function deleteUploadFile(relativeUrl) {
  if (!relativeUrl || !relativeUrl.startsWith('/uploads/')) return;
  const filename = path.basename(relativeUrl);
  // Don't delete initial seed SVG signs
  const initialSigns = [
    'stop_sign.svg', 'glavnaya_doroga.svg', 'kirish_taqiqlangan.svg',
    'tezlik_60.svg', 'piyodalar_otish.svg', 'aylanma_harakat.svg',
    'quvib_otish_taqiq.svg', 'svetofor.svg', 'chorraha_tartibi.svg', 'bolalar.svg'
  ];
  if (initialSigns.includes(filename)) return;

  const fullPath = path.resolve(__dirname, '../../uploads', filename);
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (e) {
      console.warn('Failed to delete file:', fullPath, e.message);
    }
  }
}

// 1. Get Questions for Admin (Includes is_correct, with pagination/search)
exports.getAdminQuestions = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let query = db('questions');

    if (search && search.trim()) {
      query = query.where('title', 'ilike', `%${search.trim()}%`);
    }

    if (category && category !== 'all') {
      query = query.where({ category });
    }

    const countResult = await query.clone().count('* as total').first();
    const total = Number(countResult.total);

    const questions = await query
      .select('*')
      .orderBy('id', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Fetch options for each question
    const questionIds = questions.map((q) => q.id);
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

    const result = questions.map((q) => ({
      ...q,
      options: optionsMap[q.id] || [],
    }));

    // Categories list for filtering
    const categories = await db('questions')
      .distinct('category')
      .whereNotNull('category');

    return res.json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      categories: categories.map((c) => c.category),
      questions: result,
    });
  } catch (error) {
    console.error('getAdminQuestions error:', error);
    return res.status(500).json({ success: false, message: 'Savollarni yuklashda xatolik.' });
  }
};

// 2. Get Single Question By ID (Admin or Details)
exports.getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await db('questions').where({ id }).first();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi.' });
    }

    const options = await db('question_options')
      .where({ question_id: id })
      .orderBy('order_index', 'asc');

    return res.json({
      success: true,
      question: {
        ...question,
        options,
      },
    });
  } catch (error) {
    console.error('getQuestionById error:', error);
    return res.status(500).json({ success: false, message: 'Savolni olishda xatolik.' });
  }
};

// 3. Create Question (Admin Only, Multer image upload)
exports.createQuestion = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { title, description, category } = req.body;
    let options = req.body.options;

    if (!title || !title.trim()) {
      await trx.rollback();
      return res.status(400).json({ success: false, message: 'Savol matni kiritilishi shart.' });
    }

    // Parse options if sent as string from FormData
    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        await trx.rollback();
        return res.status(400).json({ success: false, message: 'Variantlar formati noto\'g\'ri.' });
      }
    }

    if (!Array.isArray(options) || options.length < 2 || options.length > 5) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Savolda 2 tadan 5 tagacha javob varianti bo\'lishi shart.',
      });
    }

    // Validate options content and correct answer count
    let correctCount = 0;
    const parsedOptions = [];

    for (let i = 0; i < options.length; i++) {
      const opt = options[i];
      const optText = typeof opt === 'string' ? opt : (opt.option_text || opt.text || '');
      const isCorrect = typeof opt === 'object' ? Boolean(opt.is_correct) : (req.body.correct_index !== undefined && Number(req.body.correct_index) === i);

      if (!optText || !optText.trim()) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: `${i + 1}-variant matni bo'sh bo'lishi mumkin emas.`,
        });
      }

      if (isCorrect) correctCount++;

      parsedOptions.push({
        option_text: optText.trim(),
        is_correct: isCorrect,
        order_index: i,
      });
    }

    if (correctCount !== 1) {
      await trx.rollback();
      return res.status(400).json({
        success: false,
        message: 'Variantlar ichida aynan 1 ta to\'g\'ri javob belgilanishi shart.',
      });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // Insert Question
    const [newQuestion] = await trx('questions').insert({
      title: title.trim(),
      description: description ? description.trim() : null,
      category: category && category.trim() ? category.trim() : 'Umumiy qoidalar',
      image_url: imageUrl,
    }).returning('*');

    // Insert Options
    const optionsToInsert = parsedOptions.map((opt) => ({
      question_id: newQuestion.id,
      option_text: opt.option_text,
      is_correct: opt.is_correct,
      order_index: opt.order_index,
    }));

    const insertedOptions = await trx('question_options')
      .insert(optionsToInsert)
      .returning('*');

    await trx.commit();

    return res.status(201).json({
      success: true,
      message: 'Savol muvaffaqiyatli yaratildi!',
      question: {
        ...newQuestion,
        options: insertedOptions,
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error('createQuestion error:', error);
    // Delete uploaded image if transaction fails
    if (req.file) {
      deleteUploadFile(`/uploads/${req.file.filename}`);
    }
    return res.status(500).json({ success: false, message: 'Savolni saqlashda xatolik yuz berdi.' });
  }
};

// 4. Update Question (Admin Only)
exports.updateQuestion = async (req, res) => {
  const trx = await db.transaction();
  try {
    const { id } = req.params;
    const { title, description, category } = req.body;
    let options = req.body.options;

    const existingQuestion = await trx('questions').where({ id }).first();
    if (!existingQuestion) {
      await trx.rollback();
      return res.status(404).json({ success: false, message: 'Savol topilmadi.' });
    }

    if (typeof options === 'string') {
      try {
        options = JSON.parse(options);
      } catch (e) {
        await trx.rollback();
        return res.status(400).json({ success: false, message: 'Variantlar formati xato.' });
      }
    }

    let imageUrl = existingQuestion.image_url;
    if (req.file) {
      // New image uploaded, delete previous non-seed image
      deleteUploadFile(existingQuestion.image_url);
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.remove_image === 'true') {
      deleteUploadFile(existingQuestion.image_url);
      imageUrl = null;
    }

    const updateData = {
      updated_at: trx.fn.now(),
    };
    if (title && title.trim()) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (category && category.trim()) updateData.category = category.trim();
    updateData.image_url = imageUrl;

    const [updatedQuestion] = await trx('questions')
      .where({ id })
      .update(updateData)
      .returning('*');

    // Update options if provided
    let updatedOptions = [];
    if (Array.isArray(options) && options.length >= 2 && options.length <= 5) {
      let correctCount = 0;
      const parsedOptions = [];

      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        const optText = typeof opt === 'string' ? opt : (opt.option_text || opt.text || '');
        const isCorrect = typeof opt === 'object' ? Boolean(opt.is_correct) : (req.body.correct_index !== undefined && Number(req.body.correct_index) === i);

        if (!optText || !optText.trim()) {
          await trx.rollback();
          return res.status(400).json({
            success: false,
            message: `${i + 1}-variant matni bo'sh bo'lishi mumkin emas.`,
          });
        }
        if (isCorrect) correctCount++;

        parsedOptions.push({
          question_id: id,
          option_text: optText.trim(),
          is_correct: isCorrect,
          order_index: i,
        });
      }

      if (correctCount !== 1) {
        await trx.rollback();
        return res.status(400).json({
          success: false,
          message: 'Aynan 1 ta to\'g\'ri javob varianti belgilanishi shart.',
        });
      }

      // Replace options
      await trx('question_options').where({ question_id: id }).del();
      updatedOptions = await trx('question_options')
        .insert(parsedOptions)
        .returning('*');
    } else {
      updatedOptions = await trx('question_options')
        .where({ question_id: id })
        .orderBy('order_index', 'asc');
    }

    await trx.commit();

    return res.json({
      success: true,
      message: 'Savol muvaffaqiyatli yangilandi!',
      question: {
        ...updatedQuestion,
        options: updatedOptions,
      },
    });
  } catch (error) {
    await trx.rollback();
    console.error('updateQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Savolni yangilashda xatolik.' });
  }
};

// 5. Delete Question (Admin Only)
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await db('questions').where({ id }).first();

    if (!question) {
      return res.status(404).json({ success: false, message: 'Savol topilmadi.' });
    }

    // Delete image if uploaded
    deleteUploadFile(question.image_url);

    // Delete question (cascades to question_options)
    await db('questions').where({ id }).del();

    return res.json({
      success: true,
      message: 'Savol muvaffaqiyatli o\'chirildi.',
    });
  } catch (error) {
    console.error('deleteQuestion error:', error);
    return res.status(500).json({ success: false, message: 'Savolni o\'chirishda xatolik.' });
  }
};
