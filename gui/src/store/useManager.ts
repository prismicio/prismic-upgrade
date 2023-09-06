import {
	SliceMachineManagerClient,
	createSliceMachineManagerClient,
} from "@slicemachine/manager/client";

export const useManager = (): SliceMachineManagerClient =>
	createSliceMachineManagerClient({
		serverURL: "/_manager",
	});
