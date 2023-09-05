import * as path from "node:path";

import cors from "cors";
import express, { Express } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import serveStatic from "serve-static";

type CreateUpgradeExpressAppArgs = Record<string, never>;

export const createUpgradeExpressApp = (
	_args: CreateUpgradeExpressAppArgs,
): Express => {
	const app = express();

	app.use(cors());

	if (__APP_MODE__ === "development") {
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
