import { createClient } from "@/lib/supabase/server";
import {
  UserProfile,
  UserRole,
  SystemAdministrator,
  SEBOfficer,
} from "@/lib/types/auth";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  // Check if user is a system administrator
  const { data: systemAdmin } = await supabase
    .from("system_administrators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (systemAdmin) {
    return {
      id: user.id,
      email: systemAdmin.email,
      role: "system-admin",
      display_name: systemAdmin.username,
    };
  }

  // Check if user is a SEB officer
  const { data: sebOfficer } = await supabase
    .from("seb_officers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (sebOfficer) {
    return {
      id: user.id,
      email: sebOfficer.email,
      role: "seb-officer",
      display_name: sebOfficer.name,
    };
  }

  return null;
}

export async function getSystemAdmin(): Promise<SystemAdministrator | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("system_administrators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data as SystemAdministrator | null;
}

export async function getSEBOfficer(): Promise<SEBOfficer | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("seb_officers")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data as SEBOfficer | null;
}

export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  if (!allowedRoles.includes(profile.role)) {
    redirect("/unauthorized");
  }

  return profile;
}

export async function requireSystemAdmin() {
  return requireRole(["system-admin"]);
}
