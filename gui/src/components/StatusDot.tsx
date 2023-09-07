import clsx from "clsx";
import { forwardRef } from "react";

type StatusDotProps = {
	type: "unknown" | "success" | "warn" | "error";
};

export const StatusDot = forwardRef<HTMLSpanElement, StatusDotProps>(
	function StatusDot({ type }: StatusDotProps, ref): JSX.Element {
		return (
			<span className="relative flex h-2 w-2" ref={ref}>
				{["warn", "error"].includes(type) ? (
					<span
						className={clsx(
							"animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
							{
								"bg-stone-500": type === "unknown",
								"bg-green-500": type === "success",
								"bg-yellow-500": type === "warn",
								"bg-red-500": type === "error",
							},
						)}
					></span>
				) : null}
				<span
					className={clsx("relative inline-flex rounded-full h-2 w-2", {
						"bg-stone-500": type === "unknown",
						"bg-green-500": type === "success",
						"bg-yellow-500": type === "warn",
						"bg-red-500": type === "error",
					})}
				></span>
			</span>
		);
	},
);
