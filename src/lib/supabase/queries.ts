'use server';
import { validate } from 'uuid';
import { files, folders, users, workspaces, progetti, clienti } from '../../../migrations/schema';
import db from './db';
import { File, Folder, User, workspace } from './supabase.types';
import { and, eq, ilike, notExists } from 'drizzle-orm';
import { collaborators } from './schema';
import { revalidatePath } from 'next/cache';

export const createWorkspace = async (workspace: workspace) => {
    try {
        await db.insert(workspaces).values(workspace);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const deleteWorkspace = async (workspaceId: string) => {
    if (!workspaceId) return;
    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
};

export const getFolders = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) return { data: null, error: 'Error' };

    try {
        const results = await db
            .select()
            .from(folders)
            .orderBy(folders.created_at)
            .where(eq(folders.workspace_id, workspaceId)) as Folder[];
        return { data: results, error: null };
    } catch (error) {
        return { data: null, error: 'Error' };
    }
};

export const getWorkspaceDetails = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) return { data: [], error: 'Error' };

    try {
        const response = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))
            .limit(1) as workspace[];
        return { data: response, error: null };
    } catch (error) {
        console.log(error);
        return { data: [], error: 'Error' };
    }
};

export const getFileDetails = async (fileId: string) => {
    const isValid = validate(fileId);
    if (!isValid) return { data: [], error: 'Error' };

    try {
        const response = await db
            .select({
                banner_url: files.banner_url,
                created_at: files.created_at,
                data: files.data,
                folder_id: files.folder_id,
                icon_id: files.icon_id,
                id: files.id,
                in_trash: files.in_trash,
                title: files.title,
                workspace_id: files.workspace_id
            })
            .from(files)
            .where(eq(files.id, fileId))
            .limit(1);

        const result = response as File[];
        return { data: result, error: null };
    } catch (error) {
        console.log('🔴Error', error);
        return { data: [], error: 'Error' };
    }
};


export const deleteFile = async (fileId: string) => {
    if (!fileId) return;
    await db.delete(files).where(eq(files.id, fileId));
};

export const deleteFolder = async (folderId: string) => {
    if (!folderId) return;
    await db.delete(files).where(eq(files.id, folderId));
};

export const getFolderDetails = async (folderId: string) => {
    const isValid = validate(folderId);
    if (!isValid) return { data: [], error: 'Error' };

    try {
        const response = await db
            .select()
            .from(folders)
            .where(eq(folders.id, folderId))
            .limit(1) as Folder[];
        return { data: response, error: null };
    } catch (error) {
        return { data: [], error: 'Error' };
    }
};

export const getPrivateWorkspaces = async (userId: string) => {
    if (!userId) return [];

    const privateWorkspaces = await db
        .select()
        .from(workspaces)
        .where(
            and(
                notExists(
                    db
                        .select()
                        .from(collaborators)
                        .where(eq(collaborators.workspaceId, workspaces.id))
                ),
                eq(workspaces.workspace_owner, userId)
            )
        ) as workspace[];
    return privateWorkspaces;
};

export const getCollaboratingWorkspaces = async (userId: string) => {
    if (!userId) return [];

    const collaboratedWorkspaces = await db
        .select({
            id: workspaces.id,
            created_at: workspaces.created_at,
            workspace_owner: workspaces.workspace_owner,
            title: workspaces.title,
            icon_id: workspaces.icon_id,
            data: workspaces.data,
            in_trash: workspaces.in_trash,
            logo: workspaces.logo,
            banner_url: workspaces.banner_url
        })
        .from(users)
        .innerJoin(collaborators, eq(users.id, collaborators.userId))
        .innerJoin(workspaces, eq(collaborators.workspaceId, workspaces.id))
        .where(eq(users.id, userId)) as workspace[];

    return collaboratedWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
    if (!userId) return [];

    const sharedWorkspaces = await db
        .selectDistinct({
            id: workspaces.id,
            created_at: workspaces.created_at,
            workspace_owner: workspaces.workspace_owner,
            title: workspaces.title,
            icon_id: workspaces.icon_id,
            data: workspaces.data,
            in_trash: workspaces.in_trash,
            logo: workspaces.logo,
            banner_url: workspaces.banner_url
        })
        .from(workspaces)
        .orderBy(workspaces.created_at)
        .innerJoin(collaborators, eq(workspaces.id, collaborators.workspaceId))
        .where(eq(workspaces.workspace_owner, userId)) as workspace[];

    return sharedWorkspaces;
};


export const getFiles = async (folderId: string) => {
    const isValid = validate(folderId);
    if (!isValid) return { data: null, error: 'Error' };

    try {
        const results = await db
            .select({
                banner_url: files.banner_url,
                created_at: files.created_at,
                data: files.data,
                folder_id: files.folder_id,
                icon_id: files.icon_id,
                id: files.id,
                in_trash: files.in_trash,
                title: files.title,
                workspace_id: files.workspace_id
            })
            .from(files)
            .orderBy(files.created_at)
            .where(eq(files.folder_id, folderId)) as File[];
        return { data: results, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const addCollaborators = async (users: User[], workspaceId: string) => {
    users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.user_id, user.id), eq(u.workspace_id, workspaceId)),
        });
        if (!userExists)
            await db.insert(collaborators).values({ workspaceId, userId: user.id });
    });
};

export const removeCollaborators = async (
    users: User[],
    workspaceId: string
) => {
    users.forEach(async (user: User) => {
        const userExists = await db.query.collaborators.findFirst({
            where: (u, { eq }) =>
                and(eq(u.user_id, user.id), eq(u.workspace_id, workspaceId)),
        });
        if (userExists)
            await db
                .delete(collaborators)
                .where(
                    and(
                        eq(collaborators.workspaceId, workspaceId),
                        eq(collaborators.userId, user.id)
                    )
                );
    });
};

export const findUser = async (userId: string) => {
    const response = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, userId),
    });
    return response;
};

export const createFolder = async (folder: Folder) => {
    try {
        await db.insert(folders).values(folder);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const createFile = async (file: File) => {
    try {
        await db.insert(files).values(file);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const updateFolder = async (
    folder: Partial<Folder>,
    folderId: string
) => {
    try {
        await db.update(folders).set(folder).where(eq(folders.id, folderId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const updateFile = async (file: Partial<File>, fileId: string) => {
    try {
        await db.update(files).set(file).where(eq(files.id, fileId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};
export const updateUser = async (userId: string, avatarUrl: string) => {
    if (!userId) return { data: null, error: 'Invalid user ID' };

    try {
        await db.update(users).set({ avatar_url: avatarUrl }).where(eq(users.id, userId));
        revalidatePath(`/profile/${userId}`); // Revalidate path if necessary
        return { data: 'User updated successfully', error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error updating user' };
    }
};

export const updateWorkspace = async (
    workspace: Partial<workspace>,
    workspaceId: string
) => {
    if (!workspaceId) return;
    try {
        await db.update(workspaces).set(workspace).where(eq(workspaces.id, workspaceId));
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};

export const getCollaborators = async (workspaceId: string) => {
    const response = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.workspaceId, workspaceId));
    if (!response.length) return [];
    const userInformation: Promise<User | undefined>[] = response.map(
        async (user) => {
            const exists = await db.query.users.findFirst({
                where: (u, { eq }) => eq(u.id, user.userId),
            });
            return exists;
        }
    );
    const resolvedUsers = await Promise.all(userInformation);
    return resolvedUsers.filter(Boolean) as User[];
};

export const getUsersFromSearch = async (email: string) => {
    if (!email) return [];
    const accounts = await db
        .select()
        .from(users)
        .where(ilike(users.email, `${email}%`));
    return accounts;
};

export const createProject = async (project: any) => {
    try {
        const deadline = project.deadline.toISOString();
        project.deadline = deadline;
        await db.insert(progetti).values(project);
        return { data: null, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};


export const getProjects = async (workspaceId: string) => {
    const isValid = validate(workspaceId);
    if (!isValid) return { data: null, error: 'Error' };

    try {
        const results = await db
            .select({
                id: progetti.id,
                created_at: progetti.created_at,
                workspace_id: progetti.workspace_id,
                project_lead: progetti.project_lead,
                title: progetti.title,
                description: progetti.description,
                status: progetti.status,
                deadline: progetti.deadline,
                client_id: progetti.client_id,
            })
            .from(progetti)
            .orderBy(progetti.created_at)
            .where(eq(progetti.workspace_id, workspaceId));
        return { data: results, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};
export const getClients = async () => {
    try {
        const results = await db
            .select({
                codice: clienti.codice,
                ragione_sociale: clienti.ragione_sociale
            })
            .from(clienti)
            .orderBy(clienti.codice); // Puoi cambiare l'ordinamento se necessario
        return { data: results, error: null };
    } catch (error) {
        console.log(error);
        return { data: null, error: 'Error' };
    }
};
export const deleteProject = async (projectId: string) => {
    const isValid = validate(projectId);
    if (!isValid) return { success: false, message: 'Invalid project ID' };

    try {
        await db
            .delete(progetti)
            .where(eq(progetti.id, projectId));
        return { success: true, message: 'Progetto disassociato.' };
    } catch (error) {
        console.log(error);
        return {
            success: false, message: 'Errore procedura di disassociazione.'
        };
    }
};
export const deleteClient = async (clientId: string) => {
    const isValid = validate(clientId);
    if (!isValid) return { success: false, message: 'Invalid client ID' };

    try {
        await db
            .delete(clienti)
            .where(eq(clienti.codice, clientId));
        return { success: true, message: 'Client deleted successfully' };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error deleting client' };
    }
};
export const updateProject = async (projectId: string, updatedProject: any) => {
    const isValid = validate(projectId);
    if (!isValid) return { success: false, message: 'Invalid project ID' };

    try {
        await db
            .update(progetti)
            .set(updatedProject)
            .where(eq(progetti.id, projectId));
        return { success: true, message: 'Project updated successfully' };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error updating project' };
    }
};
export const updateClient = async (clientId: string, updatedClient: any) => {
    const isValid = validate(clientId);
    if (!isValid) return { success: false, message: 'Invalid client ID' };

    try {
        await db
            .update(clienti)
            .set(updatedClient)
            .where(eq(clienti.codice, clientId));
        return { success: true, message: 'Client updated successfully' };
    } catch (error) {
        console.log(error);
        return { success: false, message: 'Error updating client' };
    }
};
