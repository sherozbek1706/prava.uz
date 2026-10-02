/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  // 1. Users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('name', 150).notNullable();
    table.string('phone', 30).unique().notNullable();
    table.string('password_hash', 255).notNullable();
    table.string('role', 30).defaultTo('student'); // 'student' | 'admin'
    table.timestamps(true, true);
  });

  // 2. Questions table
  await knex.schema.createTable('questions', (table) => {
    table.increments('id').primary();
    table.text('title').notNullable();
    table.text('description').nullable();
    table.string('image_url', 500).nullable();
    table.string('category', 100).defaultTo('umumiy');
    table.timestamps(true, true);
  });

  // 3. Question Options (2-5 options per question, 1 correct)
  await knex.schema.createTable('question_options', (table) => {
    table.increments('id').primary();
    table.integer('question_id').unsigned().notNullable()
      .references('id').inTable('questions').onDelete('CASCADE');
    table.text('option_text').notNullable();
    table.boolean('is_correct').defaultTo(false).notNullable();
    table.integer('order_index').defaultTo(0);
  });

  // 4. Exams / Test History table
  await knex.schema.createTable('exams', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');
    table.integer('total_questions').notNullable();
    table.integer('correct_answers').notNullable();
    table.decimal('score_percentage', 5, 2).notNullable();
    table.boolean('passed').notNullable().defaultTo(false);
    table.integer('time_spent_seconds').defaultTo(0);
    table.timestamps(true, true);
  });

  // 5. Exam Answers (detailed history per question)
  await knex.schema.createTable('exam_answers', (table) => {
    table.increments('id').primary();
    table.integer('exam_id').unsigned().notNullable()
      .references('id').inTable('exams').onDelete('CASCADE');
    table.integer('question_id').unsigned().notNullable()
      .references('id').inTable('questions').onDelete('CASCADE');
    table.integer('selected_option_id').unsigned().nullable()
      .references('id').inTable('question_options').onDelete('SET NULL');
    table.boolean('is_correct').notNullable().defaultTo(false);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('exam_answers');
  await knex.schema.dropTableIfExists('exams');
  await knex.schema.dropTableIfExists('question_options');
  await knex.schema.dropTableIfExists('questions');
  await knex.schema.dropTableIfExists('users');
};
