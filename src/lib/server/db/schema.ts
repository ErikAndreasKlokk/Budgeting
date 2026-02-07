import { pgTable, text, serial, timestamp } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull(),
	passwordHash: text('password_hash').notNull(),
});

export const accountStatements = pgTable('accountStatements', {
	id: serial("id").primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	dato: timestamp('dato').notNull(),
	innPaaKonto: text(),
	utFraKonto: text(),
	tilKonto: text(),
	tilKontonummer: text(),
	fraKonto: text(),
	fraKontonummer: text(),
	type: text(),
	tekst: text(),
	kid: text(),
	hovedkategori: text(),
	underkategori: text()
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: timestamp('expires_at').notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
