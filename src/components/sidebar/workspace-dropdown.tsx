'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace } from '@/lib/supabase/supabase.types';
import React, { useEffect, useState } from 'react';
import SelectedWorkspace from './selected-workspace';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import WorkspaceCreator from '../global/workspace-creator';

interface WorkspaceDropdownProps {
    privateWorkspaces: workspace[] | [];
    sharedWorkspaces: workspace[] | [];
    collaboratingWorkspaces: workspace[] | [];
    defaultValue: workspace | undefined;
}

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
    privateWorkspaces,
    collaboratingWorkspaces,
    sharedWorkspaces,
    defaultValue,
}) => {
    const { dispatch, state } = useAppState();
    const [selectedOption, setSelectedOption] = useState(defaultValue);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!state.workspaces.length) {
            dispatch({
                type: 'SET_WORKSPACES',
                payload: {
                    workspaces: [
                        ...privateWorkspaces,
                        ...sharedWorkspaces,
                        ...collaboratingWorkspaces,
                    ].map((workspace) => ({ ...workspace, folders: [] })),
                },
            });
        }
    }, [privateWorkspaces, collaboratingWorkspaces, sharedWorkspaces]);

    const handleSelect = (option: workspace) => {
        setSelectedOption(option);
        setIsOpen(false);
    };

    useEffect(() => {
        const findSelectedWorkspace = state.workspaces.find(
            (workspace) => workspace.id === defaultValue?.id
        );
        if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
    }, [state, defaultValue]);

    return (
        <div
            className="relative inline-block text-left"
        >
            <div>
                <span onClick={() => setIsOpen(!isOpen)}>
                    {selectedOption ? (
                        <SelectedWorkspace workspace={selectedOption} />
                    ) : (
                        'Seleziona un workspace'
                    )}
                </span>
            </div>
            {isOpen && (
                <div
                    className="origin-top-right absolute w-full rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group border-[1px] border-muted overflow-y-auto"
                >
                    <div className="rounded-md flex flex-col">
                        <div className="!p-2">
                            {!!privateWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">Privato</p>
                                    <hr></hr>
                                    {privateWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                            {!!sharedWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">Condiviso</p>
                                    <hr />
                                    {sharedWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                            {!!collaboratingWorkspaces.length && (
                                <>
                                    <p className="text-muted-foreground">In Collaborazione</p>
                                    <hr />
                                    {collaboratingWorkspaces.map((option) => (
                                        <SelectedWorkspace
                                            key={option.id}
                                            workspace={option}
                                            onClick={handleSelect}
                                        />
                                    ))}
                                </>
                            )}
                        </div>
                        <CustomDialogTrigger
                            header="Crea un Workspace"
                            content={<WorkspaceCreator />}
                            description="I workspaces ti permettono di collaborare con altri. Puoi cambiare le impostazioni di privacy del workspace dopo averlo creato."
                        >
                            <div
                                className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full"
                            >
                                <article
                                    className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center"
                                >
                                    +
                                </article>
                                Crea area di lavoro
                            </div>
                        </CustomDialogTrigger>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceDropdown;
