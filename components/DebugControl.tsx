import { BsPlayFill } from "react-icons/bs";
import { IoIosPause } from "react-icons/io";
import { PiArrowArcRightFill } from "react-icons/pi";
import { FaStop } from "react-icons/fa6";
import { useState } from "react";
import {
	IInterpreterSlice,
	change_run_state,
	exit_debug_mode,
	interrupt_program,
	set_time,
} from "@/redux/reducers/interpreter";
import { useDispatch, useSelector } from "react-redux";
import {
	execute_instructions_step,
	execute_instructions_timed,
} from "@/interpreter/program";

export default function DebugControl() {
	const [timer, setTimer] = useState("");
	const dispatch = useDispatch();
	const interpreter = useSelector(
		({ interpreter }: { interpreter: IInterpreterSlice }) => interpreter
	);

	return (
		<div
			className={`absolute bg-zinc-950 pl-5 pr-5 h-10 flex-row items-center top-10 z-50 shadow-sm shadow-neutral-600 self-center ${
				interpreter.debug ? "flex" : "hidden"
			}`}
		>
			<input
				type="number"
				className="w-12"
				min={0}
				max={999}
				placeholder="0"
				value={timer}
				onChange={(e) => {
					if (parseFloat(e.target.value) > 999) {
						setTimer("999");
						return;
					}
					setTimer(e.target.value);
				}}
			/>
			<BsPlayFill
				color={`${interpreter.running ? "grey" : "green"}`}
				size={25}
				className={`ml-2 ${
					interpreter.running ? "cursor-default" : "cursor-pointer"
				}`}
				onClick={() => {
					dispatch(change_run_state("timed"));
					dispatch(set_time(parseFloat(timer)));
					execute_instructions_timed(parseFloat(timer));
				}}
			/>
			<IoIosPause
				color="red"
				size={20}
				className="ml-2 cursor-pointer"
				onClick={() => dispatch(interrupt_program())}
			/>
			<PiArrowArcRightFill
				color={`${interpreter.interrupted ? "grey" : "#55f"}`}
				size={20}
				className={`ml-2  ${
					interpreter.interrupted ? "cursor-default" : "cursor-pointer"
				}`}
				onClick={() => {
					dispatch(change_run_state("step"));
					execute_instructions_step();
				}}
			/>
			<FaStop
				color="brown"
				size={20}
				className="ml-2 cursor-pointer"
				onClick={() => dispatch(exit_debug_mode())}
			/>
		</div>
	);
}
