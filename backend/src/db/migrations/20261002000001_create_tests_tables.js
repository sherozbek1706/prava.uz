/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Create tests table (Biletlar / Test to'plamlari)
  const hasTests = await knex.schema.hasTable('tests');
  if (!hasTests) {
    await knex.schema.createTable('tests', (table) => {
      table.increments('id').primary();
      table.string('title', 200).notNullable();
      table.text('description').nullable();
      table.string('category', 100).defaultTo('Biletlar');
      table.integer('time_limit_minutes').defaultTo(20);
      table.decimal('pass_percentage', 5, 2).defaultTo(90.00);
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
    });
  }

  // 2. Create test_questions junction table (Many-to-Many between tests and questions)
  const hasTestQuestions = await knex.schema.hasTable('test_questions');
  if (!hasTestQuestions) {
    await knex.schema.createTable('test_questions', (table) => {
      table.increments('id').primary();
      table.integer('test_id').unsigned().notNullable()
        .references('id').inTable('tests').onDelete('CASCADE');
      table.integer('question_id').unsigned().notNullable()
        .references('id').inTable('questions').onDelete('CASCADE');
      table.integer('order_index').defaultTo(0);

      // Crucial requirement: Inside one test, a question with the same id can only appear ONCE!
      table.unique(['test_id', 'question_id']);
    });
  }

  // 3. Add test_id to exams table if not exists
  const hasTestIdColumn = await knex.schema.hasColumn('exams', 'test_id');
  if (!hasTestIdColumn) {
    await knex.schema.table('exams', (table) => {
      table.integer('test_id').unsigned().nullable()
        .references('id').inTable('tests').onDelete('SET NULL');
    });
  }
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  const hasTestIdColumn = await knex.schema.hasColumn('exams', 'test_id');
  if (hasTestIdColumn) {
    await knex.schema.table('exams', (table) => {
      table.dropColumn('test_id');
    });
  }
  await knex.schema.dropTableIfExists('test_questions');
  await knex.schema.dropTableIfExists('tests');
};
