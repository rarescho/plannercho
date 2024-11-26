'use client';
import { AuthUser } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { v4 } from 'uuid';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import EmojiPicker from '../global/emoji-picker';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { workspace } from '@/lib/supabase/supabase.types';
import { Button } from '../ui/button';
import Loader from '../global/Loader';
import { createWorkspace } from '@/lib/supabase/queries';
import { useToast } from '../ui/use-toast';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/providers/state-provider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { CreateWorkspaceFormSchema } from '@/lib/types';
import { z } from 'zod';

interface DashboardSetupProps {
  user: AuthUser;
}

const DashboardSetup: React.FC<DashboardSetupProps> = ({
  user,
}) => {
  const { toast } = useToast(); // Hook per la gestione delle notifiche
  const router = useRouter(); // Hook per la gestione della navigazione
  const { dispatch } = useAppState(); // Hook per la gestione dello stato globale
  const [selectedEmoji, setSelectedEmoji] = useState('💼'); // Stato locale per l'emoji selezionata
  const supabase = createClientComponentClient(); // Creazione del client Supabase
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode: 'onChange',
    defaultValues: {
      logo: '',
      workspaceName: '',
    },
  });

  // Funzione per la gestione dell'invio del form
  const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4(); // Generazione di un UUID unico per il workspace
    console.log(file);

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from('workspace-logos')
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: '3600',
            upsert: true,
          });
        if (error) throw new Error('');
        filePath = data.path;
      } catch (error) {
        console.log('Error', error);
        toast({
          variant: 'destructive',
          title: 'Errore! Impossibile caricare il logo del workspace',
        });
      }
    }
    try {
      // Creazione del nuovo workspace
      const newWorkspace: workspace = {
        data: null,
        created_at: new Date().toISOString(),
        icon_id: selectedEmoji,
        id: workspaceUUID,
        in_trash: '',
        title: value.workspaceName,
        workspace_owner: user.id,
        logo: filePath || null,
        banner_url: '',
      };
      const { data, error: createError } = await createWorkspace(newWorkspace);
      if (createError) {
        throw new Error();
      }
      // Aggiunta del nuovo workspace allo stato globale
      dispatch({
        type: 'ADD_WORKSPACE',
        payload: { ...newWorkspace, folders: [] },
      });

      // Notifica di successo
      toast({
        title: 'Workspace Creato',
        description: `${newWorkspace.title} è stato creato con successo.`,
      });

      // Navigazione verso il nuovo workspace
      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, 'Error');
      toast({
        variant: 'destructive',
        title: 'Impossibile creare il workspace',
        description:
          "Oops! Qualcosa è andato storto e non siamo riusciti a creare il tuo workspace. Prova di nuovo o torna più tardi.",
      });
    } finally {
      reset(); // Reset del form
    }
  };

  return (
    <Card
      className="w-[800px]
      h-screen
      sm:h-auto
  "
    >
      <CardHeader>
        <CardTitle>Crea un Workspace</CardTitle>
        <CardDescription>
          Creiamo un workspace privato per iniziare. Puoi aggiungere collaboratori successivamente dalla scheda delle impostazioni del workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div
              className="flex
            items-center
            gap-4"
            >
              <div className="text-5xl">
                <EmojiPicker getValue={(emoji) => setSelectedEmoji(emoji)}>
                  {selectedEmoji}
                </EmojiPicker>
              </div>
              <div className="w-full ">
                <Label
                  htmlFor="workspaceName"
                  className="text-sm
                  text-muted-foreground
                "
                >
                  Nome
                </Label>
                <Input
                  id="workspaceName"
                  type="text"
                  placeholder="Nome del Workspace"
                  disabled={isLoading}
                  {...register('workspaceName', {
                    required: 'Il nome del workspace è obbligatorio',
                  })}
                />
                <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
              </div>
            </div>
            <div>
              <Label
                htmlFor="logo"
                className="text-sm
                  text-muted-foreground
                "
              >
                Logo del Workspace
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                placeholder="Nome del Workspace"
                // disabled={isLoading || subscription?.status !== 'active'}
                {...register('logo', {
                  required: false,
                })}
              />
              <small className="text-red-600">
                {errors?.logo?.message?.toString()}
              </small>
            </div>
            <div className="self-end">
              <Button
                disabled={isLoading}
                type="submit"
              >
                {!isLoading ? 'Crea Workspace' : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
