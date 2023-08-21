import meow from "meow";

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
  $ npx @prismicio/upgrade-from-legacy <command>

COMMANDS
  check          Check for conflicts on current project

OPTIONS
  --help, -h     Display CLI help
  --version, -v  Display CLI version
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

if (cli.flags.help || !["check"].includes(cli.input[0])) {
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

	switch (cli.input[0]) {
		case "check":
			initProcess.check();
			break;
	}
}
