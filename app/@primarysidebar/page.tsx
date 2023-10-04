"use client";
import { addTab } from "@/redux/reducers/tabs";
import { use, useEffect, useState } from "react";
import { IoMdArrowDropright, IoMdArrowDropdown } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { listen } from "@tauri-apps/api/event";
import { get_files, open_folder } from "@/functions/folder";
import { event } from "@tauri-apps/api";
import { IFolderSlice, set_files, set_folder } from "@/redux/reducers/folders";
import { join, basename } from "path";

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
	const dispatch = useDispatch();
	const folder = useSelector(({ folder }: { folder: IFolderSlice }) => folder);

	useEffect(() => {
		if (folder.path == null) listen_menu_events();
		console.log(folder);
	}, [folder]);

	async function listen_menu_events() {
		await listen("open_folder", async (event) => {
			const folder = await open_folder();
			if (folder) {
				dispatch(set_folder(folder));
				const files = await get_files(folder);
				dispatch(set_files(files));
			}
		});

		await listen("new_folder", async (event) => {});
	}

	return (
		<div className="flex flex-col cursor-pointer select-none text-white text-sm ">
            {
                folder.path ? <>
				<div
					className="flex flex-row  ml-2 mr-2"
					onClick={() => setShowList(!showList)}
				>
					{showList ? (
						<IoMdArrowDropdown size={22} color="white" />
					) : (
						<IoMdArrowDropright size={22} color="white" />
					)}

					<span className="font-semibold text-base">
						{basename(folder.path || "")}
					</span>
				</div>
				<ul className={` ${showList ? "" : "hidden"}`}>
					{folder.files.map((file, i) => {
						return <File path={join(folder.path as string, file)} key={i} />;
					})}
				</ul>
			</> : 'No folder opened'
            }
			
		</div>
	);
}

function File({ path }: { path: string }) {
	const dispatch = useDispatch();
	return (
		<li
			className="pl-6 hover:bg-zinc-700 w-full"
			onClick={() => {
				dispatch(addTab(path));
			}}
		>
			<span>{basename(path)}</span>
		</li>
	);
}
