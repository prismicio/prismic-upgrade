import {
	PrismicUserProfile,
	SliceMachineConfig,
	SliceMachineManager,
	createSliceMachineManager,
} from "@slicemachine/manager";
import chalk from "chalk";
import { Express } from "express";
import { getPort } from "get-port-please";
import logSymbols from "log-symbols";
import open from "open";

import { ExplainedError } from "./lib/ExplainedError";
import { assertExists } from "./lib/assertExists";
import { createUpgradeExpressApp } from "./lib/createUpgradeExpressApp";
import { listr, listrRun } from "./lib/listr";

import { CompositeSlice } from "./models/CompositeSlice";
import { CustomType } from "./models/CustomType";
import { SharedSlice } from "./models/SharedSlice";
import {
	SliceConflicts,
	checkSliceConflicts,
} from "./models/checkSliceConflicts";
import { findDuplicatedSlices } from "./models/findDuplicatedSlices";

export type UpgradeProcessOptions = {
	cwd?: string;
	open?: boolean;
} & Record<string, unknown>;

const DEFAULT_OPTIONS: UpgradeProcessOptions = {};

export const createUpgradeProcess = (
	options?: UpgradeProcessOptions,
): UpgradeProcess => {
	return new UpgradeProcess(options);
};

type UpgradeProcessContext = {
	gui?: {
		app?: Express;
		port?: number;
	};
	config?: SliceMachineConfig;
	userProfile?: PrismicUserProfile;
	repository?: {
		customTypes?: CustomType[];
		sharedSlices?: SharedSlice[];
		compositeSlices?: CompositeSlice[];
	};
	conflicts?: SliceConflicts;
};

export class UpgradeProcess {
	protected options: UpgradeProcessOptions;
	protected manager: SliceMachineManager;

	protected context: UpgradeProcessContext;

	constructor(options?: UpgradeProcessOptions) {
		this.options = { ...DEFAULT_OPTIONS, ...options };
		this.manager = createSliceMachineManager({ cwd: options?.cwd });

		this.context = {};
	}

	async check(): Promise<void> {
		this.report("Check command started");

		await this.ensureSliceMachineProject();
		await this.loginAndFetchUserData();
		await this.fetchRepository();
		await this.searchCompositeSlices();
		await this.checkSliceConflicts();

		assertExists(
			this.context.conflicts,
			"Conflicts must be available through context to proceed",
		);

		if (Object.keys(this.context.conflicts).length) {
			// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
			// eslint-disable-next-line no-console
			console.log(`\n${this.formatConflicts()}`);
		}

		this.report("Check command successful!");

		const output = [];
		if (Object.keys(this.context.conflicts).length) {
			output.push(
				`  Your project ${chalk.cyan(
					"has conflicting slice IDs",
				)}, see details above.`,
				"  You won't be able to upgrade yet.",
			);
		} else {
			output.push(
				`  Your project is ${chalk.cyan("conflict-free")}!`,
				"  You will be able to upgrade soon.",
			);
		}

		output.push(
			"",
			"  Stay tuned for more information about the upgrade project:",
			"  - Newsletter: https://prismic.dev/upgrade/newsletter",
			"  - Twitter/X: https://twitter.com/prismicio",
		);

		// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
		// eslint-disable-next-line no-console
		console.log(output.join("\n"));
	}

	async migrate(): Promise<void> {
		this.report("Migrate command started");

		await this.ensureSliceMachineProject();
		await this.loginAndFetchUserData();
		await this.fetchRepository();
		await this.searchCompositeSlices();
		await this.checkSliceConflicts();

		assertExists(
			this.context.conflicts,
			"Conflicts must be available through context to proceed",
		);

		if (Object.keys(this.context.conflicts).length) {
			throw new ExplainedError(
				`\n${
					logSymbols.error
				} Cannot migrate a project with conflicts.\n\n  Run ${chalk.cyan(
					"npx @prismicio/upgrade-from-legacy check",
				)} for more details.`,
			);
		}

		await this.migrateCompositeSlices();
		await this.upsertCustomTypes();

		this.report("Migrate command successful!");
	}

	async gui(): Promise<void> {
		this.report("GUI command started");

		await this.ensureSliceMachineProject();
		await this.loginAndFetchUserData();
		await this.startGUI();

		if (this.options.open) {
			assertExists(
				this.context.gui?.port,
				"GUI port must be available through context to proceed",
			);

			await open(`http://localhost:${this.context.gui.port}`);
		}
	}

	protected report(message: string): void {
		// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
		// eslint-disable-next-line no-console
		console.log(
			`\n${chalk.bgCyan(` ${chalk.bold.white("Prismic")} `)} ${chalk.dim(
				"→",
			)} ${message}\n`,
		);
	}

	protected async ensureSliceMachineProject(): Promise<void> {
		try {
			this.context.config = await this.manager.project.getSliceMachineConfig();

			// We prefer to manually allow console logs despite the app being a CLI to catch wild/unwanted console logs better
			// eslint-disable-next-line no-console
			console.log(
				`${logSymbols.success} Working with repository ${chalk.cyan(
					this.context.config.repositoryName,
				)}`,
			);
		} catch (error) {
			throw new ExplainedError(
				`${logSymbols.error} Cannot run ${chalk.cyan(
					"@prismicio/upgrade-from-legacy",
				)} outside of a Slice Machine project.\n\n  Run ${chalk.cyan(
					"npx @slicemachine/init@latest",
				)} first or make sure you're in the right directory.`,
				error instanceof Error ? { cause: error } : {},
			);
		}

		await this.manager.plugins.initPlugins();
	}

	protected async loginAndFetchUserData(): Promise<void> {
		return listrRun([
			{
				title: "Logging in to Prismic...",
				task: async (_, parentTask) => {
					parentTask.output = "Validating session...";
					const isLoggedIn = await this.manager.user.checkIsLoggedIn();

					if (!isLoggedIn) {
						parentTask.output = "Press any key to open the browser to login...";
						await new Promise((resolve) => {
							const initialRawMode = !!process.stdin.isRaw;
							process.stdin.setRawMode?.(true);
							process.stdin.once("data", (data: Buffer) => {
								process.stdin.setRawMode?.(initialRawMode);
								process.stdin.pause();
								resolve(data.toString("utf-8"));
							});
						});

						parentTask.output = "Browser opened, waiting for you to login...";
						const { port, url } = await this.manager.user.getLoginSessionInfo();
						await this.manager.user.nodeLoginSession({
							port,
							onListenCallback() {
								open(url);
							},
						});
					}

					parentTask.output = "";
					parentTask.title = `Logged in`;

					return listr(
						[
							{
								title: "Fetching user profile...",
								task: async (_, task) => {
									this.context.userProfile =
										await this.manager.user.getProfile();

									parentTask.title = `Logged in as ${chalk.cyan(
										this.context.userProfile?.email,
									)}`;
									task.title = "Fetched user profile";
								},
							},
						],
						{ concurrent: true },
					);
				},
			},
		]);
	}

	protected async fetchRepository(): Promise<void> {
		return listrRun([
			{
				title: `Fetching ${chalk.cyan(
					this.context.config?.repositoryName,
				)} repository...`,
				task: async (_, parentTask) => {
					return listr(
						[
							{
								title: "Fetching custom types...",
								task: async (_, task) => {
									const customTypeDefinitions =
										await this.manager.customTypes.fetchRemoteCustomTypes();

									this.context.repository ||= {};
									this.context.repository.customTypes =
										customTypeDefinitions.map(
											(customTypeDefinition) =>
												new CustomType(customTypeDefinition),
										);

									task.title = `Fetched ${chalk.cyan(
										this.context.repository.customTypes.length,
									)} custom type${
										this.context.repository.customTypes.length > 1 ? "s" : ""
									}`;
									if (this.context.repository.sharedSlices) {
										parentTask.title = `Fetched ${chalk.cyan(
											this.context.repository.customTypes.length,
										)} custom type${
											this.context.repository.customTypes.length > 1 ? "s" : ""
										} and ${chalk.cyan(
											this.context.repository.sharedSlices.length,
										)} shared slice${
											this.context.repository.sharedSlices.length > 1 ? "s" : ""
										} from repository`;
									}
								},
							},
							{
								title: "Fetching shared slices...",
								task: async (_, task) => {
									const sharedSliceDefinitions =
										await this.manager.slices.fetchRemoteSlices();

									this.context.repository ||= {};
									this.context.repository.sharedSlices =
										sharedSliceDefinitions.map(
											(sharedSliceDefinition) =>
												new SharedSlice(sharedSliceDefinition),
										);

									task.title = `Fetched ${chalk.cyan(
										this.context.repository.sharedSlices.length,
									)} shared slice${
										this.context.repository.sharedSlices.length > 1 ? "s" : ""
									}`;
									if (this.context.repository.customTypes) {
										parentTask.title = `Fetched ${chalk.cyan(
											this.context.repository.customTypes.length,
										)} custom type${
											this.context.repository.customTypes.length > 1 ? "s" : ""
										} and ${chalk.cyan(
											this.context.repository.sharedSlices.length,
										)} shared slice${
											this.context.repository.sharedSlices.length > 1 ? "s" : ""
										} from repository`;
									}
								},
							},
						],
						{ concurrent: true },
					);
				},
			},
		]);
	}

	protected async searchCompositeSlices(): Promise<void> {
		return listrRun([
			{
				title: "Searching composite slices...",
				task: (_, task) => {
					assertExists(
						this.context.repository?.customTypes,
						"Repository Custom Types must be available through context to proceed",
					);

					this.context.repository.compositeSlices = [];

					for (const customType of this.context.repository.customTypes) {
						this.context.repository.compositeSlices.push(
							...customType.getAllCompositeSlices(),
						);
					}

					task.title = `Found ${chalk.cyan(
						this.context.repository.compositeSlices.length,
					)} composite slices`;
				},
			},
		]);
	}

	protected async checkSliceConflicts(): Promise<void> {
		return listrRun([
			{
				title: "Checking conflicts...",
				task: (_, task) => {
					assertExists(
						this.context.repository?.sharedSlices,
						"Repository Shared Slices must be available through context to proceed",
					);
					assertExists(
						this.context.repository?.compositeSlices,
						"Repository Composite Slices (legacy) must be available through context to proceed",
					);

					this.context.conflicts = checkSliceConflicts([
						...this.context.repository.sharedSlices,
						...this.context.repository.compositeSlices,
					]);

					const conflictsLength = Object.keys(this.context.conflicts).length;
					if (conflictsLength) {
						task.title = `Found ${chalk.cyan(conflictsLength)} conflict${
							conflictsLength > 1 ? "s" : ""
						}`;
					} else {
						task.title = `Found no conflict`;
					}
				},
			},
		]);
	}

	protected formatConflicts(): string {
		assertExists(
			this.context.conflicts,
			"Conflicts must be available through context to proceed",
		);

		const output: string[] = [];

		output.push(
			`       ${chalk.dim("(shared slice)")}  ${chalk.cyan(
				"<slice-type>",
			)} ${chalk.dim("(maybe-suffix)")}\n    ${chalk.dim(
				"(composite slice)",
			)}  ${chalk.dim("<custom-type>::<tab>::<field>::")}${chalk.cyan(
				"<slice-type>",
			)} ${chalk.dim("(maybe-suffix)")}`,
		);

		for (const id in this.context.conflicts) {
			const conflict = this.context.conflicts[id];

			output.push(
				`\n\n  ${logSymbols.error} ${chalk.cyan(id)} is conflicting:\n`,
			);

			const duplicatedSlices = findDuplicatedSlices(conflict);
			const allDuplicated =
				duplicatedSlices.length === 1 &&
				duplicatedSlices[0].length === conflict.length;

			for (const slice of conflict) {
				const maybeIndex =
					duplicatedSlices.findIndex((slices) => slices.includes(slice)) + 1;

				const suffix = maybeIndex
					? ` ${chalk.hsl(maybeIndex * 45, 50, 50)(`(d${maybeIndex})`)}`
					: "";
				if (slice instanceof SharedSlice) {
					output.push(
						`       ${chalk.dim("(shared slice)")}  ${chalk.cyan(
							slice.id,
						)}${suffix}`,
					);
				} else {
					output.push(
						`    ${chalk.dim("(composite slice)")}  ${chalk.dim(
							`${slice.meta.parent.id}::${slice.meta.path.tabID}::${slice.meta.path.sliceZoneID}::`,
						)}${chalk.cyan(slice.id)}${suffix}`,
					);
				}
			}

			if (allDuplicated) {
				output.push(`\n    ${chalk.dim("All slices are identical!")}`);
			} else if (duplicatedSlices.length) {
				output.push(
					`\n    ${chalk.dim(
						`(d${chalk.italic(
							duplicatedSlices.length === 1
								? "1"
								: `1-${duplicatedSlices.length}`,
						)}) suffixed slices are identical to slices with the same suffix`,
					)}`,
				);
			}
		}

		return output.join("\n");
	}

	protected async migrateCompositeSlices(): Promise<void> {
		return listrRun([
			{
				title: `Migrating ${chalk.cyan(
					this.context.repository?.compositeSlices?.length,
				)} composite slices...`,
				task: async (_, task) => {
					assertExists(
						this.context.config,
						"Config must be available through context to proceed",
					);
					assertExists(
						this.context.repository?.compositeSlices,
						"Repository Composite Slices (legacy) must be available through context to proceed",
					);

					// TODO: This needs to be more flexible
					const libraryID = this.context.config.libraries?.[0] ?? "./slices";

					await Promise.all(
						this.context.repository.compositeSlices.map(
							async (compositeSlice) => {
								const sharedSlice =
									SharedSlice.fromCompositeSlice(compositeSlice);
								const { errors } = await this.manager.slices.createSlice({
									libraryID,
									model: sharedSlice.definition,
								});

								if (errors.length) {
									throw errors;
								}

								compositeSlice.meta.parent.updateSliceInSliceZone(
									{
										type: "SharedSlice",
									},
									compositeSlice.meta.path,
								);
							},
						),
					);

					task.title = `Migrated ${chalk.cyan(
						this.context.repository.compositeSlices.length,
					)} composite slices as shared slices`;
				},
			},
		]);
	}

	protected async upsertCustomTypes(): Promise<void> {
		return listrRun([
			{
				title: `Upserting ${chalk.cyan(
					this.context.repository?.customTypes?.length,
				)} custom types...`,
				task: async (_, task) => {
					assertExists(
						this.context.config,
						"Config must be available through context to proceed",
					);
					assertExists(
						this.context.repository?.customTypes,
						"Repository Custom Types must be available through context to proceed",
					);

					await Promise.all(
						this.context.repository.customTypes.map(async (customType) => {
							// TODO: Need to handle existing custom type perhaps(?)
							const { errors } =
								await this.manager.customTypes.createCustomType({
									model: customType.definition,
								});

							if (errors.length) {
								throw errors;
							}
						}),
					);

					task.title = `Upserted ${chalk.cyan(
						this.context.repository.customTypes.length,
					)} custom types`;
				},
			},
		]);
	}

	protected async startGUI(): Promise<void> {
		return listrRun([
			{
				title: "Starting GUI...",
				task: async (_, task) => {
					task.output = "Finding port...";

					const port = await getPort({ port: 8888 });

					task.output = "Starting server...";

					const app = createUpgradeExpressApp({
						sliceMachineManager: this.manager,
					});

					await new Promise<void>((resolve) => {
						app.listen(port, () => {
							resolve();
						});
					});

					this.context.gui ||= {};
					this.context.gui.port = port;
					this.context.gui.app = app;

					task.output = "";
					task.title = `GUI started! Available at ${chalk.cyan(
						`http://localhost:${this.context.gui.port}`,
					)} ${import.meta.env.MODE === "development" ? "(proxying)" : ""}`;
				},
			},
		]);
	}
}
