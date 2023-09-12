import { Button, Icon, Tooltip } from "@prismicio/editor-ui";
import { useMemo } from "react";

import { useSliceConflicts } from "../store/useSliceConflicts";
import { useSliceMachineConfig } from "../store/useSliceMachineConfig";

import { StatusDot } from "./StatusDot";

import { CompositeSlice } from "../../../src/models/CompositeSlice";
import { CustomType } from "../../../src/models/CustomType";

export function CustomTypeCard({
	customType,
}: {
	customType: CustomType;
}): JSX.Element {
	const dashboard = useSliceMachineConfig((state) => state.dashboard);
	const conflicts = useSliceConflicts((state) => state.conflicts);

	const sliceZones = useMemo(() => {
		const sliceZoneMap: Record<
			string,
			{ id: string; tabID: string; compositeSlices: CompositeSlice[] }
		> = {};
		const compositeSlices = customType.getAllCompositeSlices();

		for (const compositeSlice of compositeSlices) {
			sliceZoneMap[compositeSlice.meta.path.sliceZoneID] ||= {
				id: compositeSlice.meta.path.sliceZoneID,
				tabID: compositeSlice.meta.path.tabID,
				compositeSlices: [],
			};
			sliceZoneMap[compositeSlice.meta.path.sliceZoneID].compositeSlices.push(
				compositeSlice,
			);
		}

		return Object.values(sliceZoneMap);
	}, [customType]);

	const hasConflicts = useMemo(() => {
		return Object.values(conflicts ?? {}).some((slices) => {
			return slices.some((slice) => {
				return (
					slice instanceof CompositeSlice &&
					slice.meta.parent.id === customType.id
				);
			});
		});
	}, [conflicts, customType]);

	return (
		<article className="rounded border-stone-300 border">
			<header className="p-4 flex justify-between items-center">
				<div className="space-x-2 flex items-end">
					<h3 className="heading-3 flex gap-2 items-center">
						<StatusDot type={hasConflicts ? "error" : "success"} />
						{customType.definition.label}
					</h3>
					<em className="badge">
						<Icon name="description" size="extraSmall" /> ID: {customType.id}
					</em>
				</div>
				<div>
					<a
						href={`${dashboard}/masks/${customType.id}.json`}
						target="_blank"
						tabIndex={-1}
					>
						<Button size="small" variant="secondary" startIcon="link">
							View on Prismic
						</Button>
					</a>
				</div>
			</header>
			<hr />
			<section className="px-4 py-3">
				<ul className="space-y-3">
					{sliceZones.length ? (
						sliceZones.map((sliceZone) => (
							<li key={sliceZone.id} className="space-y-2">
								<header>
									<h4 className="heading-4 flex gap-1 items-center">
										<Icon name="viewDay" size="extraSmall" />
										{sliceZone.id}
									</h4>
									<small className="italic">
										{sliceZone.compositeSlices.length} legacy slice
										{sliceZone.compositeSlices.length > 1 ? "s" : ""} in this
										slice zone.
									</small>
								</header>
								<ul className="grid grid-cols-3 gap-2">
									{sliceZone.compositeSlices.map((compositeSlice) => (
										<li
											key={compositeSlice.id}
											className="text-sm p-2 rounded border-stone-300 border hover:bg-stone-100"
										>
											<header className="space-y-2">
												<h5 className="heading-5">
													<Tooltip
														title={`${compositeSlice.definition.fieldset} has a conflicting ID`}
														content={`The ID of this slice is also present in other slice zones or among your shared slices. Head over to the "Slices" tab to resolve them!`}
														open={
															compositeSlice.id in (conflicts ?? {})
																? undefined
																: false
														}
													>
														<span className="inline-flex gap-2 items-center">
															<StatusDot
																type={
																	conflicts
																		? compositeSlice.id in conflicts
																			? "error"
																			: "success"
																		: "unknown"
																}
															/>
															{compositeSlice.definition.fieldset}
														</span>
													</Tooltip>
												</h5>
												<em className="badge">
													<Icon name="tag" size="extraSmall" /> ID:{" "}
													{compositeSlice.id}
												</em>
											</header>
										</li>
									))}
								</ul>
							</li>
						))
					) : (
						<li>
							<small className="italic">
								No slice zone in this custom type.
							</small>
						</li>
					)}
				</ul>
			</section>
		</article>
	);
}
