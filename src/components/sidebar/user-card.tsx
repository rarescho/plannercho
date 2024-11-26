'use server'
import React from 'react';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import db from '@/lib/supabase/db';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import CypressProfileIcon from '../icons/cypressProfileIcon';
import ModeToggle from '../global/mode-toggle';
import { LogOut } from 'lucide-react';
import LogoutButton from '../global/logout-button';


const UserCard = async () => {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;
    const response = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.id, user.id),
    });
    let avatarPath;
    if (!response) return;

    if (!response.avatar_url) {
        avatarPath = '';
        console.log('No avatar');
    }
    else {
        avatarPath = supabase.storage
            .from('avatars')
            .getPublicUrl(response.avatar_url)?.data.publicUrl;
    }

    const profile = {
        ...response,
        avatarUrl: avatarPath,
    };

    return (
        <article
            className="hidden
      sm:flex 
      justify-between 
      items-center 
      px-4 
      py-2 
      dark:bg-Neutrals/neutrals-12
      rounded-3xl
  "
        >
            <aside className="flex justify-center items-center gap-2">
                <Avatar>
                    <AvatarImage src={profile.avatarUrl} />
                    <AvatarFallback>
                        <CypressProfileIcon />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <small
                        className="w-[100px] 
          overflow-hidden 
          overflow-ellipsis
          "
                    >
                        {profile.email}
                    </small>
                </div>
            </aside>
            <div className="flex items-center justify-center">
                <LogoutButton>
                    <LogOut />
                </LogoutButton>
                <ModeToggle />
            </div>
        </article>
    );
};

export default UserCard;