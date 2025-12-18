import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

export const urlTable = pgTable('urls', {
  id: uuid('id').primaryKey().defaultRandom(),
  shortCode: varchar('short_code', { length: 50 }).notNull().unique(),
  targetUrl: text('target_url').notNull(),
  userId: uuid('user_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
