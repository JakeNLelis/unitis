import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth";

export type AdminActionType =
  | "election.created"
  | "election.updated"
  | "election.deleted"
  | "election.archived"
  | "election.dates_updated"
  | "candidate.approved"
  | "candidate.rejected"
  | "voter.masterlist_added"
  | "voter.masterlist_cleared"
  | "voter.removed"
  | "turnout.adjusted"
  | "officer.created"
  | "officer.deleted"
  | "partylist.approved"
  | "partylist.rejected"
  | "position.created"
  | "position.updated"
  | "position.deleted"
  | "partylist.requirements_updated"
  | "faculty.created"
  | "faculty.updated"
  | "faculty.deleted"
  | "department.created"
  | "department.updated"
  | "department.deleted"
  | "course.created"
  | "course.updated"
  | "course.deleted"
  | "campus.created";

/**
 * Record an administrative action in the audit log.
 * Fire-and-forget: errors are logged but do not disrupt the caller.
 */
export async function logAdminAction(
  actionOrParams: AdminActionType | { actionType: AdminActionType; description: string; electionId?: string | null; actorId?: string; actorEmail?: string; actorRole?: string },
  descriptionArg?: string,
  electionIdArg?: string | null,
): Promise<void> {
  try {
    let actionType: AdminActionType;
    let description: string;
    let electionId: string | null = null;
    let actorId: string | undefined;
    let actorEmail: string | undefined;
    let actorRole: string | undefined;

    if (typeof actionOrParams === "string") {
      actionType = actionOrParams;
      description = descriptionArg!;
      electionId = electionIdArg ?? null;
    } else {
      actionType = actionOrParams.actionType;
      description = actionOrParams.description;
      electionId = actionOrParams.electionId ?? null;
      actorId = actionOrParams.actorId;
      actorEmail = actionOrParams.actorEmail;
      actorRole = actionOrParams.actorRole;
    }

    let finalActorId = actorId;
    let finalActorEmail = actorEmail;
    let finalActorRole = actorRole;

    if (!finalActorId) {
      const profile = await getCurrentProfile();
      if (!profile) return;
      finalActorId = profile.id;
      finalActorEmail = profile.email;
      finalActorRole = profile.role;
    }

    const adminSupabase = createAdminClient();
    await adminSupabase.from("admin_logs").insert({
      actor_id: finalActorId,
      actor_email: finalActorEmail,
      actor_role: finalActorRole,
      action_type: actionType,
      description,
      election_id: electionId,
    });
  } catch (error) {
    console.error("[AuditLog] Failed to record action:", error);
  }
}
