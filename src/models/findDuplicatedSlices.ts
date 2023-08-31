import { CompositeSlice } from "./CompositeSlice";
import { SharedSlice } from "./SharedSlice";

export const findDuplicatedSlices = (
	slices: (CompositeSlice | SharedSlice)[],
): (CompositeSlice | SharedSlice)[][] => {
	const duplicatedSlices: (CompositeSlice | SharedSlice)[][] = [];

	for (const slice of slices) {
		const maybeDuplicatedSlices = duplicatedSlices.find((slices) => {
			if (slice instanceof SharedSlice) {
				// TODO
			} else {
				const diff = slice.diff(slices[0]);

				// All fields are alike
				return !diff.primary.length && !diff.items.length;
			}

			return false;
		});

		if (maybeDuplicatedSlices) {
			maybeDuplicatedSlices.push(slice);
		} else {
			duplicatedSlices.push([slice]);
		}
	}

	return duplicatedSlices.filter((slices) => slices.length > 1);
};
