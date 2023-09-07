import { SliceMachineConfig } from "@slicemachine/manager";
import { create } from "zustand";

import { useManager } from "./useManager";

type SliceMachineConfigState = {
	config: null | SliceMachineConfig;
	dashboard: null | string;
	fetch: () => Promise<void>;
};

export const useSliceMachineConfig = create<SliceMachineConfigState>((set) => ({
	config: null,
	dashboard: null,
	fetch: async () => {
		const config = await useManager().project.getSliceMachineConfig();

		const dashboard = config.apiEndpoint
			? config.apiEndpoint.replace(".cdn", "")
			: `https://${config.repositoryName}.prismic.io`;

		set({ config, dashboard });
	},
}));
