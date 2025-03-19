import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
});

export const accountStatements = sqliteTable('accountStatements', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	dato: integer({mode: 'timestamp'}).notNull(),
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

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
