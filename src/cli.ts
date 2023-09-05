import meow from "meow";

import { ExplainedError } from "./lib/ExplainedError";

import { name as pkgName, version as pkgVersion } from "../package.json";

import { createUpgradeProcess } from "./UpgradeProcess";

const cli = meow(
	`
Prismic Slice Machine Upgrade CLI

DOCUMENTATION
  https://prismic.dev/upgrade

VERSION
  ${pkgName}@${pkgVersion}

USAGE
  $ npx @prismicio/upgrade-from-legacy
  $ npx @prismicio/upgrade-from-legacy <command>

COMMANDS
  start (default)  Starts upgrade GUI
  check            Check for conflicts on current project
  migrate          Migrate to shared slices

OPTIONS
  --help, -h       Display CLI help
  --version, -v    Display CLI version
`,
	{
		importMeta: import.meta,
		flags: {
			help: {
				type: "boolean",
				shortFlag: "h",
				default: false,
			},
			version: {
				type: "boolean",
				shortFlag: "v",
				default: false,
			},
		},
		description: false,
		autoHelp: false,
		autoVersion: false,
		allowUnknownFlags: false,
	},
);

if (
	cli.flags.help ||
	(cli.input[0] && !["start", "check", "migrate"].includes(cli.input[0]))
) {
	cli.showHelp();
} else if (cli.flags.version) {
	// eslint-disable-next-line no-console
	console.log(`${pkgName}@${pkgVersion}`);
	process.exit(0);
} else {
	const initProcess = createUpgradeProcess({
		...cli.flags,
		input: cli.input,
	});

	(async () => {
		try {
			switch (cli.input[0]) {
				case "check":
					await initProcess.check();
					break;

				case "migrate":
					await initProcess.migrate();
					break;

				default:
					await initProcess.start();
					break;
			}
		} catch (error) {
			if (error instanceof ExplainedError) {
				// eslint-disable-next-line no-console
				console.log(error.message);

				return;
			}
			throw error;
		}
	})();
}
