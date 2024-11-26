import React from 'react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Combobox } from '../ui/combobox';

interface ProjectDialogProps {
    triggerText: string;
    title: string;
    description?: string;
    fields: Array<{
        id: string;
        label: string;
        defaultValue: string;
    }>;
    onSubmit: (values: Record<string, string>) => void;
    submitButtonText: string;
}

export const ProjectDialog: React.FC<ProjectDialogProps> = ({
    triggerText,
    title,
    description,
    fields,
    onSubmit,
    submitButtonText,
}) => {
    const [formValues, setFormValues] = React.useState<Record<string, string>>(
        fields.reduce((acc, field) => {
            acc[field.id] = field.defaultValue;
            return acc;
        }, {} as Record<string, string>)
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormValues((prevValues) => ({
            ...prevValues,
            [id]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formValues);
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{triggerText}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    {fields.map((field) => (
                        <div key={field.id} className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor={field.id} className="col-span-1 text-right">
                                {field.label}
                            </Label>
                            <Label htmlFor={field.id} className="col-span-2 text-right">
                                {formValues[field.id]}
                            </Label>
                        </div>
                    ))}
                    <Combobox />
                    <Button type='submit' className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={handleSubmit}>Diassocia progetto</Button>

                </form>
            </DialogContent>
        </Dialog>
    );
};
