import { create } from "zustand";

import { useManager } from "./useManager";
import { useSliceConflicts } from "./useSliceConflicts";

import { CompositeSlice } from "../../../src/models/CompositeSlice";
import { CustomType } from "../../../src/models/CustomType";
import { SharedSlice } from "../../../src/models/SharedSlice";
import { checkSliceConflicts } from "../../../src/models/checkSliceConflicts";

type RepositoryState = {
	customTypes: null | CustomType[];
	sharedSlices: null | SharedSlice[];
	compositeSlices: null | CompositeSlice[];
	fetch: () => Promise<void>;
};

export const useRepository = create<RepositoryState>((set) => ({
	customTypes: null,
	sharedSlices: null,
	compositeSlices: null,
	fetch: async () => {
		const [rawCustomTypes, rawSharedSlices] = await Promise.all([
			useManager().customTypes.fetchRemoteCustomTypes(),
			useManager().slices.fetchRemoteSlices(),
		]);
		const customTypes = rawCustomTypes.map(
			(customType) => new CustomType(customType),
		);
		const sharedSlices = rawSharedSlices.map(
			(sharedSlice) => new SharedSlice(sharedSlice),
		);
		const compositeSlices = customTypes
			.map((customType) => customType.getAllCompositeSlices())
			.flat();

		set({
			customTypes,
			sharedSlices,
			compositeSlices,
		});

		useSliceConflicts.setState((_state) => ({
			conflicts: checkSliceConflicts([...sharedSlices, ...compositeSlices]),
		}));
	},
}));
