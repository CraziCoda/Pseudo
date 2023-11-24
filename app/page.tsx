"use client";
import {
	ITab,
	closeTab,
	editContent,
	openTab,
	saveContent,
} from "@/redux/reducers/tabs";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IoMdClose } from "react-icons/io";
import { BsPlay, BsDot, BsBasket } from "react-icons/bs";
import CodeEditor from "@/components/Editor";
import { basename } from "path";
import { read_file } from "@/functions/folder";
import {
	assign_variable,
	uninterrupt_program,
} from "@/redux/reducers/interpreter";
import { execute_instructions } from "@/interpreter/program";
import {
	ITerminalSlice,
	change_current_input_to_output,
	clear_terminal,
} from "@/redux/reducers/terminal";
import { input_assignment, variable_assignment } from "@/interpreter/functions";
import { generate_instructions } from "@/interpreter/generate_instructions";

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
			<div className="flex h-4/6" style={{ width: "99%" }}>
				{/* This should work for now */}
				{tabs.tabs[tabs.active].path == "default" ? "" : <CodeEditor />}
			</div>
			<Footer />
		</main>
	);
}

function Header() {
	const tabs = useSelector(
		({ tabs }: { tabs: { tabs: ITab[]; active: number } }) => tabs
	);

	const dispatch = useDispatch();

	function execute() {
		const active_tab = tabs.tabs[tabs.active];

		if (active_tab.content) {
			dispatch(clear_terminal());
			dispatch(saveContent());
			// dispatch(generate_instructions(active_tab.content));
			generate_instructions(active_tab.content);

			execute_instructions();
		}
	}

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
			<div className="flex flex-row">
				<BsPlay
					size={20}
					color="white"
					className="cursor-pointer"
					onClick={execute}
				/>
			</div>
		</header>
	);
}

function Footer() {
	const input_ref = useRef<HTMLInputElement | null>(null);
	const terminal_ref = useRef<HTMLDivElement | null>(null);
	const dispatch = useDispatch();

	const terminal = useSelector(
		({ terminal }: { terminal: ITerminalSlice }) => terminal
	);

	useEffect(() => {
		terminal_ref.current?.click();
	}, [terminal]);

	return (
		<div
			ref={terminal_ref}
			className="flex flex-col border-t border-t-black h-2/6 text-white pl-5 pr-5 pt-2 text-sm bg-zinc-900 overflow-y-auto"
			onClick={() => {
				input_ref.current?.focus();
			}}
		>
			{terminal.list.map((val, i) => {
				return val.type == "output" ? (
					<div
						key={i}
						style={{
							color: val.isError ? "red" : "inherit",
						}}
					>
						{val.values.join("")}
					</div>
				) : (
					<div key={i}>
						<input
							ref={input_ref}
							className="flex w-full cursor-default bg-transparent outline-none"
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									const inputs = input_ref.current?.value.split(" ") || [];

									if (val.values.length == 1) {
										input_assignment(
											`${val.values[0]} ${input_ref.current?.value}`
										);
									} else {
										val.values.forEach((value, i, arr) => {
											if (i < inputs.length) {
												input_assignment(`${value} ${inputs[i]}`);
											} else {
												input_assignment(`${value} ""`);
											}
										});
									}

									// e.currentTarget.readOnly = true;
									dispatch(uninterrupt_program());
									dispatch(
										change_current_input_to_output(e.currentTarget.value)
									);
									execute_instructions();
								}
							}}
						/>
					</div>
				);
			})}
		</div>
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
