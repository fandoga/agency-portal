export interface Profile {
  id: string;
  agency_name: string;
  website_url: string;
  logo_url: string;
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
