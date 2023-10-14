import { AiOutlineFile } from "react-icons/ai";
export default function ActivityBar() {
	return (
		<div className="flex flex-col w-14 border-r border-r-black bg-zinc-800">
			<Activity />
		</div>
	);
}

function Activity() {
	return (
		<div>
			<div className="flex justify-center w-full h-10 border-l border-l-red-400 cursor-pointer">
				<AiOutlineFile size={24} color="white" />
			</div>
		</div>
	);
}
