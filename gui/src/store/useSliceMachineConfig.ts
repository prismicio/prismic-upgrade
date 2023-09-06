import { SliceMachineConfig } from "@slicemachine/manager";
import { create } from "zustand";

import { useManager } from "./useManager";

type SliceMachineConfigState = {
	config: null | SliceMachineConfig;
	fetch: () => Promise<void>;
};

export const useSliceMachineConfig = create<SliceMachineConfigState>((set) => ({
	config: null,
	fetch: async () => {
		const config = await useManager().project.getSliceMachineConfig();

		set({ config });
	},
}));
