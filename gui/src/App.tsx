import { Alert, AlertButton, Box } from "@prismicio/editor-ui";

export function App(): JSX.Element {
	return (
		<div>
			<Box display="grid" gridTemplateColumns="repeat(5, 600px)" gap={16}>
				<Alert
					title="Title"
					subtitle="This is a subtitle"
					onClose={() => null}
					footerButtons={
						<>
							<AlertButton title="Customer Support" onClick={() => null} />
							<AlertButton title="Retry" onClick={() => null} />
						</>
					}
				/>
			</Box>
		</div>
	);
}
