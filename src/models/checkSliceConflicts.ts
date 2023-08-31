import { CompositeSlice } from "./CompositeSlice";
import { SharedSlice } from "./SharedSlice";

export type SliceConflicts = Record<string, (CompositeSlice | SharedSlice)[]>;

export const checkSliceConflicts = (
	slices: (SharedSlice | CompositeSlice)[],
): SliceConflicts => {
	const ids: Record<string, SharedSlice | CompositeSlice> = {};
	const conflicts: SliceConflicts = {};

	for (const slice of slices) {
		if (!(slice.id in ids)) {
			ids[slice.id] = slice;

			continue;
		}

		conflicts[slice.id] ||= [ids[slice.id]];
		conflicts[slice.id].push(slice);
	}

	return conflicts;
};
