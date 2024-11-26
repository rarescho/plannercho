import { InferSelectModel } from 'drizzle-orm';
import {
    folders,
    users,
    workspaces,
    files,
    progetti,
    clienti

} from '../../../migrations/schema';

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export interface Database {
    public: {
        Tables: {
            collaborators: {
                Row: {
                    created_at: string;
                    id: string;
                    user_id: string;
                    workspace_id: string;
                };
                Insert: {
                    created_at?: string;
                    id?: string;
                    user_id: string;
                    workspace_id: string;
                };
                Update: {
                    created_at?: string;
                    id?: string;
                    user_id?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'collaborators_user_id_fkey';
                        columns: ['user_id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'collaborators_workspace_id_fkey';
                        columns: ['workspace_id'];
                        referencedRelation: 'workspaces';
                        referencedColumns: ['id'];
                    }
                ];
            };

            files: {
                Row: {
                    banner_url: string | null;
                    created_at: string;
                    data: string | null;
                    folder_id: string;
                    icon_id: string;
                    id: string;
                    in_trash: string | null;
                    title: string;
                    workspace_id: string;
                };
                Insert: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    folder_id: string;
                    icon_id: string;
                    id?: string;
                    in_trash?: string | null;
                    title: string;
                    workspace_id: string;
                };
                Update: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    folder_id?: string;
                    icon_id?: string;
                    id?: string;
                    in_trash?: string | null;
                    title?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'files_folder_id_folders_id_fk';
                        columns: ['folder_id'];
                        referencedRelation: 'folders';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'files_workspace_id_workspaces_id_fk';
                        columns: ['workspace_id'];
                        referencedRelation: 'workspaces';
                        referencedColumns: ['id'];
                    }
                ];
            };
            folders: {
                Row: {
                    banner_url: string | null;
                    created_at: string;
                    data: string | null;
                    icon_id: string;
                    id: string;
                    in_trash: string | null;
                    title: string;
                    workspace_id: string;
                };
                Insert: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    icon_id: string;
                    id?: string;
                    in_trash?: string | null;
                    title: string;
                    workspace_id: string;
                };
                Update: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    icon_id?: string;
                    id?: string;
                    in_trash?: string | null;
                    title?: string;
                    workspace_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'folders_workspace_id_workspaces_id_fk';
                        columns: ['workspace_id'];
                        referencedRelation: 'workspaces';
                        referencedColumns: ['id'];
                    }
                ];
            };
            users: {
                Row: {
                    avatar_url: string | null;
                    billing_address: Json | null;
                    email: string | null;
                    full_name: string | null;
                    id: string;
                    payment_method: Json | null;
                    updated_at: string | null;
                };
                Insert: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    email?: string | null;
                    full_name?: string | null;
                    id: string;
                    payment_method?: Json | null;
                    updated_at?: string | null;
                };
                Update: {
                    avatar_url?: string | null;
                    billing_address?: Json | null;
                    email?: string | null;
                    full_name?: string | null;
                    id?: string;
                    payment_method?: Json | null;
                    updated_at?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'users_id_fkey';
                        columns: ['id'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            workspaces: {
                Row: {
                    banner_url: string | null;
                    created_at: string;
                    data: string | null;
                    icon_id: string;
                    id: string;
                    in_trash: string | null;
                    logo: string | null;
                    title: string;
                    workspace_owner: string;
                };
                Insert: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    icon_id: string;
                    id?: string;
                    in_trash?: string | null;
                    logo?: string | null;
                    title: string;
                    workspace_owner: string;
                };
                Update: {
                    banner_url?: string | null;
                    created_at?: string;
                    data?: string | null;
                    icon_id?: string;
                    id?: string;
                    in_trash?: string | null;
                    logo?: string | null;
                    title?: string;
                    workspace_owner?: string;
                };
                Relationships: [];
            };
            progetti: {
                Row: {
                    id: string;
                    created_at: string;
                    client_id: string;
                    workspace_id: string;
                    project_lead: string;
                    title: string;
                    description: string;
                    status: string;
                    deadline: Date;
                };
                Insert: {
                    id?: string;
                    created_at?: string;
                    client_id: string;
                    workspace_id: string;
                    project_lead: string;
                    title: string;
                    description?: string;
                    status?: string;
                    deadline: Date;
                };
                Update: {
                    id?: string;
                    created_at?: string;
                    client_id: string;
                    workspace_id?: string;
                    project_lead?: string;
                    title?: string;
                    description?: string;
                    status?: string;
                    deadline: Date;
                };
                Relationships: [
                    {
                        foreignKeyName: 'progetti_workspace_id_fkey';
                        columns: ['workspace_id'];
                        referencedRelation: 'workspaces';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'progetti_project_lead_fkey';
                        columns: ['project_lead'];
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    }
                ];
            };
            clienti: {
                Row: {
                    id: string;
                    codice: string;
                    ragione_sociale: string;
                };
                Insert: {
                    id?: string;
                    codice: string;
                    ragione_sociale: string;
                };
                Update: {
                    id?: string;
                    codice?: string;
                    ragione_sociale?: string;
                };
                Relationships: [];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
            pricing_type: 'one_time' | 'recurring';
            subscription_status:
            | 'trialing'
            | 'active'
            | 'canceled'
            | 'incomplete'
            | 'incomplete_expired'
            | 'past_due'
            | 'unpaid';
            stato_progetto: 'pianificato 📅' | 'in_corso 🚧' | 'in_revisione 🔍' | 'approvato ✅' | 'in_sospeso ⏸️' | 'annullato ❌' | 'in_attesa ⏳';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
export enum ProjectState {
    PLANNED = 'pianificato 📅',
    IN_PROGRESS = 'in_corso 🚧',
    IN_REVIEW = 'in_revisione 🔍',
    APPROVED = 'approvato ✅',
    SUSPENDED = 'in_sospeso ⏸️',
    CANCELED = 'annullato ❌',
    PENDING = 'in_attesa ⏳',
}
export type workspace = InferSelectModel<typeof workspaces>;
export type User = InferSelectModel<typeof users>;
export type Folder = InferSelectModel<typeof folders>;
export type File = InferSelectModel<typeof files>;
export type Project = InferSelectModel<typeof progetti>;
export type Client = InferSelectModel<typeof clienti>;
