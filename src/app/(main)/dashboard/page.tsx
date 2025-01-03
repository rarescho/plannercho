export const dynamic = "force-dynamic"; // Garantisce che Next.js utilizzi il rendering dinamico

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import React from "react";
import { cookies } from "next/headers";
import db from "@/lib/supabase/db";
import { redirect } from "next/navigation";
import DashboardSetup from "@/components/dashboard-setup/dashboard-setup";

const DashboardPage = async () => {
  const supabase = createServerComponentClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;
  const workspace = await db.query.workspaces.findFirst({
    where: (workspace, { eq }) => eq(workspace.workspace_owner, user.id),
  });

  if (!workspace)
    return (
      <div
        className="bg-background
        h-screen
        w-screen
        flex
        justify-center
        items-center
  "
      >
        <DashboardSetup user={user} />
      </div>
    );

  redirect(`/dashboard/${workspace.id}`);
};

export default DashboardPage;
