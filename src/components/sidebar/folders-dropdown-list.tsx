'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { Folder } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon } from 'lucide-react';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { v4 } from 'uuid';
import { createFolder } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import { Accordion } from '../ui/accordion';
import Dropdown from './Dropdown';
import useSupabaseRealtime from '@/lib/hooks/useSupabaseRealtime';

interface FoldersDropdownListProps {
    workspaceFolders: Folder[];
    workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
    workspaceFolders,
    workspaceId,
}) => {
    useSupabaseRealtime();
    const { state, dispatch, folderId } = useAppState();
    const { toast } = useToast();
    const [folders, setFolders] = useState(workspaceFolders);

    //effec set initial satte server app state
    useEffect(() => {
        if (workspaceFolders.length > 0) {
            dispatch({
                type: 'SET_FOLDERS',
                payload: {
                    workspaceId,
                    folders: workspaceFolders.map((folder) => ({
                        ...folder,
                        files:
                            state.workspaces
                                .find((workspace) => workspace.id === workspaceId)
                                ?.folders.find((f) => f.id === folder.id)?.files || [],
                    })),
                },
            });
        }
    }, [workspaceFolders, workspaceId]);
    //state

    useEffect(() => {
        setFolders(
            state.workspaces.find((workspace) => workspace.id === workspaceId)
                ?.folders || []
        );
    }, [state]);

    //add folder
    const addFolderHandler = async () => {

        const newFolder: Folder = {
            data: null,
            id: v4(),
            created_at: new Date().toISOString(),
            title: 'Nuova cartella',
            icon_id: '📁',
            in_trash: null,
            workspace_id: workspaceId,
            banner_url: '',
        };
        dispatch({
            type: 'ADD_FOLDER',
            payload: { workspaceId, folder: { ...newFolder, files: [] } },
        });
        const { data, error } = await createFolder(newFolder);
        if (error) {
            toast({
                title: 'Error',
                variant: 'destructive',
                description: 'Could not create the folder',
            });
        } else {
            toast({
                title: 'Success',
                description: 'Created folder.',
            });
        }
    };

    return (
        <>
            <div
                className="flex
        sticky 
        z-20 
        top-0 
        bg-background 
        w-full  
        h-10 
        group/title 
        justify-between 
        items-center 
        pr-4 
        text-Neutrals/neutrals-8
  "
            >
                <span
                    className="text-Neutrals-8 
        font-bold 
        text-xs"
                >
                    CARTELLE
                </span>
                <TooltipComponent message="Crea cartella">
                    <PlusIcon
                        onClick={addFolderHandler}
                        size={16}
                        className="group-hover/title:inline-block
            hidden 
            cursor-pointer
            hover:dark:text-white
          "
                    />
                </TooltipComponent>
            </div>
            <Accordion
                type="multiple"
                defaultValue={[folderId || '']}
                className="pb-20"
            >
                {folders
                    .filter((folder) => !folder.in_trash)
                    .map((folder) => (
                        <Dropdown
                            key={folder.id}
                            title={folder.title}
                            listType="folder"
                            id={folder.id}
                            iconId={folder.icon_id}
                        />
                    ))}
            </Accordion>

        </>
    );
};

export default FoldersDropdownList;