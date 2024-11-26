'use client';

import React, { useState } from 'react';
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileUp, FileDown } from 'lucide-react';
import QuillEditorUpload from './quil-editor-upload';

interface QuillContextMenuIoProps {
    quillInstance: any;
    triggerElement: React.ReactNode;
    onActionExport: () => void;
}

export const QuillContextMenuIo: React.FC<QuillContextMenuIoProps> = ({ quillInstance, triggerElement, onActionExport }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const openDialog = () => setIsDialogOpen(true);
    const closeDialog = () => setIsDialogOpen(false);

    return (
        <div>
            <ContextMenu>
                <ContextMenuTrigger>
                    {triggerElement}
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64">
                    <ContextMenuItem inset onSelect={openDialog}>
                        <FileUp size={16} /> Import Docx
                    </ContextMenuItem>
                    <ContextMenuItem inset onSelect={onActionExport}>
                        <FileDown size={16} /> Export PDF
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            <QuillEditorUpload isOpen={isDialogOpen}
                onClose={closeDialog} quillIstance={quillInstance} />


        </div>
    );
};

export default QuillContextMenuIo;
