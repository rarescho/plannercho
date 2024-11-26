import React from 'react';
import CustomDialogTrigger from '../global/custom-dialog-trigger';
import QuillEditorUploadForm from './quill-editor-upload-form';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
interface QuillEditorUploadProps {
    quillIstance: any;
    isOpen: boolean;
    onClose: () => void;
}

const QuillEditorUpload: React.FC<QuillEditorUploadProps> = ({
    quillIstance,
    isOpen,
    onClose,
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="h-screen
        block
        sm:h-[440px]
        overflow-scroll
        w-full
      "
            >
                <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                </DialogHeader>
                <QuillEditorUploadForm
                    quillIstance={quillIstance}
                />
            </DialogContent>
        </Dialog>
    );
};

export default QuillEditorUpload;
