import { add_to_list } from "@/redux/reducers/terminal";
import store from "../redux/store/app";
import { print_to_screen } from "./functions";
import {
	interrupt_program,
	move_program_counter,
} from "@/redux/reducers/interpreter";

export default function generic_error(msg: string) {
	const interpreter = store.getState().interpreter;

	const program_counter = interpreter.program_counter;

    // console.log(interpreter.executable, program_counter)

	const current_line = interpreter.executable[program_counter - 1].line;

	store.dispatch(add_to_list({ type: "output", values: [msg], isError: true }));

	store.dispatch(
		add_to_list({
			type: "output",
			values: ["Error line: " + current_line],
			isError: true,
		})
	);

	store.dispatch(interrupt_program());
	store.dispatch(move_program_counter(0));
}
