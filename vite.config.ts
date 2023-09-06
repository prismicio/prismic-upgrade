import { defineConfig } from "vite";
import sdk from "vite-plugin-sdk";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				cli: "./src/cli.ts",
				"cli-watcher": "./src/cli-watcher.ts",
			},
		},
		rollupOptions: {
			// Listing `nodemon` as external prevents it from being
			// bundled. Note that `nodemon` is listed under
			// devDependencies and is used in
			// `./src/bin/start-slicemachine.ts`, which would
			// normally prompt Vite to bundle the dependency.
			external: ["nodemon"],
		},
	},
	plugins: [
		sdk({
			internalDependencies: ["meow"],
		}),
	],
	test: {
		coverage: {
			provider: "v8",
			reporter: ["lcovonly", "text"],
		},
		setupFiles: ["./test/__setup__.ts"],
		server: {
			deps: {
				inline:
					// TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
					[/^(?!.*vitest).*$/],
			},
		},
	},
});
