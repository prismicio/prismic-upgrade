import * as path from "node:path";

import {
	SliceMachineManager,
	createSliceMachineManagerMiddleware,
} from "@slicemachine/manager";
import cors from "cors";
import express, { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import serveStatic from "serve-static";

type CreateUpgradeExpressAppArgs = {
	sliceMachineManager: SliceMachineManager;
};

export const createUpgradeExpressApp = (
	args: CreateUpgradeExpressAppArgs,
): Express => {
	const app = express();

	app.use(cors());

	app.use(
		"/_manager",
		createSliceMachineManagerMiddleware({
			sliceMachineManager: args.sliceMachineManager,
		}),
	);

	if (import.meta.env.MODE === "development") {
		app.use(
			"/",
			createProxyMiddleware({
				target: "http://localhost:5173",
				changeOrigin: true,
				ws: true,
				logLevel: "warn",
			}),
		);
	} else {
		app.use(
			serveStatic(path.resolve(__dirname, "../gui"), {
				extensions: ["html"],
			}),
		);
	}

	return app;
};
