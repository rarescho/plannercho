import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import React from 'react'
import {
    getCollaboratingWorkspaces,
    getFolders,
    getPrivateWorkspaces,
    getSharedWorkspaces,
} from '@/lib/supabase/queries';
import { redirect } from 'next/navigation';
import { twMerge } from 'tailwind-merge';
import WorkspaceDropdown from './workspace-dropdown';
import NativeNavigation from './native-navigation';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import FoldersDropdownList from './folders-dropdown-list';
import { Progress } from '../ui/progress';
import UserCard from './user-card';
import TooltipComponent from '../global/tooltip-component';
import { PlusIcon, Upload } from 'lucide-react';
import UploadsDropDownList from './uploads-dropdown-list';



interface SidebarProps {
    params: { workspaceId: string };
    className?: string;
}
const SideBar: React.FC<SidebarProps> = async ({ params, className }) => {
    const supabase = createServerComponentClient({ cookies })
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    const { data: workspaceFolderData, error: foldersError } = await getFolders(
        params.workspaceId
    );
    if (foldersError) redirect('/dashboard');

    const [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces] =
        await Promise.all([
            getPrivateWorkspaces(user.id),
            getCollaboratingWorkspaces(user.id),
            getSharedWorkspaces(user.id),
        ]);




    return (
        <aside
            className={twMerge(
                'hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between',
                className
            )}
        >
            <div>
                <WorkspaceDropdown
                    privateWorkspaces={privateWorkspaces}
                    sharedWorkspaces={sharedWorkspaces}
                    collaboratingWorkspaces={collaboratingWorkspaces}
                    defaultValue={[
                        ...privateWorkspaces,
                        ...collaboratingWorkspaces,
                        ...sharedWorkspaces,
                    ].find((workspace) => workspace.id === params.workspaceId)}
                />

                <NativeNavigation myWorkspaceId={params.workspaceId} />
                <Progress
                    value={0}
                    className="h-1"
                />
                <ScrollArea
                    className="overflow-scroll relative
          h-[450px]
        "
                >
                    <div
                        className="pointer-events-none
          w-full
          absolute
          bottom-0
          h-20
          bg-gradient-to-t
          from-background
          to-transparent
          z-40"
                    />
                    <FoldersDropdownList
                        workspaceFolders={workspaceFolderData || []}
                        workspaceId={params.workspaceId}
                    />

                </ScrollArea>
                    <UploadsDropDownList />
            </div>
            <UserCard />

        </aside>
    )
}

export default SideBar
