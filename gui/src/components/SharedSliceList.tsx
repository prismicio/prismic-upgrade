import { useRepository } from "../store/useRepository";

// TODO: Rendering
export function SharedSliceList(): JSX.Element {
	const sharedSlices = useRepository((state) => state.sharedSlices);

	return (
		<section className="space-y-4">
			<h2 className="heading-2">Shared Slices ({sharedSlices?.length})</h2>
			<ul>
				{sharedSlices?.map((sharedSlice) => (
					<li key={sharedSlice.id}>{sharedSlice.id}</li>
				))}
				{sharedSlices?.length === 0 ? (
					<li className="italic p-4">No Shared Slices found.</li>
				) : null}
			</ul>
		</section>
	);
}
