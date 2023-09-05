if (
	__APP_MODE__ === "development" &&
	!["check", "migrate"].includes(process.argv.slice(2).pop() ?? "")
) {
	// Automatically restart the process ONLY when app is in development mode.
	Promise.all([import("node:url"), import("nodemon"), import("chalk")]).then(
		([url, { default: nodemon }, { default: chalk }]) => {
			const relativePath = (path: string) =>
				url.fileURLToPath(new URL(path, import.meta.url));

			nodemon({
				script: relativePath("./cli.cjs"),
				args: process.argv.slice(2),
				delay: 1,
				watch: [relativePath("../dist")],
			}).on("restart", () => {
				console.info(`${chalk.dim("[cli]")} Restarting...`);
			});
		},
	);
} else {
	import("./cli");
}
