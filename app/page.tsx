"use client";
import { closeTab, openTab } from "@/redux/reducers/tabs";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { BsPlay } from "react-icons/bs";
import CodeEditor from "@/components/Editor";

export default function Main() {
	return (
		<main className="flex h-screen w-full flex-col bg-zinc-800">
			<>
				<Header />
			</>
			<div className="flex h-full">
				<CodeEditor />
			</div>
		</main>
	);
}

function Header() {
	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: string[]; active: number } }) => tabs
	);

	// useEffect(() => {
	// 	console.log(tabs);
	// });

	return (
		<header className="flex flex-row w-full h-8 p-0 m-0 border-b border-black justify-between items-center pr-2 bg-zinc-900">
			<div className=" flex flex-row p-0 m-0">
				{tabs.tabs?.map((val, i) => {
					return <Tab name={val} index={i} active={tabs.active == i} key={i} />;
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
}

function Tab({ active, name, index }: TabProps) {
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
				<IoMdClose size={12} color="white" />
			</div>
		</div>
	);
}
