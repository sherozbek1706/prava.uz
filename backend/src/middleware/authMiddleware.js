const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'prava_secret_jwt_key_uzbekistan_driving_2026';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Kirish uchun token talab qilinadi.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db('users').where({ id: decoded.id }).first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi yoki hisob o\'chirilgan.' });
    }

    req.user = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Yaroqsiz yoki muddati o\'tgan token.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Ushbu amalni faqat administrator bajara oladi.',
    });
  }
  next();
};

const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Ushbu amal faqat talabalar (student) uchun mo\'ljallangan.',
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireStudent,
  JWT_SECRET,
};
