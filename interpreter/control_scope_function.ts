import { assign_var, place_in_variables } from "./var_functions";
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

	const current_scope = current_instruction?.scope?.split("/");
	const next_scope = next_instruction?.scope?.split("/");

	if (
		current_scope?.length == next_scope?.length &&
		current_scope?.join("/") != next_scope?.join("/")
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
	// const program_counter = store.getState().interpreter.program_counter;
	// const instruction = store.getState().interpreter.executable[program_counter];
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

export function jmp_for(args: string) {
	args = args.trim();
	const initial = place_in_variables(
		args.match(/(?<=\=\s*).*(?=to)/i)?.[0] as string
	);
	args = args.replace(/(?<=\=\s*).*(?=to)/i, initial);

	const dest = place_in_variables(
		args.match(/(?<=to\s*).*(?=step)/i)?.[0] as string
	);
	args = args.replace(/(?<=to\s*).*(?=step)/i, dest);

	const move = place_in_variables(args.match(/(?<=step\s*).*/i)?.[0] as string);
	args = args.replace(/(?<=step\s*).*/i, move);

	if (
		/^[a-zA-Z]\w*\s*=\s*[\-+]?\s*\d+[.]?\d*\s*to\s*[\-+]?\s*\d+[.]?\d*\s*step\s*[\-+]?\s*\d+[.]?\d*/i.test(
			args
		)
	) {
		const initializing = args
			.match(/[a-zA-Z]\w*\s*=\s*[\-+]?\s*\d+[.]?\d*/)?.[0]
			.replace(/\s+/g, "") as string;

		const [identifier, value] = initializing.split("=");

		assign_var(identifier, value);
		const current_variables = store.getState().interpreter.variables;
		const program_counter = store.getState().interpreter.program_counter;

		const pseudo_var = current_variables.find((val) => val.name == identifier);

		const end = args.match(/(?<=to\s*)[+-]?\d+[.]?\d*/i)?.[0] as string;

		if (pseudo_var?.value == parseFloat(end)) {
			const current_scope =
				store.getState().interpreter.executable[program_counter].scope;

			const instructions = store.getState().interpreter.executable;

			for (let i = 0; i < instructions.length; i++) {
				if (!instructions[i].scope.includes(current_scope)) {
					store.dispatch(move_program_counter(i + 1));
					break;
				}
			}
		}
	} else {
		//raise error
		generic_error("Invalid for loop");
	}
}

export function jmp_to_for_start(args: string) {
	const program_counter = store.getState().interpreter.program_counter;
	const current_scope = args.trim();
	const instructions = store.getState().interpreter.executable;
	const current_variables = store.getState().interpreter.variables;

	for (let i = program_counter; i >= 0; i--) {
		const prev_scope = instructions[i - 1]?.scope || "a";

		if (!prev_scope.includes(current_scope)) {
			const for_instruction = instructions[i];
			const identifier = for_instruction.args.trim().match(/^[a-zA-Z]\w*/)?.[0];
			args = for_instruction.args;

			// place in variables

			const initial = place_in_variables(
				args.match(/(?<=\=\s*).*(?=to)/i)?.[0] as string
			);
			args = args.replace(/(?<=\=\s*).*(?=to)/i, initial);
			const dest = place_in_variables(
				args.match(/(?<=to\s*).*(?=step)/i)?.[0] as string
			);
			args = args.replace(/(?<=to\s*).*(?=step)/i, dest);
			const move = place_in_variables(
				args.match(/(?<=step\s*).*/i)?.[0] as string
			);
			args = args.replace(/(?<=step\s*).*/i, move);

			const step = args
				.trim()
				.match(/(?<=step\s*)[\-+]?\s*\d+[.]?\d*/i)?.[0] as string;

			const to = args
				.trim()
				.match(/(?<=to\s*)[\-+]?\s*\d+[.]?\d*/i)?.[0]
				.replace(/\s*/g, "") as string;

			const from = args
				.trim()
				.match(/(?<=\=\s*)[\-+]?\s*\d+[.]?\d*/i)?.[0]
				.replace(/\s*/g, "") as string;

			const pseudo_var = current_variables.find(
				(val) => val.name == identifier
			);

			const direction = parseFloat(to) > parseFloat(from) ? "right" : "left";

			if (
				(pseudo_var?.value < parseFloat(to) && direction == "right") ||
				(pseudo_var?.value > parseFloat(to) && direction == "left")
			) {
				const new_value =
					pseudo_var?.value + parseFloat(step.replace(/\s*/g, ""));

				assign_var(pseudo_var?.name as string, new_value);

				store.dispatch(move_program_counter(i));
			} else {
				// raise error
				// console.log(pseudo_var);
			}

			break;
		}
	}
}

export function jmp_to_do_start(args: string) {
	const scope = args.trim().match(/global.*$/)?.[0] as string;
	const eq = args.trim().replace(scope, "");
    
    if(eq == ''){
        return generic_error("Expected a condition")
    }
	const op_ans = place_in_variables(eq);
	const program_counter = store.getState().interpreter.program_counter;


    console.log(program_counter, eq)

	const cond = op_ans == "false" || op_ans == "0" ? false : true;

	if (cond) {
		const instructions = store.getState().interpreter.executable;

		for (let i = program_counter; i >= 0; i--) {
			if (i <= 0) {
				// console.log(i);
				store.dispatch(move_program_counter(0));
				break;
			}

			const prev_scope = instructions[i - 1].scope;

			if (!prev_scope.includes(scope)) {
				store.dispatch(move_program_counter(i));
				break;
			}
		}
	}
}
