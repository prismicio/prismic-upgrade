import { AnimatedElement, DocumentStatusBar, Tab } from "@prismicio/editor-ui";
import { useEffect, useState } from "react";

import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { CustomTypeList } from "./components/CustomTypeList";
import { SharedSliceList } from "./components/SharedSliceList";
import { useRepository } from "./store/useRepository";
import { useSliceMachineConfig } from "./store/useSliceMachineConfig";
import { useUser } from "./store/useUser";

export function App(): JSX.Element {
	const repository = useRepository();
	const sliceMachineConfig = useSliceMachineConfig();
	const user = useUser();

	const tabs = ["Slices", "Custom Types", "Upgrade Summary"] as const;
	const [activeTab, setActiveTab] =
		useState<(typeof tabs)[number]>("Custom Types");

	useEffect(() => {
		repository.fetch();
		sliceMachineConfig.fetch();
		user.fetch();
	}, []);

	return (
		<>
			<DocumentStatusBar status="release" />
			<AppHeader />
			<div className="container space-y-4">
				<hr className="border-stone-300" />
				<nav className="flex gap-2">
					{tabs.map((tab) => (
						<Tab
							key={tab}
							title={tab}
							selected={activeTab === tab}
							onSelect={() => setActiveTab(tab)}
						/>
					))}
				</nav>
				<AnimatedElement>
					{activeTab === "Slices" ? (
						<main key="Slices" className="space-y-4">
							TODO: Slices
						</main>
					) : activeTab === "Custom Types" ? (
						<main key="Custom Types" className="space-y-4">
							<CustomTypeList key="Custom Types" />
							<SharedSliceList key="Slices" />
						</main>
					) : (
						<main key="Upgrade Summary" className="space-y-4">
							TODO: Upgrade Summary
						</main>
					)}
				</AnimatedElement>
				<hr className="border-stone-300" />
			</div>
			<AppFooter />
		</>
	);
}
