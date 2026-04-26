export interface Profile {
  id: string;
  agency_name: string;
  website_url: string;
  logo_url: string;
  color_theme?: string | null;
  updated_at: string;
}

export type CreateProfileInput = {
  agency_name: string;
  website_url?: string;
  logo_url?: string;
};

export type DeleteProfileArg = {
  profileId: string;
};

export type UpdateOrganizationSettingsInput = {
  profileId: string;
  agency_name?: string;
  color_theme?: string | null;
  logo_url?: string;
};
