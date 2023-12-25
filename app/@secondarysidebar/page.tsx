"use client";
import { useDispatch, useSelector } from "react-redux";
import { IInterpreterSlice } from "@/redux/reducers/interpreter";

export default function SecondarySideBar() {
	const interpreter = useSelector(
		({ interpreter }: { interpreter: IInterpreterSlice }) => interpreter
	);

	return (
		<div
			className={`flex flex-col w-1/5 border-l border-l-black justify-self-end bg-zinc-900 p-2 `}
			style={{ minWidth: "12rem" }}
		>
			<div className={`${interpreter.debug ? "flex" : "hidden"} flex-col`}>
				<div className={`flex-row h-8 items-center pl-2 text-xs text-white `}>
					PROGRAM OVERVIEW
				</div>
				<div className="flex flex-col items-center mb-3">
					<span className="text-white text-sm font-bold self-center">
						-- Next Line Number --
					</span>
					<span className="text-purple-400">
						{interpreter?.executable[interpreter?.program_counter]?.line}
					</span>
				</div>

				<div className="flex flex-col items-center mb-3">
					<span className="text-white text-sm font-bold self-center">
						-- Next Line --
					</span>
					<span className="text-purple-400">
						{interpreter.source_code
							.split("\n")
							[
								interpreter.executable[interpreter.program_counter]?.line - 1
							]?.trim()}
					</span>
				</div>
				<div className="flex flex-col items-center mb-3">
					<span className="text-white text-sm font-bold self-center mb-1">
						-- Varibles --
					</span>
					{interpreter.variables.map((val, i) => (
						<div className="flex flex-row self-start w-full" key={i}>
							<div className="text-sm text-red-400 font-semibold border pl-1 pr-1 w-1/2 overflow-hidden break-words">
								{val?.name}
							</div>
							<div className="flex text-sm text-purple-400 border-l-0 font-semibold border pl-2 pr-2 w-1/2 overflow-hidden">
								<span className="self-center"> {val?.value}</span>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
