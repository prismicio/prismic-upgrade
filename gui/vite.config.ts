import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: [
			{
				find: /@cli\/(.*)/,
				replacement: "../src/$1",
			},
		],
	},
	root: __dirname,
	build: {
		outDir: "../dist/gui",
	},
});
