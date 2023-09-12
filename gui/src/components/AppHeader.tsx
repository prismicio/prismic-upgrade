import { Icon, Skeleton } from "@prismicio/editor-ui";

import { useSliceMachineConfig } from "../store/useSliceMachineConfig";
import { useUser } from "../store/useUser";

export function AppHeader(): JSX.Element {
	const [config, dashboard] = useSliceMachineConfig((state) => [
		state.config,
		state.dashboard,
	]);
	const profile = useUser((state) => state.profile);

	return (
		<header className="container py-4 flex justify-between items-center">
			{config ? (
				<div>
					<h1 className="heading-1">{config.repositoryName}</h1>
					<div className="text-stone-600 text-sm">
						Dashboard:{" "}
						<a href={dashboard ?? ""} className="underline" target="_blank">
							{dashboard?.replace(/^https?:\/\//i, "")}
						</a>
					</div>
				</div>
			) : (
				<div className="leading-[0]">
					<Skeleton width={256} height={56} />
				</div>
			)}
			{profile ? (
				<em className="badge badge--medium">
					<Icon name="public" size="small" />
					Logged in as {profile.email}
				</em>
			) : (
				<div className="leading-[0]">
					<Skeleton width={256} height={28} />
				</div>
			)}
		</header>
	);
}
