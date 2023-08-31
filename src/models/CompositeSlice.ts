import { CompositeSlice as CompositeSliceDefinition } from "@prismicio/types-internal/lib/customtypes";

import { CustomType } from "./CustomType";
import { SharedSlice } from "./SharedSlice";

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

	diff(slice: CompositeSlice | SharedSlice): {
		primary: string[];
		items: string[];
	} {
		const primary: string[] = [];
		const items: string[] = [];

		if (slice instanceof SharedSlice) {
			// TODO
		} else if (
			JSON.stringify(this.definition) !== JSON.stringify(slice.definition)
		) {
			const nonRepeatKeys = Object.keys({
				...this.definition["non-repeat"],
				...slice.definition["non-repeat"],
			});
			for (const key of nonRepeatKeys) {
				if (
					this.definition["non-repeat"]?.[key]?.type !==
					slice.definition["non-repeat"]?.[key]?.type
				) {
					primary.push(key);
				}
			}

			const repeatKeys = Object.keys({
				...this.definition.repeat,
				...slice.definition.repeat,
			});
			for (const key of repeatKeys) {
				if (
					this.definition.repeat?.[key]?.type !==
					slice.definition.repeat?.[key]?.type
				) {
					items.push(key);
				}
			}
		}

		return {
			primary,
			items,
		};
	}
}
