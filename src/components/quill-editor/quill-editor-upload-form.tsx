'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import mammoth from 'mammoth';
import React, { useEffect, useRef, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import Loader from '../global/Loader';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { zodResolver } from '@hookform/resolvers/zod';

interface QuillEditorUploadFormProps {
    quillIstance: any,
}
const UploadDocFormSchema = z.object({
    document: z.any().refine((file) => file && file[0], {
        message: 'Document is required',
    }),
});
const QuillEditorUploadForm: React.FC<QuillEditorUploadFormProps> = ({ quillIstance }) => {
    const supabase = createClientComponentClient();
    const [quill, setQuill] = useState<any>(null);
    const editorRef = useRef(null);

    useEffect(() => {
        if (editorRef.current) {
            setQuill(quillIstance);
        }
    }, []);
    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting: isUploading, errors },
    } = useForm({
        mode: 'onChange',
        resolver: zodResolver(UploadDocFormSchema),
    });
    const onSubmitHandler: SubmitHandler<z.infer<typeof UploadDocFormSchema>> = async (values) => {
        const file = values.document?.[0];
        console.log("File:", file);
        if (!file || !quill) return;

        try {
            // Legge il file e inserisce il contenuto nel Quill editor
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.convertToHtml({ arrayBuffer });
            quill.clipboard.dangerouslyPasteHTML(result.value);

            quill.updateContents([{ insert: ' ' }]);  // aggiunge uno spazio per innescare l'evento
            quill.deleteText(quill.getLength() - 2, 1);

        } catch (error) {
            console.error(error);
        }
    };
    return (
        <div>
            <form
                onSubmit={handleSubmit(onSubmitHandler)}
                className="flex flex-col gap-2"
            >
                <Label className="text-sm text-muted-foreground" htmlFor="document">
                    Upload Document
                </Label>
                <Input
                    id="document"
                    type="file"
                    accept=".docx"
                    disabled={isUploading}
                    {...register('document')}
                />
                <small className="text-red-600">
                    {errors.document?.message?.toString()}
                </small>
                <Button disabled={isUploading} type="submit">
                    {!isUploading ? 'Upload Document' : <Loader />}
                </Button>
            </form>
            <div ref={editorRef} style={{ height: '400px', marginTop: '20px' }} />
        </div>
    )
}

export default QuillEditorUploadForm
