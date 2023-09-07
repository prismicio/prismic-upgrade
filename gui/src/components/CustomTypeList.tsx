import { useRepository } from "../store/useRepository";

import { CustomTypeCard } from "./CustomTypeCard";

export function CustomTypeList(): JSX.Element {
	const customTypes = useRepository((state) => state.customTypes);

	return (
		<section className="space-y-4">
			<h2 className="heading-2">Custom Types ({customTypes?.length})</h2>
			<ul className="space-y-2">
				{customTypes?.map((customType) => (
					<li key={customType.id}>
						<CustomTypeCard customType={customType} />
					</li>
				))}
				{customTypes?.length === 0 ? (
					<li className="italic p-4">No Shared Slices found.</li>
				) : null}
			</ul>
		</section>
	);
}
