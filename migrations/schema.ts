import { pgTable, foreignKey, pgEnum, uuid, timestamp, text, varchar, date, unique } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const aal_level = pgEnum("aal_level", ['aal1', 'aal2', 'aal3'])
export const code_challenge_method = pgEnum("code_challenge_method", ['s256', 'plain'])
export const factor_status = pgEnum("factor_status", ['unverified', 'verified'])
export const factor_type = pgEnum("factor_type", ['totp', 'webauthn'])
export const one_time_token_type = pgEnum("one_time_token_type", ['confirmation_token', 'reauthentication_token', 'recovery_token', 'email_change_token_new', 'email_change_token_current', 'phone_change_token'])
export const key_status = pgEnum("key_status", ['default', 'valid', 'invalid', 'expired'])
export const key_type = pgEnum("key_type", ['aead-ietf', 'aead-det', 'hmacsha512', 'hmacsha256', 'auth', 'shorthash', 'generichash', 'kdf', 'secretbox', 'secretstream', 'stream_xchacha20'])
export const stato_progetto = pgEnum("stato_progetto", ['pianificato 📅', 'in_corso 🚧', 'in_revisione 🔍', 'approvato ✅', 'in_sospeso ⏸️', 'annullato ❌', 'in_attesa ⏳'])
export const action = pgEnum("action", ['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ERROR'])
export const equality_op = pgEnum("equality_op", ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'in'])


export const folders = pgTable("folders", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: text("title").notNull(),
	icon_id: text("icon_id").notNull(),
	data: text("data"),
	in_trash: text("in_trash"),
	banner_url: text("banner_url"),
	workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade", onUpdate: "cascade" } ),
});

export const workspaces = pgTable("workspaces", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	workspace_owner: uuid("workspace_owner").notNull(),
	title: text("title").notNull(),
	icon_id: text("icon_id").notNull(),
	data: text("data"),
	in_trash: text("in_trash"),
	logo: text("logo"),
	banner_url: text("banner_url"),
});

export const files = pgTable("files", {
	id: uuid("id").defaultRandom().primaryKey().notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: text("title").notNull(),
	icon_id: text("icon_id").notNull(),
	data: text("data"),
	in_trash: text("in_trash"),
	banner_url: text("banner_url"),
	workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	folder_id: uuid("folder_id").notNull().references(() => folders.id, { onDelete: "cascade", onUpdate: "cascade" } ),
});

export const clienti = pgTable("clienti", {
	codice: varchar("codice", { length: 6 }).primaryKey().notNull(),
	ragione_sociale: varchar("ragione_sociale", { length: 255 }).notNull(),
});

export const progetti = pgTable("progetti", {
	id: uuid("id").default(sql`uuid_generate_v4()`).primaryKey().notNull(),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" } ).references(() => workspaces.id, { onDelete: "cascade" } ),
	project_lead: uuid("project_lead").notNull().references(() => users.id, { onDelete: "set null" } ).references(() => users.id, { onDelete: "set null" } ),
	title: text("title").notNull(),
	description: text("description"),
	deadline: date("deadline"),
	status: stato_progetto("status").default('pianificato 📅').notNull(),
	client_id: varchar("client_id").notNull().references(() => clienti.codice),
});

export const users = pgTable("users", {
	id: uuid("id").primaryKey().notNull(),
	full_name: text("full_name"),
	avatar_url: text("avatar_url"),
	email: text("email").notNull(),
	updated_at: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
},
(table) => {
	return {
		users_id_fkey: foreignKey({
			columns: [table.id],
			foreignColumns: [table.id],
			name: "users_id_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
		users_email_key: unique("users_email_key").on(table.email),
	}
});

export const collaborators = pgTable("collaborators", {
	workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	created_at: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	user_id: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" } ),
	id: uuid("id").defaultRandom().primaryKey().notNull(),
});