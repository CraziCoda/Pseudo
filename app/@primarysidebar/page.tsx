"use client";
import { addTab } from "@/redux/reducers/tabs";
import { useState } from "react";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { useDispatch } from "react-redux";

export default function PrimarySideBar() {
	return (
		<div className="flex flex-col w-52 border-r border-r-black bg-zinc-900">
			<div className="flex flex-row h-8 items-center pl-2 text-xs text-white">
				PROJECTS
			</div>

			<Project />
		</div>
	);
}

function Project() {
	const [showList, setShowList] = useState(false);
	return (
		<div className="flex flex-col cursor-pointer select-none text-white text-sm ">
			<div
				className="flex flex-row  ml-2 mr-2"
				onClick={() => setShowList(!showList)}
			>
				{showList ? (
					<IoMdArrowDropdown size={22} color="white" />
				) : (
					<IoMdArrowDropright size={22} color="white" />
				)}

				<span className="font-semibold text-base">First</span>
			</div>
			<ul className={` ${showList ? "" : "hidden"}`}>
				<File name="hello.psc" />
				<File name="world.psc" />
			</ul>
		</div>
	);
}

function File({ name, path }: { name: string; path?: string }) {
	const dispatch = useDispatch();
	return (
		<li
			className="pl-6 hover:bg-zinc-700 w-full"
			onClick={() => {
				dispatch(addTab(name));
			}}
		>
			<span>{name}</span>
		</li>
	);
}
