/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '../ui/use-toast';
import { useAppState } from '@/lib/providers/state-provider';
import { User, workspace } from '@/lib/supabase/supabase.types';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
    Briefcase,
    CreditCard,
    ExternalLink,
    Lock,
    LogOut,
    Plus,
    Share,
    User as UserIcon,
} from 'lucide-react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
    addCollaborators,
    deleteWorkspace,
    getCollaborators,
    removeCollaborators,
    updateUser,
    updateWorkspace,
} from '@/lib/supabase/queries';
import { v4 } from 'uuid';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import CollaboratorSearch from '../global/collaborator-search';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import LogoutButton from '../global/logout-button';
import Link from 'next/link';
import db from '@/lib/supabase/db';

const SettingsForm = () => {
    const { toast } = useToast();
    const { user } = useSupabaseUser();
    const router = useRouter();
    const supabase = createClientComponentClient();
    const { state, workspaceId, dispatch } = useAppState();
    const [permissions, setPermissions] = useState('private');
    const [collaborators, setCollaborators] = useState<User[] | []>([]);
    const [openAlertMessage, setOpenAlertMessage] = useState(false);
    const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();
    const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState('');

    const addUserAvatar = async () => {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data: response, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error || !response) {
            console.error('Error fetching user:', error);
            return;
        }

        let avatarPath = '';
        if (!response.avatar_url) {
            console.log('No avatar');
        } else {
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(response.avatar_url);

            if (data) {
                avatarPath = data.publicUrl;
                setAvatarUrl(avatarPath);
            }
        }
    };

    useEffect(() => {
        addUserAvatar();
    }, []);

    //addcollborators
    const addCollaborator = async (profile: User) => {
        if (!workspaceId) return;
        await addCollaborators([profile], workspaceId);
        setCollaborators([...collaborators, profile]);
    };

    //remove collaborators
    const removeCollaborator = async (user: User) => {
        if (!workspaceId) return;
        if (collaborators.length === 1) {
            setPermissions('private');
        }
        await removeCollaborators([user], workspaceId);
        setCollaborators(
            collaborators.filter((collaborator) => collaborator.id !== user.id)
        );
        router.refresh();
    };

    //on change
    const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!workspaceId || !e.target.value) return;
        dispatch({
            type: 'UPDATE_WORKSPACE',
            payload: { workspace: { title: e.target.value }, workspaceId },
        });
        if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
        titleTimerRef.current = setTimeout(async () => {
            // await updateWorkspace({ title: e.target.value }, workspaceId);
        }, 500);
    };

    const onChangeWorkspaceLogo = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!workspaceId) return;
        const file = e.target.files?.[0];
        if (!file) return;
        const uuid = v4();
        setUploadingLogo(true);
        const { data, error } = await supabase.storage
            .from('workspace-logos')
            .upload(`workspaceLogo.${uuid}`, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (!error) {
            dispatch({
                type: 'UPDATE_WORKSPACE',
                payload: { workspace: { logo: data.path }, workspaceId },
            });
            await updateWorkspace({ logo: data.path }, workspaceId);
            setUploadingLogo(false);
        }
    };
    const onChangeProfilePicture = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.value;
        let filePath = "";
        const uploadAvatar = async () => {
            const { data, error } = await supabase.storage
                .from("avatars")
                .upload(`avatar-${v4()}`, file, { cacheControl: "5", upsert: true });

            if (error) throw error;
            filePath = data.path;
        };

        const deleteAvatar = async (avatarUrl: string) => {
            const { data, error } = await supabase.storage
                .from("avatars")
                .remove([avatarUrl]);
            if (error) throw error;
            console.log("Avatar Delete Data:", data);
        };

        try {
            if (!avatarUrl) {
                await uploadAvatar();
            } else {
                await deleteAvatar(avatarUrl);
                await uploadAvatar();
            }
            setAvatarUrl(filePath);
            if (!user) return;
            const { data, error } = await updateUser(
                user.id, filePath
            );
            if (error) {
                toast({
                    title: "Error",
                    variant: "destructive",
                    description: "Could not update the profile picture",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Updated the profile picture",
                });
            }
        } catch (error) {
            console.log("Error in uploading profile picture:");
            console.log(error)
        }
    };



    const onClickAlertConfirm = async () => {
        if (!workspaceId) return;
        if (collaborators.length > 0) {
            await removeCollaborators(collaborators, workspaceId);
        }
        setPermissions('private');
        setOpenAlertMessage(false);
    };

    const onPermissionsChange = (val: string) => {
        if (val === 'private') {
            setOpenAlertMessage(true);
        } else setPermissions(val);
    };

    //CHALLENGE fetching avatar details
    //WIP Payment Portal redirect

    useEffect(() => {
        const showingWorkspace = state.workspaces.find(
            (workspace) => workspace.id === workspaceId
        );
        if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
    }, [workspaceId, state]);

    useEffect(() => {
        if (!workspaceId) return;
        const fetchCollaborators = async () => {
            const response = await getCollaborators(workspaceId);
            if (response.length) {
                setPermissions('shared');
                setCollaborators(response);
            }
        };
        fetchCollaborators();
    }, [workspaceId]);

    return (
        <div className="flex gap-4 flex-col">
            <p className="flex items-center gap-2 mt-6">
                <Briefcase size={20} />
                Area di lavoro
            </p>
            <Separator />
            <div className="flex flex-col gap-2">
                <Label
                    htmlFor="workspaceName"
                    className="text-sm text-muted-foreground"
                >
                    Nome
                </Label>
                <Input
                    name="workspaceName"
                    value={workspaceDetails ? workspaceDetails.title : ''}
                    placeholder="Nome area di lavoro"
                    onChange={workspaceNameChange}
                />
                <Label
                    htmlFor="workspaceLogo"
                    className="text-sm text-muted-foreground"
                >
                    Logo
                </Label>
                <Input
                    name="workspaceLogo"
                    type="file"
                    accept="image/*"
                    placeholder="Workspace Logo"
                    onChange={onChangeWorkspaceLogo}
                    disabled={uploadingLogo}
                />
            </div>
            <>
                <Label htmlFor="permissions">Permessi</Label>
                <Select
                    onValueChange={onPermissionsChange}
                    value={permissions}
                >
                    <SelectTrigger className="h-26 -mt-3">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="private">
                                <div
                                    className="p-2
                  flex
                  gap-4
                  justify-center
                  items-center child w-full
                "
                                >
                                    <Lock />
                                    <article className="text-left flex flex-col">
                                        <span>Privato</span>
                                        <p>
                                            Il tuo spazio di lavoro è privato per te.
                                        </p>
                                    </article>
                                </div>
                            </SelectItem>
                            <SelectItem value="shared">
                                <div className="p-2 flex gap-4 justify-center items-center">
                                    <Share></Share>
                                    <article className="text-left flex flex-col">
                                        <span>Condiviso</span>
                                        <span>Puoi invitare collaboratori.</span>
                                    </article>
                                </div>
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                {permissions === 'shared' && (
                    <div>
                        <CollaboratorSearch
                            existingCollaborators={collaborators}
                            getCollaborator={(user) => {
                                addCollaborator(user);
                            }}
                        >
                            <Button
                                type="button"
                                className="text-sm mt-4"
                            >
                                <Plus />
                                Aggiungi collaboratori
                            </Button>
                        </CollaboratorSearch>
                        <div className="mt-4">
                            <span className="text-sm text-muted-foreground">
                                Collaboratori {collaborators.length || ''}
                            </span>
                            <ScrollArea
                                className="
            h-[120px]
            overflow-y-scroll
            w-full
            rounded-md
            border
            border-muted-foreground/20"
                            >
                                {collaborators.length ? (
                                    collaborators.map((c) => (
                                        <div
                                            className="p-4 flex
                      justify-between
                      items-center
                "
                                            key={c.id}
                                        >
                                            <div className="flex gap-4 items-center">
                                                <Avatar>
                                                    <AvatarImage src={avatarUrl} />
                                                    <AvatarFallback>PJ</AvatarFallback>
                                                </Avatar>
                                                <div
                                                    className="text-sm 
                          gap-2
                          text-muted-foreground
                          overflow-hidden
                          overflow-ellipsis
                          sm:w-[300px]
                          w-[140px]
                        "
                                                >
                                                    {c.email}
                                                </div>
                                            </div>
                                            <Button
                                                variant="secondary"
                                                onClick={() => removeCollaborator(c)}
                                            >
                                                Cancella
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div
                                        className="absolute
                  right-0 left-0
                  top-0
                  bottom-0
                  flex
                  justify-center
                  items-center
                "
                                    >
                                        <span className="text-muted-foreground text-sm">
                                            Non hai collaboratori
                                        </span>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </div>
                )}
                <Alert variant={'destructive'}>
                    <AlertDescription>
                        Attenzione! L&#39;eliminazione del tuo spazio di lavoro eliminerà definitivamente tutti i dati relativi a questo spazio di lavoro.
                    </AlertDescription>
                    <Button
                        type="submit"
                        size={'sm'}
                        variant={'destructive'}
                        className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
                        onClick={async () => {
                            if (!workspaceId) return;
                            await deleteWorkspace(workspaceId);
                            toast({ title: 'Successfully deleted your workspae' });
                            dispatch({ type: 'DELETE_WORKSPACE', payload: workspaceId });
                            router.replace('/dashboard');
                        }}
                    >
                        Elimina area di lavoro
                    </Button>
                </Alert>
                <p className="flex items-center gap-2 mt-6">
                    <UserIcon size={20} /> Profilo
                </p>
                <Separator />
                <div className="flex items-center">
                    <Avatar>
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback>
                            <CypressProfileIcon />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ml-6">
                        <small className="text-muted-foreground cursor-not-allowed">
                            {user ? user.email : ''}
                        </small>
                        <Label
                            htmlFor="profilePicture"
                            className="text-sm text-muted-foreground"
                        >
                            Immagine di profilo
                        </Label>
                        <Input
                            name="profilePicture"
                            type="file"
                            accept="image/*"
                            placeholder="Profile Picture"
                            onChange={onChangeProfilePicture}
                            disabled={uploadingProfilePic}
                        />
                    </div>
                </div>
                <LogoutButton>
                    <div className="flex items-center">
                        <LogOut />
                    </div>
                </LogoutButton>
                <Separator />



            </>
            <AlertDialog open={openAlertMessage}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDescription>
                            La modifica di un&#39;area di lavoro condivisa in un&#39;area di lavoro privata rimuoverà definitivamente tutti i collaboratori.
                        </AlertDescription>

                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
                            Cancella
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={onClickAlertConfirm}>
                            Continua
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SettingsForm;