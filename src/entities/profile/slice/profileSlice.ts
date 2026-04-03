import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Profile } from "@/src/entities/profile/lib/types";

interface ProfileState {
  agencies: Profile[];
  selectedAgencyId: string | null;
  session: Profile | null;
  otherAgency: Profile[];
}

const initialState: ProfileState = {
  agencies: [],
  selectedAgencyId: null,
  session: null,
  otherAgency: [],
};

interface SetProfileDataPayload {
  agencies: Profile[];
  selectedAgencyId: string | null;
}

const ProfileSlice = createSlice({
  name: "Profile",
  initialState,
  reducers: {
    setProfileData: (state, action: PayloadAction<SetProfileDataPayload>) => {
      const { agencies, selectedAgencyId } = action.payload;

      state.agencies = agencies;
      state.selectedAgencyId = selectedAgencyId;
      state.session =
        agencies.find((agency) => agency.id === selectedAgencyId) ?? null;
      state.otherAgency = agencies.filter(
        (agency) => agency.id !== selectedAgencyId,
      );
    },
    clearProfileData: (state) => {
      state.agencies = [];
      state.selectedAgencyId = null;
      state.session = null;
      state.otherAgency = [];
    },
  },
});

export const { setProfileData, clearProfileData } = ProfileSlice.actions;
export const ProfileReducer = ProfileSlice.reducer;
