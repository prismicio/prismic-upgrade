import { DocumentStatusBar, Separator, Skeleton } from "@prismicio/editor-ui";
import { useMemo } from "react";

import { useSliceMachineConfig } from "./store/useSliceMachineConfig";
import { useUser } from "./store/useUser";

function Header(): JSX.Element {
	const { config } = useSliceMachineConfig();
	const { profile } = useUser();

	const apiEndpoint = useMemo(() => {
		if (!config) {
			return null;
		}

		return config.apiEndpoint
			? config.apiEndpoint.replace(/^https?:\/\//i, "")
			: `${config.repositoryName}.prismic.io`;
	}, [config]);

	return (
		<header className="p-4 container max-w-screen-lg mx-auto flex justify-between items-center">
			{config ? (
				<div>
					<h1 className="font-medium text-xl">{config.repositoryName}</h1>
					<a
						href={config.apiEndpoint || `https://${apiEndpoint}`}
						className="text-gray-600 text-sm underline"
						target="_blank"
					>
						{apiEndpoint}
					</a>
				</div>
			) : (
				<div className="leading-[0] opacity-40">
					<Skeleton width={256} height={52} />
				</div>
			)}
			{profile ? (
				<h2 className="text-sm">
					Logged in as <em>{profile.email}</em>
				</h2>
			) : (
				<div className="leading-[0] opacity-40">
					<Skeleton width={256} height={20} />
				</div>
			)}
		</header>
	);
}

export function App(): JSX.Element {
	useSliceMachineConfig((state) => state.fetch)();
	useUser((state) => state.fetch)();

	return (
		<>
			<DocumentStatusBar status="release" />
			<Header />
			<div className="px-4 container max-w-screen-lg mx-auto">
				<Separator decorative={true} />
			</div>
			<main className="p-4"></main>
		</>
	);
}
