/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
  // Check if tests already exist
  const existingTests = await knex('tests').select('id');
  if (existingTests.length > 0) {
    return;
  }

  // Create default tests / biletlar
  const [test1, test2, test3] = await knex('tests').insert([
    {
      title: '1-Bilet: Yo\'l belgilari va chorrahalar',
      description: 'Asosiy yo\'l belgilari, svetofor signallari va tartibga solinmagan chorrahalarda harakatlanish tartibi bo\'yicha namunaviy bilet.',
      category: 'Biletlar',
      time_limit_minutes: 20,
      pass_percentage: 90.00,
      is_active: true,
    },
    {
      title: '2-Bilet: Taqiqlovchi belgilar va tezlik me\'yorlari',
      description: 'Aholi yashash punktlarida ruxsat etilgan tezlik, quvib o\'tish va kirish taqiqlangan yo\'l uchastkalari qoidalari.',
      category: 'Biletlar',
      time_limit_minutes: 20,
      pass_percentage: 90.00,
      is_active: true,
    },
    {
      title: '3-Bilet: Imtiyoz va Umumiy majburiyatlar',
      description: 'Piyodalar o\'tish joylari, aylanma harakat va xavfsizlik kamarini taqish tartibi bo\'yicha imtihon sinovi.',
      category: 'Biletlar',
      time_limit_minutes: 15,
      pass_percentage: 90.00,
      is_active: true,
    },
  ]).returning('*');

  // Fetch available questions
  const allQuestions = await knex('questions').select('id').orderBy('id', 'asc');

  if (allQuestions.length > 0) {
    // Test 1: attach first 8 questions
    const test1Questions = allQuestions.slice(0, 8).map((q, idx) => ({
      test_id: test1.id,
      question_id: q.id,
      order_index: idx,
    }));
    await knex('test_questions').insert(test1Questions);

    // Test 2: attach questions (notice some questions like q[0] and q[1] can be shared across tests!)
    // "bitta savol xoxlagancha testni ichiga joylashishi mumkin"
    const test2Questions = [
      ...allQuestions.slice(2, 9),
      allQuestions[0], // shared question!
    ].filter(Boolean).map((q, idx) => ({
      test_id: test2.id,
      question_id: q.id,
      order_index: idx,
    }));
    await knex('test_questions').insert(test2Questions);

    // Test 3: attach questions
    const test3Questions = allQuestions.slice(3, 10).map((q, idx) => ({
      test_id: test3.id,
      question_id: q.id,
      order_index: idx,
    }));
    await knex('test_questions').insert(test3Questions);
  }

  console.log('✅ Tests and test_questions seeded successfully!');
};
