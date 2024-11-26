/* eslint-disable react/jsx-no-undef */
'use client';
import { useAppState } from '@/lib/providers/state-provider';
import { workspace, File, Folder, Project } from '@/lib/supabase/supabase.types'
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import 'quill/dist/quill.snow.css';
import { Button } from '../ui/button';
import { deleteFile, deleteFolder, deleteProject, findUser, getFileDetails, getFolderDetails, getProjects, getWorkspaceDetails, updateFile, updateFolder, updateWorkspace } from '@/lib/supabase/queries';
import { usePathname, useRouter } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import BannerUpload from '../banner-upload/banner-upload';
import { XCircleIcon, FileDown, CircleArrowRight } from 'lucide-react';
import EmojiPicker from '../global/emoji-picker';
import { useSocket } from '@/lib/providers/socket-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import { saveAs } from 'file-saver';
import { pdfExporter } from 'quill-to-pdf';
import mammoth from 'mammoth';
import dynamic from 'next/dynamic';
import { Label } from '@radix-ui/react-label';
import { toast } from '../ui/use-toast';
import { ProjectDialog } from '../project/project-dialog';
const QuillContextMenuIo = dynamic(() => import('./quill-context-menu-io'), { ssr: false });
const QuillEditorUpload = dynamic(() => import('./quil-editor-upload'), { ssr: false });
const KanbanBoard = dynamic(() => import('./components/kanban-board'), { ssr: false });


interface QuillEditorProps {
    dirDetails: File | Folder | workspace;
    fileId: string;
    dirType: 'file' | 'folder' | 'workspace';
}
var TOOLBAR_OPTIONS = [
    ['bold', 'italic', 'underline', 'strike'], // toggled buttons
    ['blockquote', 'code-block'],
    ['link', 'image', 'video',],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ script: 'sub' }, { script: 'super' }], // superscript/subscript
    [{ indent: '-1' }, { indent: '+1' }], // outdent/indent
    [{ direction: 'rtl' }], // text direction

    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ['clean'], // remove formatting button
];
const QuillEditor: React.FC<QuillEditorProps> = ({
    dirDetails,
    dirType,
    fileId,
}) => {
    const supabase = createClientComponentClient();
    const { user } = useSupabaseUser();
    const [deletingBanner, setDeletingBanner] = useState(false);
    const { socket } = useSocket();
    const { state, workspaceId, folderId, dispatch } = useAppState();
    const [quill, setQuill] = useState<any>(null);
    const [collaborators, setCollaborators] = useState<
        { id: string; email: string; avatarUrl: string }[]
    >([]);
    const [saving, setSaving] = useState(false);
    const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
    const router = useRouter();
    const [localCursors, setLocalCursors] = useState<any>([]);
    const [progettoRiferimento, setProgettoRiferimento] = useState<Project | null>(null);

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




    const details = useMemo(() => {
        let selectedDir;
        if (dirType === "file") {
            selectedDir = state.workspaces.find(
                (workspace) => workspace.id === workspaceId
            )?.folders.find((folder) => folder.id === folderId)?.files.find(
                (file) => file.id === fileId
            );
        } else if (dirType === "folder") {
            selectedDir = state.workspaces.find(
                (workspace) => workspace.id === workspaceId
            )?.folders.find((folder) => folder.id === fileId);
        } else if (dirType === "workspace") {
            selectedDir = state.workspaces.find(
                (workspace) => workspace.id === fileId
            );
        }
        if (selectedDir) return selectedDir;
        return {
            icon_id: dirDetails.icon_id,
            created_at: dirDetails.created_at,
            title: dirDetails.title,
            data: dirDetails.data,
            in_trash: dirDetails.in_trash,
            banner_url: dirDetails.banner_url,
        } as workspace | File | Folder;

    }, [state, workspaceId, folderId]);

    const pathname = usePathname();
    const breadCrumbs = useMemo(() => {
        if (!pathname || !state.workspaces || !workspaceId) return;
        const segments = pathname
            .split('/')
            .filter((val) => val !== 'dashboard' && val);
        const workspaceDetails = state.workspaces.find(
            (workspace) => workspace.id === workspaceId
        );
        const workspaceBreadCrumb = workspaceDetails
            ? `${workspaceDetails.icon_id} ${workspaceDetails.title}`
            : '';
        if (segments.length === 1) {
            return workspaceBreadCrumb;
        }

        const folderSegment = segments[1];
        const folderDetails = workspaceDetails?.folders.find(
            (folder) => folder.id === folderSegment
        );
        const folderBreadCrumb = folderDetails
            ? `/ ${folderDetails.icon_id} ${folderDetails.title}`
            : '';

        if (segments.length === 2) {
            return `${workspaceBreadCrumb} ${folderBreadCrumb}`;
        }

        const fileSegment = segments[2];
        const fileDetails = folderDetails?.files.find(
            (file) => file.id === fileSegment
        );
        const fileBreadCrumb = fileDetails
            ? `/ ${fileDetails.icon_id} ${fileDetails.title}`
            : '';

        return `${workspaceBreadCrumb} ${folderBreadCrumb} ${fileBreadCrumb}`;
    }, [state, pathname, workspaceId]);



    const wrapperRef = useCallback((wrapper: any) => {
        const initializeQuill = async () => {
            if (wrapper !== null) {
                wrapper.innerHTML = ''; // Clear the container
                const editor = document.createElement('div');
                wrapper.append(editor);

                const Quill = (await import('quill')).default;
                const QuillCursors = (await import('quill-cursors')).default;
                Quill.register('modules/cursors', QuillCursors);
                const q = new Quill(editor, {
                    theme: 'snow',
                    modules: {
                        toolbar: TOOLBAR_OPTIONS,
                        cursors: {
                            transformOnTextChange: true,
                        },
                    },
                });
                setQuill(q);
            }
        };

        initializeQuill();
        // Cleanup function to clear the editor when the component unmounts or ref changes
        return () => {
            if (wrapper !== null) {
                wrapper.innerHTML = '';
            }
        };
    }, []);

    const restoreFileHandler = async () => {
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            dispatch({
                type: 'UPDATE_FILE',
                payload: { file: { in_trash: '' }, fileId, folderId, workspaceId },
            });
            await updateFile({ in_trash: '' }, fileId);
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: { folder: { in_trash: '' }, folderId: fileId, workspaceId },
            });
            await updateFolder({ in_trash: '' }, fileId);
        }
    };

    const deleteFileHandler = async () => {
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            dispatch({
                type: 'DELETE_FILE',
                payload: { fileId, folderId, workspaceId },
            });
            await deleteFile(fileId);
            router.replace(`/dashboard/${workspaceId}`);
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'DELETE_FOLDER',
                payload: { folderId: fileId, workspaceId },
            });
            await deleteFolder(fileId);
            router.replace(`/dashboard/${workspaceId}`);
        }
    };
    const iconOnChange = async (icon: string) => {
        if (!fileId) return;
        if (dirType === 'workspace') {
            dispatch({
                type: 'UPDATE_WORKSPACE',
                payload: { workspace: { icon_id: icon }, workspaceId: fileId },
            });
            await updateWorkspace({ icon_id: icon }, fileId);
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: {
                    folder: { icon_id: icon },
                    workspaceId,
                    folderId: fileId,
                },
            });
            await updateFolder({ icon_id: icon }, fileId);
        }
        if (dirType === 'file') {
            if (!workspaceId || !folderId) return;

            dispatch({
                type: 'UPDATE_FILE',
                payload: { file: { icon_id: icon }, workspaceId, folderId, fileId },
            });
            await updateFile({ icon_id: icon }, fileId);
        }
    };

    const deleteBanner = async () => {
        if (!fileId) return;
        setDeletingBanner(true);
        if (dirType === 'file') {
            if (!folderId || !workspaceId) return;
            dispatch({
                type: 'UPDATE_FILE',
                payload: { file: { banner_url: '' }, fileId, folderId, workspaceId },
            });
            await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
            await updateFile({ banner_url: '' }, fileId);
        }
        if (dirType === 'folder') {
            if (!workspaceId) return;
            dispatch({
                type: 'UPDATE_FOLDER',
                payload: { folder: { banner_url: '' }, folderId: fileId, workspaceId },
            });
            await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
            await updateFolder({ banner_url: '' }, fileId);
        }
        if (dirType === 'workspace') {
            dispatch({
                type: 'UPDATE_WORKSPACE',
                payload: {
                    workspace: { banner_url: '' },
                    workspaceId: fileId,
                },
            });
            await supabase.storage.from('file-banners').remove([`banner-${fileId}`]);
            await updateWorkspace({ banner_url: '' }, fileId);
        }
        setDeletingBanner(false);
    };
    useEffect(() => {
        if (!fileId) return;
        let selectedDir;
        const fetchInformation = async () => {
            if (dirType === 'file') {
                const { data: selectedDir, error } = await getFileDetails(fileId);
                if (error || !selectedDir) {
                    return router.replace('/dashboard');
                }

                if (!selectedDir[0]) {
                    if (!workspaceId) return;
                    return router.replace(`/dashboard/${workspaceId}`);
                }
                if (!workspaceId || quill === null) return;
                if (!selectedDir[0].data) return;
                quill.setContents(JSON.parse(selectedDir[0].data || ''));
                dispatch({
                    type: 'UPDATE_FILE',
                    payload: {
                        file: { data: selectedDir[0].data },
                        fileId,
                        folderId: selectedDir[0].folder_id,
                        workspaceId,
                    },
                });
            }
            if (dirType === 'folder') {
                const { data: selectedDir, error } = await getFolderDetails(fileId);
                if (error || !selectedDir) {
                    return router.replace('/dashboard');
                }

                if (!selectedDir[0]) {
                    router.replace(`/dashboard/${workspaceId}`);
                }
                if (quill === null) return;
                if (!selectedDir[0].data) return;
                quill.setContents(JSON.parse(selectedDir[0].data || ''));
                dispatch({
                    type: 'UPDATE_FOLDER',
                    payload: {
                        folderId: fileId,
                        folder: { data: selectedDir[0].data },
                        workspaceId: selectedDir[0].workspace_id,
                    },
                });
            }
            if (dirType === 'workspace') {
                const { data: selectedDir, error } = await getWorkspaceDetails(fileId);
                if (error || !selectedDir) {
                    return router.replace('/dashboard');
                }
                if (!selectedDir[0] || quill === null) return;
                if (!selectedDir[0].data) return;
                quill.setContents(JSON.parse(selectedDir[0].data || ''));
                dispatch({
                    type: 'UPDATE_WORKSPACE',
                    payload: {
                        workspace: { data: selectedDir[0].data },
                        workspaceId: fileId,
                    },
                });
            }
        };
        fetchInformation();
    }, [fileId, workspaceId, quill, dirType]);

    //room from socket
    useEffect(() => {
        if (socket === null || quill === null || !fileId) return;
        socket.emit('create-room', fileId);
    }, [socket, quill, fileId]);
    useEffect(() => {
        if (quill === null || socket === null || !fileId || !user) return;

        const selectionChangeHandler = (cursorId: string) => {
            return (range: any, oldRange: any, source: any) => {
                if (source === 'user' && cursorId) {
                    socket.emit('send-cursor-move', range, fileId, cursorId);
                }
            };
        };
        const quillHandler = (delta: any, oldDelta: any, source: any) => {
            if (source !== 'user') return;
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
            setSaving(true);
            const contents = quill.getContents();
            const quillLength = quill.getLength();
            saveTimerRef.current = setTimeout(async () => {
                if (contents && quillLength !== 1 && fileId) {
                    if (dirType == 'workspace') {
                        dispatch({
                            type: 'UPDATE_WORKSPACE',
                            payload: {
                                workspace: { data: JSON.stringify(contents) },
                                workspaceId: fileId,
                            },
                        });
                        await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
                    }
                    if (dirType == 'folder') {
                        if (!workspaceId) return;
                        dispatch({
                            type: 'UPDATE_FOLDER',
                            payload: {
                                folder: { data: JSON.stringify(contents) },
                                workspaceId,
                                folderId: fileId,
                            },
                        });
                        await updateFolder({ data: JSON.stringify(contents) }, fileId);
                    }
                    if (dirType == 'file') {
                        if (!workspaceId || !folderId) return;
                        dispatch({
                            type: 'UPDATE_FILE',
                            payload: {
                                file: { data: JSON.stringify(contents) },
                                workspaceId,
                                folderId: folderId,
                                fileId,
                            },
                        });
                        await updateFile({ data: JSON.stringify(contents) }, fileId);
                    }
                }
                setSaving(false);
            }, 850);
            socket.emit('send-changes', delta, fileId);
        };
        quill.on('text-change', quillHandler);
        quill.on('selection-change', selectionChangeHandler(user.id));

        return () => {
            quill.off('text-change', quillHandler);
            quill.off('selection-change', selectionChangeHandler);
            if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        };
    }, [quill, socket, fileId, user, details, folderId, workspaceId, dispatch]);



    useEffect(() => {
        if (quill === null || socket === null) return;
        const socketHandler = (deltas: any, id: string) => {
            console.log('RECEIVED');

            if (id === fileId) {
                quill.updateContents(deltas);
            }
        };
        socket.on('receive-changes', socketHandler);
        return () => {
            socket.off('receive-changes', socketHandler);

        };
    }, [quill, socket, fileId]);

    useEffect(() => {
        if (!fileId || quill === null) return;
        const room = supabase.channel(fileId);
        const subscription = room
            .on('presence', { event: 'sync' }, () => {
                const newState = room.presenceState();
                const newCollaborators = Object.values(newState).flat() as any;
                setCollaborators(newCollaborators);
                if (user) {
                    const allCursors: any = [];
                    newCollaborators.forEach(
                        (collaborator: { id: string; email: string; avatar: string }) => {
                            if (collaborator.id !== user.id) {
                                const userCursor = quill.getModule('cursors');
                                userCursor.createCursor(
                                    collaborator.id,
                                    collaborator.email.split('@')[0],
                                    `#${Math.random().toString(16).slice(2, 8)}`
                                );
                                allCursors.push(userCursor);
                            }
                        }
                    );
                    setLocalCursors(allCursors);
                }
            })
            .subscribe(async (status) => {
                if (status !== 'SUBSCRIBED' || !user) return;
                const response = await findUser(user.id);
                if (!response) return;

                room.track({
                    id: user.id,
                    email: user.email?.split('@')[0],
                    avatarUrl: response.avatar_url
                        ? supabase.storage.from('avatars').getPublicUrl(response.avatar_url)
                            .data.publicUrl
                        : '',
                });
            });
        return () => {
            supabase.removeChannel(room);
        };
    }, [fileId, quill, supabase, user]);
    useEffect(() => {
        if (quill === null || socket === null || !fileId || !localCursors.length)
            return;
        const socketHandler = (range: any, roomId: string, cursorId: string) => {
            if (roomId === fileId) {
                const cursorToMove = localCursors.find(
                    (c: any) => c.cursors()?.[0].id === cursorId
                );
                if (cursorToMove) {
                    cursorToMove.moveCursor(cursorId, range);
                }
            }
        };
        socket.on('receive-cursor-move', socketHandler);
        return () => {
            socket.off('receive-cursor-move', socketHandler);
        };
    }, [quill, socket, fileId, localCursors]);
    const exportPDF = async () => {
        const delta = quill.getContents(); // gets the Quill delta
        const pdfAsBlob = await pdfExporter.generatePdf(delta); // converts to PDF
        saveAs(pdfAsBlob, 'pdf-export.pdf'); // downloads from the browser
    }
    const handleSubmitProjectDialog = async (values: Record<string, string>) => {
        if (progettoRiferimento) {
            try {
                const { success, message } = await deleteProject(progettoRiferimento.id);
                if (success) {
                    toast({
                        description: message,
                    });
                } else {
                    toast({
                        description: message,
                    });
                }
            } catch (error) {
                console.error('Error fetching project:', error);
            }
        }
    };



    function addKanbanHandler(): void {
        throw new Error('Function not implemented.');
    }

    return (
        <>
            <div className="relative">
                {details.in_trash && (<article className="py-2 
          z-40 
          bg-[#EB5757] 
          flex  
          md:flex-row 
          flex-col 
          justify-center 
          items-center 
          gap-4 
          flex-wrap">
                    <div
                        className="flex 
            flex-col 
            md:flex-row 
            gap-2 
            justify-center 
            items-center"
                    >
                        <span className="text-white">
                            This {dirType} is in the trash.
                        </span>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                            onClick={restoreFileHandler}
                        >
                            Restore
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                            onClick={deleteFileHandler}
                        >
                            Delete
                        </Button>
                    </div>
                    <span className="text-sm text-white">{details.in_trash}</span>

                </article>
                )}
                <div
                    className="flex 
        flex-col-reverse 
        sm:flex-row 
        sm:justify-between 
        justify-center 
        sm:items-center 
        sm:p-2 
        p-8"
                >
                    <div>{breadCrumbs}</div>
                    <div className="flex items-center gap-10">
                        {progettoRiferimento ?
                            <div className="flex items-center justify-center h-10">
                                <ProjectDialog
                                    triggerText={`Progetto: ${progettoRiferimento.title}`}
                                    title={`Dettagli Progetto: ${progettoRiferimento.title}`}
                                    description="Visualizza i dettagli del progetto"
                                    fields={[
                                        { id: 'title', label: 'Codice Progetto:', defaultValue: `${progettoRiferimento.title}` },
                                        { id: 'desc', label: 'Descrizione Progetto:', defaultValue: `${progettoRiferimento.description}` },
                                        { id: 'client', label: 'Cliente:', defaultValue: `${progettoRiferimento.client_id}` },
                                        { id: 'date', label: 'Data scadenza:', defaultValue: `${progettoRiferimento.deadline}` },
                                        { id: 'state', label: 'Stato:', defaultValue: `${progettoRiferimento.status}` },
                                    ]}
                                    onSubmit={handleSubmitProjectDialog}
                                    submitButtonText="Save changes"
                                />
                                {/* <Label className="text-Neutrals-8 gap-2
                            font-bold 
                            text-xs">Progetto: {progettoRiferimento}</Label>
                                </ProjectDialog> */}

                            </div>
                            : <div className="flex items-center justify-center h-10">
                                <Label className="text-Neutrals-8 
                            font-bold 
                            text-xs">Nessun progetto associato.</Label>
                            </div>}
                        <div className="flex items-center justify-center h-10">
                            {collaborators?.map((collaborator) => (
                                <TooltipProvider key={collaborator.id}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Avatar
                                                className="
                                                    -ml-3 
                                                    bg-background 
                                                    border-2 
                                                    flex 
                                                    items-center 
                                                    justify-center 
                                                    border-white 
                                                    h-8 
                                                    w-8 
                                                    rounded-full
                                                    "
                                            >
                                                <AvatarImage
                                                    src={
                                                        collaborator.avatarUrl ? collaborator.avatarUrl : ''
                                                    }
                                                    className="rounded-full"
                                                />
                                                <AvatarFallback>
                                                    {collaborator.email.substring(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TooltipTrigger>
                                        <TooltipContent>{collaborator.email}</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                        {saving ? (
                            <Badge
                                variant="secondary"
                                className="bg-orange-600 top-4
                                text-white
                                right-4
                                z-50
                                "
                            >
                                Salvataggio...
                            </Badge>
                        ) : (
                            <Badge
                                variant="secondary"
                                className="bg-emerald-600 
                                    top-4
                                text-white
                                right-4
                                z-50"
                            >
                                Salvato
                            </Badge>
                        )}
                    </div>
                </div>
            </div>
            {details.banner_url && (
                <div className="relative w-full h-[200px]">
                    <Image
                        src={
                            supabase.storage
                                .from('file-banners')
                                .getPublicUrl(details.banner_url).data.publicUrl
                        }
                        fill
                        className="w-full md:h-48
                        h-20
                        object-cover"
                        alt="Banner Image"
                    />
                </div>
            )}
            <div
                className="flex 
        justify-center
        items-center
        flex-col
        mt-2
        relative
      "
            >
                <div
                    className="w-full 
        self-center 
        max-w-[800px] 
        flex 
        flex-col
         px-7 
         lg:my-8"
                >
                    <div className="text-[80px]">
                        <EmojiPicker getValue={iconOnChange}>
                            <div
                                className="w-[100px]
                cursor-pointer
                transition-colors
                h-[100px]
                flex
                items-center
                justify-center
                hover:bg-muted
                rounded-xl"
                            >
                                {details.icon_id}
                            </div>
                        </EmojiPicker>
                    </div>
                    <div className="flex ">
                        <BannerUpload
                            id={fileId}
                            dirType={dirType}
                            className="mt-2
              text-sm
              text-muted-foreground
              p-2
              hover:text-card-foreground
              transition-all
              rounded-md"
                        >
                            {details.banner_url ? 'Update Banner' : 'Add Banner'}
                        </BannerUpload>
                        {details.banner_url && (
                            <Button
                                disabled={deletingBanner}
                                onClick={deleteBanner}
                                variant="ghost"
                                className="gap-2 hover:bg-background
                flex
                item-center
                justify-center
                mt-2
                text-sm
                text-muted-foreground
                w-36
                p-2
                rounded-md"
                            >
                                <XCircleIcon size={16} />
                                <span className="whitespace-nowrap font-normal">
                                    Remove Banner
                                </span>
                            </Button>
                        )}

                        <QuillContextMenuIo
                            quillInstance={quill}
                            onActionExport={exportPDF}
                            triggerElement={<Button
                                variant="ghost"
                                className="gap-2 hover:bg-background
                                    flex
                                    item-center
                                    justify-center
                                    mt-2
                                    text-sm
                                    text-muted-foreground
                                    w-36
                                    p-2
                                    rounded-md"
                            >Opzioni <CircleArrowRight size={16} /></Button>}
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                            onClick={addKanbanHandler}
                        >
                            Add Kanban
                        </Button>
                    </div>
                    <span
                        className="
            text-muted-foreground
            text-3xl
            font-bold
            h-9
          "
                    >
                        {details.title}
                    </span>
                    <span className="text-muted-foreground text-sm">
                        {dirType.toUpperCase()}
                    </span>
                </div>
            </div>
            <div className="flex justify-center items-center felx-col mt-2 relative">
                <div
                    id="container"
                    className="max-w-[800px]"
                    ref={wrapperRef}
                ></div>
            </div>

        </>
    )
};

export default QuillEditor
