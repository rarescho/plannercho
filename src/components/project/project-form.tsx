'use client';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { Client, Project, ProjectState } from '@/lib/supabase/supabase.types'; // Aggiorna il percorso se necessario
import { createProject, getClients, getProjects, updateProject } from '@/lib/supabase/queries';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { useAppState } from '@/lib/providers/state-provider';
import { useSupabaseUser } from '@/lib/providers/supabase-user-provider';
import DatePicker from '../ui/DatePicker';
import { format } from 'date-fns';
import { Textarea } from "@/components/ui/textarea"
import { useToast } from '../ui/use-toast';
interface FormValues {
    title: string;
    description: string;
    client_id: string;
    status: ProjectState;
    deadline: Date | undefined;
    workspace_id: string | undefined;
    project_lead: string | undefined;
}

const ProjectForm = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [clientSearch, setClientSearch] = useState('');
    const { state, workspaceId, dispatch } = useAppState();
    const { user } = useSupabaseUser();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const { toast } = useToast()
    const [progettoRiferimento, setProgettoRiferimento] = useState<Project | null>(null);


    function isValidProjectState(status: any): status is ProjectState {
        return Object.values(ProjectState).includes(status);
    }
    const [formValues, setFormValues] = useState<FormValues>({
        title: "",
        description: "",
        client_id: "",
        status: ProjectState.PLANNED,
        deadline: undefined,
        workspace_id: workspaceId,
        project_lead: user?.id,
    });

    useEffect(() => {
        const fetchClients = async () => {
            const { data, error } = await getClients();
            if (error) {
                console.error('Errore nel recupero dei clienti:', error);
            } else {
                if (data === null) return;
                const mappedClients = data.map(client => ({
                    codice: client.codice,
                    ragione_sociale: client.ragione_sociale,
                }));
                setClients(mappedClients);
                setFilteredClients(mappedClients);
            }
        };

        fetchClients();
    }, []);

    useEffect(() => {
        const filtered = clients.filter(client =>
            client.ragione_sociale.toLowerCase().startsWith(clientSearch.toLowerCase())
        );
        setFilteredClients(filtered);
    }, [clientSearch, clients]);

    const handleChange = (e: { target: any; }) => {

        const { name, value } = e.target;
        if (workspaceId) {
            dispatch({
                type: 'UPDATE_PROJECT',
                payload: { project: { [name]: value }, workspaceId },
            });
        }
        setFormValues({
            ...formValues,
            [name]: value,
        });
    };

    const handleClientChange = (value: any) => {
        setFormValues({
            ...formValues,
            client_id: value,
        });
    };

    const handleClientSearchChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        const value = e.target.value;
        setClientSearch(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {          
            console.log('Form values:', formValues);
            const result = await createProject(formValues);
            if (result.error) {
                toast({
                    description: 'Errore durante la creazione del progetto.',
                });
            } else {
                toast({
                    description: 'Progetto associato correttamente.',
                });
                setFormValues({
                    title: '',
                    client_id: '',
                    description: '',
                    deadline: undefined,
                    status: ProjectState.PLANNED,
                    workspace_id: workspaceId,
                    project_lead: user?.id,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                description: 'Errore durante la creazione del progetto.',
            });
        }
    };
    const handleDateChange = (date: Date | undefined) => {
        setFormValues({
            ...formValues,
            deadline: date,
        });
    };
    // const handleDateChange = (date: Date) => {
    //     setSelectedDate(date);
    //     setFormValues({
    //         ...formValues,
    //         date: date,
    //     });
    //     console.log("Data selezionata:", date);
    // };

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 flex-col">
            <div className="flex flex-col gap-4">
                <Label>Codice Progetto:</Label>
                <Input
                    type="text"
                    placeholder='Inserisci il codice del progetto'
                    name="title"
                    maxLength={7}
                    value={formValues.title}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="flex flex-col gap-4">
                <Label>Descrizione Progetto:</Label>
                <Textarea
                    className='h-36 p-4'
                    placeholder='Inserisci la descrizione del progetto'
                    name="description"
                    value={formValues.description}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <Label>Cliente:</Label>
                <Select onValueChange={handleClientChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Seleziona un cliente" />
                    </SelectTrigger>
                    <SelectContent>
                        <div className="p-2">
                            <Input
                                type="text"
                                className="search-input"
                                value={clientSearch}
                                onChange={handleClientSearchChange}
                                placeholder="Cerca cliente..."
                                autoFocus
                            />
                        </div>
                        <SelectGroup>
                            <SelectLabel>Clienti</SelectLabel>
                            {filteredClients.map(client => (
                                <SelectItem key={client.codice} value={client.codice}>
                                    {client.ragione_sociale}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label>Stato Progetto:</Label>
                <Select
                    onValueChange={(value) => handleChange({ target: { name: 'status', value } })}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 overflow-y-auto">
                        <SelectGroup>
                            <SelectLabel>Stati progetto</SelectLabel>
                            {Object.values(ProjectState).map(state => (
                                <SelectItem key={state} value={state}>
                                    {state}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>
            <div>
                <DatePicker buttonText="Seleziona la data di consegna del progetto" onDateChange={handleDateChange} />
                {selectedDate && (
                    <p>Data selezionata: {format(selectedDate, "PPP")}</p>
                )}
            </div>
            <Button type="submit">Associa Progetto</Button>
        </form>
    );
};

export default ProjectForm;
