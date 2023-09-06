import { PrismicUserProfile } from "@slicemachine/manager";
import { create } from "zustand";

import { useManager } from "./useManager";

type UserState = {
	profile: null | PrismicUserProfile;
	fetch: () => Promise<void>;
};

export const useUser = create<UserState>((set) => ({
	profile: null,
	fetch: async () => {
		const profile = await useManager().user.getProfile();

		set({ profile });
	},
}));
