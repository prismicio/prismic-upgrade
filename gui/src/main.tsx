import { ThemeProvider, TooltipProvider } from "@prismicio/editor-ui";
import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<ThemeProvider mode="light">
			<TooltipProvider>
				<App />
			</TooltipProvider>
		</ThemeProvider>
	</React.StrictMode>,
);
