import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type PartylistRegistrationInput = {
  election_id: string;
  name: string;
  acronym: string;
  platform: string;
  registered_by_email: string;
  registered_by_name: string;
};

export function getPartylistRegistrationInput(
  formData: FormData,
): PartylistRegistrationInput | { error: string } {
  const election_id = formData.get("election_id") as string;
  const name = formData.get("name") as string;
  const acronym = formData.get("acronym") as string;
  const platform = formData.get("platform") as string;
  const registered_by_email = formData.get("registered_by_email") as string;
  const registered_by_name = formData.get("registered_by_name") as string;

  const requiredValues = [
    election_id,
    name,
    acronym,
    registered_by_email,
    registered_by_name,
  ];

  if (requiredValues.some((value) => !value)) {
    return { error: "Please fill in all required fields." };
  }

  return {
    election_id,
    name,
    acronym,
    platform,
    registered_by_email,
    registered_by_name,
  };
}

export async function getOpenElectionForPartylistRegistration(
  electionId: string,
) {
  const supabase = await createClient();

  return supabase
    .from("elections")
    .select(
      "election_id, candidacy_start_date, candidacy_end_date, is_archived",
    )
    .eq("election_id", electionId)
    .single();
}

export async function hasExistingPartylist(
  electionId: string,
  column: "acronym" | "name",
  value: string,
) {
  const adminSupabase = await createAdminClient();

  const { data } = await adminSupabase
    .from("partylists")
    .select("partylist_id")
    .eq("election_id", electionId)
    .eq(column, value);

  return !!data?.length;
}
