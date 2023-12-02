import { place_in_variables } from "./var_functions";
import store from "../redux/store/app";
import { move_program_counter } from "@/redux/reducers/interpreter";
import generic_error from "./error_functions";

export function jmpif(args: string) {
	if (/then$/i.test(args)) {
		const op = args.replace(/then$/i, "");

		const op_ans = place_in_variables(op);

		const cond = op_ans == "false" || op_ans == "0" ? false : true;

		const program_counter = store.getState().interpreter.program_counter;
		const instruction =
			store.getState().interpreter.executable[program_counter];
		const current_scope = instruction.scope;
		if (!cond) {
			const instructions = store.getState().interpreter.executable;
			for (let i = program_counter; i < instructions.length; i++) {
				const instruction = instructions[i];
				if (instruction.scope.includes(current_scope)) {
					continue;
				}

				store.dispatch(move_program_counter(i));

				return true;
			}
		}
	} else {
		//error
		generic_error("Expected a 'then' at the end of condition");
	}
	return false;
}

export function move_to_next_instruction() {
	const program_counter = store.getState().interpreter.program_counter;
	const current_instruction =
		store.getState().interpreter.executable[program_counter];
	const next_instruction =
		store.getState().interpreter.executable[program_counter + 1];

	const current_scope = current_instruction.scope.split("/");
	const next_scope = next_instruction?.scope?.split("/");

	if (
		current_scope.length == next_scope?.length &&
		current_scope.join("/") != next_scope?.join("/")
	) {
		current_scope.pop();
		lookup_scope(current_scope.join("/"), program_counter);
		return;
	}

	store.dispatch(move_program_counter(program_counter + 1));
}

function lookup_scope(scope: string, start: number) {
	const instructions = store.getState().interpreter.executable;

	for (let i = start; i < instructions.length; i++) {
		if (instructions[i].scope == scope) {
			store.dispatch(move_program_counter(i));
			break;
		}
	}
}

export function jmp_while(args: string) {
	const op_ans = place_in_variables(args);

	const cond = op_ans == "false" || op_ans == "0" ? false : true;

	const program_counter = store.getState().interpreter.program_counter;
	const instruction = store.getState().interpreter.executable[program_counter];
	const current_scope = instruction.scope;

	if (!cond) {
		const instructions = store.getState().interpreter.executable;
		for (let i = program_counter; i < instructions.length; i++) {
			const instruction = instructions[i];

			if (instruction.scope.includes(current_scope)) {
				continue;
			}

			store.dispatch(move_program_counter(i + 1));
			break;
		}
		return true;
	}
	return false;
}

export function jmp_to_loop_start(args: string) {
	const program_counter = store.getState().interpreter.program_counter;
	const instruction = store.getState().interpreter.executable[program_counter];
	const current_scope = args.trim();

	const instructions = store.getState().interpreter.executable;

	for (let i = instructions.length - 2; i >= 0; i--) {
		if (i <= 0) {
			// console.log(i);
			store.dispatch(move_program_counter(0));
			break;
		}

		const prev_scope = instructions[i - 1].scope;

		if (!prev_scope.includes(current_scope)) {
			store.dispatch(move_program_counter(i));
			break;
		}
	}
}
