const bcrypt = require('bcryptjs');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Clear existing entries
  await knex('exam_answers').del();
  await knex('exams').del();
  await knex('question_options').del();
  await knex('questions').del();
  await knex('users').del();

  // Create Users
  const adminPinHash = await bcrypt.hash('7777', 10);
  const student1PinHash = await bcrypt.hash('1234', 10);
  const student2PinHash = await bcrypt.hash('9999', 10);
  const student3PinHash = await bcrypt.hash('2024', 10);

  const [admin] = await knex('users').insert([
    {
      name: 'Bosh Administrator',
      phone: '+998901234567',
      password_hash: adminPinHash,
      role: 'admin',
    },
    {
      name: 'Jasur Rahimov',
      phone: '+998901112233',
      password_hash: student1PinHash,
      role: 'student',
    },
    {
      name: 'Malika Karimova',
      phone: '+998935557788',
      password_hash: student2PinHash,
      role: 'student',
    },
    {
      name: 'Bobur Aliyev',
      phone: '+998971239876',
      password_hash: student3PinHash,
      role: 'student',
    }
  ]).returning('*');

  // Realistic YHQ Questions
  const questionsData = [
    {
      title: 'Ushbu yo\'l belgisi nimani bildiradi?',
      description: '2.5 "To\'xtamasdan harakatlanish taqiqlangan" yo\'l belgisi.',
      image_url: '/uploads/stop_sign.svg',
      category: 'Imtiyoz belgilari',
      options: [
        { text: 'To\'xtash taqiqlanadi', is_correct: false },
        { text: 'To\'xtamasdan harakatlanish taqiqlanadi (STOP chizig\'i yoki belgi oldida to\'xtash shart)', is_correct: true },
        { text: 'Faqat yuk avtomobillariga to\'xtash majburiy', is_correct: false },
        { text: 'Tezlikni 5 km/soatgacha pasaytirish tavsiya etiladi', is_correct: false },
      ]
    },
    {
      title: 'Ushbu belgi o\'rnatilgan yo\'lda qanday imtiyoz beriladi?',
      description: '2.1 "Asosiy yo\'l" belgisi tartibga solinmagan chorrahalarda ustunlik beradi.',
      image_url: '/uploads/glavnaya_doroga.svg',
      category: 'Imtiyoz belgilari',
      options: [
        { text: 'Haydovchi tartibga solinmagan chorrahada birinchi bo\'lib o\'tish huquqiga ega', is_correct: true },
        { text: 'Haydovchi o\'ng tomondan kelayotgan barcha transportlarga yo\'l berishi shart', is_correct: false },
        { text: 'Yo\'l harakati faqat bir tomonlama tashkil etilgan', is_correct: false },
      ]
    },
    {
      title: 'Ushbu yo\'l belgisi nimani taqiqlaydi?',
      description: '3.1 "Kirish taqiqlangan" belgisi barcha transport vositalarining kirishini taqiqlaydi.',
      image_url: '/uploads/kirish_taqiqlangan.svg',
      category: 'Taqiqlovchi belgilar',
      options: [
        { text: 'Barcha transport vositalarining kirishini taqiqlaydi', is_correct: true },
        { text: 'Faqat yuk avtomobillarining kirishini taqiqlaydi', is_correct: false },
        { text: 'O\'ng tomonga burilishni taqiqlaydi', is_correct: false },
        { text: 'Piyodalarning o\'tishini taqiqlaydi', is_correct: false },
      ]
    },
    {
      title: 'Ushbu belgi o\'rnatilgan yo\'l uchastkasida ruxsat etilgan eng yuqori tezlik qancha?',
      description: '3.24 "Yuqori tezlik cheklangan" belgisi.',
      image_url: '/uploads/tezlik_60.svg',
      category: 'Taqiqlovchi belgilar',
      options: [
        { text: 'Eng ko\'pi bilan 50 km/soat', is_correct: false },
        { text: 'Eng ko\'pi bilan 60 km/soat', is_correct: true },
        { text: 'Eng ko\'pi bilan 70 km/soat', is_correct: false },
        { text: 'Eng kamida 60 km/soat', is_correct: false },
        { text: 'Cheklov yo\'q', is_correct: false },
      ]
    },
    {
      title: 'Ushbu belgi nimani bildiradi va piyodalarga qanday munosabatda bo\'lish lozim?',
      description: '5.16.1 "Piyodalar o\'tish joyi" axborot-ko\'rsatgich belgisi.',
      image_url: '/uploads/piyodalar_otish.svg',
      category: 'Axborot-ko\'rsatgich',
      options: [
        { text: 'Piyodalar o\'tish joyi; qatnov qismini kesib o\'tayotgan piyodalarga yo\'l berish shart', is_correct: true },
        { text: 'Yer osti piyodalar o\'tish joyi; to\'xtash shart emas', is_correct: false },
        { text: 'Bolalar bog\'chasi hududi', is_correct: false },
      ]
    },
    {
      title: 'Ushbu belgi harakatlanishning qanday tartibini belgilaydi?',
      description: '4.3 "Aylanma harakat" buyuruvchi belgisi.',
      image_url: '/uploads/aylanma_harakat.svg',
      category: 'Buyuruvchi belgilar',
      options: [
        { text: 'Faqat strelkalar ko\'rsatgan yo\'nalishda aylanma harakatlanishga ruxsat beriladi', is_correct: true },
        { text: 'Chorrahada o\'ngga yoki chapga burilish taqiqlanadi', is_correct: false },
        { text: 'Faqat yengil avtomobillar harakatlanishi mumkin', is_correct: false },
        { text: 'Orqaga burilish qat\'iyan man etiladi', is_correct: false },
      ]
    },
    {
      title: 'Ushbu belgi ta\'sir doirasida quvib o\'tishga ruxsat beriladimi?',
      description: '3.20 "Quvib o\'tish taqiqlangan" belgisi.',
      image_url: '/uploads/quvib_otish_taqiq.svg',
      category: 'Taqiqlovchi belgilar',
      options: [
        { text: 'Barcha transport vositalarini quvib o\'tish taqiqlanadi (soatiga 30 km dan kam tezlikda harakatlanayotgan yakka transport vositalari bundan mustasno)', is_correct: true },
        { text: 'Faqat yuk avtomobillarini quvib o\'tish mumkin', is_correct: false },
        { text: 'Kunduzgi vaqtda quvib o\'tishga to\'liq ruxsat beriladi', is_correct: false },
      ]
    },
    {
      title: 'Svetoforning qizil chirog\'i yonganda haydovchi nima qilishi shart?',
      description: 'Svetoforning qizil signali harakatlanishni to\'liq taqiqlaydi.',
      image_url: '/uploads/svetofor.svg',
      category: 'Svetofor signallari',
      options: [
        { text: 'To\'xtash chizig\'i (stop-chiziq) oldida to\'xtashi shart', is_correct: true },
        { text: 'Hech kim bo\'lmasa ehtiyotkorlik bilan o\'tib ketishi mumkin', is_correct: false },
        { text: 'O\'ngga burilish doimo ruxsat etiladi', is_correct: false },
        { text: 'Tezlikni oshirib chorrahadan chiqib ketish kerak', is_correct: false },
      ]
    },
    {
      title: 'Tasvirlangan chorrahada transport vositalarining o\'tish ketma-ketligi qanday?',
      description: 'Asosiy yo\'ldagi ko\'k avtomobil (1) birinchi, ikkinchi darajali yo\'ldagi qizil avtomobil (2) keyin o\'tadi.',
      image_url: '/uploads/chorraha_tartibi.svg',
      category: 'Chorrahalarda harakatlanish',
      options: [
        { text: '1-chi (ko\'k avtomobil), so\'ng 2-chi (qizil avtomobil)', is_correct: true },
        { text: '2-chi (qizil avtomobil), so\'ng 1-chi (ko\'k avtomobil)', is_correct: false },
        { text: 'Bir vaqtda o\'zaro kelishib o\'tishadi', is_correct: false },
      ]
    },
    {
      title: 'Ushbu ogohlantiruvchi belgi nimani bildiradi?',
      description: '1.21 "Bolalar" ogohlantiruvchi belgisi.',
      image_url: '/uploads/bolalar.svg',
      category: 'Ogohlantiruvchi belgilar',
      options: [
        { text: 'Yo\'lning bolalar muassasalari yaqinidagi qismi, ehtiyot bo\'lish va tezlikni pasaytirish lozim', is_correct: true },
        { text: 'Piyodalar zonasi, avtomobillar harakati to\'xtatilgan', is_correct: false },
        { text: 'Maktab avtobusi to\'xtash joyi', is_correct: false },
        { text: 'Piyodalar o\'tish joyi tugaganligi', is_correct: false },
      ]
    },
    {
      title: 'Aholi yashash punktlarida yengil avtomobillarning eng yuqori tezligi necha km/soat qilib belgilangan?',
      description: 'O\'zbekiston Respublikasi YHQ bo\'yicha aholi yashash joylarida ruxsat etilgan tezlik.',
      image_url: null,
      category: 'Harakat tezligi',
      options: [
        { text: '60 km/soat (Toshkent va qator hududlarda maxsus belgilangan me\'yor)', is_correct: true },
        { text: '70 km/soat', is_correct: false },
        { text: '80 km/soat', is_correct: false },
        { text: '90 km/soat', is_correct: false },
      ]
    },
    {
      title: 'Avtomobilda xavfsizlik kamarini taqish kimlar uchun majburiy?',
      description: 'Xavfsizlik kamarlari haydovchi va barcha oldi o\'rindiqdagi yo\'lovchilar uchun shart.',
      image_url: null,
      category: 'Umumiy majburiyatlar',
      options: [
        { text: 'Faqat haydovchi uchun', is_correct: false },
        { text: 'Haydovchi va konstruksiyasida xavfsizlik kamari nazarda tutilgan barcha yo\'lovchilar uchun', is_correct: true },
        { text: 'Faqat shahar tashqarisida', is_correct: false },
      ]
    }
  ];

  for (const q of questionsData) {
    const [insertedQuestion] = await knex('questions').insert({
      title: q.title,
      description: q.description,
      image_url: q.image_url,
      category: q.category,
    }).returning('*');

    const optionsToInsert = q.options.map((opt, idx) => ({
      question_id: insertedQuestion.id,
      option_text: opt.text,
      is_correct: opt.is_correct,
      order_index: idx,
    }));

    await knex('question_options').insert(optionsToInsert);
  }

  // Create sample exam results for student Jasur Rahimov
  const jasur = await knex('users').where({ phone: '+998901112233' }).first();
  if (jasur) {
    const [sampleExam] = await knex('exams').insert({
      user_id: jasur.id,
      total_questions: 10,
      correct_answers: 9,
      score_percentage: 90.0,
      passed: true,
      time_spent_seconds: 420,
    }).returning('*');

    const allQuestions = await knex('questions').limit(10);
    for (const q of allQuestions) {
      const correctOption = await knex('question_options').where({ question_id: q.id, is_correct: true }).first();
      if (correctOption) {
        await knex('exam_answers').insert({
          exam_id: sampleExam.id,
          question_id: q.id,
          selected_option_id: correctOption.id,
          is_correct: true,
        });
      }
    }
  }

  console.log('✅ Database seeded successfully with Admin, Students, Questions, Options, and Sample Exam history.');
};
