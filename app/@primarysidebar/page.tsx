"use client";
import { addTab } from "@/redux/reducers/tabs";
import { useEffect, useState } from "react";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { listen } from "@tauri-apps/api/event";
import { get_files, open_folder } from "@/functions/folder";
import { event } from "@tauri-apps/api";

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
	// const folder = useSelector(
	//     (folders)
	// )

	useEffect(() => {
		listen_menu_events();
	});

	async function listen_menu_events() {
		await listen("open_folder", async (event) => {
			const folder = await open_folder();
			if (folder) get_files(folder);
		});

		await listen("new_folder", async (event) => {});
	}

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
