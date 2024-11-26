'use client'
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import WorkspaceIcon from '../icons/WorkspaceIcon';
import SettingsIcon from '../icons/SettingsIcon';
import TrashIcon from '../icons/TrashIcon';
import Trash from '../trash/trash';
import Settings from '../settings/settings';
import { Target } from 'lucide-react';
import ProjectForm from '../project/project';
import { Project } from '@/lib/supabase/supabase.types'
import { useAppState } from '@/lib/providers/state-provider';
import { getProjects } from '@/lib/supabase/queries';

interface NativeNavigationProps {
    myWorkspaceId: string;
    className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
    myWorkspaceId,
    className,
}) => {
    const [progettoRiferimento, setProgettoRiferimento] = useState<Project | null>(null);
    const { workspaceId } = useAppState();

    useEffect(() => {
        const fetchProject = async () => {
            if (workspaceId) {
                try {
                    const { data, error } = await getProjects(workspaceId);
                    if (error) {
                    } else if (data && data.length > 0) {
                        setProgettoRiferimento(data[0]);
                    }
                } catch (error) {
                    console.error('Error fetching project:', error);
                }
            }
        };

        fetchProject();
    }, [workspaceId]);

    return (
        <nav className={twMerge('my-2', className)}>
            <ul className="flex flex-col gap-2">
                <li>
                    <Link
                        className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
          "
                        href={`/dashboard/${myWorkspaceId}`}
                    >
                        <WorkspaceIcon />
                        <span className="font-bold text-base">Spazio di lavoro</span>
                    </Link>
                </li>
                {!progettoRiferimento ?
                    <ProjectForm>
                        <li
                            className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
            cursor-pointer
          "
                        >
                            <Target />
                            <span className="font-bold text-base">Progetto</span>
                        </li>
                    </ProjectForm>
                    : null
                }
                <Settings>
                    <li
                        className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
            cursor-pointer
          "
                    >
                        <SettingsIcon />
                        <span className="font-bold text-base">Impostazioni</span>
                    </li>
                </Settings>

                <Trash>
                    <li
                        className="group/native
            flex
            text-Neutrals/neutrals-7
            transition-all
            gap-2
          "
                    >
                        <TrashIcon />
                        <span className="font-bold text-base">Cestino</span>
                    </li>
                </Trash>
            </ul>
        </nav>
    );
};

export default NativeNavigation;