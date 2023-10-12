"use client";
import {
	ITab,
	closeTab,
	editContent,
	openTab,
	saveContent,
} from "@/redux/reducers/tabs";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { BsPlay, BsDot } from "react-icons/bs";
import CodeEditor from "@/components/Editor";
import { basename } from "path";
import { read_file } from "@/functions/folder";

export default function Main() {
	const dispatch = useDispatch();

	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: ITab[]; active: number } }) => tabs
	);

	async function handle_read_file(path: string) {
		const text = await read_file(path);
		if (text) {
			dispatch(editContent(text));
			dispatch(saveContent());
		}
	}

	useEffect(() => {
		const file_path = tabs.tabs[tabs.active].path;
		handle_read_file(file_path);
		// console.log(tabs.tabs[tabs.active]);
	}, [tabs.active]);

	return (
		<main className="flex h-screen w-full flex-col bg-zinc-800">
			<>
				<Header />
			</>
			<div className="flex h-full">
				{/* This should work for now */}
				{tabs.tabs[tabs.active].path == "default" ? "" : <CodeEditor />}
			</div>
		</main>
	);
}

function Header() {
	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: ITab[]; active: number } }) => tabs
	);

	return (
		<header className="flex flex-row w-full h-8 p-0 m-0 border-b border-black justify-between items-center pr-2 bg-zinc-900">
			<div className=" flex flex-row p-0 m-0">
				{tabs.tabs?.map((val, i) => {
					return (
						<Tab
							name={basename(val.path)}
							index={i}
							active={tabs.active == i}
							key={i}
							saved={val.saved}
						/>
					);
				})}
			</div>
			<div className=" flex flex-row">
				<BsPlay size={18} color="white" className="cursor-pointer" />
			</div>
		</header>
	);
}

interface TabProps {
	active?: boolean;
	name: string;
	index: number;
	saved?: boolean;
}

function Tab({ active, name, index, saved }: TabProps) {
	const dispatch = useDispatch();

	return (
		<div
			className={`flex flex-row h-8 w-24 items-center justify-between border-r border-t border-black pl-1 pr-1 text-gray-300 cursor-pointer ${
				active ? "border-b border-b-zinc-800 border-t-red-400 bg-zinc-800" : ""
			}`}
			onClick={() => {
				dispatch(openTab(index));
			}}
		>
			<div className="flex flex-row justify-center items-center text-xs">
				{name}
			</div>
			<div
				className="flex flex-row justify-center items-center hover:bg-zinc-700 h-3 w-3 z-10"
				onClick={(e) => {
					e.stopPropagation();
					dispatch(closeTab(index));
				}}
			>
				{saved ? (
					<IoMdClose size={12} color="white" />
				) : (
					<BsDot size={24} color="white" />
				)}
			</div>
		</div>
	);
}
