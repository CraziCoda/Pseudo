"use client";
import tabs, { ITab, addTab, closeTab } from "@/redux/reducers/tabs";
import { useEffect, useReducer, useRef, useState } from "react";
import {
	IoMdArrowDropright,
	IoMdArrowDropdown,
	IoMdAdd,
	IoMdTrash,
} from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { listen } from "@tauri-apps/api/event";
import {
	create_file,
	delete_file,
	get_files,
	open_folder,
} from "@/functions/folder";
import { IFolderSlice, set_files, set_folder } from "@/redux/reducers/folders";
import { join, basename } from "path";

export default function PrimarySideBar() {
	return (
		<div className="flex flex-col w-72 border-r border-r-black bg-zinc-900">
			<div className="flex flex-row h-8 items-center pl-2 text-xs text-white">
				PROJECT
			</div>

			<Project />
		</div>
	);
}

function Project() {
	const [showList, setShowList] = useState(true);
	const dispatch = useDispatch();
	const folder = useSelector(({ folder }: { folder: IFolderSlice }) => folder);
	const [selectedFile, seleteFile] = useState("");
	const [new_filename, set_filename] = useState("");
	const [show_file_field, set_show_file_field] = useState(false);
	const fileRef = useRef<HTMLInputElement>(null);
	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: ITab[]; active: number } }) => tabs
	);

	useEffect(() => {
		if (folder.path == null) listen_menu_events();
		// console.log(folder);
	}, [folder]);

	useEffect(() => {
		if (show_file_field) {
			fileRef.current?.focus();
			fileRef.current?.addEventListener("keypress", async (e) => {
				if (e.code == "Enter") {
					const file_created = await create_file(
						join(folder.path as string, fileRef.current?.value as string)
					);

					if (file_created) {
						await load_files();
						set_filename("");
						set_show_file_field(false);
					} else {
						console.log("Unable to create");
					}
				}
			});

			fileRef.current?.addEventListener("focusout", () => {
				set_filename("");
				set_show_file_field(false);
			});
		}
	}, [show_file_field]);

	async function handle_open_folder() {
		const folder = await open_folder();
		if (folder) {
			dispatch(set_folder(folder));
			const files = await get_files(folder);
			dispatch(set_files(files));
		}
	}

	async function load_files() {
		// console.log(folder.path);
		if (folder.path) {
			const files = await get_files(folder.path);
			dispatch(set_files(files));
		}
	}

	async function listen_menu_events() {
		await listen("open_folder", async (event) => {
			handle_open_folder();
		});
	}

	function select_file(path: string) {
		if (path != "") dispatch(addTab({ path }));
		// console.log(path);
		seleteFile(path);
	}

	async function remove_file() {
		if (await delete_file(selectedFile)) {
			await load_files();

			const index = tabs.tabs.findIndex((tab) => tab.path == selectedFile);

			if (index != -1) dispatch(closeTab(index));

			select_file("");
		}
	}

	return (
		<div className="flex flex-col cursor-pointer select-none text-white text-sm">
			{folder.path ? (
				<>
					<div className="flex flex-row justify-between items-center  ml-2 mr-2">
						<div
							className="flex flex-row items-center"
							onClick={() => setShowList(!showList)}
						>
							{showList ? (
								<IoMdArrowDropdown size={18} color="white" />
							) : (
								<IoMdArrowDropright size={18} color="white" />
							)}

							<span className="font-semibold text-base">
								{basename(folder.path || "")}
							</span>
						</div>

						<div className="flex flex-row items-center">
							<span className="flex flex-row justify-center items-center mr-2 cursor-pointer hover:bg-zinc-700 h-4 w-4">
								<IoMdAdd
									size={20}
									color="white"
									onClick={() => {
										set_show_file_field(true);
									}}
								/>
							</span>
							<span className="flex flex-row justify-center items-center cursor-pointer hover:bg-zinc-700 h-4 w-4">
								<IoMdTrash size={20} color="white" onClick={remove_file} />
							</span>
						</div>
					</div>
					<ul className={` ${showList ? "" : "hidden"}`}>
						{show_file_field && (
							<div className="flex ml-2 mr-2 mb-2">
								<input
									type="text"
									className="bg-transparent border-b border-b-gray-500 ml-4 outline-none"
									value={new_filename}
									onChange={(e) => {
										set_filename(e.target.value);
									}}
									ref={fileRef}
								/>
							</div>
						)}

						{folder.files.map((file, i) => {
							return (
								<File
									path={join(folder.path as string, file)}
									key={i}
									onClick={() => select_file(join(folder.path as string, file))}
									selected={selectedFile === join(folder.path as string, file)}
								/>
							);
						})}
					</ul>
				</>
			) : (
				<div className="flex flex-col self-center">
					<span className="">No Folder Open</span>

					<button
						className="w-24 h-8 bg-blue-600 mt-5 hover:bg-blue-700 active:bg-blue-600"
						onClick={handle_open_folder}
					>
						Open Folder
					</button>
				</div>
			)}
		</div>
	);
}

function File({
	path,
	onClick,
	selected,
}: {
	path: string;
	onClick: Function;
	selected?: boolean;
}) {
	return (
		<li
			className={`pl-6 hover:bg-zinc-700 ${
				selected ? "bg-zinc-700 " : ""
			} w-full`}
			onClick={() => onClick()}
		>
			<span>{basename(path)}</span>
		</li>
	);
}
