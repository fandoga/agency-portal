import { useCreateNewProfileMutation } from "../api/profileApi";
import { CreateProfileInput } from "../lib/types";

export const useCreateProfile = () => {
  const [createNewProfile, { isLoading, error }] =
    useCreateNewProfileMutation();

  const createProfile = async ({
    agency_name,
    website_url,
    logo_url,
  }: CreateProfileInput) => {
    const trimmed = agency_name.trim();

    try {
      await createNewProfile({
        agency_name: trimmed,
        website_url,
        logo_url,
      }).unwrap();
    } catch {
      //catch
    }
  };

  return [createProfile, isLoading, error] as const;
};
