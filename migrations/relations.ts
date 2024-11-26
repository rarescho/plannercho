import { relations } from "drizzle-orm/relations";
import { workspaces, folders, files, users, progetti, clienti, collaborators } from "./schema";

export const foldersRelations = relations(folders, ({one, many}) => ({
	workspace: one(workspaces, {
		fields: [folders.workspace_id],
		references: [workspaces.id]
	}),
	files: many(files),
}));

export const workspacesRelations = relations(workspaces, ({many}) => ({
	folders: many(folders),
	files: many(files),
	progettis_workspace_id: many(progetti, {
		relationName: "progetti_workspace_id_workspaces_id"
	}),
	collaborators: many(collaborators),
}));

export const filesRelations = relations(files, ({one}) => ({
	folder: one(folders, {
		fields: [files.folder_id],
		references: [folders.id]
	}),
	workspace: one(workspaces, {
		fields: [files.workspace_id],
		references: [workspaces.id]
	}),
}));

export const progettiRelations = relations(progetti, ({one}) => ({
	user_project_lead: one(users, {
		fields: [progetti.project_lead],
		references: [users.id],
		relationName: "progetti_project_lead_users_id"
	}),
	workspace_workspace_id: one(workspaces, {
		fields: [progetti.workspace_id],
		references: [workspaces.id],
		relationName: "progetti_workspace_id_workspaces_id"
	}),
	clienti: one(clienti, {
		fields: [progetti.client_id],
		references: [clienti.codice]
	}),
	
}));

export const usersRelations = relations(users, ({one, many}) => ({
	progettis_project_lead: many(progetti, {
		relationName: "progetti_project_lead_users_id"
	}),
	usersInAuth: one(users, {
		fields: [users.id],
		references: [users.id]
	}),
	collaborators: many(collaborators),
}));

export const clientiRelations = relations(clienti, ({many}) => ({
	progettis: many(progetti),
}));

export const usersInAuthRelations = relations(users, ({many}) => ({
	users: many(users),
}));

export const collaboratorsRelations = relations(collaborators, ({one}) => ({
	user: one(users, {
		fields: [collaborators.user_id],
		references: [users.id]
	}),
	workspace: one(workspaces, {
		fields: [collaborators.workspace_id],
		references: [workspaces.id]
	}),
}));