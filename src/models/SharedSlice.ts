import { SharedSlice as SharedSliceDefinition } from "@prismicio/types-internal/lib/customtypes";

export class SharedSlice {
	definition: SharedSliceDefinition;

	get id(): string {
		return this.definition.id;
	}

	constructor(sharedSlice: SharedSliceDefinition) {
		this.definition = sharedSlice;
	}
}
