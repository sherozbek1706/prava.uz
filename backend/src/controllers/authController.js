const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

// Helper to normalize Uzbekistan phone number to standard format: +998XXXXXXXXX
function normalizePhone(rawPhone) {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/\D/g, '');
  if (digits.startsWith('998') && digits.length === 12) {
    return '+' + digits;
  }
  if (digits.length === 9) {
    return '+998' + digits;
  }
  if (digits.length === 12) {
    return '+' + digits;
  }
  return rawPhone.trim();
}

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // 1. Validate Name
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Iltimos, to\'liq ism-familiyangizni kiriting.',
      });
    }

    // 2. Validate Uzbekistan Phone Number
    const normalizedPhone = normalizePhone(phone);
    const phoneRegex = /^\+998\d{9}$/;
    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Telefon raqam O\'zbekiston formati bo\'lishi shart (+998 XX XXX XX XX).',
      });
    }

    // 3. Validate 4-digit PIN password
    const pinRegex = /^\d{4}$/;
    if (!password || !pinRegex.test(String(password).trim())) {
      return res.status(400).json({
        success: false,
        message: 'Parol aynan 4 ta raqamdan iborat bo\'lishi shart (masalan: 1234).',
      });
    }

    // 4. Check if phone is already registered
    const existingUser = await db('users').where({ phone: normalizedPhone }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Ushbu telefon raqam allaqachon ro\'yxatdan o\'tgan. Iltimos, tizimga kiring.',
      });
    }

    // 5. Hash PIN
    const passwordHash = await bcrypt.hash(String(password).trim(), 10);

    // 6. Insert student
    const [newUser] = await db('users').insert({
      name: name.trim(),
      phone: normalizedPhone,
      password_hash: passwordHash,
      role: 'student',
    }).returning(['id', 'name', 'phone', 'role', 'created_at']);

    // 7. Generate JWT
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role, name: newUser.name, phone: newUser.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
      token,
      user: newUser,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.',
    });
  }
};

// Common Login (Student or Admin)
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Telefon raqam va parolni kiritishingiz kerak.',
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await db('users').where({ phone: normalizedPhone }).first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Telefon raqam yoki parol noto\'g\'ri.',
      });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Telefon raqam yoki parol noto\'g\'ri.',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Tizimga muvaffaqiyatli kirdingiz!',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi.',
    });
  }
};

// Admin Login (dedicated endpoint with role validation)
exports.adminLogin = async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Administrator telefon raqami va parolini kiriting.',
      });
    }

    const normalizedPhone = normalizePhone(phone);
    const user = await db('users')
      .where({ phone: normalizedPhone, role: 'admin' })
      .first();

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Administrator hisobi topilmadi yoki ma\'lumotlar xato.',
      });
    }

    const isMatch = await bcrypt.compare(String(password).trim(), user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Parol noto\'g\'ri.',
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Admin panelga muvaffaqiyatli xush kelibsiz!',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverda xatolik yuz berdi.',
    });
  }
};

// Get current authenticated user profile
exports.getMe = async (req, res) => {
  try {
    const user = await db('users')
      .where({ id: req.user.id })
      .select('id', 'name', 'phone', 'role', 'created_at')
      .first();

    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi.' });
    }

    // Get basic stats for user
    const stats = await db('exams')
      .where({ user_id: user.id })
      .select(
        db.raw('count(*) as total_exams'),
        db.raw('count(case when passed = true then 1 end) as passed_exams'),
        db.raw('avg(score_percentage) as average_score')
      )
      .first();

    return res.json({
      success: true,
      user: {
        ...user,
        stats: {
          total_exams: Number(stats?.total_exams || 0),
          passed_exams: Number(stats?.passed_exams || 0),
          average_score: Math.round(Number(stats?.average_score || 0)),
        },
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    return res.status(500).json({ success: false, message: 'Serverda xatolik.' });
  }
};
