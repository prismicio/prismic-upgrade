import { CompositeSlice as CompositeSliceDefinition } from "@prismicio/types-internal/lib/customtypes";

import { CustomType } from "./CustomType";

export type CompositeSliceMeta = {
	parent: CustomType;
	path: {
		tabID: string;
		sliceZoneID: string;
		sliceID: string;
	};
};

export class CompositeSlice {
	definition: CompositeSliceDefinition;
	meta: CompositeSliceMeta;

	get id(): string {
		return this.meta.path.sliceID;
	}

	constructor(
		compositeSlice: CompositeSliceDefinition,
		meta: CompositeSliceMeta,
	) {
		this.definition = compositeSlice;
		this.meta = meta;
	}
}
