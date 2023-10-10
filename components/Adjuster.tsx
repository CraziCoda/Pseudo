interface AdjusterProps {
	direction: "vertical" | "horizontal";
}
export default function Adjuster({ direction }: AdjusterProps) {
	return (
		<div
			className={`flex bg-white ${
				direction == "vertical" ? "h-full w-1" : "w-full h-1"
			} cursor-pointer bg-red-800`}
		></div>
	);
}
