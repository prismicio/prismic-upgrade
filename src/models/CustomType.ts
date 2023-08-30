import {
	CustomType as CustomTypeDefinition,
	DynamicSlice as DynamicSliceDefinition,
} from "@prismicio/types-internal/lib/customtypes";

import { CompositeSlice } from "./CompositeSlice";

export class CustomType {
	definition: CustomTypeDefinition;

	get id(): string {
		return this.definition.id;
	}

	constructor(customType: CustomTypeDefinition) {
		this.definition = customType;
	}

	getAllCompositeSlices = (): CompositeSlice[] => {
		const extractedCompositeSlices: CompositeSlice[] = [];

		for (const tabID in this.definition.json) {
			const fields = this.definition.json[tabID];

			for (const fieldID in fields) {
				const field = fields[fieldID];

				// TODO: Do we need to handle "choice" also?
				if (field.type !== "Slices") {
					continue;
				}

				const slices = field.config?.choices;

				if (!slices) {
					continue;
				}

				for (const sliceID in slices) {
					const slice = slices[sliceID];

					// TODO: Handle legacy slices
					if (slice.type !== "Slice") {
						continue;
					}

					extractedCompositeSlices.push(
						new CompositeSlice(slice, {
							parent: this,
							path: {
								tabID,
								sliceZoneID: fieldID,
								sliceID,
							},
						}),
					);
				}
			}
		}

		return extractedCompositeSlices;
	};

	updateSliceInSliceZone(
		definition: DynamicSliceDefinition,
		path: {
			tabID: string;
			sliceZoneID: string;
			sliceID: string;
		},
	): void {
		const maybeSliceZone =
			this.definition.json?.[path.tabID]?.[path.sliceZoneID];

		if (maybeSliceZone.type === "Slices" && maybeSliceZone.config?.choices) {
			maybeSliceZone.config.choices[path.sliceID] = definition;
		} else {
			throw new Error(
				`Could not find slice zone at ${this.id}::${path.tabID}::${path.sliceZoneID}`,
			);
		}
	}
}
