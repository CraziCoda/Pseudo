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
import { IoMdClose, IoIosRemove } from "react-icons/io";
import { VscDebug, VscDebugAlt, VscDebugAltSmall } from "react-icons/vsc";
import { MdClear } from "react-icons/md";
import { BsPlay, BsDot } from "react-icons/bs";
import CodeEditor from "@/components/Editor";
import { basename } from "path";
import { read_file } from "@/functions/folder";
import {
	IInterpreterSlice,
	assign_variable,
	enter_debug_mode,
	exit_debug_mode,
	interrupt_program,
	uninterrupt_program,
} from "@/redux/reducers/interpreter";
import {
	execute_instructions,
	execute_instructions_timed,
} from "@/interpreter/program";
import {
	ITerminalSlice,
	change_current_input_to_output,
	clear_terminal,
} from "@/redux/reducers/terminal";
import { input_assignment, variable_assignment } from "@/interpreter/functions";
import { generate_instructions } from "@/interpreter/generate_instructions";
import DebugControl from "@/components/DebugControl";

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
		const currentContent = tabs.tabs[tabs.active].content;

		if (!currentContent) {
			const file_path = tabs.tabs[tabs.active].path;
			handle_read_file(file_path);
		}
	}, [tabs.active]);

	return (
		<main className="flex h-screen w-screen flex-col bg-zinc-800 overflow-hidden">
			<>
				<Header />
			</>
			<DebugControl />
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
	const interpreter = useSelector(
		({ interpreter }: { interpreter: IInterpreterSlice }) => interpreter
	);

	const dispatch = useDispatch();

	function execute() {
		const active_tab = tabs.tabs[tabs.active];

		if (active_tab.content) {
			dispatch(clear_terminal());
			dispatch(saveContent());
			generate_instructions(active_tab.content);
			execute_instructions();
		}
	}

	function activate_debug() {
		const active_tab = tabs.tabs[tabs.active];
		if (active_tab.content) {
			dispatch(clear_terminal());
			dispatch(saveContent());
			generate_instructions(active_tab.content);
			dispatch(enter_debug_mode());
		}
	}

	function end_execution() {
		dispatch(exit_debug_mode());
		dispatch(clear_terminal());
		dispatch(interrupt_program());
	}

	return (
		<header className="flex flex-row w-full h-8 p-0 m-0 border-b border-black justify-between items-center pr-2 bg-zinc-900">
			<div className=" flex flex-row w-11/12 p-0 m-0 overflow-x-auto ">
				<div className="flex flex-row">
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
			</div>
			<div className="flex flex-row justify-center items-center">
				<BsPlay
					size={25}
					color="white"
					className="cursor-pointer mr-2"
					onClick={execute}
				/>
				<VscDebug
					size={20}
					color={`${interpreter.debug ? "grey" : "white"}`}
					className={`${
						interpreter.debug ? "cursor-auto" : "cursor-pointer"
					} mr-2`}
					onClick={activate_debug}
				/>

				<MdClear
					size={25}
					color="white"
					className="cursor-pointer mr-2"
					onClick={end_execution}
				/>
			</div>
		</header>
	);
}

function Footer() {
	const input_ref = useRef<HTMLInputElement | null>(null);
	const terminal_ref = useRef<HTMLDivElement | null>(null);
	const dispatch = useDispatch();

	const interpreter = useSelector(
		({ interpreter }: { interpreter: IInterpreterSlice }) => interpreter
	);

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
									if (interpreter.running_state == "normal")
										execute_instructions();
									else if (interpreter.running_state == "timed")
										execute_instructions_timed(interpreter.execution_time || 0);
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
