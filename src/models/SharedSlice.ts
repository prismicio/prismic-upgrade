import { SharedSlice as SharedSliceDefinition } from "@prismicio/types-internal/lib/customtypes";

import { CompositeSlice } from "./CompositeSlice";

export class SharedSlice {
	definition: SharedSliceDefinition;

	get id(): string {
		return this.definition.id;
	}

	constructor(sharedSlice: SharedSliceDefinition) {
		this.definition = sharedSlice;
	}

	static fromCompositeSlice(compositeSlice: CompositeSlice): SharedSlice {
		return new SharedSlice({
			id: compositeSlice.id,
			type: "SharedSlice",
			name: compositeSlice.definition.fieldset ?? compositeSlice.id,
			variations: [
				{
					id: "default",
					name: "Default",
					description: "Default",
					imageUrl: "",
					docURL: "...",
					version: "initial",
					primary: compositeSlice.definition["non-repeat"],
					items: compositeSlice.definition.repeat,
				},
			],
		});
	}
}
