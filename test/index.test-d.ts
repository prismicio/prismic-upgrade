import { expectTypeOf, it } from "vitest";

import * as lib from "../src";

it("returns void", () => {
	expectTypeOf(lib.createUpgradeProcess).returns.not.toBeVoid();
});
