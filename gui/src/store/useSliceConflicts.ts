import { create } from "zustand";

import { CompositeSlice } from "../../../src/models/CompositeSlice";
import { SharedSlice } from "../../../src/models/SharedSlice";
import {
	SliceConflicts,
	checkSliceConflicts,
} from "../../../src/models/checkSliceConflicts";

type SliceConflictsState = {
	conflicts: null | SliceConflicts;
};

export const useSliceConflicts = create<SliceConflictsState>((set) => ({
	conflicts: null,
	check: (slices: (CompositeSlice | SharedSlice)[]) => {
		const conflicts = checkSliceConflicts(slices);

		set({ conflicts });
	},
}));
